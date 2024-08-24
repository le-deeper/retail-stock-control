from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from historique.views import *
urlpatterns = [
    path('order_history/', get_order_history, name='order_history'),
    path('actions_history/', get_actionns_history, name='actions_history'),
    path('stock_actions_history/', get_stock_actions_history, name='stock_actions_history'),
    path('download-order-<int:order_id>/', download_order, name='download_order'),
    path('supplying_history/', get_supplying_history, name='supplying_history'),
]