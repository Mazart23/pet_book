import logging

from ..database.queries import Queries as db 

from flask import request
from flask_restx import Resource, fields, Namespace


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
