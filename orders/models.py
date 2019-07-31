from django.contrib.auth.models import User
from django.db import models


# Create models for menu item.
class MenuItem(models.Model):
    category = models.CharField(max_length=64)
    item = models.CharField(max_length=64)
    price_sm = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    price_lg = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    price = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    item_num = models.SmallIntegerField(default=0)
    max_toppings = models.SmallIntegerField(default=None, blank=True, null=True)
    has_extras = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.category}, {self.item} | small: ${self.price_sm} | large: ${self.price_lg} | price: ${self.price} | index: {self.item_num} | toppings_limit: {self.max_toppings}"


# Create model for topping
class Topping(models.Model):
    name = models.CharField(max_length=64)
    order_num = models.SmallIntegerField(default=0)

    def __str__(self):
        return f"{self.name}"


# Create model for Extra
class Extra(models.Model):
    item = models.CharField(max_length=64)
    price_sm = models.DecimalField(max_digits=5, decimal_places=2)
    price_lg = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.item}"


# Create model for Order
class Order(models.Model):
    customer = models.ForeignKey(
        User,
        null=True,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    timestamp = models.DateTimeField(auto_now=True)
    total = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    in_cart = models.BooleanField(default=True)
    placed = models.BooleanField(default=False)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Order #{self.id} by {self.customer.first_name}"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        null=True,
        related_name='items'
    )
    category = models.CharField(max_length=64, default=None)
    item = models.CharField(max_length=64, default=None)
    size = models.CharField(max_length=64, default=None)
    extras = models.CharField(max_length=100, default=None)
    extras_price = models.DecimalField(max_digits=5, decimal_places=2, default=None)
    price = models.DecimalField(max_digits=5, decimal_places=2, default=None)
    toppings = models.CharField(max_length=100, default=None)

    def __str__(self):
        return f"category: {self.category} | size: {self.size} | extras: {self.extras} | extras_price: {self.extras_price} | name: {self.name} | price: {self.price} | toppings: {self.toppings} | user: {self.user}"
