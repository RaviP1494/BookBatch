from flask import Flask, render_template, request, flash, redirect, session, g

# from forms import 
# from models import

app = Flask(__name__)

# app.config["SECRET_KEY"]='blah'

@app.route("/")
def home():
    return render_template("/base.html")