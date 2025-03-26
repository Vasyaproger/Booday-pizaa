from rest_framework import serializers
from .models import Customer, Branch, Category, Subcategory, Product

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['name', 'email', 'phone', 'password']

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'name', 'city']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'emoji']

class SubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategory
        fields = ['id', 'name', 'category']

class ProductSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)  # Делаем поле image необязательным
    prices = serializers.JSONField(required=False, allow_null=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'image', 'branch', 'subcategory', 'prices', 'price']

    def validate(self, data):
        # Проверяем, что либо prices, либо price указаны, но не оба
        is_pizza = False
        if 'subcategory' in data:
            subcategory = data['subcategory']
            category = subcategory.category
            is_pizza = category.name.lower() == 'пицца'

        if is_pizza:
            if not data.get('prices'):
                raise serializers.ValidationError('Для пиццы необходимо указать цены (prices).')
            if data.get('price'):
                raise serializers.ValidationError('Для пиццы не нужно указывать price, используйте prices.')
        else:
            if not data.get('price'):
                raise serializers.ValidationError('Для не-пиццы необходимо указать цену (price).')
            if data.get('prices'):
                raise serializers.ValidationError('Для не-пиццы не нужно указывать prices, используйте price.')

        return data