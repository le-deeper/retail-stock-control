import logging

from django.contrib import messages
from django.http import HttpResponse
from django.shortcuts import redirect
from django.shortcuts import render
from django.utils.translation import gettext_lazy as _

from commande.models import *
from direction.models import Site, Parametre
from gestion.models import Approvisionnement
from historique.models import Action
from utility.actions import VERIFICATION_STOCK_KEY
from utility.connectivity import logged_in, unique_method
from utility.errors import BAD_SEARCH, COMMAND_CANT_BE_DOWNLOADED
from utility.manager_informations import get_manager_site, SUPER_ADMIN_LEVEL
from utility.search_engine import search_commands, get_key, search_supplies


# Create your views here.
@logged_in()
def get_order_history(request, gerant):
    site = get_manager_site(gerant, request)
    if request.method == 'POST':
        try:
            query = request.POST.get('query', '')
            by_client = request.POST.get('by_client') == 'on'
            by_date = request.POST.get('by_date') == 'on'
            by_method = request.POST.get('by_method') == 'on'
            by_total = request.POST.get('by_total') == 'on'
            by_products = request.POST.get('by_products') == 'on'
            by_gerant = request.POST.get('by_gerant') == 'on'

            filtered_commands = search_commands(query, by_client, by_date, by_method, by_gerant)
            if not filtered_commands and not by_total and not by_products:
                messages.error(request, _(BAD_SEARCH))
            commands_total = CommandeTotale.objects.all()
            if site:
                commands_total.filter(gerant__site=site)
            for field, value in filtered_commands:
                commands_total = commands_total.filter(**{field: value})
            commands_total = commands_total.order_by('-date')
            commands_total = [Commande(cmd) for cmd in commands_total]
            commands = []
            if by_total:
                total = float(get_key('total', query))
                for command in commands_total:
                    produit = get_key('produit', query)
                    if (total - 50 <= command.total <= total + 50 and
                            (produit in [product.prod.nom for product in command.products]
                                if (by_products and produit) else True)):
                        commands.append(command)
            else:
                commands = commands_total
            return render(request, 'order_history.html', {'query': query, 'commands': commands,
                                                          'gerant': gerant,
                                                          'by_client': by_client, 'by_date': by_date,
                                                          'by_method': by_method, 'by_total': by_total,
                                                          'by_products': by_products, 'by_gerant': by_gerant,
                                                          "sites": Site.objects.all() if gerant.est_super_admin else []}
                          )
        except Exception:
            messages.error(request, _(BAD_SEARCH))
    commands_total = CommandeTotale.objects.all().order_by('-date')
    if site:
        commands_total = commands_total.filter(gerant__site=site)
    commands_total = commands_total[:50]
    commands = [Commande(command_total) for command_total in commands_total]
    return render(request, 'order_history.html', {'commands': commands, 'gerant': gerant,
                                                  "sites": Site.objects.all() if gerant.est_super_admin else [],
                                                  "settings": Parametre.parametre_to_dict()})


@unique_method('GET')
@logged_in(level=SUPER_ADMIN_LEVEL)
def get_actionns_history(request, gerant):
    site = get_manager_site(gerant, request)
    actions = Action.objects.all()
    if site:
        actions = actions.filter(gerant__site=site)
    actions = actions.order_by("-date")
    actions = actions[:50]
    return render(request, 'actions_history.html', {'actions': actions, 'gerant': gerant,
                                                    "sites": Site.objects.all() if gerant.est_super_admin else [],
                                                    "settings": Parametre.parametre_to_dict()})


@unique_method('GET')
@logged_in(level=SUPER_ADMIN_LEVEL)
def get_stock_actions_history(request, gerant):
    site = get_manager_site(gerant, request)
    actions = Action.objects.all()
    if site:
        actions = actions.filter(gerant__site=site)
    actions = actions.filter(action__contains=VERIFICATION_STOCK_KEY).order_by("-date")
    actions = actions[:100]
    return render(request, 'actions_history.html', {'actions': actions, 'gerant': gerant,
                                                    "sites": Site.objects.all() if gerant.est_super_admin else [],
                                                    "settings": Parametre.parametre_to_dict()})


@unique_method('GET')
@logged_in()
def download_order(request, order_id, gerant):
    site = get_manager_site(gerant, request)
    command_total = CommandeTotale.objects.get(id_commande=order_id)
    if site:
        if command_total.gerant.site != site and not gerant.est_super_admin:
            messages.error(request, _(COMMAND_CANT_BE_DOWNLOADED))
            return redirect('/')

    command = Commande(command_total)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="Reçu n°{command.id}.pdf"'
    command.receipt(response)

    return response


@logged_in()
def get_supplying_history(request, gerant):
    site = get_manager_site(gerant, request)
    if request.method == 'POST':
        try:
            query = request.POST.get('query', '')
            by_date = request.POST.get('by_date') == 'on'
            by_product = request.POST.get('by_product') == 'on'
            by_gerant = request.POST.get('by_gerant') == 'on'
            by_four = request.POST.get('by_four') == 'on'

            filters = search_supplies(query, by_product, by_date, by_four, by_gerant)
            supplies = Approvisionnement.objects.all()
            if site:
                supplies = supplies.filter(site=site)
            for field, value in filters:
                supplies = supplies.filter(**{field: value})
            return render(request, 'supplying_history.html', {'query': query, 'supplies': supplies,
                                                              'gerant': gerant,
                                                              'by_four': by_four, 'by_date': by_date,
                                                              'by_product': by_product, 'by_gerant': by_gerant,
                                                              "sites": Site.objects.all() if gerant.est_super_admin
                                                              else [],
                                                              "settings": Parametre.parametre_to_dict()})
        except Exception as e:
            logging.error(e)
            messages.error(request, _(BAD_SEARCH))
    supplying = Approvisionnement.objects.all()
    if site:
        supplying = supplying.filter(site=site)
    supplying = supplying.order_by("-date_achat")[:50]
    return render(request, 'supplying_history.html', {'supplies': supplying, 'gerant': gerant,
                                                      "sites": Site.objects.all() if gerant.est_super_admin else [],
                                                      "settings": Parametre.parametre_to_dict()})
