import logging
from datetime import datetime

from flask import request
from flask_restx import Resource, fields, Namespace
from bson.objectid import ObjectId

from ..database.queries import Queries as db


log = logging.getLogger('POST')

api = Namespace('post')

reaction_model = api.model('Reaction', {
    'id': fields.String(description="Unique ID of the reaction", example="12345"),
    'user_id': fields.String(description="ID of the user who reacted", example="671f880f5bf26ed4c9f540fd"),
    'reaction_type': fields.String(description="Type of reaction", example="heart")
})

post_model = api.model('Post', {
    'id': fields.String(description="Unique ID of the post", example="6752269f6f218f859668c4ba"),
    'content': fields.String(description="Content of the post", example=":p"),
    'images': fields.List(fields.String, description="List of image URLs", example=["https://i.imgur.com/IszRpNP.jpeg", "https://i.imgur.com/mGjZUFQ.jpeg"]),
    'user': fields.Nested(api.model('User', {
        'id': fields.String(description="User ID of the post creator", example="671f880f5bf26ed4c9f540fd"),
        'username': fields.String(description="Username of the post creator", example="Julia"),
        'image': fields.String(description="Profile image URL of the post creator", example="https://i.imgur.com/9P3c7an.jpeg")
    }), description="User information of the post creator"),
    'location': fields.String(description="Location of the post", example="Krakow"),
    'timestamp': fields.String(description="Timestamp of the post", example="2024-12-05 21:18:07"),
    'reactions': fields.List(fields.Nested(reaction_model), description="List of reactions to the post")
})



post_list_model = api.model('PostList', {
    'posts': fields.List(fields.Nested(post_model), description="List of posts")
})


@api.route('/')
class Post(Resource):
    @api.doc(
        params={
            "user_id": {"description": "Filter posts by user ID.", "example": "671f880f5bf26ed4c9f540fd", "required": False},
            "last_timestamp": {"description": "Timestamp of the last fetched post (ISO format)", "example": "2025-01-01T12:00:00", "required": False},
            "limit": {"description": "Number of posts to fetch", "example": 10, "required": False}
        }
    )
    @api.response(200, "OK")
    @api.response(500, "Failed to fetch posts")
    @api.marshal_with(post_list_model, code=200)
    def get(self):
        """
        Fetch posts based on optional filters (e.g., user ID, timestamp, pagination)
        """
        try:
            # Read query parameters
            user_id = request.args.get('user_id')
            last_timestamp = request.args.get('last_timestamp')
            limit = int(request.args.get('limit', 10))

            # Initialize query
            query = {}
            if user_id:
                try:
                    query['user_id'] = ObjectId(user_id)
                except Exception:
                    log.error(f"Invalid user_id format: {user_id}")
                    return {"message": "Invalid user_id format."}, 400

            if last_timestamp:
                try:
                    query['timestamp'] = {'$lt': datetime.fromisoformat(last_timestamp)}
                except ValueError:
                    log.error(f"Invalid timestamp format: {last_timestamp}")
                    return {"message": "Invalid timestamp format. Use ISO format."}, 400

            log.info(f"Fetching posts with query: {query}, limit: {limit}")

            # Fetch posts with aggregation pipeline
            posts = db().fetch_posts(query=query, limit=limit)

            log.info(f"Posts fetched: {posts}")
            return {"posts": posts}, 200

        except Exception as e:
            log.error(f"Error in GET /posts: {e}")
            return {"message": "Failed to fetch posts"}, 500


    def put(self):
        '''
        create
        '''

    def patch(self):
        '''
        edit
        '''

    def delete(self):
        '''
        delete
        '''

@api.route('/single')
class SinglePost(Resource):
    @api.doc(
        params={
            "id": {"description": "Unique ID of the post.", "example": "671f880f5bf26ed4c9f540fd", "required": True},
            'Authorization': {
                'description': 'Bearer token for authentication',
                'required': True,
                'in': 'header',
                'default': 'Bearer '
            }
        }
    )
    @api.response(200, "OK")
    @api.response(500, "Internal Server Error")
    @api.marshal_with(post_model, code=200)
    def get(self):
        """
        Fetch single post based on its ID
        """
        try:
            post_id = request.args.get('id')
            
            post = db().fetch_posts(query={'_id': ObjectId(post_id)}, limit=1)

            assert post

            log.info(f"Post fetched: {post}")
            return post[0], 200

        except Exception as e:
            log.error(f"Error: {e}")
            return {"message": "Failed to fetch post"}, 500