from rest_framework import serializers
from .models import Customer, Branch, Category, Subcategory, Product
import bcrypt

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['email', 'phone', 'password', 'name']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'phone': {'required': True},
            'name': {'required': True},
        }

    def validate_email(self, value):
        if Customer.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует.")
        return value

    def validate_phone(self, value):
        # Простая проверка формата телефона (можно настроить под ваши требования)
        if not value.startswith('+') or len(value) < 10:
            raise serializers.ValidationError("Номер телефона должен начинаться с '+' и содержать минимум 10 символов.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        username = validated_data['email'].split('@')[0]
        user = Customer(
            username=username,
            password=hashed_password,
            email=validated_data['email'],
            phone=validated_data['phone'],
            name=validated_data['name']
        )
        user.save()
        return user

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'name', 'city']
        extra_kwargs = {
            'name': {'required': True},
            'city': {'required': True},
        }

    def validate_name(self, value):
        if Branch.objects.filter(name=value).exists():
            raise serializers.ValidationError("Филиал с таким названием уже существует.")
        return value

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'emoji']
        extra_kwargs = {
            'name': {'required': True},
            'emoji': {'required': True},
        }

    def validate_name(self, value):
        if Category.objects.filter(name=value).exists():
            raise serializers.ValidationError("Категория с таким названием уже существует.")
        return value

class SubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategory
        fields = ['id', 'name', 'category']
        extra_kwargs = {
            'name': {'required': True},
            'category': {'required': True},
        }

    def validate(self, data):
        category = data.get('category')
        name = data.get('name')
        if Subcategory.objects.filter(category=category, name=name).exists():
            raise serializers.ValidationError("Подкатегория с таким названием уже существует в этой категории.")
        return data

class ProductSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    prices = serializers.JSONField(required=False, allow_null=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'image', 'branch', 'subcategory', 'prices', 'price']
        extra_kwargs = {
            'name': {'required': True},
            'branch': {'required': True},
            'subcategory': {'required': True},
        }

    def validate(self, data):
        # Проверяем, что либо prices, либо price указаны, но не оба
        is_pizza = False
        subcategory = data.get('subcategory')
        if subcategory:
            category = subcategory.category
            is_pizza = category.name.lower() == 'пицца'

        if is_pizza:
            if not data.get('prices'):
                raise serializers.ValidationError('Для пиццы необходимо указать цены (prices).')
            if data.get('price'):
                raise serializers.ValidationError('Для пиццы не нужно указывать price, используйте prices.')
            # Проверяем структуру prices
            prices = data.get('prices')
            required_keys = ['small', 'medium', 'large']
            if not all(key in prices for key in required_keys):
                raise serializers.ValidationError('Для пиццы необходимо указать все цены: small, medium, large.')
            for key in required_keys:
                if not isinstance(prices[key], (int, float)) or prices[key] <= 0:
                    raise serializers.ValidationError(f'Цена для {key} должна быть числом больше 0.')
        else:
            if not data.get('price'):
                raise serializers.ValidationError('Для не-пиццы необходимо указать цену (price).')
            if data.get('prices'):
                raise serializers.ValidationError('Для не-пиццы не нужно указывать prices, используйте price.')
            if data.get('price') <= 0:
                raise serializers.ValidationError('Цена должна быть больше 0.')

        # Проверяем уникальность продукта в филиале и подкатегории
        name = data.get('name')
        branch = data.get('branch')
        subcategory = data.get('subcategory')
        if Product.objects.filter(name=name, branch=branch, subcategory=subcategory).exists():
            raise serializers.ValidationError("Продукт с таким названием уже существует в этом филиале и подкатегории.")

        return data

    def update(self, instance, validated_data):
        # Обновляем поля
        instance.name = validated_data.get('name', instance.name)
        instance.branch = validated_data.get('branch', instance.branch)
        instance.subcategory = validated_data.get('subcategory', instance.subcategory)
        instance.image = validated_data.get('image', instance.image)

        # Обновляем цены в зависимости от типа продукта
        is_pizza = instance.subcategory.category.name.lower() == 'пицца'
        if is_pizza:
            instance.prices = validated_data.get('prices', instance.prices)
            instance.price = None
        else:
            instance.price = validated_data.get('price', instance.price)
            instance.prices = None

        instance.save()
        return instance