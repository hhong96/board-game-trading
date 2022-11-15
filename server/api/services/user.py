from api.repos import data_access
from api.util import FormError
from api.validator import validate_register_form

from sqlalchemy.exc import SQLAlchemyError

def login(form: dict):
    """
    Attempt to a login as a user
    """
    record = data_access.get_user(form)

    if not len(record):
        raise FormError(emailOrNickname="User does not exist")

    if record.password != form.get('password'):
        raise FormError(password="Incorrect password for user")
    return record

def register(form: dict):
    """
    Attempt to register a new user
    """
    try:
        validated_form = validate_register_form(form)
        data_access.register_user(validated_form)

    except FormError as fe:
        raise fe