import functools

from flask import session, redirect, url_for, abort


class FormError(Exception):
    '''
    Example:
        FormError(login="Email/Nick is not registered")
    '''
    def __init__(self, **messages: dict) -> None:
        super().__init__("Validation Failed")
        self.messages = messages
    pass

class ApiError(Exception):
    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(str)


def authenticated(fn):
    '''
    A decorator that protects functions that should only be invoked by authenticated users
    '''

    @functools.wraps(fn)
    def restricted_route(*args, **kwargs):
        if "email" not in session:
            print("Aborting request because user email not in session")
            return abort(401)
        
        print("Request Auth successful")

        return fn(*args, **kwargs)
    
    return restricted_route


def unauthenticated(fn):
    '''
    A decorator that protects functions that should only be invoked by authenticated users
    '''

    @functools.wraps(fn)
    def unrestricted_route(*args, **kwargs):
        if "email" in session:
            print("Aborting request because user email is in the session")
            return abort(401)
        
        print("Request successful")

        return fn(*args, **kwargs)
    
    return unrestricted_route