import logging
from flask import request
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
import bcrypt
from ..database.queries import Queries as db

log = logging.getLogger('USER')
api = Namespace('user')

# Models
user_model = api.model(
    'User model',
    {
        '_id': fields.String(),
        'username': fields.String(),
        'email': fields.String(),
        'bio': fields.String(),
        'profile_picture_url': fields.String(),
        'location': fields.String(),
        'private_settings': fields.Boolean(),
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

# Routes
@api.route('/profile')
class UserProfile(Resource):
    @api.marshal_with(user_model, code=200)
    @api.response(404, 'User not found')
    @jwt_required()
    def get(self):
        """
        Fetch the user's profile data.
        """
        user_id = get_jwt_identity()
        queries = db()

        user = queries.get_user_by_id(user_id)
        if not user:
            api.abort(404, "User not found.")

        return {
            '_id': str(user['_id']),
            'username': user['username'],
            'email': user['email'],
            'bio': user.get('bio', ''),
            'profile_picture_url': user.get('profile_picture_url', ''),
            'location': user.get('location', ''),
            'private_settings': user.get('private_settings', True),
        }, 200


@api.route('/login')
class Login(Resource):
    @api.expect(login_input_model, validate=True)
    @api.marshal_with(login_output_model, code=200)
    @api.response(401, 'Invalid credentials')
    def post(self):
        """
        Log in the user and return an access token.
        """
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        queries = db()
        user = queries.get_user_by_username(username)
        if not user or not bcrypt.checkpw(password.encode('utf-8'), user['hashed_password']):
            api.abort(401, 'Invalid credentials')

        access_token = create_access_token(identity=str(user['_id']))
        return {'access_token': access_token}, 200
