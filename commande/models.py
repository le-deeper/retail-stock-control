from django.db import models

from utility.search_engine import search


class CommandeTotale(models.Model):
    id_commande = models.AutoField(primary_key=True)
    gerant = models.ForeignKey('direction.Gerant', on_delete=models.CASCADE)
    client = models.ForeignKey('direction.Client', on_delete=models.CASCADE, null=True)
    date = models.DateTimeField(auto_now_add=True)
    methode_paiement = models.ForeignKey('gestion.MethodePaiement', on_delete=models.CASCADE, null=True)
    commentaire = models.TextField(null=True)

    def __str__(self):
        return (f"{self.id_commande} - Validé par {self.gerant.nom} - pour {self.client.nom if self.client else 'Inconnu'} "
                f"- Date: {self.date} - Méthode: {self.methode_paiement}")


class CommandeProduit(models.Model):
    prod = models.ForeignKey('gestion.Produit', on_delete=models.CASCADE)
    commande = models.ForeignKey('CommandeTotale', on_delete=models.CASCADE)
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    est_cadeau = models.BooleanField(default=False)
    qte = models.IntegerField()

    def __str__(self):
        return f"{self.prod.nom} - {self.qte} - {self.prix} ({self.commande})"


class Commande:
    def __init__(self, command_total: CommandeTotale):
        self.id = command_total.id_commande
        self.gerant = command_total.gerant.nom
        self.site = command_total.gerant.site.nom if command_total.gerant.site else "Inconnu"
        self.client = command_total.client.nom if command_total.client else 'Inconnu'
        self.date = command_total.date
        # Changer la date sous le format 'JJ/MM/AAAA à HH:MM:SS'
        self.formated_date = self.date.strftime('%d/%m/%Y %H:%M')
        self.paiement = command_total.methode_paiement.nom
        self.products = search(CommandeProduit, 'commande', command_total, True)
        self.comment = command_total.commentaire
        self.total = sum([product.prix * product.qte for product in self.products if not product.est_cadeau])

