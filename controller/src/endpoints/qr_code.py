import logging
import datetime

from flask import request
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..database.queries import Queries as db
from ..utils.request import send_request
from ..utils.apps import Services


log = logging.getLogger('QR')

api = Namespace('qr')


guest_model = api.model(
    'Guest model', {
        'ip': fields.String(required=True, description='IP address of the guest'),
        'city': fields.String(required=True, description='City associated with the IP address'),
        'latitude': fields.String(required=True, description='Latitude coordinate of the IP address'),
        'longitude': fields.String(required=True, description='Longitude coordinate of the IP address')
    }
)

scan_input_model = api.model(
    'Scan input model', {
        'user_id': fields.String(required=True, description='Unique ID of the user'),
        'guest': fields.Nested(guest_model, required=True, description='Guest information')
    }
)

generate_qr_model = api.model(
    'Generate qr model', {
        'qr': fields.String(required=True, description='QR code encoded in base64')
    }
)


@api.route('/scan')
class Scan(Resource):
    @api.expect(scan_input_model, validate=True)
    @api.response(200, 'OK')
    @api.response(500, 'Database Error')
    def post(self):
        timestamp = str(datetime.datetime.now())
        json_data = request.get_json()

        user_id = json_data.get('user_id')
        guest = json_data.get('guest')
        
        ip = guest.get('ip')
        city = guest.get('city')
        latitude = guest.get('latitude')
        longitude = guest.get('longitude')

        queries = db()

        db_response = queries.insert_scan(user_id, ip, city, latitude, longitude, timestamp)

        if not db_response:
            api.abort(500, 'Database Error')
        
        send_json = {}
        send_json.update(json_data)
        send_json.update({'timestamp': timestamp})
        
        try:
            send_request('POST', Services.NOTIFIER, '/emit/scan', json_data=send_json)
        except Exception as e:
            log.info(f'Error during sending notification for {user_id = } via websocket: {e}')
            
        return {}, 200


@api.route('/generator')
class Generator(Resource):
    @api.marshal_with(generate_qr_model, code=200)
    @api.response(401, 'Invalid credentials')
    @api.response(500, 'Internal Server Error')
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        
        qr_encoded = ''
            
        return {'qr': qr_encoded}, 200