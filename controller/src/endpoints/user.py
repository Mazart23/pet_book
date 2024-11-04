import logging

from flask import request
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import create_access_token

from ..database.queries import Queries as db 


log = logging.getLogger('### USER ###')

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
        'name': fields.String(),
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

@api.route('/status')
class Status(Resource):
    @api.doc(params={'id': {'description': 'Identifier', 'example': '1'}})
    @api.marshal_with(status_model, code=200)
    def get(self):
        id = request.args.get('id')
        return {'status': 'OK'}, 200
    @api.expect(status_model, validate=True)
    @api.marshal_with(status_model, code=200)
    def post(self):
        req_data = request.get_json()
        return {'status': 'OK'}, 200
    
# TESTOWANIE BAZY
@api.route('/user-data')
class User(Resource):
    @api.doc(params={'id': {'description': 'User Identifier', 'example': '671f880f5bf26ed4c9f540fd', 'required': True}})
    @api.marshal_with(user_model, code=200, as_list=True)
    @api.response(404, 'User not found')
    def get(self):
        user_id = request.args.get('id')

        queries = db()
        
        users = queries.get_user(user_id)

        if not users:
            api.abort(404, "User not found.")

        return users, 200


@api.route('/login')
class Login(Resource):
    @api.expect(login_input_model, validate=True)
    @api.marshal_with(login_output_model, code=200)
    @api.response(401, 'Invalid credentials')
    def post(self):
        username = request.json.get('username')
        password = request.json.get('password')

        if not(username == 'test' and password == 'password'):
            api.abort(401, 'Invalid credentials')

        user_id = '123'
        access_token = create_access_token(identity=user_id)
        return {'access_token': access_token}, 200
