from typing import List, Dict
from bson.objectid import ObjectId

from . import MongoDBConnect


class Queries(MongoDBConnect):

    def get_user(self, id: str) -> List[Dict]:
        try:
            query = {'_id': ObjectId(id)}
            # projection = {'_id' : 0}
            return list(self.find("users", query))
        except Exception as e:
            print(f"Error fetching user: {e}")
            return []     
