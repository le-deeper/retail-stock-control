from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from direction.views import *


urlpatterns = [
    path('analyse/', go_to_analysis, name='analysis'),
    path('sales/', get_sales_perfs, name='sales'),
    path('sales_chart/', get_sales_perfs_chart, name='sales_chart'),
    path('sales_per_method_chart/', get_sales_per_method_chart, name='sales_per_method_chart'),
    path('revenue/', get_revenue, name='revenue'),
    path('revenue_chart/', get_revenue_chart, name='revenue_chart'),
    path('products_sales/', get_products_sales, name='products_sales'),
    path('products_total/', get_products_total, name='products_total'),
    path('product_total/', get_product_total, name='products_total'),

]
