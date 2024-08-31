from datetime import datetime, timedelta
from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import redirect
from django.utils.translation import gettext_lazy as _
from django.utils.translation import activate
from django.utils.timezone import make_aware
from uuid import uuid4

import json

from django.shortcuts import render

from commande.models import *
from direction.models import *
from gestion.models import *
from historique.models import *
from retail_stock_control import settings
from utility.actions import *
from utility.connectivity import connection, unique_method, logged_in, hash_password
from utility.errors import *
from utility.manager_informations import get_manager_site, SUPER_ADMIN_LEVEL, ADMIN_LEVEL
from utility.search_engine import search as search_engine
from utility.telegram import send_message_to_admin, TELEGRAM_FORMAT


# Create your views here.
def change_language(request, lang_code):
    """Modifie la langue en changeant la valeur du cookie"""
    next_url = request.GET.get('next', '/')
    response = redirect(next_url)
    response.set_cookie(settings.LANGUAGE_COOKIE_NAME, lang_code)
    activate(lang_code)
    return response


def change_site(request, site):
    """Modifie le site en changeant la valeur du cookie"""
    next_url = request.GET.get('next', '/')
    response = redirect(next_url)
    response.set_cookie('site', site)
    return response


# Create your views here.
def go_to_login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        # gerant = search_engine(Gerant, 'nom', username)
        gerant = connection(username, password)
        tentatives = Tentative.objects.filter(pseudo=username).order_by('-date')[:3]
        attempts = 0
        for tentative in tentatives:
            if make_aware(datetime.now()) - tentative.date < timedelta(minutes=60):
                attempts += 1
        if attempts >= 3:
            return JsonResponse({'status': 'error', 'message': _(TOO_MANY_ATTEMPTS)}, status=401)
        if gerant:
            # Enregistrer une session pour ce gerant avec comme valeur l'uuid actuel
            session = Session(valeur=str(uuid4()), datelimit=datetime.now() + timedelta(days=5), gerant=gerant)
            session.save()
            return JsonResponse({'status': 'success', 'message': _(CONNECTION_SUCCESS), 'session': session.valeur,
                                 'days': 5}, status=200)
        tentative = Tentative(pseudo=username)
        tentative.save()
        return JsonResponse({'status': 'error', 'message': _(INVALID_IDS)}, status=401)
    return render(request, 'login.html')


@unique_method('GET')
@logged_in()
def go_to_home(request, gerant):
    return render(request, 'index.html', {"categories": sorted(Categorie.objects.all(),
                                                               key=lambda x: x.nom),
                                          "paiements": sorted(MethodePaiement.objects.all(),
                                                              key=lambda x: x.nom),
                                          "gerant": gerant,
                                          "gerants": [g for g in Gerant.objects.all() if
                                                      not g.est_super_admin] if gerant.est_super_admin else [],
                                          "sites": Site.objects.all() if gerant.est_super_admin else [],
                                          "settings": Parametre.parametre_to_dict()
                                          })


@unique_method('GET')
@logged_in()
def search(request, gerant):
    s = request.GET.get('q')
    qty = int(request.GET.get('qty', True))
    eco_mode = Parametre.get_value(Parametre.ECO_MODE)
    if eco_mode:
        try:
            eco_mode = int(eco_mode.valeur)
        except ValueError:
            eco_mode = 0
    if qty:
        site = get_manager_site(gerant, request)
        if not site:
            return JsonResponse({'status': 'error', 'message': _(CHOOSE_SITE)}, status=404)
    else:
        site = None
    produits = search_engine(Produit, 'nom', s)
    return JsonResponse(Produit.products_to_dict(produits, site, gerant.est_admin or gerant.est_super_admin, eco_mode),
                        safe=False)


@unique_method('GET')
@logged_in()
def search_barcode(request, gerant):
    site = get_manager_site(gerant, request)
    if not site:
        return JsonResponse({'status': 'error', 'message': _(CHOOSE_SITE)}, status=200)
    s = request.GET.get('q')
    if not s:
        return JsonResponse({'status': 'error', 'message': _(INVALID_CODE_BAR)}, status=200)
    produits = search_engine(Produit, 'code_bar', int(s), True)
    print(f"Produits: {produits} pour le code barre {s}")
    if produits:
        return JsonResponse(Produit.products_to_dict(produits, site, include_prix_achat=gerant.est_admin or
                                                                                        gerant.est_super_admin),
                            safe=False)
    return JsonResponse({'status': 'error', 'message': _(UNKNOWN_PRODUCT)}, status=200)


