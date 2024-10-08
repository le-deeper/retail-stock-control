from django.core.exceptions import ValidationError
from django.db import models

from commande.models import CommandeProduit
from direction.models import Parametre
from utility.search_engine import search


# Create your models here.
class Stock(models.Model):
    """product quantity in a site"""
    id_stock = models.AutoField(primary_key=True)
    prod = models.ForeignKey('Produit', on_delete=models.CASCADE)
    site = models.ForeignKey('direction.Site', on_delete=models.CASCADE, null=True)
    qte = models.IntegerField()

    def __str__(self):
        return f"{self.prod} - {self.site} - {self.qte}"


class Categorie(models.Model):
    """product category"""
    id_categ = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=255)

    def __str__(self):
        return self.nom


class MethodePaiement(models.Model):
    """payment method"""
    id_paiement = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=255)

    def __str__(self):
        return self.nom


class Produit(models.Model):
    """Model for a product"""
    id_prod = models.AutoField(primary_key=True)
    image = models.ImageField(upload_to='prodcuts_images/')
    image_url = models.URLField(max_length=200)
    nom = models.CharField(max_length=255)
    prix_vente = models.DecimalField(max_digits=10, decimal_places=2)  # Prix avec lequel on vend le porduit aux clients
    prix_achat = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    categ = models.ForeignKey('Categorie', on_delete=models.CASCADE)
    code_bar = models.CharField(unique=True, null=True, max_length=15)
    stock_urgence = models.IntegerField(default=0)

    def clean(self):
        if self.image and self.image_url:
            raise ValidationError("You can't have both an image and an image URL.")

    def __str__(self):
        return f"{self.nom} - {self.prix_vente} - {self.categ}"

    @staticmethod
    def products_to_dict(products, site, include_prix_achat=False, eco_mode=False):
        """get a list of products and return a list of dictionaries with the product's information
        :param products: list of products
        :param site: the site where the stock is located
        :param include_prix_achat: if True, include the purchase price of the product
        :param eco_mode: if True, don't include the product image
        :return: a list of dictionaries with the product's information"""
        products_dict = []
        for product in products:
            qte = 'Inconnu'
            if site:
                stock = Stock.objects.filter(prod=product, site=site)
                qte = stock[0].qte if stock else 0
            default_image = Parametre.get_value(Parametre.IMAGE_PATH).valeur if Parametre.get_value(Parametre.IMAGE_PATH) else ''
            product_dict = {
                'code': product.id_prod,
                'nom': product.nom,
                'qte': qte,
                'prix': product.prix_vente,
                'categorie': product.categ.nom,
                'image': product.image.url if product.image else
                (product.image_url if product.image_url else default_image),
                'prix_achat': product.prix_achat if (include_prix_achat and product.prix_achat) else 'Inconnu'
            }
            if eco_mode:
                product_dict['image'] = ''
            products_dict.append(product_dict)
        return products_dict


class Approvisionnement(models.Model):
    """Model for a product purchase (supply)"""
    id_appro = models.AutoField(primary_key=True)
    date_achat = models.DateTimeField(auto_now_add=True)
    qte = models.IntegerField()
    prix_achat = models.DecimalField(max_digits=10, decimal_places=2)
    prod = models.ForeignKey('Produit', on_delete=models.CASCADE)
    four = models.CharField(max_length=255, default="Inconnu")
    site = models.ForeignKey('direction.Site', on_delete=models.CASCADE, null=True)
    gerant = models.ForeignKey('direction.Gerant', on_delete=models.CASCADE, null=True)

    def __str__(self):
        return f"{self.prod} - {self.qte} - {self.prix_achat} - {self.date_achat}"


class Paiement(models.Model):
    """Model for a payment deadline"""
    CLIENT = 1
    FOUR = 2
    id_paiement = models.AutoField(primary_key=True)
    date_paiement = models.DateTimeField(null=True)
    destinataire = models.IntegerField(choices=[(CLIENT, 'Client'), (FOUR, 'Fournisseur')], default=CLIENT)
    commande = models.ForeignKey('commande.CommandeTotale', on_delete=models.CASCADE, null=True)
    approvisionnement = models.ForeignKey('Approvisionnement', on_delete=models.CASCADE, null=True)
    est_terminee = models.BooleanField(default=False)
    parti_payee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    def save(
            self, *args, **kwargs
    ):
        # Set the total amount of the payment
        if self.destinataire == self.CLIENT:
            products = search(CommandeProduit, "commande", self.commande, True)
            self.total = sum([product.prix * product.qte for product in products if not product.est_cadeau])
        elif self.destinataire == self.FOUR:
            self.total = float(self.approvisionnement.qte) * float(self.approvisionnement.prix_achat)
        super(Paiement, self).save(*args, **kwargs)

    def clean(self):
        # Check if the payment respects the constraints
        if self.destinataire == self.CLIENT and not self.commande:
            raise ValidationError("Une commande est nécessaire pour l'échéance d'un client")
        elif self.destinataire == self.FOUR and not self.approvisionnement:
            raise ValidationError("Un approvisionnement est nécessaire pour l'échéance d'un fournisseur")

    def __str__(self):
        if self.destinataire == self.CLIENT:
            return f"Client - {self.commande} - {self.date_paiement} ({self.id_paiement})"
        else:
            return f"Fournisseur - {self.approvisionnement} - {self.date_paiement} ({self.id_paiement})"


class VerificationStock(models.Model):
    """Model for a stock verification"""
    id_verif = models.AutoField(primary_key=True)
    date_verif = models.DateTimeField(auto_now_add=True)
    gerant = models.ForeignKey('direction.Gerant', on_delete=models.CASCADE)
    erreur = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.gerant} - {self.date_verif}"
