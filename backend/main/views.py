from pathlib import Path
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import render
from django.core.mail import send_mail
from django.contrib.auth.hashers import check_password
from django.conf import settings
import bcrypt
import random
import string
from PIL import Image
from django.contrib.auth.models import User
import datetime
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import CustomerSerializer, BranchSerializer, CategorySerializer, SubcategorySerializer, ProductSerializer
from .models import Customer, Branch, Category, Subcategory, Product
import json

# Логирование для отладки
import logging
logger = logging.getLogger(__name__)

# Представление для корневого URL
class RootView(APIView):
    def get(self, request):
        return Response({
            "message": "Добро пожаловать в API Boodai Pizza!",
            "available_endpoints": {
                "admin": {
                    "register": "/api/admin/register",
                    "login": "/api/admin/login",
                    "users": "/api/admin/users",
                    "promo": "/api/admin/promo",
                    "branch": "/api/admin/branch",
                    "branches": "/api/admin/branches",
                    "category": "/api/admin/category",
                    "categories": "/api/admin/categories",
                    "subcategory": "/api/admin/subcategory",
                    "subcategories": "/api/admin/subcategories",
                    "product": "/api/admin/product",
                    "products": "/api/admin/products",
                },
                "auth": {
                    "register": "/api/auth/register",
                    "login": "/api/auth/login",
                },
                "users": {
                    "list": "/api/users",
                    "promo": "/api/users/promo",
                },
                "public": {
                    "branches": "/api/public/branches",
                    "categories": "/api/public/categories",
                    "products": "/api/public/products",
                }
            }
        }, status=status.HTTP_200_OK)

# Эндпоинты для админов
class AdminRegisterView(APIView):
    def post(self, request):
        username = f"admin_{''.join(random.choices(string.ascii_lowercase + string.digits, k=6))}"
        password = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        email = f"{username}@example.com"
        User.objects.create_user(username=username, password=password, email=email, is_staff=True, is_superuser=True)
        logger.info(f"Admin registered: {username}")
        return Response({'username': username, 'password': password}, status=status.HTTP_200_OK)

class AdminLoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            logger.warning("Admin login failed: Missing username or password")
            return Response({'message': 'Укажите логин и пароль'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=username)
            if not user.is_staff and not user.is_superuser:
                logger.warning(f"Admin login failed: {username} is not an admin")
                return Response({'message': 'Доступ разрешен только администраторам'}, status=status.HTTP_403_FORBIDDEN)

            if not check_password(password, user.password):
                logger.warning(f"Admin login failed: Incorrect password for {username}")
                return Response({'message': 'Неверный пароль'}, status=status.HTTP_401_UNAUTHORIZED)

            logger.info(f"Admin login successful for {username}")
            return Response({'message': 'Вход успешен'}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            logger.warning(f"Admin login failed: User {username} not found")
            return Response({'message': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Admin login error: {str(e)}")
            return Response({'message': 'Ошибка сервера'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request):
        logger.warning("GET request to /api/admin/login is not allowed")
        return Response(
            {'message': 'Метод GET не поддерживается для этого эндпоинта. Используйте POST для входа.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

class AdminUsersView(APIView):
    def get(self, request):
        admins = User.objects.filter(is_staff=True).values('username')
        return Response(admins, status=status.HTTP_200_OK)

class AdminPromoView(APIView):
    def post(self, request):
        promo_code = request.data.get('promoCode')
        username = request.data.get('username')
        user = Customer.objects.filter(username=username).first()
        if not user:
            logger.warning(f"Promo code send failed: User {username} not found")
            return Response({'message': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)
        send_mail(
            'Ваш промокод',
            f'Здравствуйте, {user.name}!\n\nВаш промокод: {promo_code}\n\nС уважением,\nКоманда приложения',
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=False,
        )
        logger.info(f"Promo code {promo_code} sent to {user.email}")
        return Response({'message': f'Промокод {promo_code} отправлен на {user.email}'}, status=status.HTTP_200_OK)

# Эндпоинты для пользователей
class UserRegisterView(APIView):
    def get(self, request):
        return Response({
            "message": "This endpoint is for user registration. Use POST to register a new user.",
            "required_fields": ["email", "phone", "password"]
        }, status=status.HTTP_200_OK)

    def post(self, request):
        logger.info(f"Received data for user registration: {request.data}")
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            if Customer.objects.filter(email=data['email']).exists():
                logger.warning(f"User registration failed: Email {data['email']} already exists")
                return Response({'message': 'Пользователь с таким email уже существует'}, status=status.HTTP_400_BAD_REQUEST)
            hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
            user = Customer(
                username=data['email'].split('@')[0],
                password=hashed_password.decode('utf-8'),
                name=data['name'],
                email=data['email'],
                phone=data['phone']
            )
            user.save()
            logger.info(f"Customer registered: {user.email}")
            return Response({'message': 'Регистрация успешна', 'name': user.name}, status=status.HTTP_201_CREATED)
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response({'message': 'Ошибка валидации', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    def get(self, request):
        return Response({
            "message": "This endpoint is for user login. Use POST to login.",
            "required_fields": ["email", "password"]
        }, status=status.HTTP_200_OK)

    def post(self, request):
        logger.info(f"Login attempt: email={request.data.get('email')}")
        data = request.data
        user = Customer.objects.filter(email=data.get('email')).first()
        if not user:
            logger.warning(f"Login failed: User with email {data.get('email')} not found")
            return Response({'message': 'Пользователь не найден'}, status=status.HTTP_400_BAD_REQUEST)
        if not bcrypt.checkpw(data.get('password', '').encode('utf-8'), user.password.encode('utf-8')):
            logger.warning(f"Login failed: Invalid password for {user.email}")
            return Response({'message': 'Неверный пароль'}, status=status.HTTP_400_BAD_REQUEST)
        logger.info(f"Login successful: {user.email}")
        return Response({'message': 'Вход успешен', 'name': user.name}, status=status.HTTP_200_OK)

class UsersView(APIView):
    def get(self, request):
        users = Customer.objects.values('username', 'name', 'email', 'phone')
        return Response(users, status=status.HTTP_200_OK)

    def delete(self, request, id):
        try:
            user = Customer.objects.get(id=id)
            user.delete()
            logger.info(f"User deleted: {user.email}")
            return Response({'message': 'Пользователь удален'}, status=status.HTTP_200_OK)
        except Customer.DoesNotExist:
            logger.warning(f"User deletion failed: User with id {id} not found")
            return Response({'message': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)

# Эндпоинты для филиалов
class BranchView(APIView):
    def post(self, request):
        serializer = BranchSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Branch created: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.error(f"Branch creation failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, id):
        try:
            branch = Branch.objects.get(id=id)
        except Branch.DoesNotExist:
            logger.warning(f"Branch update failed: Branch with id {id} not found")
            return Response({'message': 'Филиал не найден'}, status=status.HTTP_404_NOT_FOUND)
        serializer = BranchSerializer(branch, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Branch updated: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.error(f"Branch update failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        try:
            branch = Branch.objects.get(id=id)
            if branch.products.exists():
                logger.warning(f"Branch deletion failed: Branch {id} has products")
                return Response({'message': 'Нельзя удалить филиал, у которого есть продукты'}, status=status.HTTP_400_BAD_REQUEST)
            branch.delete()
            logger.info(f"Branch deleted: {id}")
            return Response({'message': 'Филиал удален'}, status=status.HTTP_200_OK)
        except Branch.DoesNotExist:
            logger.warning(f"Branch deletion failed: Branch with id {id} not found")
            return Response({'message': 'Филиал не найден'}, status=status.HTTP_404_NOT_FOUND)

class BranchesView(APIView):
    def get(self, request):
        branches = Branch.objects.all()
        serializer = BranchSerializer(branches, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Эндпоинты для категорий
class CategoryView(APIView):
    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Category created: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.error(f"Category creation failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, id):
        try:
            category = Category.objects.get(id=id)
        except Category.DoesNotExist:
            logger.warning(f"Category update failed: Category with id {id} not found")
            return Response({'message': 'Категория не найдена'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Category updated: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.error(f"Category update failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        try:
            category = Category.objects.get(id=id)
            if category.subcategories.exists():
                logger.warning(f"Category deletion failed: Category {id} has subcategories")
                return Response({'message': 'Нельзя удалить категорию, у которой есть подкатегории'}, status=status.HTTP_400_BAD_REQUEST)
            category.delete()
            logger.info(f"Category deleted: {id}")
            return Response({'message': 'Категория удалена'}, status=status.HTTP_200_OK)
        except Category.DoesNotExist:
            logger.warning(f"Category deletion failed: Category with id {id} not found")
            return Response({'message': 'Категория не найдена'}, status=status.HTTP_404_NOT_FOUND)

class CategoriesView(APIView):
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Эндпоинты для подкатегорий
class SubcategoryListView(APIView):
    def get(self, request):
        subcategories = Subcategory.objects.all()
        serializer = SubcategorySerializer(subcategories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SubcategoryView(APIView):
    def post(self, request):
        logger.info(f"Received data for subcategory creation: {request.data}")
        serializer = SubcategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Subcategory created: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.error(f"Subcategory creation failed: {serializer.errors}")
        error_message = serializer.errors.get('category', serializer.errors.get('name', 'Ошибка валидации данных'))
        if isinstance(error_message, list):
            error_message = error_message[0]
        return Response({'message': error_message}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, id):
        try:
            subcategory = Subcategory.objects.get(id=id)
        except Subcategory.DoesNotExist:
            logger.warning(f"Subcategory update failed: Subcategory with id {id} not found")
            return Response({'message': 'Подкатегория не найдена'}, status=status.HTTP_404_NOT_FOUND)
        serializer = SubcategorySerializer(subcategory, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Subcategory updated: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.error(f"Subcategory update failed: {serializer.errors}")
        return Response({'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        try:
            subcategory = Subcategory.objects.get(id=id)
            if Product.objects.filter(subcategory=subcategory).exists():
                logger.warning(f"Subcategory deletion failed: Subcategory {id} has products")
                return Response({'message': 'Нельзя удалить подкатегорию, у которой есть продукты'}, status=status.HTTP_400_BAD_REQUEST)
            subcategory.delete()
            logger.info(f"Subcategory deleted: {id}")
            return Response({'message': 'Подкатегория удалена'}, status=status.HTTP_200_OK)
        except Subcategory.DoesNotExist:
            logger.warning(f"Subcategory deletion failed: Subcategory with id {id} not found")
            return Response({'message': 'Подкатегория не найдена'}, status=status.HTTP_404_NOT_FOUND)

# Эндпоинты для продуктов
class ProductView(APIView):
    parser_classes = (MultiPartParser, FormParser)  # Для обработки multipart/form-data

    def post(self, request):
        logger.info(f"Received data for product creation: {request.data}, files: {request.FILES}")

        name = request.data.get('name')
        image = request.FILES.get('image')
        branch_id = request.data.get('branch')
        subcategory_id = request.data.get('subcategory')
        prices = request.data.get('prices')
        price = request.data.get('price')

        # Проверяем обязательные поля
        if not name or not branch_id or not subcategory_id:
            logger.warning("Product creation failed: Missing required fields")
            return Response(
                {'message': 'Укажите название, филиал и подкатегорию'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            branch = Branch.objects.get(id=branch_id)
            subcategory = Subcategory.objects.get(id=subcategory_id)

            # Проверяем, является ли продукт пиццей
            category = subcategory.category
            is_pizza = category.name.lower() == 'пицца'

            # Обрабатываем цены
            if is_pizza:
                if not prices:
                    logger.warning("Product creation failed: Prices required for pizza")
                    return Response(
                        {'message': 'Укажите цены для пиццы'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                prices = json.loads(prices)  # Парсим JSON-строку в словарь
                if not all(key in prices for key in ['small', 'medium', 'large']):
                    logger.warning("Product creation failed: Missing pizza price fields")
                    return Response(
                        {'message': 'Укажите все цены для пиццы (small, medium, large)'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                # Проверяем, что цены больше 0
                if not (float(prices['small']) > 0 and float(prices['medium']) > 0 and float(prices['large']) > 0):
                    logger.warning("Product creation failed: Pizza prices must be greater than 0")
                    return Response(
                        {'message': 'Все цены для пиццы должны быть больше 0'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                if not price:
                    logger.warning("Product creation failed: Price required for non-pizza product")
                    return Response(
                        {'message': 'Укажите цену для продукта'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if float(price) <= 0:
                    logger.warning("Product creation failed: Price must be greater than 0")
                    return Response(
                        {'message': 'Цена должна быть больше 0'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Обрабатываем изображение
            image_path = None
            if image:
                if image.content_type not in ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']:
                    logger.warning(f"Product creation failed: Invalid image format {image.content_type}")
                    return Response(
                        {'message': 'Только PNG, JPG, JPEG и WebP форматы поддерживаются'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if image.size > 5 * 1024 * 1024:
                    logger.warning(f"Product creation failed: Image size too large {image.size}")
                    return Response(
                        {'message': 'Файл слишком большой'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                products_dir = Path(settings.MEDIA_ROOT) / 'products'
                products_dir.mkdir(parents=True, exist_ok=True)

                with Image.open(image) as img:
                    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                        logger.info(f"Converting image from mode {img.mode} to RGB")
                        img = img.convert('RGB')

                    img = img.resize((800, int(800 * img.height / img.width)))
                    timestamp = datetime.datetime.now().timestamp()
                    image_path = f"products/compressed-{timestamp}-{image.name}"
                    full_path = Path(settings.MEDIA_ROOT) / image_path
                    logger.info(f"Saving image to: {full_path}")

                    try:
                        img.save(full_path, 'JPEG', quality=80)
                    except Exception as e:
                        logger.error(f"Failed to save image: {e}")
                        return Response(
                            {'message': f'Ошибка при сохранении изображения: {str(e)}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

            # Создаем продукт
            product = Product(
                name=name,
                branch=branch,
                subcategory=subcategory,
            )
            if image_path:
                product.image = image_path
            if is_pizza:
                product.prices = prices
            else:
                product.price = float(price)
            product.save()

            logger.info(f"Product created: {product.name}")
            return Response(
                {
                    'id': product.id,
                    'name': product.name,
                    'image': product.image.url if product.image else None,
                    'branch': {'id': branch.id, 'name': branch.name},
                    'subcategory': {'id': subcategory.id, 'name': subcategory.name, 'category': category.id},
                    'prices': product.prices if is_pizza else None,
                    'price': product.price if not is_pizza else None,
                },
                status=status.HTTP_201_CREATED
            )

        except Branch.DoesNotExist:
            logger.warning(f"Product creation failed: Branch {branch_id} not found")
            return Response(
                {'message': 'Филиал не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Subcategory.DoesNotExist:
            logger.warning(f"Product creation failed: Subcategory {subcategory_id} not found")
            return Response(
                {'message': 'Подкатегория не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Product creation failed: {str(e)}")
            return Response(
                {'message': f'Ошибка сервера: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, id):
        logger.info(f"Received data for product update: {request.data}, files: {request.FILES}")

        try:
            product = Product.objects.get(id=id)
        except Product.DoesNotExist:
            logger.warning(f"Product update failed: Product with id {id} not found")
            return Response({'message': 'Продукт не найден'}, status=status.HTTP_404_NOT_FOUND)

        name = request.data.get('name', product.name)
        branch_id = request.data.get('branch', product.branch.id)
        subcategory_id = request.data.get('subcategory', product.subcategory.id)
        prices = request.data.get('prices')
        price = request.data.get('price')
        image = request.FILES.get('image')

        try:
            branch = Branch.objects.get(id=branch_id)
            subcategory = Subcategory.objects.get(id=subcategory_id)

            # Проверяем, является ли продукт пиццей
            category = subcategory.category
            is_pizza = category.name.lower() == 'пицца'

            # Обрабатываем цены
            if is_pizza:
                if prices:
                    prices = json.loads(prices)
                    if not all(key in prices for key in ['small', 'medium', 'large']):
                        logger.warning("Product update failed: Missing pizza price fields")
                        return Response(
                            {'message': 'Укажите все цены для пиццы (small, medium, large)'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    if not (float(prices['small']) > 0 and float(prices['medium']) > 0 and float(prices['large']) > 0):
                        logger.warning("Product update failed: Pizza prices must be greater than 0")
                        return Response(
                            {'message': 'Все цены для пиццы должны быть больше 0'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
            else:
                if price:
                    if float(price) <= 0:
                        logger.warning("Product update failed: Price must be greater than 0")
                        return Response(
                            {'message': 'Цена должна быть больше 0'},
                            status=status.HTTP_400_BAD_REQUEST
                        )

            # Обрабатываем изображение
            old_image = product.image.path if product.image else None
            image_path = None
            if image:
                if image.content_type not in ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']:
                    logger.warning(f"Product update failed: Invalid image format {image.content_type}")
                    return Response(
                        {'message': 'Только PNG, JPG, JPEG и WebP форматы поддерживаются'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if image.size > 5 * 1024 * 1024:
                    logger.warning(f"Product update failed: Image size too large {image.size}")
                    return Response(
                        {'message': 'Файл слишком большой'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                products_dir = Path(settings.MEDIA_ROOT) / 'products'
                products_dir.mkdir(parents=True, exist_ok=True)

                with Image.open(image) as img:
                    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                        logger.info(f"Converting image from mode {img.mode} to RGB")
                        img = img.convert('RGB')

                    img = img.resize((800, int(800 * img.height / img.width)))
                    timestamp = datetime.datetime.now().timestamp()
                    image_path = f"products/compressed-{timestamp}-{image.name}"
                    full_path = Path(settings.MEDIA_ROOT) / image_path
                    logger.info(f"Saving image to: {full_path}")

                    try:
                        img.save(full_path, 'JPEG', quality=80)
                        if old_image and Path(old_image).exists():
                            Path(old_image).unlink()
                            logger.info(f"Deleted old image: {old_image}")
                    except Exception as e:
                        logger.error(f"Failed to save image: {e}")
                        return Response(
                            {'message': f'Ошибка при сохранении изображения: {str(e)}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

            # Обновляем продукт
            product.name = name
            product.branch = branch
            product.subcategory = subcategory
            if image_path:
                product.image = image_path
            if is_pizza and prices:
                product.prices = prices
                product.price = None
            elif not is_pizza and price:
                product.price = float(price)
                product.prices = None
            product.save()

            logger.info(f"Product updated: {product.name}")
            return Response(
                {
                    'id': product.id,
                    'name': product.name,
                    'image': product.image.url if product.image else None,
                    'branch': {'id': branch.id, 'name': branch.name},
                    'subcategory': {'id': subcategory.id, 'name': subcategory.name, 'category': category.id},
                    'prices': product.prices if is_pizza else None,
                    'price': product.price if not is_pizza else None,
                },
                status=status.HTTP_200_OK
            )

        except Branch.DoesNotExist:
            logger.warning(f"Product update failed: Branch {branch_id} not found")
            return Response(
                {'message': 'Филиал не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Subcategory.DoesNotExist:
            logger.warning(f"Product update failed: Subcategory {subcategory_id} not found")
            return Response(
                {'message': 'Подкатегория не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Product update failed: {str(e)}")
            return Response(
                {'message': f'Ошибка сервера: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, id):
        try:
            product = Product.objects.get(id=id)
            if product.image and Path(product.image.path).exists():
                Path(product.image.path).unlink()
                logger.info(f"Deleted image for product {id}: {product.image.path}")
            product.delete()
            logger.info(f"Product deleted: {id}")
            return Response({'message': 'Продукт удален'}, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            logger.warning(f"Product deletion failed: Product with id {id} not found")
            return Response({'message': 'Продукт не найден'}, status=status.HTTP_404_NOT_FOUND)

class ProductsView(APIView):
    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Публичные эндпоинты
class PublicBranchesView(APIView):
    def get(self, request):
        branches = Branch.objects.all()
        serializer = BranchSerializer(branches, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PublicCategoriesView(APIView):
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PublicProductsView(APIView):
    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Представление для фронтенда
class AdminFrontendView(APIView):
    def get(self, request):
        return render(request, 'index.html')