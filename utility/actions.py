from historique.models import Action

VERIFICATION_STOCK_KEY = "verification de stock"


def create_adding_site_action(gerant, site_name):
    return Action(categorie=Action.INFO, action=f"Ajout du site {site_name}", gerant=gerant)


def create_changing_qty_action(gerant, product, stock, quantity):
    return Action(categorie=Action.ERROR,
                  action=f"Le gérant {gerant.nom} a changé le stock du produit {product.nom} (id: {product.id_prod})"
                         f" de {stock.qte} à {quantity} par le bias d'une verification de stock",
                  gerant=gerant)


def create_delete_category_action(gerant, category):
    return Action(categorie=Action.WARNING,
                  action=f"SUPPRESSION de la catégorie {category.nom} (id: {category.id_categ})",
                  gerant=gerant)


def create_selling_under_price_action(gerant, prod, price):
    return Action(categorie=Action.WARNING,
                  action=f"A vendu le produit {prod.nom} "
                         f"avec un prix inférieux à celui conseillé (Vendu à {price} "
                         f"contre {prod.prix_vente} conseillé)",
                  gerant=gerant)


def create_warning_stock_action(gerant, prod, qte):
    return Action(categorie=Action.WARNING,
                  action=f"Le stock du produit {prod.nom} est en dessous du seuil d'urgence (stock: {qte})",
                  gerant=gerant)


def create_supplying_product_action(gerant, product, quantity):
    return Action(categorie=Action.INFO,
                  action=f"Approvisionnement du produit {product.nom} "
                         f"(id: {product.id_prod} - qte ajouté: {quantity}) ",
                  gerant=gerant)


def create_deleting_product_action(gerant, product):
    return Action(categorie=Action.WARNING,
                  action=f"SUPPRESSION du produit {product.nom} (id: {product.id_prod})",
                  gerant=gerant)


def create_deleting_manager_action(gerant, gerant_to_delete):
    return Action(categorie=Action.WARNING,
                  action=f"SUPPRESSION du gérant {gerant_to_delete.nom} (id: {gerant_to_delete.gerant} - "
                         f"estAdmin: {gerant_to_delete.est_admin})",
                  gerant=gerant)


def create_promoting_manager_action(gerant, gerant_to_promote):
    return Action(categorie=Action.INFO,
                  action=f"PROMOTION du gérant {gerant_to_promote.nom} (id: {gerant_to_promote.gerant})",
                  gerant=gerant)


def create_demoting_manager_action(gerant, gerant_to_demote):
    return Action(categorie=Action.INFO,
                  action=f"Relegation du gérant {gerant_to_demote.nom} (id: {gerant_to_demote.gerant})",
                  gerant=gerant)


def create_adding_manager_action(gerant, new_gerant):
    return Action(categorie=Action.INFO,
                  action=f"Ajout du gérant {new_gerant.nom} (est admin: {new_gerant.est_admin})",
                  gerant=gerant)


def create_changing_product_price_action(gerant, product, new_price):
    return Action(categorie=Action.INFO,
                  action=f"Changement du prix de vente du produit {product.nom} (id: {product.id_prod} - "
                         f"ancien prix: {product.prix_vente} - nouveau prix: {new_price})",
                  gerant=gerant)


def create_adding_product_action(gerant, new_product):
    return Action(categorie=Action.INFO,
                  action=f"Ajout du produit {new_product.nom} dans la catégorie {new_product.categ.nom} "
                         f"(id: {new_product.id_prod} - prix: {new_product.prix_vente})",
                  gerant=gerant)
