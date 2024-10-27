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
