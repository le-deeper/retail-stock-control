import hashlib
from functools import wraps

from django.contrib import messages
from django.shortcuts import redirect
from django.utils.translation import gettext_lazy as _

from direction.models import Gerant
from utility.errors import BAD_REQUEST
from utility.manager_informations import *
from utility.request_informations import get_manager_by_session
from utility.search_engine import search

HASHED_TIMES = 10


def hash_password(password):
    # Hash the password using SHA-256
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    for i in range(HASHED_TIMES):
        hashed_password = hashlib.sha256(hashed_password.encode()).hexdigest()
    return hashed_password


def verify_password(password, hashed_password):
    # Hash the input password
    hashed_input_password = hash_password(password)
    # Compare the hashed input password with the stored hashed password
    return hashed_input_password == hashed_password


def connection(username, password):
    # Search for the user in the database
    user = search(Gerant, 'nom', username)
    if user:
        # Verify the password
        if verify_password(password, user[0].mdp):
            return user[0]
    return False


def logged_in(level=SIMPLE_LEVEL):
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            gerant = get_manager_by_session(request)
            if gerant:
                if get_manager_level(gerant) >= level:
                    return func(request, gerant=gerant, *args, **kwargs)
                else:
                    messages.error(request, _("Vous n'avez pas les droits nécessaires pour accéder à cette page."))
            else:
                messages.error(request, _("Vous devez vous connecter pour accéder à cette page."))
            return redirect('/login/')
        return wrapper
    return decorator


def unique_method(method):
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            if request.method == method:
                return func(request, *args, **kwargs)
            messages.error(request, _(BAD_REQUEST))
            return redirect('/')
        return wrapper
    return decorator
