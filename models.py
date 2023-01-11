from datetime import datetime

from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy

bcrypt = Bcrypt()
db = SQLAlchemy()


class User(db.Model):
    """|User model|"""

    __tablename__ = "users"

    id = db.Column(
        db.Integer,
        primary_key=True
    )
    display_name = db.Column(
        db.String(14),
        nullable=False,
        unique=True
    )
    password = db.Column(
        db.Text,
        nullable=False
    )
    favorites = db.relationship(
        'Book',
        secondary="favorites"
    )


    @classmethod
    def signup(cls, display_name, password):
        """
        |Sign up user|
        Hashes password and adds user to system
        """

        try:
            hashed_pwd = bcrypt.generate_password_hash(password).decode('UTF-8')
            user = User(
                display_name=display_name,
                password=hashed_pwd
            )
        except Exception as e:
            print(e)
            return e
        return user

    @classmethod
    def authenticate(cls, display_name, password):
        try:
            user = cls.query.filter_by(display_name=display_name).first()
        except Exception as e:
            print(e)
            return e
        if user:
            if bcrypt.check_password_hash(user.password, password):
                return user
        return False

        

class Book(db.Model):
    """|Book model|"""

    __tablename__="books"

    id = db.Column(
        db.Integer,
        primary_key=True
    )
    book_key = db.Column(
        db.String(15),
        unique=True,
        nullable=False
    )
    title = db.Column(
        db.Text
    )
    author = db.Column(
        db.Text
    )
    genre = db.Column(
        db.Text
    )
    record_create_time = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow()
    )

class Favorite(db.Model):
    """|Favorite book of user model|"""

    __tablename__="favorites"

    id = db.Column(
        db.Integer,
        primary_key=True
    )
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='cascade')
    )
    book_id = db.Column(
        db.Integer,
        db.ForeignKey('books.id', ondelete='cascade'),
        unique=True
    )


def connect_db(app):
    db.app = app
    db.init_app(app)
