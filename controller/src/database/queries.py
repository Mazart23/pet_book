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

    
    def create_post(self, user_id: str, description: str, images_urls: list, location: str, timestamp: str) -> bool:
        try:
            log.info(f"Creating post for user {user_id}.")
            post_document = {
                '_user_id': ObjectId(user_id),
                'description': description,
                'images_urls': images_urls,
                'comments': [],
                'timestamp': timestamp,
                'reactions_count': {'likes': 0, 'hearts': 0},
                'location': location
            }
            log.info(f"Post document: {post_document}")
            result = self.insert_one('posts', post_document)
            post_id = result.inserted_id
            log.info(f"Post inserted with ID: {post_id}")
            update_result = self.update_one(
                'users',
                {'_id': ObjectId(user_id)},
                {'$push': {'posts': post_id}}
            )
            log.info(f"User update result: {update_result.modified_count}")
            if update_result.modified_count == 0:
                log.info(f"User with id {user_id} not updated with new post")
                return False

            return True

        except Exception as e:
            log.error(f"Error creating post: {e}")
            return False
    
    def modify_post(self, post_id: str, description: str = None, images_urls: list = None) -> bool:
        try:
            update_fields = {}
            if description is not None:
                update_fields['description'] = description
            if images_urls is not None:
                update_fields['images_urls'] = images_urls

            update_result = self.update_one(
                'posts',
                {'_id': ObjectId(post_id)},
                {'$set': update_fields}
            )

            return update_result.modified_count > 0

        except Exception as e:
            log.error(f"Error modifying post: {e}")
            return False
    
    def delete_post(self, post_id: str, user_id: str) -> bool:
        try:
            delete_result = self.delete_one('posts', {'_id': ObjectId(post_id)})

            if delete_result.deleted_count == 0:
                log.info(f"No post found with id {post_id} to delete")
                return False

            update_result = self.update_one(
                'users',
                {'_id': ObjectId(user_id)},
                {'$pull': {'posts': ObjectId(post_id)}}
            )

            return update_result.modified_count > 0

        except Exception as e:
            log.error(f"Error deleting post: {e}")
            return False
        


    def fetch_posts(self, query: dict, skip: int = 0, limit: int = 10) -> list:
        """
        Fetch posts from the database with optional filters, pagination.
        :param query: Dictionary containing query filters
        :param skip: Number of documents to skip (for pagination)
        :param limit: Maximum number of documents to return
        :return: List of posts
        """
        try:

            posts = list(self.find('posts', query))

            posts.sort(key=lambda x: x['timestamp'], reverse=True)
            paginated_posts = posts[skip:skip + limit]

            for post in paginated_posts:
                if '_id' in post:
                    post['_id'] = str(post['_id'])
                if '_user_id' in post:
                    post['_user_id'] = str(post['_user_id'])

            return paginated_posts
        
        except Exception as e:
            log.error(f"Error fetching posts: {e}")
            return []

