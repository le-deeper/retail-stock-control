from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from gestion.views import *

urlpatterns = [
    path("", go_to_home, name="home"),
    path('changer_langue/<str:lang_code>/', change_language, name='changer_langue'),
    path('change_site/<str:site>/', change_site, name='change_site'),
    path("search/", search, name="search"),
    path("search_barcode/", search_barcode, name="search_barcode"),
    path('submit/', submit_order, name='submit'),
    path('login/', go_to_login, name='login'),
    path('add_product/', add_product, name='add_product'),
    path('supply_product/', supply_product, name='supply_product'),
    path('change_product_price/', change_product_price, name='change_product'),
    path('change_product_barcode/', change_product_barcode, name='change_product_barcode'),
    path('delete_product/', delete_product, name='delete_product'),
    path('add_category/', add_category, name='new_category'),
    path('delete_category/', delete_category, name='delete_category'),
    path('add_gerant/', add_gerant, name='add_gerant'),
    path('delete_gerant/', delete_gerant, name='delete_gerant'),
    path('add_site/', add_site, name='add_site'),
    path('promote_gerant/', promote_gerant, name='promote_gerant'),
    path('demote_gerant/', demote_gerant, name='demote_gerant'),
    path('stock_verification/', stock_verification, name='stock_verification'),
    path('stock_validation/', stock_validation, name='stock_validation'),
    path('deadlines_providers/', deadlines_providers, name='deadlines_providers'),
    path('deadlines_clients/', deadlines_clients, name='deadlines_clients'),
    path('deadlines/', deadlines, name='deadlines'),
]