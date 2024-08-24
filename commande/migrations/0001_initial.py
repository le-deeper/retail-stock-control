# Generated by Django 5.0.7 on 2024-08-23 20:35

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CommandeProduit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('prix', models.DecimalField(decimal_places=2, max_digits=10)),
                ('est_cadeau', models.BooleanField(default=False)),
                ('qte', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='CommandeTotale',
            fields=[
                ('id_commande', models.AutoField(primary_key=True, serialize=False)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('commentaire', models.TextField(null=True)),
            ],
        ),
    ]
