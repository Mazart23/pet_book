import logging
import os

import requests

from flask import request, jsonify
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt

from ..database.queries import Queries as db 



log = logging.getLogger('USER')

api = Namespace('user')

status_model = api.model(
    'Status model',
    {
        'status': fields.String(),
    }
)

user_model = api.model(
    'User model',
    {
        '_id': fields.String(),
        'username': fields.String(),
    }
)

login_input_model = api.model(
    'Login input model',
    {
        'username': fields.String(),
        'password': fields.String(),
    }
)

login_output_model = api.model(
    'Login output model',
    {
        'access_token': fields.String()
    }
)

edit_password_model = api.model(
    'Edit password model',
    {
        'username': fields.String(),
        'current_password': fields.String(),
        'new_password': fields.String(),
    }
)


@api.route('/')
class User(Resource):
    def get(self):
        '''
        fetch
        '''

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


# TESTOWANIE BAZY
@api.route('/user-data')
class UserData(Resource):
    @api.doc(params={'id': {'description': 'User Identifier', 'example': '671f880f5bf26ed4c9f540fd', 'required': True}})
    @api.marshal_with(user_model, code=200, as_list=True)
    @api.response(404, 'User not found')
    def get(self):
        user_id = request.args.get('id')

        queries = db()
        
        user = queries.get_user_by_id(user_id)

        if not user:
            api.abort(404, "User not found.")
        
        ret_dict = {
            '_id': user['_id'],
            'username': user['username']
        }
        return ret_dict, 200


@api.route('/login')
class Login(Resource):
    @api.expect(login_input_model, validate=True)
    @api.marshal_with(login_output_model, code=200)
    @api.response(200, 'OK')
    @api.response(400, 'Bad Request')
    @api.response(401, 'Invalid credentials')
    def post(self):
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        queries = db()

        user = queries.get_user_by_username(username)
        
        if not user or not bcrypt.checkpw(password.encode('utf-8'), user['hashed_password']):
            api.abort(401, 'Invalid credentials')
        
        access_token = create_access_token(identity=str(user['_id']))
        return {'access_token': access_token}, 200


@api.route('/password')
class Password(Resource):
    @api.expect(edit_password_model, validate=True)
    @api.response(200, 'OK')
    @api.response(400, 'Bad Request')
    @api.response(401, 'Invalid credentials')
    @api.response(404, 'User not found')
    @api.response(500, 'Internal Server Error')
    def patch(self):
        data = request.get_json()
        
        username = data.get('username')
        current_password = data.get('current_password')
        password = data.get('new_password')
        
        queries = db()
        
        user = queries.get_user_by_username(username)
        
        if not user:
            api.abort(404, 'User not found')
            
        if not bcrypt.checkpw(current_password.encode('utf-8'), user['hashed_password']):
            api.abort(401, 'Invalid credentials')
        
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        queries = db()
        
        result = queries.user_change_password(user['_id'], hashed_password)
        
        if not result:
            api.abort(500, 'Internal Server Error')
        
        return {}, 200
    
@api.route('/user-picture')
class UserPicture(Resource):
    @api.doc(
        description="Fetch the profile picture URL of a user by their ID.",
        params={
            "user_id": {"description": "The ID of the user whose profile picture URL is to be fetched.", "example": "671f880f5bf26ed4c9f540fd", "required": True}
        },
        responses={
            200: "OK",
            404: "User not found",
            400: "User ID not provided"
        }
    )
    def get(self):
        '''
        Fetch the profile picture URL of a user by their ID.
        '''
        user_id = request.args.get('user_id')
        
        if not user_id:
            api.abort(400, "User ID not provided")
        
        queries = db()
        user = queries.get_user_by_id(user_id)
        if not user:
            api.abort(404, "User not found")

        return {"profile_picture_url": user.get("profile_picture_url", None)}, 200

    @jwt_required()
    @api.doc(
        description="Set or update the authenticated user's profile picture. Requires a file upload (key: 'picture').",
        consumes=["multipart/form-data"],
        params={
            "picture": {"description": "The new profile picture file.", "type": "file", "required": True}
        },
        responses={
            200: "OK",
            400: "No picture file provided",
            404: "User not found",
            401: "Unauthorized",
            500: "Failed to upload image or update profile picture"
        }
    )
    def put(self):
        '''
        Set or update the authenticated user's profile picture.
        '''
        user_id = get_jwt_identity()
        queries = db()

        try:
            log.info(f"Received request to update profile picture for user {user_id}")

            user = queries.get_user_by_id(user_id)
            if not user:
                log.warning(f"User with ID {user_id} not found.")
                api.abort(404, "User not found")

            if 'picture' not in request.files:
                log.warning(f"No picture file provided in request for user {user_id}")
                api.abort(400, "No picture file provided")
            
            picture = request.files['picture']

            log.info("Uploading picture to Imgur...")
            headers = {"Authorization": f"Client-ID {os.environ.get('IMGUR_CLIENT_ID')}"}
            response = requests.post(
                os.environ.get('IMGUR_API_URL'),
                headers=headers,
                files={"image": picture}
            )

            if response.status_code != 200:
                log.error(f"Imgur upload failed with status code {response.status_code}: {response.text}")
                api.abort(500, "Failed to upload image to Imgur")

            imgur_data = response.json()
            new_picture_url = imgur_data['data']['link']
            log.info(f"Imgur upload successful. New URL: {new_picture_url}")

            result = queries.update_user_picture(user_id, new_picture_url)
            if not result:
                log.error(f"Failed to update profile picture for user {user_id} in database.")
                api.abort(500, "Failed to update user profile picture")
            
            log.info(f"Profile picture updated successfully for user {user_id}")
            return {"profile_picture_url": new_picture_url}, 200

        except Exception as e:
            log.error(f"Unexpected error updating profile picture for user {user_id}: {e}")
            api.abort(500, "An unexpected error occurred.")

    @jwt_required()
    @api.doc(
        description="Delete the authenticated user's profile picture.",
        responses={
            200: "OK",
            404: "User not found",
            401: "Unauthorized",
            500: "Failed to delete user profile picture"
        }
    )
    def delete(self):
        """
        Delete the authenticated user's profile picture.
        """
        user_id = get_jwt_identity()
        queries = db()
        user = queries.get_user_by_id(user_id)

        if not user:
            api.abort(404, "User not found")

        result = queries.update_user_picture(user_id, None)
        if not result:
            api.abort(500, "Failed to delete user profile picture")

        return {}, 200
