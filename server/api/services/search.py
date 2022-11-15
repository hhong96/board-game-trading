from api.repos import data_access
from api.util import FormError
from api.validator import *

from sqlalchemy.exc import SQLAlchemyError

def keyword_search(form: dict): 
    """
    Attempt to accept a trade
    """
    try:
        #unsure if need to have a validate form function like in validator.py
        return data_access.keyword_search(form)

    except FormError as fe:
        raise fe

def within_postal_code_search(form: dict): 
    """
    get items within a specific postal code
    """
    try:
        #unsure if need to have a validate form function like in validator.py
        return data_access.within_postal_code_search(form)

    except FormError as fe:
        raise fe

def radius_search(form: dict): 
    """
    get items within a radius of the user's postal code
    """
    try:
        #unsure if need to have a validate form function like in validator.py
        return data_access.radius_search(form)

    except FormError as fe:
        raise fe