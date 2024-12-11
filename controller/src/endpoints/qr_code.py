import logging
import datetime

from flask import request
from flask_restx import Resource, fields, Namespace

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
        'data': fields.Nested(guest_model, required=True, description='Guest information')
    }
)


@api.route('/scan')
class Scan(Resource):
    @api.expect(scan_input_model, validate=True)
    @api.response(200, 'OK')
    @api.response(400, 'Bad Request')
    @api.response(500, 'Database Error')
    def post(self):
        timestamp = str(datetime.datetime.now())
        json_data = request.get_json()

        user_id = json_data.get('user_id')
        guest = json_data.get('data')
        
        ip = guest.get('ip')
        city = guest.get('city')
        latitude = guest.get('latitude')
        longitude = guest.get('longitude')

        queries = db()

        notification_id = queries.insert_scan(user_id, ip, city, latitude, longitude, timestamp)

        if not notification_id:
            api.abort(500, 'Database Error')
        
        send_json = {}
        send_json.update(json_data)
        send_json.update({'notification_id': notification_id, 'timestamp': timestamp})
        send_json['data'].pop('ip')
        
        try:
            send_request('POST', Services.NOTIFIER, '/emit/scan', json_data=send_json)
        except Exception as e:
            log.info(f'Error during sending notification for {user_id = } via websocket: {e}')
            
        return {}, 200
