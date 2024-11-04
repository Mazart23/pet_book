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
    
    def insert_scan(self, user_id: str, ip: str, city: str, latitude: float, longitude: float, timestamp) -> bool:
        try:
            query = {'user_id': user_id, 'ip': ip, 'city': city, 'latitude': latitude, 'longitude': longitude, 'timestamp': timestamp}
            return True
        except Exception as e:
            print(f"Error fetching user: {e}")
            return False
