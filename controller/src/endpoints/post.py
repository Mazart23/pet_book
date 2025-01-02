import logging

from flask import request
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import jwt_required

from ..database.queries import Queries as db
from ..utils.request import send_request
from ..utils.apps import Services

from bson.objectid import ObjectId


log = logging.getLogger('POST')

api = Namespace('post')

reaction_model = api.model('Reaction', {
    'id': fields.String(description="Unique ID of the reaction", example="12345"),
    'user_id': fields.String(description="ID of the user who reacted", example="671f880f5bf26ed4c9f540fd"),
    'reaction_type': fields.String(description="Type of reaction", example="heart")
})

comment_model = api.model('Comment', {
    'id': fields.String(description="Unique ID of the comment", example="12345"),
    'user_id': fields.String(description="ID of the user who commented", example="671f880f5bf26ed4c9f540fd"),
    'content': fields.String(description="content of comment", example="great pic!"),
    'timestamp': fields.String(description="Timestamp of the comment", example="2024-12-05 21:18:07")
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
    'comments': fields.List(fields.Nested(comment_model), description="List of comments to the post"),
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
            "page": {"description": "Page number for pagination.", "example": 1, "required": False},
            "limit": {"description": "Number of posts per page.", "example": 10, "required": False}
        }
    )
    @api.response(200, "OK")
    @api.response(500, "Failed to fetch posts")
    @api.marshal_with(post_list_model, code=200)
    def get(self):
        """
        Fetch posts based on optional filters (e.g., user ID, pagination)
        """
        try:
            user_id = request.args.get('user_id')
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 10))
            log.info(f"Query Params - user_id: {user_id}, page: {page}, limit: {limit}")
            queries = db()

            query = {}
            if user_id:
                query = {'user_id': ObjectId(user_id)}
            
            user_info = queries.get_user_by_id(user_id)

            skip = (page - 1) * limit
            log.info(f"Fetching posts with query: {query}, skip: {skip}, limit: {limit}")

            posts = queries.fetch_posts(query=query, skip=skip, limit=limit)

            for post in posts:
                
                
                comments = queries.get_comments(post['id'])
                log.info(f"Comments fetched: {comments}")
                reactions = queries.get_reactions(post['id'])
                log.info(f"Reactions fetched: {reactions}")
                
                post['images'] = eval(post['images']) if isinstance(post['images'], str) else post['images']
                
                post['user'] = {"id": user_id, "username": user_info["username"], "image": user_info["profile_picture_url"]}


                for reaction in reactions:
                    post['reactions'].append({'id': reaction['_id'], 'user_id': reaction['user_id'], 'reaction_type': reaction['reaction_type']})

                for comment in comments:
                    post['comments'].append({'id': comment['_id'], 'user_id': comment['user_id'], 'content': comment['content'], 'timestamp': comment['timestamp']})

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