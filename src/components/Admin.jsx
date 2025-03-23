import React, { Component } from 'react';

export default class Admin extends Component {
  state = {
    users: [],
    promoCode: '',
    branches: [],
    categories: [],
    products: [],
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
    error: '',
    message: '',
    activeTab: 'users', // Изменили с 'admins' на 'users'
  };

  componentDidMount() {
    this.fetchUsers();
    this.fetchBranches();
    this.fetchCategories();
    this.fetchProducts();

    const editingProduct = localStorage.getItem('editingProduct');
    if (editingProduct) {
      const parsedProduct = JSON.parse(editingProduct);
      this.setState({
        editingProduct: parsedProduct,
        productName: parsedProduct.name,
        prices: parsedProduct.prices || { small: '', medium: '', large: '' },
        price: parsedProduct.price || '',
        selectedBranch: parsedProduct.branch._id,
        selectedCategory: parsedProduct.subcategory.category,
        selectedSubcategory: parsedProduct.subcategory._id,
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
      const response = await fetch('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      const data = await response.json();
      if (response.ok) this.setState({ users: data });
      else this.setState({ error: data.message });
    } catch (err) {
      this.setState({ error: 'Ошибка сервера' });
    }
  };

  fetchBranches = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/branches', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      const data = await response.json();
      if (response.ok) this.setState({ branches: data });
      else this.setState({ error: data.message });
    } catch (err) {
      this.setState({ error: 'Ошибка сервера' });
    }
  };

  fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/categories', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      const data = await response.json();
      if (response.ok) this.setState({ categories: data });
      else this.setState({ error: data.message });
    } catch (err) {
      this.setState({ error: 'Ошибка сервера' });
    }
  };

  fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/products', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      const data = await response.json();
      if (response.ok) this.setState({ products: data });
      else this.setState({ error: data.message });
    } catch (err) {
      this.setState({ error: 'Ошибка сервера' });
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
      const response = await fetch('http://localhost:5000/api/users/promo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ promoCode: this.state.promoCode, username }),
      });
      const data = await response.json();
      if (response.ok) this.setState({ message: data.message, promoCode: '' });
      else this.setState({ error: data.message });
    } catch (err) {
      this.setState({ error: 'Ошибка сервера' });
    }
  };

  deleteUser = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      const data = await response.json();
      if (response.ok) {
        this.setState({
          users: this.state.users.filter((user) => user._id !== id),
          message: data.message,
        });
      } else {
        this.setState({ error: data.message });
      }
    } catch (err) {
      this.setState({ error: 'Ошибка при удалении пользователя' });
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
      ? `http://localhost:5000/api/admin/branch/${editingBranch._id}`
      : 'http://localhost:5000/api/admin/branch';
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
          const updatedBranches = this.state.branches.map((b) => (b._id === data._id ? data : b));
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
        this.setState({ error: data.message });
      }
    } catch (err) {
      this.setState({ error: 'Ошибка сервера' });
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
      const response = await fetch(`http://localhost:5000/api/admin/branch/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      if (response.ok) {
        this.setState({
          branches: this.state.branches.filter((b) => b._id !== id),
          message: 'Филиал удален',
        });
      } else {
        const data = await response.json();
        this.setState({ error: data.message });
      }
    } catch (err) {
      this.setState({ error: 'Ошибка при удалении филиала' });
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
      const response = await fetch('http://localhost:5000/api/admin/category', {
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
        this.setState({ error: data.message });
      }
    } catch (err) {
      this.setState({ error: 'Ошибка сервера' });
    }
  };

  addSubcategory = async (e) => {
    e.preventDefault();
    const { subcategoryName, selectedCategory } = this.state;
    if (!selectedCategory) {
      this.setState({ error: 'Пожалуйста, выберите категорию' });
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/admin/subcategory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ name: subcategoryName, categoryId: selectedCategory }),
      });
      const data = await response.json();
      if (response.ok) {
        const updatedCategories = this.state.categories.map((cat) =>
          cat._id === selectedCategory ? { ...cat, subcategories: [...cat.subcategories, data] } : cat
        );
        this.setState({ categories: updatedCategories, subcategoryName: '', message: 'Подкатегория добавлена' });
      } else {
        this.setState({ error: data.message });
      }
    } catch (err) {
      this.setState({ error: 'Ошибка сервера' });
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
    formData.append('branchId', selectedBranch);
    formData.append('subcategoryId', selectedSubcategory);

    if (isPizza) {
      formData.append('prices', JSON.stringify(prices));
    } else {
      formData.append('price', price);
    }

    const url = editingProduct
      ? `http://localhost:5000/api/admin/product/${editingProduct._id}`
      : 'http://localhost:5000/api/admin/product';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        if (editingProduct) {
          const updatedProducts = this.state.products.map((p) => (p._id === data._id ? data : p));
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
        this.setState({ error: data.message });
      }
    } catch (err) {
      this.setState({ error: 'Ошибка при добавлении продукта' });
    }
  };

  editProduct = (product) => {
    this.setState({
      editingProduct: product,
      productName: product.name,
      prices: product.prices || { small: '', medium: '', large: '' },
      price: product.price || '',
      selectedBranch: product.branch._id,
      selectedCategory: product.subcategory.category,
      selectedSubcategory: product.subcategory._id,
      productImage: null,
    });
  };

  deleteProduct = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/product/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      if (response.ok) {
        this.setState({
          products: this.state.products.filter((p) => p._id !== id),
          message: 'Продукт удален',
        });
      } else {
        const data = await response.json();
        this.setState({ error: data.message });
      }
    } catch (err) {
      this.setState({ error: 'Ошибка при удалении продукта' });
    }
  };

  isPizza = (subcategoryId) => {
    const { categories } = this.state;
    const subcategory = categories
      .flatMap((cat) => cat.subcategories)
      .find((sub) => sub._id === subcategoryId);
    if (!subcategory) return false;
    const category = categories.find((cat) => cat._id === subcategory.category);
    return category && category.name.toLowerCase() === 'пицца';
  };

  formatNumber = (number) => {
    if (!number || Number(number) <= 0) return 'Не указана';
    return Number(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  setActiveTab = (tab) => {
    this.setState({ activeTab: tab, editingBranch: null, branchName: '', branchCity: '' });
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
      products,
      editingProduct,
      editingBranch,
      error,
      message,
      activeTab,
    } = this.state;

    const isPizza = selectedSubcategory ? this.isPizza(selectedSubcategory) : false;
    const filteredSubcategories = selectedCategory
      ? categories.find((cat) => cat._id === selectedCategory)?.subcategories || []
      : [];

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500 animate-pulse">
            Панель управления
          </h1>

          {error && (
            <div className="bg-red-500 text-white p-4 rounded-xl mb-6 shadow-lg animate-bounce text-center">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-500 text-white p-4 rounded-xl mb-6 shadow-lg animate-bounce text-center">
              {message}
            </div>
          )}

          <div className="mb-10">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 border-b border-gray-200">
                <button
                  onClick={() => this.setActiveTab('users')}
                  className={`px-4 py-2 rounded-t-lg font-semibold transition-all duration-300 ${
                    activeTab === 'users'
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Пользователи
                </button>
                <button
                  onClick={() => this.setActiveTab('branch')}
                  className={`px-4 py-2 rounded-t-lg font-semibold transition-all duration-300 ${
                    activeTab === 'branch'
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Добавить филиал
                </button>
                <button
                  onClick={() => this.setActiveTab('manageBranches')}
                  className={`px-4 py-2 rounded-t-lg font-semibold transition-all duration-300 ${
                    activeTab === 'manageBranches'
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Управление филиалами
                </button>
                <button
                  onClick={() => this.setActiveTab('category')}
                  className={`px-4 py-2 rounded-t-lg font-semibold transition-all duration-300 ${
                    activeTab === 'category'
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Добавить категорию
                </button>
                <button
                  onClick={() => this.setActiveTab('subcategory')}
                  className={`px-4 py-2 rounded-t-lg font-semibold transition-all duration-300 ${
                    activeTab === 'subcategory'
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Добавить подкатегорию
                </button>
              </div>

              {activeTab === 'users' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="bg-gray-50 p-4 sm:p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">{user.name}</h3>
                      <p className="text-gray-600 text-sm sm:text-base mb-1 text-center">
                        <strong>Логин:</strong> {user.username}
                      </p>
                      <p className="text-gray-600 text-sm sm:text-base mb-1 text-center">
                        <strong>Email:</strong> {user.email}
                      </p>
                      <p className="text-gray-600 text-sm sm:text-base mb-4 text-center">
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
                          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-2 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-md"
                        >
                          Отправить на email
                        </button>
                      </form>
                      <button
                        onClick={() => this.deleteUser(user._id)}
                        className="w-full mt-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md"
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'branch' && (
                <form onSubmit={this.addBranch} className="space-y-4 sm:space-y-6">
                  <input
                    type="text"
                    name="branchName"
                    value={branchName}
                    onChange={this.handleInputChange}
                    className="w-full p-3 sm:p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                    placeholder="Название филиала"
                  />
                  <input
                    type="text"
                    name="branchCity"
                    value={branchCity}
                    onChange={this.handleInputChange}
                    className="w-full p-3 sm:p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                    placeholder="Город"
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-md"
                  >
                    {editingBranch ? 'Сохранить изменения' : 'Добавить филиал'}
                  </button>
                </form>
              )}

              {activeTab === 'manageBranches' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {branches.map((branch) => (
                    <div
                      key={branch._id}
                      className="bg-gray-50 p-4 sm:p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">{branch.name}</h3>
                      <p className="text-gray-600 text-sm sm:text-base mb-4 text-center">{branch.city}</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => this.editBranch(branch)}
                          className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-sm"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => this.deleteBranch(branch._id)}
                          className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-sm"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'category' && (
                <form onSubmit={this.addCategory} className="space-y-4 sm:space-y-6">
                  <input
                    type="text"
                    name="categoryEmoji"
                    value={categoryEmoji}
                    onChange={this.handleInputChange}
                    className="w-full p-3 sm:p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                    placeholder="Эмодзи категории (например, 🍕)"
                  />
                  <input
                    type="text"
                    name="categoryName"
                    value={categoryName}
                    onChange={this.handleInputChange}
                    className="w-full p-3 sm:p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                    placeholder="Название категории"
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-md"
                  >
                    Добавить категорию
                  </button>
                </form>
              )}

              {activeTab === 'subcategory' && (
                <form onSubmit={this.addSubcategory} className="space-y-4 sm:space-y-6">
                  <select
                    name="selectedCategory"
                    value={selectedCategory}
                    onChange={this.handleInputChange}
                    className="w-full p-3 sm:p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.emoji ? `${cat.emoji} ${cat.name}` : cat.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="subcategoryName"
                    value={subcategoryName}
                    onChange={this.handleInputChange}
                    className="w-full p-3 sm:p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                    placeholder="Название подкатегории"
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-md"
                  >
                    Добавить подкатегорию
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
              {editingProduct ? 'Редактировать продукт' : 'Добавить продукт'}
            </h2>
            <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg">
              <form onSubmit={this.addProduct} className="space-y-4 sm:space-y-6">
                <input
                  type="text"
                  name="productName"
                  value={productName}
                  onChange={this.handleInputChange}
                  className="w-full p-3 sm:p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                  placeholder="Название продукта"
                />
                <input
                  type="file"
                  name="productImage"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={this.handleFileChange}
                  className="w-full p-3 sm:p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600 transition-all duration-300"
                />
                {productImage && <p className="text-sm text-gray-600">Выбрано: {productImage.name}</p>}
                {editingProduct && editingProduct.image && !productImage && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Текущее изображение:</p>
                    <img
                      src={`http://localhost:5000${editingProduct.image}`}
                      alt="Текущее изображение"
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg mt-2 mx-auto"
                    />
                  </div>
                )}
                <select
                  name="selectedBranch"
                  value={selectedBranch}
                  onChange={this.handleInputChange}
                  className="w-full p-3 sm:p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                >
                  <option value="">Выберите филиал</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}, {branch.city}
                    </option>
                  ))}
                </select>
                <select
                  name="selectedCategory"
                  value={selectedCategory}
                  onChange={this.handleInputChange}
                  className="w-full p-3 sm:p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.emoji ? `${cat.emoji} ${cat.name}` : cat.name}
                    </option>
                  ))}
                </select>
                {selectedCategory && (
                  <select
                    name="selectedSubcategory"
                    value={selectedSubcategory}
                    onChange={this.handleInputChange}
                    className="w-full p-3 sm:p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                  >
                    <option value="">Выберите подкатегорию</option>
                    {filteredSubcategories.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                )}
                {selectedSubcategory && isPizza ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                      type="number"
                      name="small"
                      value={prices.small}
                      onChange={this.handleInputChange}
                      className="w-full p-3 sm:p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                      placeholder="Цена (Маленькая, в сомах)"
                    />
                    <input
                      type="number"
                      name="medium"
                      value={prices.medium}
                      onChange={this.handleInputChange}
                      className="w-full p-3 sm:p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                      placeholder="Цена (Средняя, в сомах)"
                    />
                    <input
                      type="number"
                      name="large"
                      value={prices.large}
                      onChange={this.handleInputChange}
                      className="w-full p-3 sm:p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                      placeholder="Цена (Большая, в сомах)"
                    />
                  </div>
                ) : selectedSubcategory ? (
                  <input
                    type="number"
                    name="price"
                    value={price}
                    onChange={this.handleInputChange}
                    className="w-full p-3 sm:p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                    placeholder="Цена (в сомах)"
                  />
                ) : null}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-md"
                >
                  {editingProduct ? 'Сохранить изменения' : 'Добавить продукт'}
                </button>
              </form>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Продукты</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="relative bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {product.image ? (
                    <img
                      src={`http://localhost:5000${product.image}`}
                      alt={product.name}
                      className="w-full h-40 sm:h-48 object-cover rounded-xl mb-4 transition-transform duration-300 hover:scale-105"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found')}
                    />
                  ) : (
                    <div className="w-full h-40 sm:h-48 bg-gray-200 rounded-xl mb-4 flex items-center justify-center">
                      <span className="text-gray-500">Нет изображения</span>
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">{product.name}</h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-4 text-center">
                    {this.isPizza(product.subcategory._id) ? (
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
                      className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-sm"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => this.deleteProduct(product._id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-sm"
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