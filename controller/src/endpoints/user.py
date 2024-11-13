import logging

from flask import request
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import create_access_token
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
    
# TESTOWANIE BAZY
@api.route('/user-data')
class User(Resource):
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

@api.route('/edit-password')
class EditPassword(Resource):
    @api.expect(edit_password_model, validate=True)
    @api.response(200, 'OK')
    @api.response(401, 'Invalid credentials')
    @api.response(404, 'User not found')
    @api.response(500, 'Internal Server Error')
    def post(self):
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
