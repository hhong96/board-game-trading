from api.util import FormError

def validate_login_form(raw_login: dict):
    """
    Attempts to validate login form
    
    :param dict raw_login: Raw login form from client
    """

    errors = {}
    if "emailOrNickname" not in raw_login:
        errors["emailOrNickname"] = "Email/Nick is required"
    if "password" not in raw_login:
        errors["password"] = "Password is required"

    if (len(errors)):
        raise FormError(**errors)

    return raw_login


def validate_register_form(raw_register: dict):
    """
    Attempts to validate content of registration form

    :param dict raw_register: Raw register form from client
    """
    errors = {}
    form_names = ["email", "password", "firstName", "lastName", "nickname", "postalCode"]

    for name in form_names:
        if name not in raw_register or not len(raw_register.get(name).strip()):
            errors[name] = "Field is required"
    
    if len(errors):
        raise FormError(**errors)

    return raw_register

def validate_listItem_form(raw_listItem: dict):
    """
    Attempts to validate content of registration form

    :param dict raw_register: Raw register form from client
    """
    errors = {}
    form_names = ["email", "password", "firstName", "lastName", "nickname", "postalCode"]

    for name in form_names:
        if name not in raw_register or not len(raw_register.get(name).strip()):
            errors[name] = "Field is required"
    
    if len(errors):
        raise FormError(**errors)

    return raw_register


