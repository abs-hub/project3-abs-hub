import logging
import traceback

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.models import User
from django.db.models import ProtectedError
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.shortcuts import render
from django.urls import reverse

from orders.models import MenuItem, Topping, Extra, Order, OrderItem
from .utility import fetch_model, cart, cart_count, update_total


# Default landing page
def index(request):
    if not request.user.is_authenticated:
        context = {
            'message': None,
            'regular_pizza': fetch_model(MenuItem, 'Regular Pizza'),
            'sicilian_pizza': fetch_model(MenuItem, 'Sicilian Pizza'),
            'toppings': fetch_model(Topping),
            'subs': fetch_model(MenuItem, 'Subs'),
            'extras': fetch_model(Extra),
            'pasta': fetch_model(MenuItem, 'Pasta'),
            'salads': fetch_model(MenuItem, 'Salads'),
            'platters': fetch_model(MenuItem, 'Dinner Platters'),
        }
        return render(request, 'orders/landing.html', context)
    else:
        context = {
            'message': None,
            'regular_pizza': fetch_model(MenuItem, 'Regular Pizza'),
            'sicilian_pizza': fetch_model(MenuItem, 'Sicilian Pizza'),
            'toppings': fetch_model(Topping),
            'subs': fetch_model(MenuItem, 'Subs'),
            'extras': fetch_model(Extra),
            'pasta': fetch_model(MenuItem, 'Pasta'),
            'salads': fetch_model(MenuItem, 'Salads'),
            'platters': fetch_model(MenuItem, 'Dinner Platters'),
            'cart_count': cart_count(request.user)
        }
        return render(request, "orders/index.html", context)


def login_view(request):
    if request.method == 'POST':

        # Grab username & password submitted via POST request & make sure that both
        # fields are not empty
        username = request.POST["username"]
        password = request.POST["password"]
        if username == '' or password == '':
            return HttpResponse('{"success": false, "message": "Both username and password are required."}')

        # Django built-in username & password authentication + login session -- by
        # logging the user in, request.user.is_authenticated == True in the
        # def index(request): route.
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return HttpResponse('{"success": true, "message": ""}')
        else:
            return HttpResponse('{"success": false, "message": "Invalid username and/or password."}')
    return HttpResponseRedirect(reverse('index'))


def logout_view(request):
    """
        Log out user.
    """
    logout(request)
    return HttpResponseRedirect(reverse('index'))


def register_view(request):
    """
        Register new user.
    """
    if request.method == 'GET':
        return render(request, 'orders/landing.html', {'message': None})
    else:
        username = request.POST['username']
        first_name = request.POST['first_name']
        last_name = request.POST['last_name']
        email = request.POST['email']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is None:
            new_user = User.objects.create_user(username, email, password,
                                                first_name=first_name,
                                                last_name=last_name)
            new_user.save()
            login(request, new_user)
            return HttpResponse('{"success": true, "message": ""}')
        else:
            return render(request,
                          'orders/landing.html',
                          {'message': 'User already exists.'})


@login_required(redirect_field_name='index')
def cart_view(request):
    """
        View items in one's cart.
    """
    customer = request.user
    order = cart(customer)
    context = {
        'message': None,
        'order': order,
        'cart': order.items.all(),
        'cart_count': cart_count(customer),
        'total': order.total
    }
    return render(request, 'orders/cart.html', context)


@login_required(redirect_field_name='index')
def pending_view(request):
    """
        View orders placed but not yet marked completed.
    """
    username = request.user
    customer = User.objects.get(username=username)
    orders = Order.objects.filter(
        placed=True, completed=False,
        in_cart=False, customer=customer
    )
    context = {
        'message': None,
        'orders': orders,
        'cart_count': cart_count(username)
    }
    return render(request, 'orders/pending.html', context)


@login_required(redirect_field_name='index')
def history_view(request):
    """
        View orders marked completed.
    """
    username = request.user
    customer = User.objects.get(username=username)
    orders = Order.objects.filter(completed=True, customer=customer)
    context = {
        'message': None,
        'orders': orders,
        'cartcount': cart_count(username)
    }
    return render(request, 'orders/history.html', context)


