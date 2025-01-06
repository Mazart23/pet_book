import logging

from flask import request
from flask_restx import Resource, fields, Namespace

from ..utils.websocket import Websocket 


log = logging.getLogger('EMIT')

api = Namespace('emit')


scan_model = api.model(
    'Scan model', 
    {
        'city': fields.String(required=True, description='City name associated with the IP address'),
        'latitude': fields.String(required=True, description='Latitude coordinate of the IP address'),
        'longitude': fields.String(required=True, description='Longitude coordinate of the IP address')
    }
)

scan_input_model = api.model(
    'Scan input model', 
    {
        'user_owner_id': fields.String(required=True, description='Unique ID of the user'),
        'notification_id': fields.String(required=True, description='Unique ID of the scan'),
        'data': fields.Nested(scan_model, required=True, description='Scan information'),
        'timestamp': fields.String(required=True, description='Time of scan')
    }
)


reaction_model = api.model(
    'Reaction model', 
    {
        'post_id': fields.String(required=True, description='Unique ID of the reacted post'),
        'user_id': fields.String(required=True, description='Unique ID of the user who reacted'),
        'username': fields.String(required=True, description='Name of the user who reacted'),
        'reaction_type': fields.String(required=True, description='Type of reaction'),
    }
)

reaction_input_model = api.model(
    'Reaction Input Model', 
    {
        'user_owner_id': fields.String(required=True, description='Unique ID of the user'),
        'notification_id': fields.String(required=True, description='Unique ID of the reaction'),
        'data': fields.Nested(reaction_model, required=True, description='Reaction information'),
        'timestamp': fields.String(required=True, description='Time of reaction')
    }
)

comment_model = api.model(
    'Comment model', 
    {
        'post_id': fields.String(required=True, description='Unique ID of the commented post'),
        'user_id': fields.String(required=True, description='Unique ID of the user who commented'),
        'username': fields.String(required=True, description='Username of the user who commented'),
    }
)

comment_input_model = api.model(
    'Comment Input Model', 
    {
        'user_owner_id': fields.String(required=True, description='Unique ID of the user'),
        'notification_id': fields.String(required=True, description='Unique ID of the comment'),
        'data': fields.Nested(comment_model, required=True, description='Comment information'),
        'timestamp': fields.String(required=True, description='Time of comment')
    }
)


@api.route('/scan')
class Scan(Resource):
    @api.expect(scan_input_model, validate=True)
    @api.response(200, 'OK')
    @api.response(400, 'Bad Request')
    def post(self):
        json_data = request.get_json()

        user_id = json_data.pop('user_owner_id')
        json_data['notification_type'] = 'scan'

        socket = Websocket()

        if socket.is_connected(user_id):
            socket.emit('notification_scan', json_data, room=user_id)

        return {}, 200


@api.route('/reaction')
class Reaction(Resource):
    @api.expect(reaction_input_model, validate=True)
    @api.response(200, 'OK')
    @api.response(400, 'Bad Request')
    def post(self):
        json_data = request.get_json()

        user_id = json_data.pop('user_owner_id')
        json_data['notification_type'] = 'reaction'
        
        socket = Websocket()

        if socket.is_connected(user_id):
            socket.emit('notification_reaction', json_data, room=user_id)

        return {}, 200


@api.route('/comment')
class Comment(Resource):
    @api.expect(comment_input_model, validate=True)
    @api.response(200, 'OK')
    @api.response(400, 'Bad Request')
    def post(self):
        json_data = request.get_json()

        user_id = json_data.pop('user_owner_id')
        json_data['notification_type'] = 'comment'
        
        socket = Websocket()

        if socket.is_connected(user_id):
            socket.emit('notification_comment', json_data, room=user_id)

        return {}, 200
