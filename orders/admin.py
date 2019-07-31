from django.contrib import admin

from orders.models import MenuItem, Topping, Extra, Order, OrderItem


# Register your models here.
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemInline]


admin.site.register(Topping)
admin.site.register(Extra)
admin.site.register(MenuItem)
admin.site.register(Order, OrderAdmin)
