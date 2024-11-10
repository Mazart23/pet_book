from typing import List, Dict
from bson.objectid import ObjectId
import logging

from . import MongoDBConnect

log = logging.getLogger('QUERIES')


class Queries(MongoDBConnect):

    def get_user(self, id: str) -> List[Dict]:
        try:
            query = {'_id': ObjectId(id)}
            # projection = {'_id' : 0}
            return list(self.find("users", query))
        except Exception as e:
            log.error(f"Error fetching user: {e}")
            return []
    
    @MongoDBConnect.transaction
    def insert_scan(self, user_id: str, ip: str, city: str, latitude: float, longitude: float, timestamp: str, session=None) -> bool:
        
        document = {'type': 'qr_scan', 'user_id': ObjectId(user_id), 'ip': ip, 'city': city, 'latitude': latitude, 'longitude': longitude, 'timestamp': timestamp}
        result = self.insert_one('notifications', document)
        
        inserted_id = result.inserted_id

        update_result = self.update_one(
            'users',
            {'_id': ObjectId(user_id)},
            {'$push': {'notifications': inserted_id}},
            session=session
        )

        if update_result.modified_count > 0:
            return True
        else:
            log.info(f"User with id {user_id} not updated")
            return False
