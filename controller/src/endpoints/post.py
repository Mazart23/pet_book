import logging
import os

from flask import request
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..database.queries import Queries as db
from bson.objectid import ObjectId
from ..utils.request import send_request
from ..utils.apps import Services
from ..utils.apps import Url

from datetime import datetime


log = logging.getLogger('POST')

api = Namespace('post')

post_model = api.model('Post', {
    '_id': fields.String(description="User ID of the post creator", example="671f880f5bf26ed4c9f540fd"),
    '_user_id': fields.String(description="User ID of the post creator", example="671f880f5bf26ed4c9f540fd"),
    'description': fields.String(description="Post description", example="My first post!"),
    'images_urls': fields.List(fields.String, description="List of image URLs", example=["url1", "url2"]),
    'timestamp': fields.String(description="ISO formatted timestamp", example="2023-12-01T12:34:56Z"),
    'reactions_count': fields.Raw(description="Reaction counts (e.g., likes)", example={"likes": 0}),
    'location': fields.String(description="Location of the post", example="New York, NY"),
})

post_list_model = api.model('PostList', {
    'posts': fields.List(fields.Nested(post_model), description="List of posts")
})

@api.route('/posts')
class Post(Resource):
    @api.doc(
        description="Fetch posts based on optional filters (e.g., user ID, pagination).",
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
            log.info("GET /posts endpoint hit.")
            # Get query parameters
            user_id = request.args.get('user_id')
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 10))
            log.info(f"Query Params - user_id: {user_id}, page: {page}, limit: {limit}")
            queries = db()

            # Build query filter
            query = {}
            if user_id:
                query = {'_user_id': ObjectId(user_id)}

            # Pagination
            skip = (page - 1) * limit
            log.info(f"Fetching posts with query: {query}, skip: {skip}, limit: {limit}")

            posts = queries.fetch_posts(query=query, skip=skip, limit=limit)
            log.info(f"Posts fetched: {posts}")
            return {"posts": posts}, 200

        except Exception as e:
            log.error(f"Error in GET /posts: {e}")
            return {"message": "Failed to fetch posts"}, 500

    @jwt_required()
    @api.doc(
        description="Create a new post for the authenticated user.",
        consumes=["multipart/form-data"],
        params={
            "description": {"description": "Text description of the post.", "example": "My first post!", "required": True},
            "images": {"description": "List of image files to upload.", "type": "file", "required": True, "example": "image.jpg"}
        }
    )
    @api.response(201, "Post created successfully")
    @api.response(400, "Invalid input")
    @api.response(404, "User not found")
    @api.response(500, "Internal server error")
    @api.marshal_with(post_model, code=201)
    def post(self):
        """
        Create a new post for the authenticated user.
        """
        log.info("POST /posts endpoint hit.")
        user_id = get_jwt_identity()
        log.info(f"Authenticated user ID: {user_id}")
        queries = db()

        try:

            user = queries.get_user_by_id(user_id)
            if not user:
                log.error(f"User not found for ID: {user_id}")
                api.abort(404, "User not found")


            description = request.form.get('description', '').strip()
            if not description:
                log.error("Description cannot be empty.")
                api.abort(400, "Description cannot be empty")


            files = request.files.getlist('images')
            if not files:
                log.error("No image files provided.")
                api.abort(400, "No image files provided")

            # Upload files to Imgur
            imgur_urls = []
            for file in files:
                try:
                    headers = {"Authorization": f"Client-ID {os.environ.get('IMGUR_CLIENT_ID')}"}
                    log.info(f"Uploading file to Imgur: {file.filename}")
                    response = send_request('POST', Url.IMGUR, files={'image': file}, headers=headers)
                except Exception as e:
                    log.error(f"Error uploading to Imgur: {e}")
                    api.abort(500, "Failed to upload image to Imgur")

                if response.status_code != 200:
                    log.error(f"Imgur upload failed: {response.text}")
                    api.abort(500, "Imgur upload failed")

                imgur_data = response.json()
                imgur_urls.append(imgur_data['data']['link'])
                log.info(f"Uploaded to Imgur: {imgur_urls[-1]}")
            
            location = user.get("location", "").strip()

            # Create new post
            new_post = {
                "_user_id": user_id,
                "description": description,
                "images_urls": imgur_urls,
                "timestamp": datetime.utcnow(),
                "reactions_count": {"likes": 0},
                "location": location if location else "",
            }
            new_post["timestamp"] = new_post["timestamp"].isoformat()

            post_id = queries.create_post(
                user_id=user_id,
                description=description,
                images_urls=imgur_urls,
                location=new_post["location"],
                timestamp=new_post["timestamp"],
            )
            log.info(f"Post inserted with ID: {post_id}")
            if not post_id:
                log.error("Failed to insert post into database.")
                api.abort(500, "Failed to create post")

            
            log.info(f"Returning response: {new_post}")

            return {"post": new_post}, 201

        except Exception as e:
            log.error(f"Unexpected error in POST /posts: {e}")
            api.abort(500, f"An unexpected error occurred: {str(e)}")

    @jwt_required()
    @api.doc(
        description="Modify an existing post by providing its ID.",
        params={
            "post_id": {"description": "The ID of the post to modify.", "example": "12345", "required": True},
            "description": {"description": "Updated text description of the post.", "example": "Updated description."},
            "images_urls": {"description": "Updated list of image URLs.", "example": ["url1", "url2"]}
        }
    )
    @api.response(200, "Post updated successfully")
    @api.response(400, "Failed to update post")
    @api.response(500, "Internal server error")
    def put(self):
        """
        Modify an existing post
        """
        try:
            log.info("PUT /posts endpoint hit.")
            data = request.json
            log.info(f"Received data: {data}")
            post_id = data['post_id']
            description = data.get('description')
            images_urls = data.get('images_urls')

            log.info(f"Updating post {post_id} with description: {description}, images_urls: {images_urls}")
            if db().modify_post(post_id, description, images_urls):
                log.info(f"Post {post_id} updated successfully.")
                return {"message": "Post updated successfully"}, 200
            log.error(f"Failed to update post {post_id}.")
            return {"message": "Failed to update post"}, 400
        except Exception as e:
            log.error(f"Error in PUT /posts: {e}")
            return {"message": "Internal server error"}, 500

    @jwt_required()
    @api.doc(
        description="Delete an existing post by providing its ID.",
        params={
            "post_id": {"description": "The ID of the post to delete.", "example": "12345", "required": True}
        }
    )
    @api.response(200, "Post deleted successfully")
    @api.response(400, "Failed to delete post")
    @api.response(500, "Internal server error")
    def delete(self):
        """
        Delete an existing post
        """
        try:
            log.info("DELETE /posts endpoint hit.")
            log.info(f"Request Headers: {request.headers}")
            log.info(f"Raw Data: {request.data.decode('utf-8')}")
            data = request.get_json()
            log.info(f"Received data: {data}")
            post_id = data['_id']
            user_id = get_jwt_identity()
            log.info(f"User ID: {user_id}, Post ID: {post_id}")

            if db().delete_post(post_id, user_id):
                log.info(f"Post {post_id} deleted successfully.")
                return {"message": "Post deleted successfully"}, 200
            log.error(f"Failed to delete post {post_id}.")
            return {"message": "Failed to delete post"}, 400
        except Exception as e:
            log.error(f"Error in DELETE /posts: {e}")
            return {"message": "Internal server error"}, 500

