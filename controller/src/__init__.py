import os
from logging import DEBUG

from flask import Flask, Blueprint
from flask_restx import Api
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from .utils.logger_config import config_logger


app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')

CORS(app)
config_logger(app, DEBUG)
JWTManager(app)

blueprint = Blueprint('api', __name__)
api = Api(blueprint, version = '1.0.0', title = 'PetBook Controller API')


from .endpoints.user import api as user
from .endpoints.qr_code import api as qr_code
from .endpoints.config import api as config
from .endpoints.post import api as post
from .endpoints.comment import api as comment
from .endpoints.reaction import api as reaction
from .endpoints.notification import api as notification


api.add_namespace(user)
api.add_namespace(qr_code)
api.add_namespace(config)
api.add_namespace(post)
api.add_namespace(comment)
api.add_namespace(reaction)
api.add_namespace(notification)

app.register_blueprint(blueprint)
