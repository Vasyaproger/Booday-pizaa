from django.apps import AppConfig
from django.db import connection
from django.db.utils import OperationalError
from django.db.models.signals import post_migrate
from django.dispatch import receiver
import bcrypt

def ensure_db_ready():
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("Database is ready for operations.")
        return True
    except OperationalError as e:
        print(f"Database is not ready: {e}")
        return False

def initialize_superuser():
    if not ensure_db_ready():
        print("Database is not ready, skipping superuser initialization.")
        return

    from django.contrib.auth.models import User
    try:
        superuser_count = User.objects.filter(is_superuser=True).count()
        print(f"Current superuser count: {superuser_count}")
        if superuser_count == 0:
            username = "admin"
            password = "admin123"
            email = "admin@example.com"
            User.objects.create_superuser(username=username, password=password, email=email)
            print(f"Created Superuser with credentials:\nUsername: {username}\nPassword: {password}\nEmail: {email}")
        else:
            print("Superuser already exists in the database.")
    except Exception as e:
        print(f"Error during superuser initialization: {e}")

def initialize_user():
    if not ensure_db_ready():
        print("Database is not ready, skipping user initialization.")
        return

    from .models import Customer
    try:
        user_count = Customer.objects.count()
        print(f"Current customer count: {user_count}")
        if user_count == 0:
            email = "user@example.com"
            phone = "+996123456789"
            password = "user123"
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            username = email.split('@')[0]
            user = Customer(
                username=username,
                password=hashed_password.decode('utf-8'),
                name=username,
                email=email,
                phone=phone
            )
            user.save()
            print(f"Created Customer with credentials:\nEmail: {email}\nPhone: {phone}\nPassword: {password}")
            user_count_after = Customer.objects.count()
            print(f"Customer count after creation: {user_count_after}")
            if user_count_after == 0:
                print("Error: Customer was not saved to the database!")
            else:
                print("Customer successfully saved to the database.")
        else:
            print("Customer already exists in the database.")
    except Exception as e:
        print(f"Error during customer initialization: {e}")

class MainConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'main'

    def ready(self):
        pass

@receiver(post_migrate, sender=MainConfig)
def initialize_data(sender, **kwargs):
    print("Starting initialization of superuser and customer after migrations...")
    initialize_superuser()
    initialize_user()
    print("Initialization completed.")