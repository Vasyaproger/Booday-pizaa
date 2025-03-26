from django.urls import path
from main.views import (
    RootView, AdminRegisterView, AdminLoginView, AdminUsersView, AdminPromoView,
    UserRegisterView, UserLoginView, UsersView,
    BranchView, BranchesView, CategoryView, CategoriesView,
    SubcategoryView, SubcategoryListView, ProductView, ProductsView,
    PublicBranchesView, PublicCategoriesView, PublicProductsView,
    AdminFrontendView
)

urlpatterns = [
    path('', RootView.as_view(), name='root'),
    path('api/admin/register', AdminRegisterView.as_view(), name='admin-register'),
    path('api/admin/login', AdminLoginView.as_view(), name='admin-login'),
    path('api/admin/users', AdminUsersView.as_view(), name='admin-users'),
    path('api/admin/promo', AdminPromoView.as_view(), name='admin-promo'),
    path('api/admin/branch', BranchView.as_view(), name='admin-branch'),
    path('api/admin/branches', BranchesView.as_view(), name='admin-branches'),
    path('api/admin/branch/<int:id>', BranchView.as_view(), name='admin-branch-detail'),
    path('api/admin/category', CategoryView.as_view(), name='admin-category'),
    path('api/admin/categories', CategoriesView.as_view(), name='admin-categories'),
    path('api/admin/category/<int:id>', CategoryView.as_view(), name='admin-category-detail'),
    path('api/admin/subcategory', SubcategoryView.as_view(), name='admin-subcategory'),
    path('api/admin/subcategories', SubcategoryListView.as_view(), name='admin-subcategories'),
    path('api/admin/subcategory/<int:id>', SubcategoryView.as_view(), name='admin-subcategory-detail'),
    path('api/admin/product', ProductView.as_view(), name='admin-product'),
    path('api/admin/products', ProductsView.as_view(), name='admin-products'),
    path('api/admin/product/<int:id>', ProductView.as_view(), name='admin-product-detail'),
    path('api/auth/register', UserRegisterView.as_view(), name='user-register'),
    path('api/auth/login', UserLoginView.as_view(), name='user-login'),
    path('api/users', UsersView.as_view(), name='users-list'),
    path('api/users/<int:id>', UsersView.as_view(), name='users-detail'),
    path('api/public/branches', PublicBranchesView.as_view(), name='public-branches'),
    path('api/public/categories', PublicCategoriesView.as_view(), name='public-categories'),
    path('api/public/products', PublicProductsView.as_view(), name='public-products'),
    path('admin/', AdminFrontendView.as_view(), name='admin-frontend'),
]