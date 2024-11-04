import os
from threading import Lock

from flask import Flask, request
from flask_socketio import SocketIO, join_room
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request, decode_token

from .singleton import SingletonMeta


class Websocket(metaclass=SingletonMeta):

    def __init__(self, app: Flask | None):
        '''
        app - running flask application
        connected_users - states of users: True - connected, False - disconnected

        register events by on_event
        '''
        client_http = os.environ.get('CLIENT_HTTP')
        client_ip = os.environ.get('CLIENT_IP')
        client_port = os.environ.get('CLIENT_PORT')
        self.app = SocketIO(app, cors_allowed_origins=f"{client_http}://{client_ip}:{client_port}")

        self.connected_users = {}
        self.users_lock = Lock()

        @self.app.on('connect')
        def on_connect():
            self.handle_connect()

        @self.app.on('disconnect')
        def on_disconnect():
            self.handle_disconnect()
    

    def handle_connect(self) -> None:
        token = request.args.get('token')
        decoded_token = decode_token(token, csrf_value=None, allow_expired=False)

        user_id = decoded_token["sub"]

        if user_id:
            with self.users_lock:
                self.connected_users[user_id] = True
            join_room(user_id)
            print(f'User connected with {user_id = }.')

    def handle_disconnect(self) -> None:
        token = request.args.get('token')
        decoded_token = decode_token(token, csrf_value=None, allow_expired=False)

        user_id = decoded_token["sub"]

        if user_id:
            with self.users_lock:
                self.connected_users[user_id] = False
            print(f'User disconnected with {user_id = }.')


    def is_connected(self, user_id) -> bool:
        with self.users_lock:
            result = self.connected_users.get(user_id, False)
        return result


    def emit(self, *args, **kwargs) -> None:
        self.app.emit(*args, **kwargs)
