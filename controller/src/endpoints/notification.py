import logging

from flask import request
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..database.queries import Queries as db
from ..utils.request import send_request
from ..utils.apps import Services


log = logging.getLogger('NOTIFICATION')

api = Namespace('notification')


comment_model = api.model(
    'Comment data model', 
    {
        'post_id': fields.String(required=True, description='Unique ID of the post'),
        'user_id': fields.String(required=True, description='Unique ID of the user that has commented the post'),
        'comment_id': fields.String(required=True, description='Unique ID of the comment'),
    }
)

reaction_model = api.model(
    'Reaction data model', 
    {
        'post_id': fields.String(required=True, description='Unique ID of the post'),
        'user_id': fields.String(required=True, description='Unique ID of the user that has given the reaction'),
        'reaction_type': fields.String(required=True, description='Type of reaction'),
    }
)

scan_model = api.model(
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
        'data': fields.Polymorph(
            {
                'comment': comment_model,
                'reaction': reaction_model,
                'scan': scan_model
            },
            discriminator='notification_type',
            required=True,
            description='Data specific for notification type'
        )
    }
)

delete_model = api.model(
    'Delete notification model',
    {
        'notification_id': fields.String(required=True, description='Unique ID of the notification'),
        'notification_type': fields.String(required=True, description='Type of notification', enum=['comment', 'reaction', 'scan'])
    }
)


@api.route('/')
class Notification(Resource):
    @api.doc(params={'quantity': {'description': 'Quantity of reactions to fetch', 'type': int, 'default': 10, 'required': True}})
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
        
        queries = db()
        result = queries.get_notifications(user_id, quantity)
        
        return result, 200

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