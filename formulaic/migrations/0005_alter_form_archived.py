# Generated by Django 4.0.5 on 2023-10-23 19:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('formulaic', '0004_submission_promo_source'),
    ]

    operations = [
        migrations.AlterField(
            model_name='form',
            name='archived',
            field=models.BooleanField(default=False),
        ),
    ]
