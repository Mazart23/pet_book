import os
import MySQLdb


class MysqlConnect:

    def __init__(self):
        self.con = MySQLdb.connect(os.environ.get('MYSQL_HOST'), os.environ.get('MYSQL_USER'), os.environ.get('MYSQL_PASSWORD'), os.environ.get('MYSQL_DATABASE'),charset="utf8")
        self.cur = self.con.cursor()
        
    def __del__(self):
        self.cur.close()
        self.con.close()

    def commit(self):
        self.con.commit()

    def fetchall(self):
        return self.cur.fetchall()
