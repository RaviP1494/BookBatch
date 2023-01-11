from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField, URLField
from wtforms.validators import DataRequired, Email, Length, URL

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=4,max=14)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=8,max=32)])
    c_password = PasswordField('Confirm password', validators=[DataRequired(), Length(min=8,max=32)])

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])