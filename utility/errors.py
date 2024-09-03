from django.utils.translation import gettext_lazy as _

INVALID_CODE_BAR = _('Veuillez saisir un code barre correct')
INVALID_IDS = _("Identifiants invalides")
INVALID_JSON = _("JSON invalide")

BAD_REQUEST = _("Mauvaise requête")
CANT_PAY_MORE = _('La somme payée ne peut pas être supérieure à la somme totale')
PAYMENT_UPDATED = _('Paiement mis à jour')
BAD_SEARCH = _("Mauvaise Recherche")
TOO_MANY_ATTEMPTS = _("Trop de tentatives, Veuillez patienter 1 heure")
FIELDS_REQUIRED = _("Champs requis non renseignés")
CONNECTION_SUCCESS = _("Connexion réussie")
VERIFICATION_ADDED = _('Vérification ajoutée')

CHOOSE_SITE = _('Veuillez choisir un site')
SITE_ALREADY_EXISTS = _('Site déjà existant')
SITE_ADDED = _('Site ajouté')

PRODUCT_NOT_FOUND = _("Produit non trouvé")
PRODUCT_UPDATED = _("Produit mis à jour")
PRODUCT_ADDED = _('Produit ajouté')
PRODUCT_DELETED = _('Product supprimé')
UNKNOWN_PRODUCT = _('Produit introuvable')

CATEGORY_NOT_FOUND = _("Catégorie non trouvée")
CATEGORY_ADDED = _('Catégorie ajoutée')
CATEGORY_DELETED = _('Catégorie supprimée')
UNKNOWN_CATEGORY = _('Catégorie introuvable')

MANAGER_NOT_FOUND = _("Gérant non trouvé")
MANAGER_DELETED = _('Gérant supprimé')
MANAGER_ADDED = _('Gérant ajouté')
MANAGER_PROMOTED = _('Gérant promu')
MANAGER_DEMOTED = _('Gérant rétrogradé')
SUPER_ADMIN_CANT_SELL = _('Un super admin ne peut pas vendre')
SUPER_ADMIN_CANT_BE_DELETED = _('Un super admin ne peut pas être supprimé')

QUANTITY_NOT_ENOUGH = _('Quantité supérieur à celle possédé')
QUANTITY_UNDER_WARNING = _("Attention, certains produits sont en dessous du seuil d'urgence")

COMMAND_SAVED = _('Commande enregistrée')
COMMAND_NOT_CHANGED = _('Aucun produit à modifier')
COMMAND_CHANGED = _("Commande modifiée")
COMMAND_CANT_BE_DOWNLOADED = _("Vous n'avez pas le droit de télécharger cette commande")
UNKNOWN_COMMAND = _('Commande introuvable')
