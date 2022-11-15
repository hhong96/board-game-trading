from api.repos import data_access
from api.util import FormError
from api.validator

from sqlalchemy.exc import SQLAlchemyError

def trade_status(form: dict):
    """
    Attempt to load all open trades for a user to either accept or reject
    """
    record = data_access.trade_status(form)

    if not len(record):
        raise FormError(form="No open trades currently")

    return record

def accept_trade(form: dict): 
     """
    Attempt to accept a trade
    """
     try:
        #unsure if need to have a validate form function like in validator.py
        return data_access.accept_trade(form)

    except FormError as fe:
        raise fe

def reject_trade(form: dict): 
     """
    Attempt to reject a trade
    """
     try:
        #unsure if need to have a validate form function like in validator.py
        return data_access.reject_trade(form)

    except FormError as fe:
        raise fe

def get_trade(form: dict): 
     """
    Attempt to get trade info
    """
     try:
        #unsure if need to have a validate form function like in validator.py
        return data_access.get_trade(form)

    except FormError as fe:
        raise fe
