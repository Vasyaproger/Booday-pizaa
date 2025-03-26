from django.urls import path
from . import views

urlpatterns = [
    # Публичные маршруты
    path('public/branches/', views.PublicBranchList.as_view(), name='public-branch-list'),
    path('public/categories/', views.PublicCategoryList.as_view(), name='public-category-list'),
    path('public/products/', views.PublicProductList.as_view(), name='public-product-list'),

    # Админские маршруты
    path('admin/login/', views.AdminLoginView.as_view(), name='admin-login'),
    path('users/', views.UserList.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDelete.as_view(), name='user-delete'),
    path('admin/branches/', views.BranchListCreate.as_view(), name='branch-list-create'),
    path('admin/branch/<int:pk>/', views.BranchDetail.as_view(), name='branch-detail'),
    path('admin/categories/', views.CategoryListCreate.as_view(), name='category-list-create'),
    path('admin/subcategories/', views.SubcategoryListCreate.as_view(), name='subcategory-list-create'),
    path('admin/subcategory/<int:pk>/', views.SubcategoryDetail.as_view(), name='subcategory-detail'),
    path('admin/products/', views.ProductListCreate.as_view(), name='product-list-create'),
    path('admin/product/<int:pk>/', views.ProductDetail.as_view(), name='product-detail'),
    path('admin/promo/', views.PromoCodeView.as_view(), name='promo-code'),

    # Маршруты для заказов
    path('orders/', views.OrderCreate.as_view(), name='order-create'),

    # Маршруты для авторизации
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
]