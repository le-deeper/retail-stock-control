# Generated by Django 5.0.7 on 2024-08-23 20:35

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('direction', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Tentative',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('pseudo', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='Action',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('categorie', models.IntegerField(choices=[(1, 'Information'), (2, 'Avertissement'), (3, 'Erreur')])),
                ('action', models.TextField()),
                ('gerant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='direction.gerant')),
            ],
        ),
        migrations.CreateModel(
            name='Session',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('valeur', models.CharField(max_length=255)),
                ('datelimit', models.DateField()),
                ('gerant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='direction.gerant')),
            ],
        ),
    ]
