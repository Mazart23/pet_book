import logging

from flask import request
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..database.queries import Queries as db
from ..utils.request import send_request
from ..utils.apps import Services


log = logging.getLogger('COMMENT')

api = Namespace('comment')


@api.route('/')
class Comment(Resource):
    def get(self):
        '''
        fetch
        '''
    
    @api.response(200, 'OK')
    @api.response(400, 'Bad Request')
    @api.response(401, 'Unauthorized')
    @api.response(500, 'Database Error')
    @jwt_required()
    def put(self):
        '''
        Create comment
        '''
        user_id = get_jwt_identity()
        user_owner_id = request.json.get('user_id')
        # there will be database operations...
        json_data = {}
        send_request('POST', Services.NOTIFIER, '/emit/comment', json_data=json_data)
        try:
            send_request('POST', Services.NOTIFIER, '/emit/scan', json_data=json_data)
        except Exception as e:
            log.info(f'Error during sending notification for {user_owner_id = } via websocket: {e}')

        return {}, 200

    def delete(self):
        '''
        delete
        '''
