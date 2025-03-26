from django.contrib import admin
from django.urls import path
from main.views import (
    RootView,
    AdminRegisterView, AdminLoginView, AdminUsersView, AdminPromoView,
    UserRegisterView, UserLoginView, UsersView, UserPromoView,
    BranchView, BranchesView, CategoryView, CategoriesView, SubcategoryView, SubcategoryListView,  # Add SubcategoryListView
    ProductView, ProductsView, PublicBranchesView, PublicCategoriesView, PublicProductsView,
    AdminFrontendView  # Add AdminFrontendView for the frontend
)

urlpatterns = [
    # Django admin panel route
    path('admin/', admin.site.urls),

    # Root route
    path('', RootView.as_view(), name='root'),
    
    # Admin routes
    path('api/admin/register', AdminRegisterView.as_view(), name='admin-register'),
    path('api/admin/login', AdminLoginView.as_view(), name='admin-login'),
    path('api/admin/users', AdminUsersView.as_view(), name='admin-users'),
    path('api/admin/promo', AdminPromoView.as_view(), name='admin-promo'),
    path('api/admin/branch', BranchView.as_view(), name='branch-create'),
    path('api/admin/branch/<int:id>', BranchView.as_view(), name='branch-update-delete'),
    path('api/admin/branches', BranchesView.as_view(), name='branches'),
    path('api/admin/category', CategoryView.as_view(), name='category-create'),
    path('api/admin/category/<int:id>', CategoryView.as_view(), name='category-update-delete'),
    path('api/admin/categories', CategoriesView.as_view(), name='categories'),
    path('api/admin/subcategory', SubcategoryView.as_view(), name='subcategory-create'),
    path('api/admin/subcategory/<int:id>', SubcategoryView.as_view(), name='subcategory-detail'),
    path('api/admin/subcategories', SubcategoryListView.as_view(), name='subcategory-list'),  # Add this route
    path('api/admin/product', ProductView.as_view(), name='product-create'),
    path('api/admin/product/<int:id>', ProductView.as_view(), name='product-update-delete'),
    path('api/admin/products', ProductsView.as_view(), name='products'),
    
    # User routes
    path('api/auth/register', UserRegisterView.as_view(), name='user-register'),
    path('api/auth/login', UserLoginView.as_view(), name='user-login'),
    path('api/users', UsersView.as_view(), name='users'),
    path('api/users/<int:id>', UsersView.as_view(), name='user-delete'),
    path('api/users/promo', UserPromoView.as_view(), name='user-promo'),
    
    # Public routes
    path('api/public/branches', PublicBranchesView.as_view(), name='public-branches'),
    path('api/public/categories', PublicCategoriesView.as_view(), name='public-categories'),
    path('api/public/products', PublicProductsView.as_view(), name='public-products'),
    
    # Frontend route for admin panel
    path('admin/', AdminFrontendView.as_view(), name='admin-frontend'),
    path('admin/<path:path>', AdminFrontendView.as_view(), name='admin-frontend-path'),
]