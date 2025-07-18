# Generated by Django 2.2.3 on 2019-07-31 05:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0002_remove_orderitem_user'),
    ]

    operations = [
        migrations.RenameField(
            model_name='orderitem',
            old_name='data_group',
            new_name='category',
        ),
        migrations.RenameField(
            model_name='orderitem',
            old_name='data_size',
            new_name='size',
        ),
        migrations.AddField(
            model_name='menuitem',
            name='item_num',
            field=models.SmallIntegerField(default=1),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='menuitem',
            name='max_toppings',
            field=models.SmallIntegerField(default=None),
            preserve_default=False,
        ),
    ]
