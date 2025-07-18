from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("landing", views.login_view, name="landing"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register_view, name="register"),
    path("orders", views.orders_view, name="orders"),
    path('cart', views.cart_view, name='cart'),
    path('additem', views.additem, name='additem'),
    path('place', views.place_order, name='place'),
    path('checkout', views.checkout, name='checkout'),
    path('charge', views.charge, name='charge'),
    path('orders', views.orders_view, name='orders'),
    path('pending', views.pending_view, name='pending'),
    path('history', views.history_view, name='history'),
    path('complete', views.complete_order, name='complete'),
    path('cancel', views.cancel_order, name='cancel'),
    path('emptycart', views.empty_cart, name='emptycart')
]
