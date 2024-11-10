import logging

import requests

from .apps import Service


def send_request(method: str, to: Service | str, endpoint: str, json_data: dict = {}, json_input: bool = True, json_output: bool = True, timeout: int = 30) -> requests.Response:
    url = None
    if isinstance(to, Service):
        url = f'{to.http}://{to.ip}:{to.port}{endpoint}'
    else:
        url = f'{to}{endpoint}'

    headers = {}
    if json_input:
        headers['Content-Type'] = 'application/json'
    if json_output:
        headers['Accept'] = 'application/json'
    
    match method:
        case 'GET':
            headers.pop('Content-Type')
            response = requests.get(url, params=json_data, timeout=timeout, headers=headers)
        case 'POST':
            response = requests.post(url, json=json_data, timeout=timeout, headers=headers)
        case 'PUT':
            response = requests.put(url, params=json_data, timeout=timeout, headers=headers)
    
    return response
