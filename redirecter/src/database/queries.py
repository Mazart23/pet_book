from typing import List, Dict
from bson.objectid import ObjectId

from . import MongoDBConnect


class Queries(MongoDBConnect):

    def get_username(self, id: str) -> str | None:
        try:
            query = {'_id': ObjectId(id)}
            result = self.find_one("users", query)
            if result:
                return result['name']
            else:
                return None
        except Exception as e:
            print(f"Error fetching user: {e}")
            return []