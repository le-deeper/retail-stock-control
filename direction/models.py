from django.db import models
from django.core.exceptions import ValidationError


# Create your models here.
class Client(models.Model):
    id_cli = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=255)

    def __str__(self):
        return self.nom


class Site (models.Model):
    nom = models.CharField(max_length=255, primary_key=True)

    def __str__(self):
        return self.nom


class Gerant(models.Model):
    gerant = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=255)
    mdp = models.CharField(max_length=255)
    est_admin = models.BooleanField(default=False)
    est_super_admin = models.BooleanField(default=False)
    site = models.ForeignKey('Site', on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.nom} - est admin: {self.est_admin} - est super admin{self.est_super_admin}"

    def clean(self):
        if not self.est_super_admin and not self.site:
            raise ValidationError("Un gérant non super admin doit être associé à un site.")


class Parametre(models.Model):
    BOT_TOKEN, CHAT_ID, CURRENCY, PHONE_NUMBER, ECO_MODE, IMAGE_PATH, TOTAL_TOLERANCE = range(1, 8)

    KEYS = {
        BOT_TOKEN: 'bot_token',
        CHAT_ID: 'chat_id',
        CURRENCY: 'currency',
        PHONE_NUMBER: 'phone_number',
        ECO_MODE: 'eco_mode',
        IMAGE_PATH: 'image_path',
        TOTAL_TOLERANCE: 'total_tolerance'
    }
    nom = models.IntegerField(primary_key=True,
                              choices=[(k, v) for k, v in KEYS.items()])
    valeur = models.CharField(max_length=255)

    def __str__(self):
        return f"{Parametre.KEYS.get(self.nom, self.nom)} - {self.valeur}"

    @staticmethod
    def get_value(key):
        values = Parametre.objects.filter(nom=key)
        return values[0] if values else None

    @staticmethod
    def parametre_to_dict():
        parametres_dict = {}
        for parametre in Parametre.objects.all():
            key = Parametre.KEYS.get(parametre.nom, None)
            if key:
                parametres_dict[key] = parametre.valeur
        return parametres_dict
