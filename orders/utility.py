from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from django.core import serializers
from smtplib import SMTPException, SMTPAuthenticationError
from orders.models import MenuItem, Topping, Extra, Order, OrderItem


def fetch_model(model, cat=None):
    """ This method will filter and return values for the passed model """
    cols = [field.name for field in model._meta.get_fields()]

    ret_val = None
    if 'id' in cols:
        cols.remove('id')

    if cat is None:
        ret_val = serializers.serialize('json', model.objects.all())
    elif cat is 'Topping':
        ret_val = serializers.serialize('json', model.objects.all())
    elif cat is 'Extra':
        ret_val = serializers.serialize('json', model.objects.all())
    else:
        ret_val = model.objects.filter(category__contains=cat)

    return ret_val

def cart(customer):
    """
        Return current cart items, if none creates a new one
    """
    try:
        shopping_cart = Order.objects.get(customer=customer, in_cart=True)
    except Order.DoesNotExist:
        shopping_cart = Order(customer=customer)
        shopping_cart.save()
    return shopping_cart


def update_total(order):
    """
        Updates total price of order.
    """
    if not isinstance(order, Order):
        raise Http404("{} is not an instance of Order.".format(order))
    else:
        items = order.items.all()
        order.total = 0
        for item in items:
            order.total += (item.price + item.extras_price)
        order.save()


def cart_count(customer):
    """
        Return number of items in cart.
    """
    try:
        shopping_cart = Order.objects.get(customer=customer, in_cart=True)
    except Order.MultipleObjectsReturned:
        raise Http404("More than one cart found.")
    except Order.DoesNotExist:
        return 0
    else:
        return shopping_cart.items.count()


def find_price(model, size):
    if size is not None:
        return model.price_sm if size is 'S' else model.price_lg
    else:
        return model.price
