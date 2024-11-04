import logging
import datetime

from flask import request
from flask_restx import Resource, fields, Namespace

from ..database.queries import Queries as db
from ..utils.request import send_request
from ..utils.apps import Service


log = logging.getLogger('### QR ###')

api = Namespace('qr')
 

status_model = api.model(
    'Status model',
    {
        'status': fields.String(),
    }
)

guest_model = api.model(
    'Guest', {
        'ip': fields.String(required=True, description='IP address of the guest'),
        'city': fields.String(required=True, description='City associated with the IP address'),
        'latitude': fields.String(required=True, description='Latitude coordinate of the IP address'),
        'longitude': fields.String(required=True, description='Longitude coordinate of the IP address')
    }
)

scan_input_model = api.model(
    'UserData', {
        'user_id': fields.String(required=True, description='Unique ID of the user'),
        'guest': fields.Nested(guest_model, required=True, description='Guest information')
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


@api.route('/scan')
class Status(Resource):
    @api.expect(scan_input_model, validate=True)
    @api.response(200, 'OK')
    @api.response(500, 'Database Error')
    def post(self):
        timestamp = datetime.datetime.now()
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
        send_request('POST', Service.NOTIFIER, '/emit/scan', json_data=send_json)

        return {}, 200
