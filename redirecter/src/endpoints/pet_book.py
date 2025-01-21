import logging

from flask import request, render_template, make_response
from flask_restx import Resource, fields, Namespace
import geocoder
from geopy.geocoders import Nominatim

from ..database.queries import Queries as db 
from ..utils.apps import Services
from ..utils.request import send_request


log = logging.getLogger('PETBOOK')

api = Namespace('pet-book')
 

notification_status = api.model(
    'Notification status',
    {
        'is_send': fields.Boolean()
    }
)

redirect_model = api.model(
    'Redirect model',
    {
        'user_id': fields.String(required=True, description='User identifier', example='671f880f5bf26ed4c9f540fd'),
        'remote_addr': fields.String(required=True, description='IP whose call access point', example='0.0.0.0'),
        'is_location_passed': fields.Boolean(required=True, description='Indicates if location was successfully passed', example=True),
        'latitude': fields.Float(required=False, description='Latitude obtained from geolocation', example='13.33'),
        'longitude': fields.Float(required=False, description='Longitude obtained from geolocation', example='10.34')
    }
)


@api.route('/')
class AccessPoint(Resource):
    @api.doc(params={'id': {'description': 'User Identifier', 'example': '671f880f5bf26ed4c9f540fd', 'required': True}})
    @api.response(200, 'OK')
    @api.response(400, 'Bad Request')
    @api.response(404, 'User not found')
    def get(self):
        user_id = request.args.get('id')

        queries = db()
        
        username = queries.get_username(user_id)

        if username is None:
            api.abort(404)
        
        remote_addr = request.remote_addr
        
        post_to = Services.REDIRECTER
        url_post = f'{post_to.http}://{post_to.ip_host}:{post_to.port}/pet-book/notify'

        redirection_to = Services.CLIENT
        url_redirect = f'{redirection_to.http}://{redirection_to.ip_host}:{redirection_to.port}/profile/{username}'
    
        response = make_response(render_template('locationAsk.html', user_id=user_id, username=username, remote_addr=remote_addr, url_post=url_post, url_redirect=url_redirect))
        response.headers['Content-Type'] = 'text/html'
        return response


@api.route('/notify')
class Notify(Resource):
    @api.expect(redirect_model, validate=True)
    @api.response(200, 'OK')
    @api.response(400, 'Bad Request')
    @api.response(500, 'Internal Server Error / Request Error')
    def post(self):
        data = request.get_json()
        user_id = data.get('user_id')
        remote_addr = data.get('remote_addr')
        is_location_passed = data.get('is_location_passed')

        if is_location_passed:
            latitude = str(data.get('latitude'))
            longitude = str(data.get('longitude'))
            
            geolocator = Nominatim(user_agent='pet-book')
            
            try:
                location = geolocator.reverse(f'{latitude}, {longitude}', language='pl')
                
                if location and 'address' in location.raw and 'city' in location.raw['address']:
                    city = location.raw['address']['city']
                else:
                    city = ''
            
            except Exception as e:
                log.error(f'Error with geolocation: {e}')
                city = ''
            
        else:
            ip = geocoder.ip(remote_addr)
            
            if ip and ip.latlng:
                latitude = str(ip.latlng[0])
                longitude = str(ip.latlng[1])
                city = ip.city if ip.city else ''
            
            else:
                latitude, longitude, city = '', '', ''
        
        json_data = {
            'user_id': user_id,
            'data': {
                'ip': remote_addr,
                'city': city,
                'latitude': latitude,
                'longitude': longitude,
            }
        }
        
        try:
            response_controller = send_request('POST', Services.CONTROLLER, '/qr/scan', json_data=json_data)
                
        except Exception as e:
            log.error(f'Exception during sending qr scan info: {e}')
            api.abort(500, 'Request Error')
        
        if response_controller.status_code != 200:
            log.error(f'Got unexpected response from controller for sending qr scan info: {response_controller}')
            api.abort(500, 'Internal Server Error')
        
        return {}, 200
