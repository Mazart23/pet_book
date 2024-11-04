import logging

from flask import request, redirect
from flask_restx import Resource, fields, Namespace
import requests
import geocoder

from ..database.queries import Queries as db 
from ..utils.apps import Service
from ..utils.request import send_request


log = logging.getLogger('### PETBOOK ###')

api = Namespace('pet-book')
 

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

@api.route('/redirect')
class Status(Resource):
    @api.doc(params={'id': {'description': 'User Identifier', 'example': '671f880f5bf26ed4c9f540fd', 'required': True}})
    @api.response(404, 'User not found')
    def get(self):
        user_id = request.args.get('id')

        queries = db()
        
        username = queries.get_username(user_id)

        if username is None:
            api.abort(404)

        ip_adrr = request.remote_addr
        ip = geocoder.ip(ip_adrr)

        json_data = {
            'user_id': user_id,
            'guest': {
                'ip': ip_adrr,
                'city': str(ip.city) if ip.city else '',
                'latitude': str(ip.latlng[0]) if ip.latlng[0] else '',
                'longitude': str(ip.latlng[1]) if ip.latlng[1] else '',
            }
        }
        response_controller = send_request('POST', Service.CONTROLLER, '/qr/scan', json_data=json_data)

        is_user_informed = response_controller.status_code == 200
        redirection_service = Service.CLIENT

        return redirect(f'{redirection_service['http']}://{redirection_service['ip']}:{redirection_service['port']}/profile/{username}?informed={is_user_informed}')
