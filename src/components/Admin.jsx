import React, { Component } from 'react';

export default class Admin extends Component {
    state = {
        users: [],
        promoCode: '',
        branches: [],
        categories: [],
        products: [],
        subcategories: [],
        branchName: '',
        branchCity: '',
        categoryName: '',
        categoryEmoji: '',
        subcategoryName: '',
        selectedCategory: '',
        selectedSubcategory: '',
        productName: '',
        productImage: null,
        prices: { small: '', medium: '', large: '' },
        price: '',
        selectedBranch: '',
        editingProduct: null,
        editingBranch: null,
        editingSubcategory: null,
        error: '',
        message: '',
        activeTab: 'users',
    };

    componentDidMount() {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            window.location.href = '/admin/login';
            return;
        }
        this.fetchUsers();
        this.fetchBranches();
        this.fetchCategories();
        this.fetchSubcategories();
        this.fetchProducts();

        const editingProduct = localStorage.getItem('editingProduct');
        if (editingProduct) {
            const parsedProduct = JSON.parse(editingProduct);
            this.setState({
                editingProduct: parsedProduct,
                productName: parsedProduct.name,
                prices: parsedProduct.prices || { small: '', medium: '', large: '' },
                price: parsedProduct.price || '',
                selectedBranch: parsedProduct.branch.id,
                selectedCategory: parsedProduct.subcategory.category,
                selectedSubcategory: parsedProduct.subcategory.id,
                productImage: null,
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.editingProduct !== this.state.editingProduct) {
            if (this.state.editingProduct) {
                localStorage.setItem('editingProduct', JSON.stringify(this.state.editingProduct));
            } else {
                localStorage.removeItem('editingProduct');
            }
        }
    }

    fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/users', {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
            });
            const data = await response.json();
            if (response.ok) this.setState({ users: data });
            else this.setState({ error: data.message || 'Ошибка при загрузке пользователей' });
        } catch (err) {
            this.setState({ error: 'Ошибка сервера при загрузке пользователей' });
        }
    };

    fetchBranches = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/branches', {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
            });
            const data = await response.json();
            if (response.ok) this.setState({ branches: data });
            else this.setState({ error: data.message || 'Ошибка при загрузке филиалов' });
        } catch (err) {
            this.setState({ error: 'Ошибка сервера при загрузке филиалов' });
        }
    };

    fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/categories', {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
            });
            const data = await response.json();
            if (response.ok) this.setState({ categories: data });
            else this.setState({ error: data.message || 'Ошибка при загрузке категорий' });
        } catch (err) {
            this.setState({ error: 'Ошибка сервера при загрузке категорий' });
        }
    };

    fetchSubcategories = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/subcategories', {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
            });
            const data = await response.json();
            if (response.ok) this.setState({ subcategories: data });
            else this.setState({ error: data.message || 'Ошибка при загрузке подкатегорий' });
        } catch (err) {
            this.setState({ error: 'Ошибка сервера при загрузке подкатегорий' });
        }
    };

    fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/products');
            const data = await response.json();
            if (response.ok) this.setState({ products: data });
            else this.setState({ error: data.message || 'Ошибка при загрузке продуктов' });
        } catch (err) {
            this.setState({ error: 'Ошибка сервера при загрузке продуктов' });
        }
    };

    handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name in this.state.prices) {
            this.setState({ prices: { ...this.state.prices, [name]: value }, error: '', message: '' });
        } else if (name === 'price') {
            this.setState({ price: value, error: '', message: '' });
        } else if (name === 'selectedCategory') {
            this.setState({ selectedCategory: value, selectedSubcategory: '', error: '', message: '' });
        } else {
            this.setState({ [name]: value, error: '', message: '' });
        }
    };

    handleFileChange = (e) => {
        const file = e.target.files[0];
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (file && !allowedTypes.includes(file.type)) {
            this.setState({ error: 'Только PNG, JPG, JPEG и WebP форматы поддерживаются' });
            return;
        }
        this.setState({ productImage: file });
    };

    sendPromoCode = async (e, username) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/users/promo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                },
                body: JSON.stringify({ promoCode: this.state.promoCode, username }),
            });
            const data = await response.json();
            if (response.ok) this.setState({ message: data.message, promoCode: '' });
            else this.setState({ error: data.message || 'Ошибка при отправке промокода' });
        } catch (err) {
            this.setState({ error: 'Ошибка сервера при отправке промокода' });
        }
    };

    deleteUser = async (id) => {
        try {
            const response = await fetch(`http://localhost:8000/api/users/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
            });
            const data = await response.json();
            if (response.ok) {
                this.setState({
                    users: this.state.users.filter((user) => user.id !== id),
                    message: data.message,
                });
            } else {
                this.setState({ error: data.message || 'Ошибка при удалении пользователя' });
            }
        } catch (err) {
            this.setState({ error: 'Ошибка сервера при удалении пользователя' });
        }
    };

    addBranch = async (e) => {
        e.preventDefault();
        const { branchName, branchCity, editingBranch } = this.state;
        if (!branchName || !branchCity) {
            this.setState({ error: 'Пожалуйста, укажите название и город филиала' });
            return;
        }

        const url = editingBranch
            ? `http://localhost:8000/api/admin/branch/${editingBranch.id}`
            : 'http://localhost:8000/api/admin/branch';
        const method = editingBranch ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                },
                body: JSON.stringify({ name: branchName, city: branchCity }),
            });
            const data = await response.json();
            if (response.ok) {
                if (editingBranch) {
                    const updatedBranches = this.state.branches.map((b) => (b.id === data.id ? data : b));
                    this.setState({ branches: updatedBranches, editingBranch: null });
                } else {
                    this.setState({ branches: [...this.state.branches, data] });
                }
                this.setState({
                    branchName: '',
                    branchCity: '',
                    message: editingBranch ? 'Филиал обновлен' : 'Филиал добавлен',
                });
            } else {
                this.setState({ error: data.message || 'Ошибка при добавлении филиала' });
            }
        } catch (err) {
            this.setState({ error: 'Ошибка сервера при добавлении филиала' });
        }
    };

    editBranch = (branch) => {
        this.setState({
            editingBranch: branch,
            branchName: branch.name,
            branchCity: branch.city,
            activeTab: 'branch',
        });
    };

    deleteBranch = async (id) => {
        try {
            const response = await fetch(`http://localhost:8000/api/admin/branch/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
            });
            if (response.ok) {
                this.setState({
                    branches: this.state.branches.filter((b) => b.id !== id),
                    message: 'Филиал удален',
                });
            } else {
                const data = await response.json();
                this.setState({ error: data.message || 'Ошибка при удалении филиала' });
            }
        } catch (err) {
            this.setState({ error: 'Ошибка сервера при удалении филиала' });
        }
    };

    addCategory = async (e) => {
        e.preventDefault();
        const { categoryName, categoryEmoji } = this.state;
        if (!categoryName || !categoryEmoji) {
            this.setState({ error: 'Пожалуйста, укажите название и эмодзи категории' });
            return;
        }
        try {
            const response = await fetch('http://localhost:8000/api/admin/category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                },
                body: JSON.stringify({ name: categoryName, emoji: categoryEmoji }),
            });
            const data = await response.json();
            if (response.ok) {
                this.setState({
                    categories: [...this.state.categories, data],
                    categoryName: '',
                    categoryEmoji: '',
                    message: 'Категория добавлена',
                });
            } else {
                this.setState({ error: data.message || 'Ошибка при добавлении категории' });
            }
        } catch (err) {
            this.setState({ error: 'Ошибка сервера при добавлении категории' });
        }
    };

    addSubcategory = async (e) => {
        e.preventDefault();
        const { subcategoryName, selectedCategory, editingSubcategory } = this.state;
        if (!selectedCategory) {
            this.setState({ error: 'Пожалуйста, выберите категорию' });
            return;
        }
        if (!subcategoryName) {
            this.setState({ error: 'Пожалуйста, укажите название подкатегории' });
            return;
        }
        const token = localStorage.getItem('adminToken');
        if (!token) {
            this.setState({ error: 'Токен авторизации отсутствует. Пожалуйста, войдите снова.' });
            return;
        }
        const url = editingSubcategory
            ? `http://localhost:8000/api/admin/subcategory/${editingSubcategory.id}`
            : 'http://localhost:8000/api/admin/subcategory';
        const method = editingSubcategory ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: subcategoryName, category: parseInt(selectedCategory) }),
            });
            const data = await response.json();
            if (response.ok) {
                if (editingSubcategory) {
                    const updatedSubcategories = this.state.subcategories.map((sub) =>
                        sub.id === data.id ? data : sub
                    );
                    this.setState({
                        subcategories: updatedSubcategories,
                        editingSubcategory: null,
                        subcategoryName: '',
                        selectedCategory: '',
                        message: 'Подкатегория обновлена',
                    });
                } else {
                    this.setState({
                        subcategories: [...this.state.subcategories, data],
                        subcategoryName: '',
                        selectedCategory: '',
                        message: 'Подкатегория добавлена',
                    });
                }
                this.fetchSubcategories();
            } else {
                this.setState({ error: data.message || 'Ошибка при добавлении подкатегории' });
            }
        } catch (err) {
            this.setState({ error: 'Ошибка сервера при добавлении подкатегории' });
        }
    };

    editSubcategory = (subcategory) => {
        this.setState({
            editingSubcategory: subcategory,
            subcategoryName: subcategory.name,
            selectedCategory: subcategory.category,
            activeTab: 'subcategory',
        });
    };

    deleteSubcategory = async (id) => {
        try {
            const response = await fetch(`http://localhost:8000/api/admin/subcategory/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
            });
            if (response.ok) {
                this.setState({
                    subcategories: this.state.subcategories.filter((sub) => sub.id !== id),
                    message: 'Подкатегория удалена',
                });
            } else {
                const data = await response.json();
                this.setState({ error: data.message || 'Ошибка при удалении подкатегории' });
            }
        } catch (err) {
            this.setState({ error: 'Ошибка сервера при удалении подкатегории' });
        }
    };

    addProduct = async (e) => {
        e.preventDefault();
        const { productName, productImage, prices, price, selectedBranch, selectedSubcategory, editingProduct } = this.state;

        if (!selectedBranch) {
            this.setState({ error: 'Пожалуйста, выберите филиал' });
            return;
        }
        if (!selectedSubcategory) {
            this.setState({ error: 'Пожалуйста, выберите подкатегорию' });
            return;
        }

        const isPizza = this.isPizza(selectedSubcategory);
        if (isPizza) {
            if (!prices.small || !prices.medium || !prices.large || Number(prices.small) <= 0 || Number(prices.medium) <= 0 || Number(prices.large) <= 0) {
                this.setState({ error: 'Пожалуйста, заполните все цены для пиццы (должны быть больше 0)' });
                return;
            }
        } else {
            if (!price || isNaN(price) || Number(price) <= 0) {
                this.setState({ error: 'Пожалуйста, укажите корректную цену для товара (должна быть больше 0)' });
                return;
            }
        }

        const formData = new FormData();
        formData.append('name', productName);
        if (productImage) formData.append('image', productImage);
        formData.append('branch', selectedBranch);
        formData.append('subcategory', selectedSubcategory);

        if (isPizza) {
            formData.append('prices', JSON.stringify(prices));
        } else {
            formData.append('price', price);
        }

        const url = editingProduct
            ? `http://localhost:8000/api/admin/product/${editingProduct.id}`
            : 'http://localhost:8000/api/admin/product';
        const method = editingProduct ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                if (editingProduct) {
                    const updatedProducts = this.state.products.map((p) => (p.id === data.id ? data : p));
                    this.setState({ products: updatedProducts, editingProduct: null });
                } else {
                    this.setState({ products: [...this.state.products, data] });
                }
                this.setState({
                    productName: '',
                    productImage: null,
                    prices: { small: '', medium: '', large: '' },
                    price: '',
                    selectedBranch: '',
                    selectedCategory: '',
                    selectedSubcategory: '',
                    message: editingProduct ? 'Продукт обновлен' : 'Продукт добавлен',
                });
                document.querySelector('input[type="file"]').value = '';
                localStorage.removeItem('editingProduct');
            } else {
                this.setState({ error: data.message || 'Ошибка при добавлении продукта' });
            }
        } catch (err) {
            this.setState({ error: 'Ошибка сервера при добавлении продукта' });
        }
    };

    editProduct = (product) => {
        this.setState({
            editingProduct: product,
            productName: product.name,
            prices: product.prices || { small: '', medium: '', large: '' },
            price: product.price || '',
            selectedBranch: product.branch.id,
            selectedCategory: product.subcategory.category,
            selectedSubcategory: product.subcategory.id,
            productImage: null,
        });
    };

    deleteProduct = async (id) => {
        try {
            const response = await fetch(`http://localhost:8000/api/admin/product/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                this.setState({
                    products: this.state.products.filter((p) => p.id !== id),
                    message: 'Продукт удален',
                });
            } else {
                const data = await response.json();
                this.setState({ error: data.message || 'Ошибка при удалении продукта' });
            }
        } catch (err) {
            this.setState({ error: 'Ошибка сервера при удалении продукта' });
        }
    };

    isPizza = (subcategoryId) => {
        const { subcategories } = this.state;
        const subcategory = subcategories.find((sub) => sub.id === subcategoryId);
        if (!subcategory) return false;
        const category = this.state.categories.find((cat) => cat.id === subcategory.category);
        return category && category.name.toLowerCase() === 'пицца';
    };

    formatNumber = (number) => {
        if (!number || Number(number) <= 0) return 'Не указана';
        return Number(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    setActiveTab = (tab) => {
        this.setState({ activeTab: tab, editingBranch: null, branchName: '', branchCity: '', editingSubcategory: null, subcategoryName: '', selectedCategory: '' });
    };

    logout = () => {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
    };

    render() {
        const {
            users,
            promoCode,
            branchName,
            branchCity,
            categoryName,
            categoryEmoji,
            subcategoryName,
            selectedCategory,
            selectedSubcategory,
            productName,
            productImage,
            prices,
            price,
            selectedBranch,
            branches,
            categories,
            subcategories,
            products,
            editingProduct,
            editingBranch,
            editingSubcategory,
            error,
            message,
            activeTab,
        } = this.state;

        const isPizza = selectedSubcategory ? this.isPizza(selectedSubcategory) : false;
        const filteredSubcategories = selectedCategory
            ? subcategories.filter((sub) => sub.category === parseInt(selectedCategory))
            : [];

        return (
            <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-orange-600">
                            Панель управления
                        </h1>
                        <button
                            onClick={this.logout}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md"
                        >
                            Выйти
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-600 text-white p-4 rounded-lg mb-6 shadow-lg animate-bounce text-center">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="bg-green-600 text-white p-4 rounded-lg mb-6 shadow-lg animate-bounce text-center">
                            {message}
                        </div>
                    )}

                    <div className="mb-10">
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex flex-wrap justify-center gap-3 mb-6 border-b border-gray-200">
                                <button
                                    onClick={() => this.setActiveTab('users')}
                                    className={`flex items-center px-4 py-2 rounded-t-lg font-semibold transition-all duration-300 ${
                                        activeTab === 'users'
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                    </svg>
                                    Пользователи
                                </button>
                                <button
                                    onClick={() => this.setActiveTab('branch')}
                                    className={`flex items-center px-4 py-2 rounded-t-lg font-semibold transition-all duration-300 ${
                                        activeTab === 'branch'
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a2 2 0 012-2h2a2 2 0 012 2v5m-4 0h4"></path>
                                    </svg>
                                    Добавить филиал
                                </button>
                                <button
                                    onClick={() => this.setActiveTab('manageBranches')}
                                    className={`flex items-center px-4 py-2 rounded-t-lg font-semibold transition-all duration-300 ${
                                        activeTab === 'manageBranches'
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12h.01M12 12h.01M9 12h.01M12 15h.01M12 9h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    Управление филиалами
                                </button>
                                <button
                                    onClick={() => this.setActiveTab('category')}
                                    className={`flex items-center px-4 py-2 rounded-t-lg font-semibold transition-all duration-300 ${
                                        activeTab === 'category'
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18m-9 5h9"></path>
                                    </svg>
                                    Добавить категорию
                                </button>
                                <button
                                    onClick={() => this.setActiveTab('subcategory')}
                                    className={`flex items-center px-4 py-2 rounded-t-lg font-semibold transition-all duration-300 ${
                                        activeTab === 'subcategory'
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                                    </svg>
                                    Добавить подкатегорию
                                </button>
                                <button
                                    onClick={() => this.setActiveTab('manageSubcategories')}
                                    className={`flex items-center px-4 py-2 rounded-t-lg font-semibold transition-all duration-300 ${
                                        activeTab === 'manageSubcategories'
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    Управление подкатегориями
                                </button>
                            </div>

                            {activeTab === 'users' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {users.map((user) => (
                                        <div
                                            key={user.id}
                                            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                        >
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">{user.name}</h3>
                                            <p className="text-gray-600 text-sm mb-1 text-center">
                                                <strong>Логин:</strong> {user.username}
                                            </p>
                                            <p className="text-gray-600 text-sm mb-1 text-center">
                                                <strong>Email:</strong> {user.email}
                                            </p>
                                            <p className="text-gray-600 text-sm mb-4 text-center">
                                                <strong>Телефон:</strong> {user.phone}
                                            </p>
                                            <form onSubmit={(e) => this.sendPromoCode(e, user.username)} className="space-y-4">
                                                <input
                                                    type="text"
                                                    name="promoCode"
                                                    value={promoCode}
                                                    onChange={this.handleInputChange}
                                                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                                                    placeholder="Промокод"
                                                />
                                                <button
                                                    type="submit"
                                                    className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-md"
                                                >
                                                    Отправить на email
                                                </button>
                                            </form>
                                            <button
                                                onClick={() => this.deleteUser(user.id)}
                                                className="w-full mt-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'branch' && (
                                <form onSubmit={this.addBranch} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Название филиала</label>
                                        <input
                                            type="text"
                                            name="branchName"
                                            value={branchName}
                                            onChange={this.handleInputChange}
                                            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                                            placeholder="Название филиала"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
                                        <input
                                            type="text"
                                            name="branchCity"
                                            value={branchCity}
                                            onChange={this.handleInputChange}
                                            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                                            placeholder="Город"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-md"
                                    >
                                        {editingBranch ? 'Сохранить изменения' : 'Добавить филиал'}
                                    </button>
                                </form>
                            )}

                            {activeTab === 'manageBranches' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {branches.map((branch) => (
                                        <div
                                            key={branch.id}
                                            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                        >
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">{branch.name}</h3>
                                            <p className="text-gray-600 text-sm mb-4 text-center">{branch.city}</p>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => this.editBranch(branch)}
                                                    className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-sm"
                                                >
                                                    Редактировать
                                                </button>
                                                <button
                                                    onClick={() => this.deleteBranch(branch.id)}
                                                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-sm"
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'category' && (
                                <form onSubmit={this.addCategory} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Эмодзи категории</label>
                                        <input
                                            type="text"
                                            name="categoryEmoji"
                                            value={categoryEmoji}
                                            onChange={this.handleInputChange}
                                            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                                            placeholder="Эмодзи категории (например, 🍕)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Название категории</label>
                                        <input
                                            type="text"
                                            name="categoryName"
                                            value={categoryName}
                                            onChange={this.handleInputChange}
                                            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                                            placeholder="Название категории"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-md"
                                    >
                                        Добавить категорию
                                    </button>
                                </form>
                            )}

                            {activeTab === 'subcategory' && (
                                <form onSubmit={this.addSubcategory} className="space-y-6 bg-orange-50 p-6 rounded-xl shadow-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-orange-700 mb-1">Категория</label>
                                        <select
                                            name="selectedCategory"
                                            value={selectedCategory}
                                            onChange={this.handleInputChange}
                                            className="w-full p-3 bg-white border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 text-gray-700"
                                        >
                                            <option value="">Выберите категорию</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.emoji ? `${cat.emoji} ${cat.name}` : cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-orange-700 mb-1">Название подкатегории</label>
                                        <input
                                            type="text"
                                            name="subcategoryName"
                                            value={subcategoryName}
                                            onChange={this.handleInputChange}
                                            className="w-full p-3 bg-white border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 text-gray-700"
                                            placeholder="Название подкатегории"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-md"
                                    >
                                        {editingSubcategory ? 'Сохранить изменения' : 'Добавить подкатегорию'}
                                    </button>
                                </form>
                            )}

                            {activeTab === 'manageSubcategories' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {subcategories.map((sub) => {
                                        const category = categories.find((cat) => cat.id === sub.category);
                                        return (
                                            <div
                                                key={sub.id}
                                                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                            >
                                                <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">{sub.name}</h3>
                                                <p className="text-gray-600 text-sm mb-4 text-center">
                                                    Категория: {category ? `${category.emoji} ${category.name}` : 'Не указана'}
                                                </p>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => this.editSubcategory(sub)}
                                                        className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-sm"
                                                    >
                                                        Редактировать
                                                    </button>
                                                    <button
                                                        onClick={() => this.deleteSubcategory(sub.id)}
                                                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-sm"
                                                    >
                                                        Удалить
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
                            {editingProduct ? 'Редактировать продукт' : 'Добавить продукт'}
                        </h2>
                        <div className="bg-white p-8 rounded-xl shadow-lg">
                            <form onSubmit={this.addProduct} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Название продукта</label>
                                    <input
                                        type="text"
                                        name="productName"
                                        value={productName}
                                        onChange={this.handleInputChange}
                                        className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                                        placeholder="Название продукта"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Изображение продукта</label>
                                    <input
                                        type="file"
                                        name="productImage"
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        onChange={this.handleFileChange}
                                        className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700 transition-all duration-300"
                                    />
                                    {productImage && <p className="text-sm text-gray-600 mt-2">Выбрано: {productImage.name}</p>}
                                    {editingProduct && editingProduct.image && !productImage && (
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-600">Текущее изображение:</p>
                                            <img
                                                src={`http://localhost:8000${editingProduct.image}`}
                                                alt="Текущее изображение"
                                                className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg mt-2 mx-auto"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Филиал</label>
                                    <select
                                        name="selectedBranch"
                                        value={selectedBranch}
                                        onChange={this.handleInputChange}
                                        className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                                    >
                                        <option value="">Выберите филиал</option>
                                        {branches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}, {branch.city}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                                    <select
                                        name="selectedCategory"
                                        value={selectedCategory}
                                        onChange={this.handleInputChange}
                                        className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                                    >
                                        <option value="">Выберите категорию</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.emoji ? `${cat.emoji} ${cat.name}` : cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {selectedCategory && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Подкатегория</label>
                                        <select
                                            name="selectedSubcategory"
                                            value={selectedSubcategory}
                                            onChange={this.handleInputChange}
                                            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                                        >
                                            <option value="">Выберите подкатегорию</option>
                                            {filteredSubcategories.map((sub) => (
                                                <option key={sub.id} value={sub.id}>
                                                    {sub.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {selectedSubcategory && isPizza ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Цена (Маленькая)</label>
                                            <input
                                                type="number"
                                                name="small"
                                                value={prices.small}
                                                onChange={this.handleInputChange}
                                                className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                                                placeholder="Цена (Маленькая, в сомах)"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Цена (Средняя)</label>
                                            <input
                                                type="number"
                                                name="medium"
                                                value={prices.medium}
                                                onChange={this.handleInputChange}
                                                className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                                                placeholder="Цена (Средняя, в сомах)"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Цена (Большая)</label>
                                            <input
                                                type="number"
                                                name="large"
                                                value={prices.large}
                                                onChange={this.handleInputChange}
                                                className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                                                placeholder="Цена (Большая, в сомах)"
                                            />
                                        </div>
                                    </div>
                                ) : selectedSubcategory ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Цена</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={price}
                                            onChange={this.handleInputChange}
                                            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                                            placeholder="Цена (в сомах)"
                                        />
                                    </div>
                                ) : null}
                                <button
                                    type="submit"
                                    className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-md"
                                >
                                    {editingProduct ? 'Сохранить изменения' : 'Добавить продукт'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Продукты</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="relative bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    {product.image ? (
                                        <img
                                            src={`http://localhost:8000${product.image}`}
                                            alt={product.name}
                                            className="w-full h-48 object-cover rounded-xl mb-4 transition-transform duration-300 hover:scale-105"
                                            onError={(e) => (e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found')}
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-gray-200 rounded-xl mb-4 flex items-center justify-center">
                                            <span className="text-gray-500">Нет изображения</span>
                                        </div>
                                    )}
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">{product.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4 text-center">
                                        {this.isPizza(product.subcategory.id) ? (
                                            <>
                                                Цена: {this.formatNumber(product.prices?.small)} сом (S) |{' '}
                                                {this.formatNumber(product.prices?.medium)} сом (M) |{' '}
                                                {this.formatNumber(product.prices?.large)} сом (L)
                                            </>
                                        ) : (
                                            <>Цена: {this.formatNumber(product.price)} сом</>
                                        )}
                                    </p>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => this.editProduct(product)}
                                            className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-sm"
                                        >
                                            Редактировать
                                        </button>
                                        <button
                                            onClick={() => this.deleteProduct(product.id)}
                                            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-sm"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}