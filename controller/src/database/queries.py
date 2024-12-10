from bson.objectid import ObjectId
from bson.binary import Binary
import logging

from pymongo import DESCENDING

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
    
    def get_notifications(self, user_id: str, quantity: int) -> list[dict]:
        try:
            filter = {'user_id': user_id}
            projection = {
                "custom_fields": {
                    "$switch": {
                        "branches": [
                            {
                                "case": {"$eq": ["$notification_type", "comment"]},
                                "then": {
                                    "post_id": 1,
                                    "user_id": 1,
                                    "comment_id": 1,
                                    "content": 1,
                                    'timestamp': 1
                                }
                            },
                            {
                                "case": {"$eq": ["$notification_type", "reaction"]},
                                "then": {
                                    "post_id": 1,
                                    "user_id": 1,
                                    "reaction_type": 1,
                                    "timestamp": 1
                                }
                            },
                            {
                                "case": {"$eq": ["$notification_type", "scan"]},
                                "then": {
                                    "city": 1,
                                    "latitude": 1,
                                    "longitude": 1,
                                    "timestamp": 1
                                }
                            }
                        ],
                        "default": {}
                    }
                },
                "timestamp": 1
            },
            return self.find('notification', 'user_id', filter, projection, quantity)
        except Exception as e:
            log.error(f'Error fetching notifications: {e}')
            return []
    
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

    def delete_notification(self, user_id: str, notification_id: str) -> bool:
        try:
            notification_object_id = ObjectId(notification_id)

            delete_result = self.delete_one(
                'users',
                {
                    "user_id": user_id,
                    "_id": notification_object_id
                }
            )
            
            if delete_result.deleted_count == 0:
                log.info(f"Notification not deleted for {user_id}, {notification_id = }")
                return False

            return True
        
        except Exception as e:
            log.error(f"Error during deleting notification: {notification_id = }, {user_id = }, Error = {e}")
            return False