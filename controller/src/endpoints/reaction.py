import logging

from flask import request
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import jwt_required

from ..database.queries import Queries as db
from ..utils.request import send_request
from ..utils.apps import Services


log = logging.getLogger('REACTION')

api = Namespace('reaction')


@api.route('/')
class Reaction(Resource):
    def get(self):
        '''
        fetch
        '''

    def put(self):
        '''
        create
        '''

    def patch(self):
        '''
        edit
        '''

    def delete(self):
        '''
        delete
        '''