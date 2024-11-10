import logging
from bson.objectid import ObjectId

from . import MongoDBConnect


log = logging.getLogger('QUERIES')


class Queries(MongoDBConnect):

    def get_username(self, id: str) -> str | None:
        try:
            query = {'_id': ObjectId(id)}
            result = self.find_one('users', query)
            if result:
                return result['username']
            else:
                return None
        except Exception as e:
            log.error(f'Error fetching user: {e}')
            return None
