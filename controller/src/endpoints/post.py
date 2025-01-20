import logging

from flask import request
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import jwt_required

from ..database.queries import Queries as db
from ..utils.request import send_request
from ..utils.apps import Services

from bson.objectid import ObjectId

from datetime import datetime


log = logging.getLogger('POST')

api = Namespace('post')

reaction_model = api.model('Reaction', {
    'id': fields.String(description="Unique ID of the reaction", example="12345"),
    'user_id': fields.String(description="ID of the user who reacted", example="671f880f5bf26ed4c9f540fd"),
    'reaction_type': fields.String(description="Type of reaction", example="heart")
})

comment_model = api.model('Comment', {
    'id': fields.String(description="Unique ID of the comment", example="12345"),
    'content': fields.String(description="content of comment", example="great pic!"),
    'timestamp': fields.String(description="Timestamp of the comment", example="2024-12-05 21:18:07"),
    'user': fields.Nested(api.model('User', {
        'id': fields.String(description="User ID of the post creator", example="671f880f5bf26ed4c9f540fd"),
        'username': fields.String(description="Username of the post creator", example="Julia"),
        'image': fields.String(description="Profile image URL of the post creator", example="https://i.imgur.com/9P3c7an.jpeg")
    }), description="User information of the post creator")
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

comments_list_model = api.model('CommentsList', {
    'comments': fields.List(fields.Nested(comment_model), description="List of comments for a given post")
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
    
@api.route('/comments')
class PostComments(Resource):
    @api.doc(
        params={
            "post_id": {"description": "Filter comments by post ID.", "example": "671f880f5bf26ed4c9f540fd", "required": False},
            "last_timestamp": {"description": "Timestamp of the last fetched post (ISO format)", "example": "2025-01-01T12:00:00", "required": False},
            "limit": {"description": "Number of posts to fetch", "example": 10, "required": False}
        }
    )
    @api.response(200, "OK")
    @api.response(500, "Failed to fetch comments")
    @api.marshal_with(comments_list_model, code=200)
    def get(self):
        """
        Fetch comments for post 
        """
        try:
            # Read query parameters
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

            # Fetch comments with aggregation pipeline
            comments = db().fetch_comments(query=query, limit=limit)

            log.info(f"Comments fetched: {comments}")
            return {"posts": comments}, 200

        except Exception as e:
            log.error(f"Error in GET /comments: {e}")
            return {"message": "Failed to fetch comments"}, 500
        

@api.route('/search')
class Search(Resource):
    search_model = api.model(
        'Search model',
        {
            'username': fields.String(description="Partial or full username", example="Fra"),
            'content': fields.String(description="Search content", example="bio text or other"),
        }
    )

    @api.doc(params={
        'query': {'description': 'Search query string (username or content)', 'example': 'Fra', 'required': True},
        'type': {'description': 'Search type: username or content', 'example': 'username', 'required': True},
    })
    @api.response(200, 'OK')
    @api.response(400, 'Bad Request')
    @api.response(404, 'No results found')
    @api.response(500, 'Internal Server Error')
    def get(self):
        """
        Search for users by username or content.
        """
        try:
            query = request.args.get('query')
            search_type = request.args.get('type')

            if not query or not search_type:
                log.error("Missing required query or type parameters.")
                return {"message": "Bad Request: query and type are required parameters."}, 400

            log.info(f"Search request received with query: {query}, type: {search_type}")

            queries = db()

            if search_type.lower() == 'username':
                results = queries.search_users_by_username(query) or []
                if not results:
                    log.info(f"No results found for username: {query}")
                    return {"message": "No results found for username."}, 404
                log.info(f"Found {len(results)} users for query: {query}")
                return {"users": results}, 200

            elif search_type.lower() == 'content':
                results = queries.search_posts(search_term=query) or []
                if not results:
                    log.info(f"No results found for content: {query}")
                    return {"message": "No results found for content."}, 404

                log.info(f"Found {len(results)} posts for query: {query}")
                return {"posts": results}, 200

            else:
                log.error(f"Invalid search type: {search_type}")
                return {"message": "Bad Request: type must be 'username' or 'content'."}, 400

        except Exception as e:
            log.error(f"Error in GET /search: {e}")
            api.abort(500, "An unexpected error occurred while processing your request.")
