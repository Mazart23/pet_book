import logging

from flask import request
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..database.queries import Queries as db
from ..utils.request import send_request
from ..utils.apps import Services
from ..utils.fields import DynamicModelField


log = logging.getLogger('NOTIFICATION')

api = Namespace('notification')


base_model = api.model(
    'Base Notification Model', 
    {
        'notification_type': fields.String(description='The type of notification')
    }
)

comment_model = api.inherit(
    'Comment data model', 
    {
        'post_id': fields.String(required=True, description='Unique ID of the post'),
        'user_id': fields.String(required=True, description='Unique ID of the user that has commented the post'),
        'username': fields.String(required=True, description='Username of the user who commented'),
    }
)

reaction_model = api.inherit(
    'Reaction data model', 
    {
        'post_id': fields.String(required=True, description='Unique ID of the post'),
        'user_id': fields.String(required=True, description='Unique ID of the user that has given the reaction'),
        'username': fields.String(required=True, description='Username of the user who reacted'),
        'reaction_type': fields.String(required=True, description='Type of reaction'),
    }
)

scan_model = api.inherit(
    'Scan data model', 
    {
        'city': fields.String(required=True, description='City name associated with the location'),
        'latitude': fields.String(required=True, description='Latitude coordinate of the location'),
        'longitude': fields.String(required=True, description='Longitude coordinate of the location')
    }
)

get_model = api.model(
    'Get notifications model',
    {
        'notification_type': fields.String(required=True, description='Type of notification', enum=['comment', 'reaction', 'scan']),
        'notification_id': fields.String(required=True, description='Unique ID of the notification'),
        'timestamp': fields.String(required=True, description='Time of the scan'),
        'data': DynamicModelField({
            'comment': comment_model,
            'reaction': reaction_model,
            'scan': scan_model
        })
    }
)

delete_model = api.model(
    'Delete notification model',
    {
        'notification_id': fields.String(required=True, description='Unique ID of the notification'),
    }
)


@api.route('/')
class Notification(Resource):
    @api.doc(
        params={
            'last_timestamp': {'description': 'Timestamp of last fetched notification', 'type': str, 'required': True},
            'quantity': {'description': 'Quantity of reactions to fetch', 'type': int, 'default': 10, 'required': True}
        },
        headers={
            'Authorization': {'description': 'Bearer token for authentication', 'required': True}
        }
    )
    @api.marshal_list_with(get_model, code=200)
    @api.response(200, 'OK')
    @api.response(400, 'Bad Request')
    @api.response(500, 'Database Error')
    @jwt_required()
    def get(self):
        '''
        Fetch list of notifications
        '''
        user_id = get_jwt_identity()
        quantity = request.args.get('quantity', None, type=int)
        if quantity is None or quantity <= 0:
            log.error(f'Got {quantity = }, quantity is required and must be a positive integer')
            api.abort(400, 'Bad Request')
        
        last_timestamp = request.args.get('last_timestamp', None, type=str)
        
        queries = db()
        raw_results = queries.get_notifications(user_id, last_timestamp, quantity)

        if raw_results is False:
            log.info('Problem during getting notifications')
            api.abort(500, 'Database Error')

        formatted_results = []

        for result in raw_results:
            if 'reaction_type' in result:  # reaction
                formatted_results.append({
                    'notification_type': 'reaction',
                    'notification_id': str(result.get('_id')),
                    'timestamp': result.get('timestamp'),
                    'data': {
                        'post_id': result.get('post_id'),
                        'user_id': result.get('user_id'),
                        'username': result.get('username'),
                        'reaction_type': result.get('reaction_type')
                    }
                })
            elif 'city' in result:  # scan
                formatted_results.append({
                    'notification_type': 'scan',
                    'notification_id': str(result.get('_id')),
                    'timestamp': result.get('timestamp'),
                    'data': {
                        'city': result.get('city'),
                        'latitude': result.get('latitude'),
                        'longitude': result.get('longitude')
                    }
                })
            else:  # comment
                formatted_results.append({
                    'notification_type': 'comment',
                    'notification_id':str(result.get('_id')),
                    'timestamp': result.get('timestamp'),
                    'data': {
                        'post_id': result.get('post_id'),
                        'user_id': result.get('user_id'),
                        'username': result.get('username')
                    }
                })

        return formatted_results, 200
    
    @api.doc(
        headers={
            'Authorization': {'description': 'Bearer token for authentication', 'example': 'Bearer ', 'required': True}
        }
    )
    @api.expect(delete_model, validate=True)
    @api.response(200, 'OK')
    @api.response(400, 'Bad Request')
    @api.response(401, 'Unauthorized')
    @api.response(500, 'Database Error')
    @jwt_required()
    def delete(self):
        '''
        Delete notification
        '''
        user_id = get_jwt_identity()
        notification_id = request.json.get('notification_id')
        notification_type = request.json.get('notification_type')
        
        queries = db()
        result = queries.delete_notification(notification_type, user_id, notification_id)
        
        if not result:
            log.error(f'Cannot delete reaction: {user_id = }, {notification_id = }')
            api.abort(500, 'Database Error')
        
        return {}, 200
