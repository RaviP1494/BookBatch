from flask import Flask, render_template, request, flash, redirect, session, g

from forms import RegistrationForm, LoginForm
from models import db, connect_db, User, Book, BookCollect, Message, Recommendation

from datetime import datetime


CURR_USER_KEY = "curr_user"

app = Flask(__name__)

app.config[
    "SQLALCHEMY_DATABASE_URI"
] = "postgresql://postgres:drowssap@localhost:5432/bookbatch"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ECHO"] = False

app.config["SECRET_KEY"] = "temporary"

connect_db(app)

# with app.app_context():
#     db.drop_all()
#     db.create_all()


def do_login(user):
    session[CURR_USER_KEY] = user.id


def do_logout():
    if CURR_USER_KEY in session:
        del session[CURR_USER_KEY]


@app.before_request
def add_user_to_g():
    if CURR_USER_KEY in session:
        g.user = User.query.get(session[CURR_USER_KEY])
    else:
        g.user = None


@app.route("/")
def root():
    return redirect("/books/search")


@app.route("/books/search")
def bookSearch():
    return render_template("/books/search.html")


@app.route("/books/<string:work_id>")
def workView(work_id):
    return render_template("/books/editions.html", work_id=work_id)


@app.route("/books/editions/<string:edition_id>")
def editionView(edition_id):
    if(g.user and g.user.friends):
        friends = g.user.friends
    else:
        friends = None
    return render_template("/books/edition.html", edition_id=edition_id, friends=friends)


@app.route("/signup", methods=["GET", "POST"])
def signup():
    form = RegistrationForm()

    if form.validate_on_submit():
        if form.password.data == form.c_password.data:
            user = User.signup(
                user_name=form.username.data, password=form.password.data
            )
            if type(user) is Exception:
                raise Exception("Signup failed")
            db.session.add(user)
            db.session.commit()
            do_login(user)
            return redirect(f"/users/{form.username.data}")

    else:
        return render_template("/users/signup.html", form=form)


@app.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()

    if form.validate_on_submit():
        user = User.authenticate(
            user_name=form.username.data, password=form.password.data
        )
        if type(user) is Exception:
            raise Exception("Invalid credentials")
        elif user:
            do_login(user)
            return redirect(f"/users/{form.username.data}")
    return render_template("/users/login.html", form=form)


@app.route("/users/<string:uName>")
def profile(uName):
    user = User.query.filter_by(user_name=uName).first()
    favorites = BookCollect.query.filter_by(
        user_id=user.id, collection_name="favorites"
    )
    read_list = BookCollect.query.filter_by(
        user_id=user.id, collection_name="read_list"
    )
    return render_template(
        "/users/user.html", user=user, favorites=favorites, read_list=read_list
    )


@app.route("/users/search")
def userSearchView():
    q = request.args.get('q')
    if(q):
        q_req = '%{}%'.format(q)
        users = User.query.filter(User.user_name.ilike(q_req)).all()
        return render_template("/users/search.html", users=users)
    return render_template("/users/search.html")


@app.route("/users/<string:uName>/addfriend", methods=["POST"])
def addFriend(uName):
    userToAdd = User.query.filter_by(user_name=uName).first()
    g.user.friends.append(userToAdd)
    userToAdd.friends.append(g.user)
    db.session.add(g.user)
    db.session.add(userToAdd)
    db.session.commit()
    return redirect(f'/users/{uName}')


@app.route("/users/<string:uName>/sendmessage", methods=["POST"])
def sendMessage(uName):
    receiver = User.query.filter_by(user_name=uName).first()
    content = request.form["content"]
    msg = Message(sender_id=g.user.id, receiver_id=receiver.id, content=content)
    db.session.add(msg)
    db.session.commit()
    return redirect(f'/users/{receiver.user_name}')

@app.route("/books/<string:olid>/recommend", methods=["POST"])
def recommend(olid):
    receiver_name = request.form["receiver_name"]
    receiver = User.query.filter_by(user_name=receiver_name).first()
    book = Book.query.filter_by(olid=olid).one_or_none()
    if not book:
        book = Book(
            olid=olid,
            title=request.form["title"],
            author=request.form["author"],
            publish_date=request.form["publish_date"],
        )
    db.session.add(book)
    db.session.commit()
    rec = Recommendation(sender_id=g.user.id, receiver_id=receiver.id, book_id = book.id)
    db.session.add(rec)
    db.session.commit()
    return redirect('/')


@app.route("/books/<string:olid>/usercollect/<string:cname>", methods=["POST"])
def addToCollection(olid, cname):
    if CURR_USER_KEY in session:
        book = Book.query.filter_by(olid=olid).one_or_none()
        if not book:
            book = Book(
                olid=olid,
                title=request.form["title"],
                author=request.form["author"],
                publish_date=request.form["publish_date"],
            )
            db.session.add(book)
            db.session.commit()
        collection_item = BookCollect(
            user_id=g.user.id, collection_name=cname, book_id=book.id
        )
        db.session.add(collection_item)
        db.session.commit()
        return redirect(f"/users/{g.user.user_name}")
    else:
        return redirect("/")


@app.route("/logout")
def logout():
    do_logout()
    return redirect("/")

