import os
from dataclasses import dataclass

import yaml


@dataclass
class Service:
    http: str
    ip_host: str
    ip: str
    port: str

    @classmethod
    def load(cls, service: str):
        with open("/app/config/apps.yaml", "r") as file:
            config = yaml.safe_load(file)
        return cls(
            http=config['services'][service]['http'],
            ip_host=config['services'][service]['ip_host'],
            ip=config['services'][service]['ip'],
            port=config['services'][service]['port']
        )

class Services:
    CLIENT = Service.load('client')
    CONTROLLER = Service.load('controller')
    REDIRECTER = Service.load('redirecter')
    NOTIFIER = Service.load('notifier')
