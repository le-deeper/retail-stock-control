from django.http import JsonResponse
from django.shortcuts import render
from django.utils.timezone import make_aware

from commande.models import CommandeTotale, Commande
from direction.models import Site, Parametre
from gestion.models import Produit
from utility.connectivity import logged_in, unique_method
from utility.manager_informations import get_manager_site, ADMIN_LEVEL, SUPER_ADMIN_LEVEL
from utility.search_engine import search
from utility.stats import *


def get_date_start_date_end(request):
    year_start = int(request.POST['year_start'])
    month_start = int(request.POST['month_start'])
    day_start = int(request.POST['day_start'])
    year_end = int(request.POST['year_end'])
    month_end = int(request.POST['month_end'])
    day_end = int(request.POST['day_end'])
    return year_start, month_start, day_start, year_end, month_end, day_end


def get_orders_between_dates(request, gerant):
    year_start, month_start, day_start, year_end, month_end, day_end = get_date_start_date_end(request)
    start_date = make_aware(datetime(year_start, month_start, day_start))
    end_date = make_aware(datetime(year_end, month_end, day_end))
    site = get_manager_site(gerant, request)
    # Récupérer les commandes
    commands_total = CommandeTotale.objects.filter(date__range=(start_date, end_date))
    if site:
        commands_total = commands_total.filter(gerant__site=site)
    commands = [Commande(command_total) for command_total in
                commands_total]
    return commands


@unique_method('GET')
@logged_in(level=ADMIN_LEVEL)
def go_to_analysis(request, gerant):
    return render(request, 'analysis.html', context={'gerant': gerant,
                                                     "sites": Site.objects.all() if gerant.est_super_admin else [],
                                                     "settings": Parametre.parametre_to_dict()})


@unique_method('POST')
@logged_in(level=ADMIN_LEVEL)
def get_sales_perfs(request, gerant):
    commands = get_orders_between_dates(request, gerant)
    # Calculer les performances
    sales = sales_performance(commands)
    return JsonResponse({'result': sales})


@unique_method('POST')
@logged_in(level=ADMIN_LEVEL)
def get_sales_perfs_chart(request, gerant):
    commands = get_orders_between_dates(request, gerant)
    # Calculer les performances
    sales = sales_performance_chart(commands)
    return JsonResponse({'result': sales})


@unique_method('POST')
@logged_in(level=ADMIN_LEVEL)
def get_sales_per_method_chart(request, gerant):
    commands = get_orders_between_dates(request, gerant)
    # Calculer les performances
    sales = sales_performance_per_method_chart(commands)
    return JsonResponse({'result': sales})


@unique_method('POST')
@logged_in(level=SUPER_ADMIN_LEVEL)
def get_revenue(request, gerant):
    commands = get_orders_between_dates(request, gerant)
    # Calculer les revenus
    rev = revenue(commands)
    return JsonResponse({'result': rev})


@unique_method('POST')
@logged_in(level=SUPER_ADMIN_LEVEL)
def get_revenue_chart(request, gerant):
    commands = get_orders_between_dates(request, gerant)
    # Calculer les revenus
    rev = revenue_chart(commands)
    return JsonResponse({'result': rev})


@unique_method('POST')
@logged_in(level=ADMIN_LEVEL)
def get_products_sales(request, gerant):
    commands = get_orders_between_dates(request, gerant)
    products = products_by_sales(commands)
    return JsonResponse({'result': products})


@unique_method('POST')
@logged_in(level=ADMIN_LEVEL)
def get_products_total(request, gerant):
    commands = get_orders_between_dates(request, gerant)
    products = total_saled_products(commands)
    return JsonResponse({'result': products})


@unique_method('POST')
@logged_in(level=ADMIN_LEVEL)
def get_product_total(request, gerant):
    porduct_id = int(request.POST['product_id'])
    product = search(Produit, 'id_prod', porduct_id, True)[0]
    commands = get_orders_between_dates(request, gerant)
    product_result = total_saled_product(product.id_prod, commands)
    return JsonResponse({'result': product_result})
