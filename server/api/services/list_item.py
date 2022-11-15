from api.repos import data_access
from api.util import FormError

def list_item(form: dict):
    """
    Attempt list item 
    """
    try:
        return data_access.list_item(form)
        
    except FormError as fe:
        raise fe

def list_platform(form: dict):
    """
    Attempt list item 
    """
    try:
        data_access.list_game_platform(form)
        
    except FormError as fe:
        raise fe