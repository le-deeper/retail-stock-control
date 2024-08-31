from datetime import date

from historique.models import Session
from utility.search_engine import search


def get_manager_by_session(request):
    """Get the manager by the session cookie"""
    session = request.COOKIES.get('session', None)
    if session:
        # vérifier si la session est valide
        session = search(Session, 'valeur', session, True)
        if session:
            session = session[0]
            if session.datelimit > date.today():
                return session.gerant
    return None


def get_ip(request):
    """Get the IP address of the user"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