@login_required(redirect_field_name='index')
def empty_cart(request):
    """
        Empty one's cart.
    """
    username = request.user
    customer = User.objects.get(username=username)
    try:
        id = request.POST['orderid']
        Order.objects.get(id=int(id), customer=customer).delete()
    except ProtectedError:
        raise Http404('Failed to remove order object.')
    except Order.DoesNotExist:
        raise Http404('Order does not exist. Are you the customer?')

    return HttpResponseRedirect(reverse('cart'))


@login_required(redirect_field_name='index')
def additem(request):
    """
        Add orders to cart.
    """
    if request.method == 'POST':
        customer = request.user
        category = request.POST['category']
        item = request.POST['item']
        order = cart(customer)
        size = request.POST['size']
        toppings = request.POST['toppings']
        extras = request.POST['extras']
        extras_price = request.POST['extras_price']
        price = request.POST['price']

        if extras is not None:
            print("i")

        # Get price again from database and add item.
        try:
            new_item = OrderItem(
                category=category,
                item=item,
                price=price,
                order=order,
                toppings=toppings,
                extras=extras,
                extras_price=extras_price,
                size=size
            )
            new_item.save()
            # finally update the total
            update_total(order)
        except Exception as e:
            logging.error(traceback.format_exc())
            return HttpResponse('{"success": false, "message": "Unable to add item!"}')

        return HttpResponse('{"success": true, "message": "Item was addedd successfully!"}')


@login_required(redirect_field_name='index')
def checkout(request):
    """
        Go to checkout page.
    """
    customer = request.user
    order = cart(customer)
    context = {
        'message': None,
        'order': order,
        'cart': order.items.all(),
        'cartcount': cart_count(customer),
        'total': order.total,
        'paid': None
    }
    return render(request, 'orders/checkout.html', context)


def place_order(request):
    """
        Place an order.
    """
    customer = request.user
    try:
        cart = Order.objects.get(customer=customer, in_cart=True)
    except Order.MultipleObjectsReturned:
        raise Http404("More than one cart found.")
    except Order.DoesNotExist:
        raise Http404("No cart exists.")
    else:
        cart.placed = True
        cart.in_cart = False
        cart.save()
    context = {
        'user': customer,
        'order': cart,
        'cartcount': cart_count(customer)
    }
    return render(request, 'orders/thanks.html', context)


@login_required(redirect_field_name='index')
def charge(request):
    """
        Charge order with Stripe.
    """
    customer = request.user
    order = cart(customer)
    context = {
        'message': None,
        'order': order,
        'cart': order.items.all(),
        'cartcount': cart_count(customer),
        'total': order.total,
        'paid': True
    }
    return render(request, 'orders/checkout.html', context)


""" Admin users views are as below """


@login_required(redirect_field_name='index')
def orders_view(request):
    """
        View placed orders from all customers. Admin User only.
        Superuser can mark orders as completed or delete them.
    """
    if request.user.is_superuser:
        orders = Order.objects.filter(placed=True, completed=False)

        context = {
            'message': None,
            'orders': orders,
            'cartcount': cart_count(request.user)
        }
        return render(request, 'orders/orders.html', context)
    else:
        raise Http404("You are not authorized to view this page.")


@user_passes_test(lambda u: u.is_superuser)
def cancel_order(request):
    """
        Admin User cancels an order.
    """
    try:
        id = request.POST['orderid']
        Order.objects.get(id=int(id)).delete()
    except ProtectedError:
        raise Http404('Failed to remove order object.')
    except Order.DoesNotExist:
        raise Http404('Order does not exist.')

    return HttpResponseRedirect(reverse('orders'))


@user_passes_test(lambda u: u.is_superuser)
def complete_order(request):
    """
        Admin User marks an order as completed.
    """
    try:
        id = request.POST['orderid']
        order = Order.objects.get(id=int(id))
        order.in_cart = False
        order.placed = False
        order.completed = True
        order.save()
    except Order.DoesNotExist:
        raise Http404('Order does not exist.')

    return HttpResponseRedirect(reverse('orders'))
