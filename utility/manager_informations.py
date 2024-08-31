from direction.models import Site
from utility.search_engine import search

SIMPLE_LEVEL = 1
ADMIN_LEVEL = 2
SUPER_ADMIN_LEVEL = 3


def get_manager_level(manager):
    """get the level of a manager"""
    if manager.est_super_admin:
        return SUPER_ADMIN_LEVEL
    if manager.est_admin:
        return ADMIN_LEVEL
    return SIMPLE_LEVEL


def get_manager_site(manager, request):
    """get the site of a manager"""
    if manager.est_super_admin:
        site = request.COOKIES.get('site', None)
        if site and site != "none":
            sites = search(Site, 'nom', site, True)
            return sites[0] if sites else None
        return None
    return manager.site
