from flask import Flask, render_template, request, flash, redirect, session, g

from forms import RegistrationForm, LoginForm
from models import db, connect_db, User, Book

CURR_USER_KEY = "curr_user"

app = Flask(__name__)

app.config[
    "SQLALCHEMY_DATABASE_URI"
] = "postgresql://postgres:drowssap@localhost:5432/bookbatch"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ECHO"] = False

app.config["SECRET_KEY"] = "temporary"

connect_db(app)

with app.app_context():
    db.drop_all()
    db.create_all()


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

@app.route('/books/search')
def book_search():
    return render_template("/books/search.html")

@app.route("/books/<str:work_id>")
def work_view(work_id):
    print()


@app.route("/signup", methods=["GET", "POST"])
def signup():
    form = RegistrationForm()

    if form.validate_on_submit():
        if form.password.data == form.c_password.data:
            user = User.signup(
                display_name=form.username.data, password=form.password.data
            )
            if type(user) is Exception:
                raise Exception("Signup failed")
            db.session.add(user)
            db.session.commit()
            do_login(user)
            return redirect("/")

    else:
        return render_template("/users/signup.html", form=form)


@app.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()

    if form.validate_on_submit():
        user = User.authenticate(
            display_name=form.username.data, password=form.password.data
        )
        if type(user) is Exception:
            raise Exception("Invalid credentials")
        elif user:
            do_login(user)
            return redirect("/")
    return render_template("/users/login.html", form=form)

@app.route("/users/profile")
def profile():
    return render_template("/users/user.html")

@app.route("/logout")
def logout():
    do_logout()
    return redirect("/")

