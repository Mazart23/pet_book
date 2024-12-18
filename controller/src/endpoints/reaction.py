import logging
from datetime import datetime

from flask import request
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..database.queries import Queries as db
from ..utils.request import send_request
from ..utils.apps import Services


log = logging.getLogger('REACTION')

api = Namespace('reaction')


auth_parser = api.parser()
auth_parser.add_argument(
    'Authorization', 
    location='headers', 
    required=True, 
    help='Bearer token for authentication',
    type=str,
    default='Bearer ',
)

get_reactions_model = api.model(
    'Get reactions model', 
    {
        'reaction_id': fields.String(required=True, description='Unique ID of the reaction'),
        'post_id': fields.String(required=True, description='Unique ID of the reacted post'),
        'user_id': fields.String(required=True, description='Unique ID of the user who reacted'),
        'username': fields.String(required=True, description='Username of the user who reacted'),
        'reaction_type': fields.String(required=True, description='Type of raction')
    }
)

put_reaction_model = api.model(
    'Put reaction model', 
    {
        'reaction_type': fields.String(required=True, description='Type of the reaction'),
        'post_id': fields.String(required=True, description='Unique ID of the reacted post'),
    }
)

delete_reaction_model = api.model(
    'Delete reaction model', 
    {
        'reaction_id': fields.String(required=True, description='Unique ID of the reaction'),
        'post_id': fields.String(required=True, description='Unique ID of the reacted post'),
    }
)


@api.route('/')
class Reaction(Resource):
    @api.doc(
        params={
            'post_id': {'description': 'Unique ID of post to fetch reactions of', 'type': str, 'required': True},
            'Authorization': {
                'description': 'Bearer token for authentication',
                'required': True,
                'in': 'header',
                'default': 'Bearer '
            }
        }
    )
    @api.marshal_list_with(get_reactions_model, code=200)
    @api.response(200, 'OK')
    @api.response(400, 'Bad Request')
    @api.response(401, 'Unauthorized')
    @api.response(500, 'Database Error')
    @jwt_required()
    def get(self):
        '''
        Fetch reactions
        '''

    @api.doc(params={
        'Authorization': {
            'description': 'Bearer token for authentication',
            'required': True,
            'in': 'header',
            'default': 'Bearer '
        }
    })
    @api.expect(put_reaction_model, validate=True)
    @api.response(201, 'Created')
    @api.response(400, 'Bad Request')
    @api.response(401, 'Unauthorized')
    @api.response(500, 'Database Error')
    @jwt_required()
    def put(self):
        '''
        Create reaction
        '''
        user_id = get_jwt_identity()
        post_id = request.json.get('post_id')
        reaction_type = request.json.get('reaction_type')
        timestamp = datetime.now()
        
        queries = db()
        user_owner_id = queries.get_post_by_id(post_id).get('user_id')
        
        if not user_owner_id:
            log.info('User owner not found')
            api.abort(404, "User not found")
        
        username = queries.get_user_by_id(user_id).get('username')
        
        if not username:
            log.info('User that reacted not found')
            api.abort(404, "User not found")
        
        reaction_id = queries.insert_reaction(post_id, user_id, reaction_type, timestamp)
        
        if not reaction_id:
            log.error(f'Cannot insert reaction for data: {post_id = }, {user_id = }, {reaction_type = }')
            api.abort(500, 'Database Error')
        
        json_data = {
            'user_owner_id': user_owner_id,
            'data': {
                'reaction_id': reaction_id,
                'post_id': post_id,
                'user_id': user_id,
                'username': username,
                'reaction_type': reaction_type,
            'timestamp': str(timestamp)
            }
        }
        try:
            send_request('POST', Services.NOTIFIER, '/emit/reaction', json_data=json_data)
        except Exception as e:
            log.info(f'Error during sending notification for {user_owner_id = } via websocket: {e}')

        return {}, 201

    @api.doc(params={
        'Authorization': {
            'description': 'Bearer token for authentication',
            'required': True,
            'in': 'header',
            'default': 'Bearer '
        }
    })
    @api.expect(delete_reaction_model, validate=True)
    @api.response(200, 'OK')
    @api.response(400, 'Bad Request')
    @api.response(401, 'Unauthorized')
    @api.response(403, 'Forbidden')
    @api.response(500, 'Database Error')
    @jwt_required()
    def delete(self):
        '''
        Delete reaction
        '''
        user_id = get_jwt_identity()
        reaction_id = request.json.get('reaction_id')
        post_id = request.json.get('post_id')
        
        queries = db()
        reaction = queries.get_reaction_by_id(reaction_id)
        reaction_user_id = str(reaction.get(user_id))
        
        if user_id != reaction_user_id:
            log.info(f'Ownership of the reaction is in conflict: {user_id = }, {reaction_user_id = }')
            api.abort(403, "Forbidden")
        
        response = queries.delete_reaction(reaction_id, post_id)
        
        if not response:
            log.error(f'Cannot delete reaction for data: {reaction_id = }, {user_id = }, {post_id = }')
            api.abort(500, 'Database Error')

        return {}, 200