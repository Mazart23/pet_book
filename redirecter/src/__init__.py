from logging import DEBUG

from flask import Flask, Blueprint
from flask_restx import Api
from flask_cors import CORS

from .utils.logger_config import config_logger


app = Flask(__name__, template_folder="/redirecter/src/templates")

CORS(app)
config_logger(app, DEBUG)

blueprint = Blueprint('api', __name__)
api = Api(blueprint, version = '1.0.0', title = 'PetBook Redirecter API')


from .endpoints.pet_book import api as pet_book


api.add_namespace(pet_book)

app.register_blueprint(blueprint)
