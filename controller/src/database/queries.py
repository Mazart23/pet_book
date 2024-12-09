from bson.objectid import ObjectId
from bson.binary import Binary
import logging

from . import MongoDBConnect

log = logging.getLogger('QUERIES')


class Queries(MongoDBConnect):

    def get_user_by_id(self, id: str) -> dict:
        try:
            filter = {'_id': ObjectId(id)}
            # projection = {'_id' : 0}
            return self.find_one('users', filter)
        except Exception as e:
            log.error(f'Error fetching user: {e}')
            return {}
    
    def get_user_by_username(self, username: str) -> dict:
        try:
            filter = {'username': username}
            return self.find_one('users', filter)
        except Exception as e:
            log.error(f'Error fetching user: {e}')
            return {}
        
    def get_user_by_email(self, email: str) -> dict:
        try:
            filter = {'email': email}
            return self.find_one('users', filter)
        except Exception as e:
            log.error(f'Error fetching user: {e}')
            return {}
    
    def user_change_password(self, _id: ObjectId, hashed_password: bytes) -> bool:
        try:
            hashed_password_binary = Binary(hashed_password)
            update_result = self.update_one(
                'users',
                {'_id': _id},
                {'$set': {'hashed_password': hashed_password_binary}},
            )

            if update_result.modified_count == 0:
                log.info(f'User with id {_id} not updated')
                return False
            
            return True

        except Exception as e:
            log.error(f'Error updating user: {e}')
            return False
    
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

        if update_result.modified_count == 0:
            log.info(f"User with id {user_id} not updated")
            return False
        
        return True

    def update_user_picture(self, user_id: str, new_picture_url: str) -> bool:

        try:
            update_result = self.update_one(
                'users',
                {'_id': ObjectId(user_id)},
                {'$set': {'profile_picture_url': new_picture_url}}
            )

            if update_result.modified_count == 0:
                log.info(f"Profile picture not updated for user {user_id}")
                return False

            return True
        
        except Exception as e:
            log.error(f"Error updating profile picture for user {user_id}: {e}")
            return False
