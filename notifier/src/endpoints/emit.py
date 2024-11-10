import logging

from flask import request
from flask_restx import Resource, fields, Namespace

from ..utils.websocket import Websocket 


log = logging.getLogger('EMIT')

api = Namespace('emit')


guest_model = api.model(
    'Guest model', {
        'ip': fields.String(required=True, description='IP address of the guest'),
        'city': fields.String(required=True, description='City associated with the IP address'),
        'latitude': fields.String(required=True, description='Latitude coordinate of the IP address'),
        'longitude': fields.String(required=True, description='Longitude coordinate of the IP address')
    }
)

scan_input_model = api.model(
    'Scan model', 
    {
        'user_id': fields.String(required=True, description='Unique ID of the user'),
        'guest': fields.Nested(guest_model, required=True, description='Guest information'),
        'timestamp': fields.String(required=True, description='Time of scan')
    }
)


@api.route('/scan')
class Scan(Resource):
    @api.expect(scan_input_model, validate=True)
    @api.response(200, 'OK')
    def post(self):
        json_data = request.get_json()

        user_id = json_data.get('user_id')
        
        socket = Websocket()

        if socket.is_connected(user_id):
            socket.emit('notification_scan', json_data, room=user_id)

        return {}, 200
