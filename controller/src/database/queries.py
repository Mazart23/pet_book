from typing import List

from . import MysqlConnect


class Queries(MysqlConnect):

    def select_users(self, id: str) -> List[tuple]:
        sql = '''
            SELECT (name, phone_number)
            FROM users u
            WHERE u.id = %s;
        '''
        self.cur.execute(sql, [id])
        data = self.cur.fetchall()

        return data
        