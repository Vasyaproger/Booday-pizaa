from rest_framework.exceptions import AuthenticationFailed
from jose import jwt, JWTError
import os
import logging

logger = logging.getLogger(__name__)

class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Пути, которые не требуют авторизации
        excluded_paths = [
            '/api/admin/login',
            '/api/admin/register',
            '/api/auth/login',
            '/api/auth/register',
            '/api/public/branches',
            '/api/public/categories',
            '/api/public/products',
            '/api/',
        ]
        logger.info(f"Request path: {request.path}, Method: {request.method}")

        # Пропускаем проверку токена для исключенных путей
        if request.path in excluded_paths:
            logger.info(f"Skipping token check for {request.path}")
            return self.get_response(request)

        # Проверяем токен только для админских эндпоинтов
        if request.path.startswith('/api/admin/'):
            # Разрешаем GET-запросы к продуктам и отдельному продукту без токена
            if (request.path == '/api/admin/products' or request.path.startswith('/api/admin/product')) and request.method == 'GET':
                logger.info(f"Allowing GET request to {request.path} without token")
                return self.get_response(request)

            auth_header = request.headers.get('Authorization', '')
            logger.info(f"Authorization header: {auth_header}")

            if not auth_header or not auth_header.startswith('Bearer '):
                logger.warning(f"Token missing or invalid format for {request.path}")
                raise AuthenticationFailed('Токен отсутствует или неверный формат. Ожидается "Bearer <token>"')

            token = auth_header.split(' ')[1]
            logger.info(f"Extracted token: {token}")

            try:
                payload = jwt.decode(
                    token,
                    os.getenv('JWT_SECRET', 'your-secret-key'),
                    algorithms=['HS256'],
                    options={"verify_exp": False}  # Токен бессрочный
                )
                request.user_id = payload.get('id')
                request.is_admin = payload.get('is_admin', False)
                logger.info(f"Token decoded, user_id: {request.user_id}, is_admin: {request.is_admin}")

                # Проверяем, является ли пользователь админом, только для POST, PUT, DELETE
                if request.method in ['POST', 'PUT', 'DELETE'] and not request.is_admin:
                    logger.warning(f"Access denied for user {request.user_id}: Not an admin")
                    raise AuthenticationFailed('Доступ разрешен только администраторам')
            except JWTError as e:
                logger.error(f"JWT decode error for {request.path}: {e}")
                raise AuthenticationFailed(f'Неверный токен: {str(e)}')

        # Для остальных запросов токен не обязателен, но если он есть, декодируем его
        else:
            auth_header = request.headers.get('Authorization', '')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                try:
                    payload = jwt.decode(
                        token,
                        os.getenv('JWT_SECRET', 'your-secret-key'),
                        algorithms=['HS256'],
                        options={"verify_exp": False}
                    )
                    request.user_id = payload.get('id')
                    request.is_admin = payload.get('is_admin', False)
                    logger.info(f"Token decoded for non-admin path, user_id: {request.user_id}, is_admin: {request.is_admin}")
                except JWTError as e:
                    logger.error(f"JWT decode error for non-admin path {request.path}: {e}")
                    # Не прерываем запрос, просто игнорируем токен

        return self.get_response(request)