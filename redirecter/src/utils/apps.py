import os
from enum import Enum


class Service(Enum):
    CLIENT = {
        'HTTP': os.environ.get('CLIENT_HTTP'),
        'IP': os.environ.get('CLIENT_IP'),
        'PORT': os.environ.get('CLIENT_PORT')
    }
    CONTROLLER = {
        'HTTP': os.environ.get('CONTROLLER_HTTP'),
        'IP': os.environ.get('CONTROLLER_IP'),
        'PORT': os.environ.get('CONTROLLER_PORT')
    }
    REDIRECTER = {
        'HTTP': os.environ.get('REDIRECTER_HTTP'),
        'IP': os.environ.get('REDIRECTER_IP'),
        'PORT': os.environ.get('REDIRECTER_PORT')
    }
    NOTIFIER = {
        'HTTP': os.environ.get('NOTIFIER_HTTP'),
        'IP': os.environ.get('NOTIFIER_IP'),
        'PORT': os.environ.get('NOTIFIER_PORT')
    }
