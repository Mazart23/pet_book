import logging
from datetime import datetime

from flask import request
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..database.queries import Queries as db
from ..utils.request import send_request
from ..utils.apps import Services


log = logging.getLogger('COMMENT')

api = Namespace('comment')


auth_parser = api.parser()
auth_parser.add_argument(
    'Authorization', 
    location='headers', 
    required=True, 
    help='Bearer token for authentication',
    type=str,
    default='Bearer ',
)

get_comments_model = api.model(
    'Get comments model', 
    {
        'comment_id': fields.String(required=True, description='Unique ID of the comment'),
        'post_id': fields.String(required=True, description='Unique ID of the commented post'),
        'user_id': fields.String(required=True, description='Unique ID of the user who commented'),
        'username': fields.String(required=True, description='Username of the user who commented'),
        'content': fields.String(required=True, description='Description of comment'),
        'timestamp': fields.String(required=True, description='Time of comment')
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
        'post_id': fields.String(required=True, description='Unique ID of the commented post'),
    }
)

@api.route('/')
class Comment(Resource):
    @api.doc(
        params={
            'post_id': {'description': 'Unique ID of post to fetch comments from', 'type': str, 'required': True},
            'last_timestamp': {'description': 'Timestamp of last fetched notification', 'type': str, 'required': True},
            'quantity': {'description': 'Quantity of comments to fetch', 'type': int, 'default': 10, 'required': True},
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
        Fetch comments
        '''
    
    @api.doc(params={
        'Authorization': {
            'description': 'Bearer token for authentication',
            'required': True,
            'in': 'header',
            'default': 'Bearer '
        }
    })
    @api.expect(put_comment_model, validate=True)
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
        
        username = queries.get_user_by_id(user_id).get('username')
        
        if not username:
            log.info('User that commented not found')
            api.abort(404, "User not found")
        
        comment_id = queries.insert_comment(post_id, user_id, content, timestamp)
        
        if not comment_id:
            log.error(f'Cannot insert comment for data: {post_id = }, {user_id = }, {content = }')
            api.abort(500, 'Database Error')
        
        json_data = {
            'user_owner_id': user_owner_id,
            'notification_id': comment_id,
            'data': {
                'post_id': post_id,
                'user_id': user_id,
                'username': username,
            'timestamp': str(timestamp)
            }
        }
        try:
            send_request('POST', Services.NOTIFIER, '/emit/comment', json_data=json_data)
        except Exception as e:
            log.info(f'Error during sending notification for {user_owner_id = } via websocket: {e}')

        return {}, 201

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
        post_id = request.json.get('post_id')
        
        queries = db()
        comment = queries.get_comment_by_id(comment_id)
        comment_user_id = str(comment.get(user_id))
        
        if user_id != comment_user_id:
            log.info(f'Ownership of the comment is in conflict: {user_id = }, {comment_user_id = }')
            api.abort(403, "Forbidden")
        
        response = queries.delete_comment(comment_id, post_id)
        
        if not response:
            log.error(f'Cannot delete comment for data: {comment_id = }, {user_id = }, {post_id = }')
            api.abort(500, 'Database Error')

        return {}, 200
