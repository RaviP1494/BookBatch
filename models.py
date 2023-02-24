from datetime import datetime

from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy

bcrypt = Bcrypt()
db = SQLAlchemy()


class User(db.Model):
    """|User model|"""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(14), nullable=False, unique=True)
    password = db.Column(db.Text, nullable=False)
    collections = db.relationship("BookCollect", backref="user")
    friends = db.relationship(
        "User",
        secondary="friendship",
        primaryjoin="User.id==friendship.c.user_id",
        secondaryjoin="User.id==friendship.c.friend_id",
    )
    received_messages = db.relationship(
        "Message", primaryjoin="User.id==Message.receiver_id"
    )
    received_recommendations = db.relationship(
        "Book", 
        secondary="recommendations",
        primaryjoin="User.id==Recommendation.receiver_id",
        secondaryjoin="Recommendation.book_id==Book.id"
    )

    @classmethod
    def signup(cls, user_name, password):
        """
        |Sign up user|
        Hashes password and adds user to system
        """

        try:
            hashed_pwd = bcrypt.generate_password_hash(password).decode("UTF-8")
            user = User(user_name=user_name, password=hashed_pwd)
        except Exception as e:
            print(e)
            return e
        return user

    @classmethod
    def authenticate(cls, user_name, password):
        try:
            user = cls.query.filter_by(user_name=user_name).first()
        except Exception as e:
            print(e)
            return e
        if user:
            if bcrypt.check_password_hash(user.password, password):
                return user
        return False


class Friendship(db.Model):
    """|Friendship model|"""

    __tablename__ = "friendship"

    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), primary_key=True
    )
    friend_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), primary_key=True
    )


class Message(db.Model):
    """|Message model|"""

    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    receiver_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    content = db.Column(db.Text)


class Recommendation(db.Model):
    """|Recommendation model|"""

    __tablename__ = "recommendations"

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    receiver_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    book_id = db.Column(db.Integer, db.ForeignKey("books.id"))


class Book(db.Model):
    """|Book model|"""

    __tablename__ = "books"

    id = db.Column(db.Integer, primary_key=True)
    olid = db.Column(db.String(11), unique=True, nullable=False)
    title = db.Column(db.Text)
    author = db.Column(db.Text)
    publish_date = db.Column(db.String)
    record_create_time = db.Column(
        db.DateTime, nullable=False, default=datetime.utcnow()
    )
    collections = db.relationship("BookCollect", backref="book")


class BookCollect(db.Model):
    """|Join table for User Collections of Books|"""

    __tablename__ = "collections"

    id = db.Column(db.Integer, primary_key=True)
    collection_name = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="cascade"))
    book_id = db.Column(
        db.Integer, db.ForeignKey("books.id", ondelete="cascade"), unique=True
    )


def connect_db(app):
    db.app = app
    db.init_app(app)
