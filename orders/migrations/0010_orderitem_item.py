# Generated by Django 2.2.3 on 2019-07-31 13:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0009_menuitem_has_extras'),
    ]

    operations = [
        migrations.AddField(
            model_name='orderitem',
            name='item',
            field=models.CharField(default=None, max_length=64),
        ),
    ]
