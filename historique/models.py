from django.db import models


# Create your models here.
class Action(models.Model):
    """Action made by a manager"""
    INFO = 1
    WARNING = 2
    ERROR = 3
    id = models.AutoField(primary_key=True)
    date = models.DateTimeField(auto_now_add=True)
    categorie = models.IntegerField(choices=[(INFO, 'Information'), (WARNING, 'Avertissement'), (ERROR, 'Erreur')])
    action = models.TextField()
    gerant = models.ForeignKey('direction.Gerant', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.gerant.nom} - {self.date} - {self.action}"


class Tentative(models.Model):
    """Tentative to connect to the application"""
    id = models.AutoField(primary_key=True)
    date = models.DateTimeField(auto_now_add=True)
    pseudo = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.pseudo} - {self.date}"


class Session(models.Model):
    """Session of a manager"""
    id = models.AutoField(primary_key=True)
    valeur = models.CharField(max_length=255)
    datelimit = models.DateField()
    gerant = models.ForeignKey('direction.Gerant', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.gerant.nom} - {self.valeur} - {self.datelimit}"
