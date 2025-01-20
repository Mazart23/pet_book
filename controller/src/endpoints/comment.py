import logging
from datetime import datetime

from flask import request
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson.objectid import ObjectId

from ..database.queries import Queries as db
from ..utils.request import send_request
from ..utils.apps import Services


log = logging.getLogger('COMMENT')

api = Namespace('comment')


user_model = api.model(
    'User for comment model', 
    {
        'id': fields.String(description="User ID of the post creator", example="671f880f5bf26ed4c9f540fd"),
        'username': fields.String(description="Username of the post creator", example="Julia"),
        'image': fields.String(description="Profile image URL of the post creator", example="https://i.imgur.com/9P3c7an.jpeg")
    }
)

comment_model = api.model(
    'Comment model', 
    {
        'id': fields.String(description="Unique ID of the comment", example="12345"),
        'content': fields.String(description="content of comment", example="great pic!"),
        'timestamp': fields.String(description="Timestamp of the comment", example="2024-12-05 21:18:07"),
        'user': fields.Nested(user_model, description="User information of the post creator")
    }
)

get_comments_model = api.model(
    'Get comments model', 
    {
        'comments': fields.List(fields.Nested(comment_model), description="List of comments for a given post")
    }
)

put_comment_model = api.model(
    'Put comment model', 
    {
        'post_id': fields.String(required=True, description='Unique ID of the commented post'),
        'content': fields.String(required=True, description='Description of comment'),
    }
)

delete_comment_model = api.model(
    'Delete comment model', 
    {
        'comment_id': fields.String(required=True, description='Unique ID of the comment'),
    }
)

@api.route('/')
class Comment(Resource):
    @api.doc(
        params={
            'post_id': {'description': 'Unique ID of post to fetch comments from', 'type': str, 'required': True},
            'last_timestamp': {'description': 'Timestamp of last fetched notification', 'type': str, 'required': False},
            'limit': {'description': 'Quantity of comments to fetch', 'type': int, 'default': 10, 'required': True},
            'Authorization': {
                'description': 'Bearer token for authentication',
                'required': True,
                'in': 'header',
                'default': 'Bearer '
            }
        }
    )
    @api.marshal_list_with(get_comments_model, code=200)
    @api.response(200, 'OK')
    @api.response(400, 'Bad Request')
    @api.response(401, 'Unauthorized')
    @api.response(500, 'Database Error')
    @jwt_required()
    def get(self):
        '''
        Fetch comments for post
        '''
        try:
            post_id = request.args.get('post_id')
            last_timestamp = request.args.get('last_timestamp')
            limit = int(request.args.get('limit', 10))

            # Initialize query
            query = {}
            if post_id:
                try:
                    query['post_id'] = ObjectId(post_id)
                except Exception:
                    log.error(f"Invalid user_id format: {post_id}")
                    return {"message": "Invalid post_id format."}, 400

            if last_timestamp:
                try:
                    query['timestamp'] = {'$lt': datetime.fromisoformat(last_timestamp)}
                except ValueError:
                    log.error(f"Invalid timestamp format: {last_timestamp}")
                    return {"message": "Invalid timestamp format. Use ISO format."}, 400

            log.info(f"Fetching comments with query: {query}, limit: {limit}")

            comments = db().fetch_comments(query=query, limit=limit)

            log.info(f"Comments fetched: {comments}")
            return {"comments": comments}, 200

        except Exception as e:
            log.error(f"Error in GET /comments: {e}")
            return {"message": "Failed to fetch comments"}, 500
    
    @api.doc(params={
        'Authorization': {
            'description': 'Bearer token for authentication',
            'required': True,
            'in': 'header',
            'default': 'Bearer '
        }
    })
    @api.expect(put_comment_model, validate=True)
    @api.marshal_with(comment_model, code=201)
    @api.response(201, 'Created')
    @api.response(400, 'Bad Request')
    @api.response(401, 'Unauthorized')
    @api.response(500, 'Database Error')
    @jwt_required()
    def put(self):
        '''
        Create comment
        '''
        user_id = get_jwt_identity()
        post_id = request.json.get('post_id')
        content = request.json.get('content')
        timestamp = datetime.now()
        
        queries = db()
        user_owner_id = queries.get_post_by_id(post_id).get('user_id')
        
        if not user_owner_id:
            log.info('User owner not found')
            api.abort(404, "User not found")
        
        user_owner_id = str(user_owner_id)

        user = queries.get_user_by_id(user_id)
        
        if not user:
            log.info('User that commented not found')
            api.abort(404, "User not found")

        comment_id = queries.insert_comment(post_id, user_id, content, timestamp)
        
        if not comment_id:
            log.error(f'Cannot insert comment for data: {post_id = }, {user_id = }, {content = }')
            api.abort(500, 'Database Error')
        
        json_data_notifier = {
            'user_owner_id': user_owner_id,
            'notification_id': comment_id,
            'data': {
                'post_id': post_id,
                'user_id': user_id,
                'username': user.get('username'),
            'timestamp': str(timestamp)
            }
        }
        try:
            send_request('POST', Services.NOTIFIER, '/emit/comment', json_data=json_data_notifier)
        except Exception as e:
            log.info(f'Error during sending notification for {user_owner_id = } via websocket: {e}')

        json_data = {
            'id': comment_id,
            'content': content,
            'timestamp': str(timestamp),
            'user': {
                'id': user_id,
                'username': user.get('username'),
                'image': user.get('profile_picture_url')
            }
        }
        return json_data, 201

    @api.doc(params={
        'Authorization': {
            'description': 'Bearer token for authentication',
            'required': True,
            'in': 'header',
            'default': 'Bearer '
        }
    })
    @api.expect(delete_comment_model, validate=True)
    @api.response(200, 'OK')
    @api.response(400, 'Bad Request')
    @api.response(401, 'Unauthorized')
    @api.response(403, 'Forbidden')
    @api.response(500, 'Database Error')
    @jwt_required()
    def delete(self):
        '''
        Delete comment
        '''
        user_id = get_jwt_identity()
        comment_id = request.json.get('comment_id')
        
        queries = db()
        comment = queries.get_comment_by_id(comment_id)
        comment_user_id = str(comment.get('user_id'))
        
        if user_id != comment_user_id:
            log.info(f'Ownership of the comment is in conflict: {user_id = }, {comment_user_id = }')
            api.abort(403, "Forbidden")
        
        response = queries.delete_comment(comment_id)
        
        if not response:
            log.error(f'Cannot delete comment for data: {comment_id = }, {user_id = }')
            api.abort(500, 'Database Error')

        return {}, 200