@unique_method('POST')
@logged_in()
def submit_order(request, gerant):
    try:
        if gerant.est_super_admin:
            return JsonResponse({'status': 'error', 'message': _(SUPER_ADMIN_CANT_SELL)}, status=401)
        site = get_manager_site(gerant, request)
        data = json.loads(request.body)
        products = data.get('products', [])
        payment_method = data.get('paiement_method')
        client_name = data.get('client_name', None)
        comment = data.get('comment', "")
        is_buying_later = data.get('is_buying_later', False)
        warning_stock = False
        command_total = CommandeTotale(gerant=gerant,
                                       methode_paiement=search_engine(MethodePaiement, 'id_paiement', payment_method)[
                                           0],
                                       commentaire=comment)
        if client_name:
            client = search_engine(Client, 'nom', client_name)
            if not client:
                client = Client(nom=client_name)
                client.save()
            else:
                client = client[0]
            command_total.client = client
        if not products:
            return JsonResponse({'status': 'error', 'message': _(UNKNOWN_PRODUCT)}, status=200)
        command_total.save()

        # Process each product
        for product in products:
            product_code = product.get('productCode')
            quantity = product.get('quantity')
            price = product.get('price')
            is_gift = product.get('is_gift', False)
            prod = search_engine(Produit, 'id_prod', product_code)[0]
            prod: Produit
            if prod.prix_vente > float(price):
                create_selling_under_price_action(gerant, prod, price).save()
                send_message_to_admin(TELEGRAM_FORMAT.format(title=action.gerant.nom, description=action.action,
                                                             date=action.date.strftime('%d/%m/%Y à %H:%M')))
            product_command = CommandeProduit(prod=prod,
                                              commande=command_total,
                                              prix=price,
                                              qte=quantity,
                                              est_cadeau=is_gift)
            try:
                stock = Stock.objects.filter(prod=prod, site=site).get()
            except Stock.DoesNotExist:
                return JsonResponse({'status': 'error', 'message': _(QUANTITY_NOT_ENOUGH)},
                                    status=200)
            if stock.qte < int(quantity):
                command_total.delete()
                return JsonResponse({'status': 'error', 'message': _(QUANTITY_NOT_ENOUGH)},
                                    status=200)
            else:
                stock.qte -= int(quantity)
            if prod.stock_urgence > stock.qte:
                action = create_warning_stock_action(gerant, prod, stock.qte)
                action.save()
                send_message_to_admin(TELEGRAM_FORMAT.format(title=action.gerant.nom, description=action.action,
                                                             date=action.date.strftime('%d/%m/%Y à %H:%M')))

            stock.save()
            product_command.save()
        if is_buying_later:
            echeance = Paiement(commande=command_total)
            echeance.save()
        warning_msg = "" if not warning_stock else _(QUANTITY_UNDER_WARNING)
        return JsonResponse({'status': 'success', 'message': _(COMMAND_SAVED) + "." + warning_msg}, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': _(INVALID_JSON)}, status=400)


@unique_method('POST')
@logged_in()
def edit_order(request, gerant):
    try:
        site = get_manager_site(gerant, request)
        data = json.loads(request.body)
        products = data.get('products', [])
        order = data.get('order', None)
        warning_stock = False
        if not order:
            return JsonResponse({'status': 'error', 'message': _(UNKNOWN_COMMAND)}, status=200)
        if not products:
            return JsonResponse({'status': 'error', 'message': _(COMMAND_NOT_CHANGED)}, status=200)
        command_total = search_engine(CommandeTotale, 'id_commande', order)
        if not command_total:
            return JsonResponse({'status': 'error', 'message': _(UNKNOWN_COMMAND)}, status=200)
        command_total = command_total[0]

        # Process each product
        for product in products:
            product_code = product.get('productCode')
            quantity = int(product.get('quantity'))
            price = float(product.get('price'))
            prod = search_engine(Produit, 'id_prod', product_code)[0]
            prod: Produit
            if prod.prix_vente > price:
                action = create_selling_under_price_action(gerant, prod, price)
                action.save()
                send_message_to_admin(TELEGRAM_FORMAT.format(title=action.gerant.nom, description=action.action,
                                                             date=action.date.strftime('%d/%m/%Y à %H:%M')))
            product_command = CommandeProduit.objects.filter(prod=prod, commande=command_total).get()
            product_command.prix = price
            stock = Stock.objects.filter(prod=prod, site=site).get()
            stock.qte += product_command.qte
            if stock.qte < quantity:
                stock.qte -= product_command.qte
                return JsonResponse({'status': 'error', 'message': _(QUANTITY_NOT_ENOUGH) +
                                                                   f"pour le produit {product_command.prod.nom}"},
                                    status=200)
            else:
                stock.qte -= quantity
                product_command.qte = quantity
            if prod.stock_urgence > stock.qte:
                action = create_warning_stock_action(gerant, prod, stock.qte)
                action.save()
                send_message_to_admin(TELEGRAM_FORMAT.format(title=action.gerant.nom, description=action.action,
                                                             date=action.date.strftime('%d/%m/%Y à %H:%M')))

            stock.save()
            product_command.save()
        warning_msg = "" if not warning_stock else _(QUANTITY_UNDER_WARNING)
        return JsonResponse({'status': 'success', 'message': _(COMMAND_CHANGED) + "." + warning_msg}, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': _(INVALID_JSON)}, status=400)


@unique_method('POST')
@logged_in(level=ADMIN_LEVEL)
def add_product(request, gerant):
    try:
        data = json.loads(request.body)
        name = data.get('name')
        category_id = data.get('category')
        barcode = data.get('barcode', '')
        price = data.get('price')
        image_url = data.get('image_url', '')
        image = request.FILES.get("image", None)
        warning_qty = data.get('warning_quantity', 0)

        if not name or not category_id or not price:
            return JsonResponse({'status': 'error', 'message': _(FIELDS_REQUIRED)}, status=400)

        category = search_engine(Categorie, 'id_categ', category_id, True)[0]
        new_product = Produit(
            nom=name,
            categ=category,
            code_bar=barcode if barcode else None,
            prix_vente=price,
            image_url=image_url,
            stock_urgence=warning_qty

        )
        if image:
            new_product.image = image
        new_product.save()
        create_adding_product_action(gerant, new_product).save()

        return JsonResponse({'status': 'success', 'message': _(PRODUCT_ADDED)}, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': _(INVALID_JSON)}, status=400)
    except Categorie.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': _(UNKNOWN_CATEGORY)}, status=404)


@unique_method('POST')
@logged_in()
def supply_product(request, gerant):
    try:
        data = json.loads(request.body)
        product_id = data.get('product_id')
        quantity = data.get('quantity')
        price = data.get('price')
        change_price = data.get('change_price', False)
        four = data.get('four', None)
        buy_later = data.get('buy_later', False)
        site = get_manager_site(gerant, request)
        if not site:
            return JsonResponse({'status': 'error', 'message': _(CHOOSE_SITE)}, status=404)

        if not product_id or not quantity or not price:
            return JsonResponse({'status': 'error', 'message': _(FIELDS_REQUIRED)}, status=400)

        product = search_engine(Produit, 'id_prod', product_id, True)[0]
        stock = Stock.objects.filter(prod=product, site=site)
        stock = Stock(prod=product, site=site, qte=0) if not stock else stock[0]
        stock.qte += int(quantity)
        stock.save()

        if change_price:
            product.prix_achat = price
        product.save()

        approvisionnement = Approvisionnement(qte=quantity, prix_achat=price, prod=product, four=four, gerant=gerant,
                                              site=site)
        approvisionnement.save()
        if buy_later:
            echeance = Paiement(approvisionnement=approvisionnement, destinataire=Paiement.FOUR)
            echeance.save()
        action = create_supplying_product_action(gerant, product, quantity).save()

        return JsonResponse({'status': 'success', 'message': _(PRODUCT_UPDATED)}, status=201)
    except Produit.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': _(PRODUCT_NOT_FOUND)}, status=404)


@unique_method('POST')
@logged_in(level=ADMIN_LEVEL)
def change_product_price(request, gerant):
    try:
        data = json.loads(request.body)
        product_id = data.get('product_id')
        new_price = data.get('new_price')

        if not product_id or not new_price:
            return JsonResponse({'status': 'error', 'message': _(FIELDS_REQUIRED)}, status=400)

        product = Produit.objects.get(id_prod=product_id)
        action = create_changing_product_price_action(gerant, product, new_price)
        product.prix_vente = float(new_price)
        product.save()
        action.save()

        return JsonResponse({'status': 'success', 'message': _(PRODUCT_UPDATED)}, status=200)
    except Produit.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': _(PRODUCT_NOT_FOUND)}, status=404)


@unique_method('POST')
@logged_in()
def change_product_barcode(request, gerant):
    try:
        data = json.loads(request.body)
        product_id = data.get('code')
        barcode = data.get('barcode')
        print(f"code barre: {barcode}")
        barcode = int(barcode)

        if not product_id or not barcode:
            return JsonResponse({'status': 'error', 'message': _(FIELDS_REQUIRED)}, status=200)

        product = Produit.objects.get(id_prod=product_id)
        products = Produit.objects.filter(code_bar=barcode)
        if products:
            return JsonResponse({'status': 'error', 'message': f'{barcode} déjà utilisé pour {products[0].nom}'},
                                status=200)
        product.code_bar = barcode
        product.save()

        return JsonResponse({'status': 'success', 'message': _(PRODUCT_UPDATED)}, status=200)
    except Produit.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': _(PRODUCT_NOT_FOUND)}, status=404)


@unique_method('POST')
@logged_in(level=SUPER_ADMIN_LEVEL)
def delete_product(request, gerant):
    try:
        data = json.loads(request.body)
        product_id = data.get('product_id')

        if not product_id:
            return JsonResponse({'status': 'error', 'message': _(FIELDS_REQUIRED)}, status=400)

        product = search_engine(Produit, 'id_prod', product_id, True)[0]
        action = create_deleting_product_action(gerant, product)
        product.delete()
        action.save()
        send_message_to_admin(TELEGRAM_FORMAT.format(title=action.gerant.nom, description=action.action,
                                                     date=action.date.strftime('%d/%m/%Y à %H:%M')))

        return JsonResponse({'status': 'success', 'message': _(PRODUCT_DELETED)}, status=200)
    except Produit.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': _(PRODUCT_NOT_FOUND)}, status=404)


@unique_method('POST')
@logged_in(level=ADMIN_LEVEL)
def add_category(request, gerant):
    data = json.loads(request.body)
    category_name = data.get('category_name')

    if not category_name:
        return JsonResponse({'status': 'error', 'message': _(FIELDS_REQUIRED)}, status=400)

    category = Categorie(nom=category_name)
    category.save()

    return JsonResponse({'status': 'success', 'message': _(CATEGORY_ADDED)}, status=200)


@unique_method('POST')
@logged_in(level=SUPER_ADMIN_LEVEL)
def delete_category(request, gerant):
    try:
        data = json.loads(request.body)
        category_id = data.get('category_id')

        if not category_id:
            return JsonResponse({'status': 'error', 'message': _(FIELDS_REQUIRED)}, status=400)

        category = search_engine(Categorie, 'id_categ', category_id, True)[0]
        action = create_delete_category_action(gerant, category)
        category.delete()
        action.save()
        send_message_to_admin(TELEGRAM_FORMAT.format(title=action.gerant.nom, description=action.action,
                                                     date=action.date.strftime('%d/%m/%Y à %H:%M')))

        return JsonResponse({'status': 'success', 'message': _(CATEGORY_DELETED)}, status=200)
    except Categorie.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': _(CATEGORY_NOT_FOUND)}, status=404)


@unique_method('POST')
@logged_in(level=SUPER_ADMIN_LEVEL)
def add_gerant(request, gerant):
    try:
        data = json.loads(request.body)
        gerant_name = data.get('gerant_name')
        gerant_pwd = data.get('gerant_pwd')
        gerant_site = data.get('site')

        if not gerant_name:
            return JsonResponse({'status': 'error', 'message': _(FIELDS_REQUIRED)}, status=400)

        site = search_engine(Site, 'nom', gerant_site, True)
        if not site:
            return JsonResponse({'status': 'error', 'message': _(CHOOSE_SITE)}, status=404)

        new_gerant = Gerant(nom=gerant_name, mdp=hash_password(gerant_pwd), site=site[0])
        new_gerant.est_admin = request.POST.get('is_admin', False)
        action = create_adding_manager_action(gerant, new_gerant)
        new_gerant.save()
        action.save()

        return JsonResponse({'status': 'success', 'message': _(MANAGER_ADDED)}, status=200)
    except Gerant.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': _(MANAGER_NOT_FOUND)}, status=404)


@unique_method('POST')
@logged_in(level=SUPER_ADMIN_LEVEL)
def delete_gerant(request, gerant):
    try:
        data = json.loads(request.body)
        gerant_id = data.get('gerant_id')

        if not gerant_id:
            return JsonResponse({'status': 'error', 'message': _(FIELDS_REQUIRED)}, status=400)

        gerant_to_delete = Gerant.objects.get(gerant=gerant_id)
        if gerant_to_delete.est_super_admin:
            return JsonResponse({'status': 'error', 'message': _(SUPER_ADMIN_CANT_BE_DELETED)},
                                status=400)
        action = create_deleting_manager_action(gerant, gerant_to_delete)
        gerant_to_delete.delete()
        action.save()
        send_message_to_admin(TELEGRAM_FORMAT.format(title=action.gerant.nom, description=action.action,
                                                     date=action.date.strftime('%d/%m/%Y à %H:%M')))

        return JsonResponse({'status': 'success', 'message': _(MANAGER_DELETED)}, status=200)
    except Gerant.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': _(MANAGER_NOT_FOUND)}, status=404)


@unique_method('POST')
@logged_in(level=SUPER_ADMIN_LEVEL)
def promote_gerant(request, gerant):
    try:
        data = json.loads(request.body)
        gerant_id = data.get('gerant_id')

        if not gerant_id:
            return JsonResponse({'status': 'error', 'message': _(FIELDS_REQUIRED)}, status=400)

        gerant_to_promote = Gerant.objects.get(gerant=gerant_id)
        gerant_to_promote.est_admin = True
        create_promoting_manager_action(gerant, gerant_to_promote).save()
        gerant_to_promote.save()

        return JsonResponse({'status': 'success', 'message': _(MANAGER_PROMOTED)}, status=200)
    except Gerant.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': _(MANAGER_NOT_FOUND)}, status=404)


@unique_method('POST')
@logged_in(level=SUPER_ADMIN_LEVEL)
def demote_gerant(request, gerant):
    try:
        data = json.loads(request.body)
        gerant_id = data.get('gerant_id')

        if not gerant_id:
            return JsonResponse({'status': 'error', 'message': _(FIELDS_REQUIRED)}, status=400)

        gerant_to_demote = Gerant.objects.get(gerant=gerant_id)
        gerant_to_demote.est_admin = False
        action = create_demoting_manager_action(gerant, gerant_to_demote)
        gerant_to_demote.save()
        action.save()

        return JsonResponse({'status': 'success', 'message': _(MANAGER_DEMOTED)}, status=200)
    except Gerant.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': _(MANAGER_NOT_FOUND)}, status=404)


@unique_method('POST')
@logged_in(level=SUPER_ADMIN_LEVEL)
def add_site(request, gerant):
    data = json.loads(request.body)
    site_name = data.get('site_name')
    sites = search_engine(Site, 'nom', site_name, True)
    if sites:
        return JsonResponse({'status': 'error', 'message': _(SITE_ALREADY_EXISTS)}, status=400)
    new_site = Site(nom=site_name)
    new_site.save()
    create_adding_site_action(gerant, site_name).save()
    return JsonResponse({'status': 'success', 'message': _(SITE_ADDED)}, status=200)


@unique_method('GET')
@logged_in()
def stock(request, gerant):
    products = Produit.objects.all()
    site = get_manager_site(gerant, request)
    if not site:
        return JsonResponse({'status': 'error', 'message': _(CHOOSE_SITE)}, status=200)

    return render(request, 'stock.html', {"products": Produit.products_to_dict(products, site),
                                          "gerant": gerant,
                                          "sites": Site.objects.all() if gerant.est_super_admin else [],
                                          "settings": Parametre.parametre_to_dict()})


@unique_method('GET')
@logged_in()
def stock_verification(request, gerant):
    products = Produit.objects.all()
    site = get_manager_site(gerant, request)
    if gerant.est_super_admin:
        messages.error(request, 'Un super admin ne peut pas faire de vérification de stock')
        return redirect('/')
    return render(request, 'stock_verification.html', {"products": sorted(Produit.products_to_dict(
        products, site),
        key=lambda x: x['nom']),
        "gerant": gerant,
        "last_verifications":
            [x for x in VerificationStock.objects.all()
                  .filter(gerant__site=site).order_by("-date_verif")][:3],
        "sites": Site.objects.all() if gerant.est_super_admin else [],
        "settings": Parametre.parametre_to_dict()})


@unique_method('POST')
@logged_in()
def stock_validation(request, gerant):
    site = get_manager_site(gerant, request)
    if not site:
        return JsonResponse({'status': 'error', 'message': _(CHOOSE_SITE)}, status=404)
    try:
        data = json.loads(request.body).get('products', None)

        verification = VerificationStock(gerant=gerant)
        if data:
            verification.erreur = True
        verification.save()
        for product_id, quantity in data.items():
            product = search_engine(Produit, 'id_prod', product_id, True)[0]
            stock = Stock.objects.filter(prod=product, site=site).get()
            action = create_changing_qty_action(gerant, product, stock, quantity)
            stock.qte = quantity
            action.save()
            stock.save()

        return JsonResponse({'status': 'success', 'message': _(VERIFICATION_ADDED)}, status=200)
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': _(INVALID_JSON)}, status=400)


@unique_method('GET')
@logged_in()
def deadlines_providers(request, gerant):
    site = get_manager_site(gerant, request)
    deadlines = Paiement.objects.all().filter(est_terminee=False).filter(destinataire=Paiement.FOUR)
    if site:
        deadlines = deadlines.filter(approvisionnement__site=site)
    deadlines = deadlines.order_by("-approvisionnement__date_achat")
    return render(request, 'deadlines.html', {"gerant": gerant,
                                              "deadlines_providers": deadlines,
                                              "sites": Site.objects.all() if gerant.est_super_admin else [],
                                              "settings": Parametre.parametre_to_dict()})


@unique_method('GET')
@logged_in()
def deadlines_clients(request, gerant):
    site = get_manager_site(gerant, request)
    deadlines = Paiement.objects.all().filter(est_terminee=False).filter(destinataire=Paiement.CLIENT)
    if site:
        deadlines = deadlines.filter(approvisionnement__site=site)
    deadlines = deadlines.order_by("-commande__date")
    return render(request, 'deadlines.html', {"gerant": gerant,
                                              "deadlines_clients": deadlines
        ,
                                              "sites": Site.objects.all() if gerant.est_super_admin else [],
                                              "settings": Parametre.parametre_to_dict()})


@unique_method('POST')
@logged_in(level=ADMIN_LEVEL)
def deadlines(request, gerant):
    data = json.loads(request.body)
    echeance_id = data.get('id_echeance')
    part_to_add = data.get('part_to_add', 0)
    finish_echeance = data.get('finish_echeance', False)
    echeance = Paiement.objects.get(id_paiement=echeance_id)
    if finish_echeance:
        echeance.parti_payee = echeance.total
        echeance.est_terminee = True
    else:
        echeance.parti_payee = float(echeance.parti_payee) + float(part_to_add)
        if echeance.parti_payee > echeance.total:
            return JsonResponse({'status': 'error',
                                 'message': _(CANT_PAY_MORE)},
                                status=400)
        if echeance.parti_payee == echeance.total:
            echeance.est_terminee = True
    echeance.save()
    return JsonResponse({'status': 'success', 'message': _(PRODUCT_UPDATED)}, status=200)
