from bson.objectid import ObjectId
from bson.binary import Binary
import logging
from datetime import datetime

from . import MongoDBConnect

log = logging.getLogger('QUERIES')


class Queries(MongoDBConnect):

    def get_user_by_id(self, id: str) -> dict:
        try:
            filter = {'_id': ObjectId(id)}
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
    
    def get_post_by_id(self, id: str) -> dict:
        try:
            filter = {'_id': ObjectId(id)}
            return self.find_one('posts', filter)
        except Exception as e:
            log.error(f'Error fetching post: {e}')
            return {}
    
    def get_notifications(self, user_id: str, last_timestamp: datetime | None, quantity: int) -> list[dict] | bool:
        try:
            scans_filter = {
                'user_id': ObjectId(user_id),
                'is_notification': True
            }
            filter = {
                'is_notification': True
            }

            if last_timestamp:
                timestamp_filter = {'timestamp': {"$lt": last_timestamp}}
                scans_filter.update(timestamp_filter)
                filter.update(timestamp_filter)

            pipeline = [
                {"$match": {"user_id": ObjectId(user_id)}},
                {"$project": {
                    "_id": 1
                }},
                {"$lookup": {
                    "from": "comments",
                    "localField": "_id",
                    "foreignField": "post_id",
                    "pipeline": [
                        {"$match": filter},
                        {"$project": {
                            "_id": 1,
                            "post_id": 1,
                            "user_id": 1,
                            "timestamp": 1
                        }}
                    ],
                    "as": "comments"
                }},
                
                {"$lookup": {
                    "from": "reactions",
                    "localField": "_id",
                    "foreignField": "post_id",
                    "pipeline": [
                        {"$match": filter},
                        {"$project": {
                            "_id": 1,
                            "post_id": 1,
                            "user_id": 1,
                            "reaction_type": 1,
                            "timestamp": 1
                        }}
                    ],
                    "as": "reactions"
                }},
                
                {"$project": {
                    "notifications": {
                        "$concatArrays": [
                            {"$ifNull": ["$comments", []]},
                            {"$ifNull": ["$reactions", []]}
                        ]
                    }
                }},
                
                {"$unwind": {"path": "$notifications", "preserveNullAndEmptyArrays": True}},
                
                {"$replaceRoot": {
                    "newRoot": {
                        "$ifNull": ["$notifications", {}]
                    }
                }},
                
                {"$unionWith": {
                    "coll": "scans",
                    "pipeline": [
                        {"$match": scans_filter},
                        {"$project": {
                            "city": 1,
                            "latitude": 1,
                            "longitude": 1,
                            "timestamp": 1
                        }}
                    ]
                }},

                {"$addFields": {
                    "user_id_object": {"$toObjectId": "$user_id"}
                }},
                {"$lookup": {
                    "from": "users",
                    "localField": "user_id_object",
                    "foreignField": "_id",
                    "as": "user_info"
                }},
                {"$unwind": {
                    "path": "$user_info",
                    "preserveNullAndEmptyArrays": True 
                }},
                {"$addFields": {
                    "username": "$user_info.username"
                }},
                {"$project": {
                    "user_info": 0,
                    "user_id_object": 0
                }},

                {"$sort": {"timestamp": -1}},
                {"$addFields": {
                    "timestamp": {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": "$timestamp"
                        }
                    }
                }},
                {"$match": {
                    "timestamp": {"$ne": None}
                }},
                {"$limit": quantity}
            ]

            return self.find_aggregate('posts', pipeline)

        except Exception as e:
            log.error(f'Error fetching notifications: {e}')
            return False
    
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
    def insert_scan(self, user_id: str, ip: str, city: str, latitude: float, longitude: float, timestamp: datetime, session=None) -> str | bool:
        try:
            document = {
                'user_id': ObjectId(user_id), 
                'ip': ip, 
                'city': city, 
                'latitude': latitude, 
                'longitude': longitude, 
                'timestamp': timestamp,
                'is_notification': True
            }
            result = self.insert_one('scans', document)
            
            inserted_id = result.inserted_id

            update_result = self.update_one(
                'users',
                {'_id': ObjectId(user_id)},
                {'$push': {'scans': inserted_id}},
                session=session
            )

            if update_result.modified_count == 0:
                log.info(f"User with id {user_id} not updated")
                return False
            
            return inserted_id
    
        except Exception as e:
            log.error(f"Error inserting comment with data {user_id = }, {ip = }, {city = }, {latitude = }, {longitude = } Error: {e}")
            return False
    
    @MongoDBConnect.transaction
    def insert_comment(self, post_id: str, user_id: str, content: str, timestamp: datetime, session=None) -> str | bool:
        try:
            document = {
                'post_id': ObjectId(post_id), 
                'user_id': ObjectId(user_id), 
                'content': content, 
                'timestamp': timestamp, 
                'is_notification': True
            }
            result = self.insert_one('comments', document)
            
            inserted_id = result.inserted_id

            update_result = self.update_one(
                'posts',
                {'_id': ObjectId(post_id)},
                {'$push': {'comments': inserted_id}},
                session=session
            )

            if update_result.modified_count == 0:
                log.info(f"Post with id {post_id} not updated")
                return False
            
            return str(inserted_id)
        
        except Exception as e:
            log.error(f"Error inserting comment with data {post_id = }, {user_id = }, {content = }, Error: {e}")
            return False
    
    @MongoDBConnect.transaction
    def insert_reaction(self, post_id: str, user_id: str, reaction_type: str, timestamp: datetime, session=None) -> str | bool:
        try:
            document = {
                'post_id': ObjectId(post_id), 
                'user_id': ObjectId(user_id), 
                'reaction_type': reaction_type, 
                'timestamp': timestamp, 
                'is_notification': True
            }
            result = self.insert_one('reactions', document)
            
            inserted_id = result.inserted_id

            update_result = self.update_one(
                'posts',
                {'_id': ObjectId(post_id)},
                {'$push': {'reactions': inserted_id}},
                session=session
            )

            if update_result.modified_count == 0:
                log.info(f"Reaction with id {inserted_id} not updated")
                return False
            
            return str(inserted_id)
        
        except Exception as e:
            log.error(f"Error inserting reaction with data {post_id = }, {user_id = }, {reaction_type = }, Error: {e}")
            return False

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

    def remove_notification(self, notification_type: str, user_id: str, notification_id: str) -> bool:
        try:          
            delete_result = self.update_one(
                f'{notification_type}s',
                {
                    "user_id": ObjectId(user_id),
                    "_id": ObjectId(notification_id)
                },
                {'$set': {'is_notification': False}}
            )
            
            if delete_result.modified_count == 0:
                log.info(f"Notification not removed for {user_id}, {notification_id = }")
                return False

            return True
        
        except Exception as e:
            log.error(f"Error during removing notification: {notification_id = }, {user_id = }, Error = {e}")
            return False
    
    @MongoDBConnect.transaction
    def delete_comment(self, comment_id: str, post_id: str, session=None) -> bool:
        try:
            delete_result = self.delete_one(
                'comments',
                {
                    "_id": ObjectId(comment_id)
                },
                session=session
            )
            
            if delete_result.deleted_count == 0:
                log.info(f"Comment not deleted for {comment_id = }, {post_id = }")
                return False

            update_result = self.update_one(
                'posts',
                {'_id': ObjectId(post_id)},
                {'$pull': {'comments': ObjectId(comment_id)}},
                session=session
            )

            if update_result.modified_count == 0:
                log.info(f"Comment not removed from post {post_id = }, {comment_id = }")
                return False
            
            return True
        
        except Exception as e:
            log.error(f"Error during deleting comment: {comment_id = }, {post_id = }, Error = {e}")
            return False
    
    @MongoDBConnect.transaction
    def delete_reaction(self, reaction_id: str, post_id: str, session=None) -> bool:
        try:
            delete_result = self.delete_one(
                'reactions',
                {
                    "_id": ObjectId(reaction_id)
                },
                session=session
            )
            
            if delete_result.deleted_count == 0:
                log.info(f"Reaction not deleted for {reaction_id = }, {post_id = }")
                return False

            update_result = self.update_one(
                'posts',
                {'_id': ObjectId(post_id)},
                {'$pull': {'reactions': ObjectId(reaction_id)}},
                session=session
            )

            if update_result.modified_count == 0:
                log.info(f"Reaction not removed from post {post_id = }, {reaction_id = }")
                return False
            
            return True
        
        except Exception as e:
            log.error(f"Error during deleting reaction: {reaction_id = }, {post_id = }, Error = {e}")
            return False