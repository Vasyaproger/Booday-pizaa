import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';

// Классовый компонент Product
class ProductClass extends Component {
  state = {
    selectedBranch: null, // Выбранный филиал
    cart: [],
    branches: [], // Список филиалов с бэкенда
    categories: [], // Список категорий с бэкенда
    products: [], // Список продуктов с бэкенда
    selectedProduct: null,
    loading: false, // Состояние загрузки
    error: null, // Ошибка при загрузке данных
    activeCategory: null, // Для отслеживания активной категории
    orderPlaced: false, // Статус заказа
  };

  componentDidMount() {
    this.fetchBranches();
    this.fetchCategories();
    this.fetchProducts();
    window.addEventListener('scroll', this.handleScroll);

    // Загружаем корзину из localStorage, если она есть
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.setState({ cart: JSON.parse(savedCart) });
    }

    // Проверяем, был ли уже сделан заказ
    const orderPlaced = localStorage.getItem('orderPlaced') === 'true';
    this.setState({ orderPlaced });
  }

  componentDidUpdate(prevProps, prevState) {
    // Сохраняем корзину в localStorage при её изменении
    if (prevState.cart !== this.state.cart) {
      localStorage.setItem('cart', JSON.stringify(this.state.cart));
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  fetchBranches = async () => {
    try {
      this.setState({ loading: true, error: null });
      const response = await fetch('http://localhost:5000/api/public/branches');
      const data = await response.json();
      if (response.ok) {
        this.setState({ branches: data });
      } else {
        this.setState({ error: data.message });
      }
    } catch (err) {
      this.setState({ error: 'Ошибка при загрузке филиалов' });
    } finally {
      this.setState({ loading: false });
    }
  };

  fetchCategories = async () => {
    try {
      this.setState({ loading: true, error: null });
      const response = await fetch('http://localhost:5000/api/public/categories');
      const data = await response.json();
      if (response.ok) {
        this.setState({ categories: data });
      } else {
        this.setState({ error: data.message });
      }
    } catch (err) {
      this.setState({ error: 'Ошибка при загрузке категорий' });
    } finally {
      this.setState({ loading: false });
    }
  };

  fetchProducts = async () => {
    try {
      this.setState({ loading: true, error: null });
      const response = await fetch('http://localhost:5000/api/public/products');
      const data = await response.json();
      if (response.ok) {
        this.setState({ products: data });
      } else {
        this.setState({ error: data.message });
      }
    } catch (err) {
      this.setState({ error: 'Ошибка при загрузке продуктов' });
    } finally {
      this.setState({ loading: false });
    }
  };

  selectBranch = (branch) => {
    this.setState({ selectedBranch: branch });
  };

  openModal = (product) => {
    this.setState({ selectedProduct: product });
  };

  closeModal = () => {
    this.setState({ selectedProduct: null });
  };

  addToCart = (size) => {
    const { selectedProduct, cart } = this.state;
    const cartItem = {
      id: selectedProduct._id,
      name: selectedProduct.name,
      size: size,
      price: selectedProduct.prices[size] || selectedProduct.price,
      image: selectedProduct.image, // Добавляем изображение в корзину
    };
    this.setState({ cart: [...cart, cartItem], selectedProduct: null });
  };

  getCartSummary = () => {
    const { cart } = this.state;
    const totalItems = cart.length;
    const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
    return { totalItems, totalPrice };
  };

  scrollToCategory = (categoryId) => {
    this.setState({ activeCategory: categoryId });
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  handleScroll = () => {
    const { categories } = this.state;
    let currentCategory = null;

    for (const category of categories) {
      const element = document.getElementById(`category-${category._id}`);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          currentCategory = category._id;
          break;
        }
      }
    }

    if (currentCategory !== this.state.activeCategory) {
      this.setState({ activeCategory: currentCategory });
    }
  };

  // Переход на страницу оформления заказа
  goToCheckout = () => {
    this.props.navigate('/checkout');
  };

  render() {
    const {
      selectedBranch,
      selectedProduct,
      cart,
      branches,
      categories,
      products,
      loading,
      error,
      activeCategory,
      orderPlaced,
    } = this.state;
    const { totalItems, totalPrice } = this.getCartSummary();

    if (!selectedBranch) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Выберите филиал</h1>
            {loading && <p className="text-center text-gray-600">Загрузка...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {branches.map((branch) => (
                <button
                  key={branch._id}
                  onClick={() => this.selectBranch(branch)}
                  className="bg-white rounded-xl shadow-lg p-6 text-left hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-105"
                >
                  <h2 className="text-xl font-semibold">{branch.name}</h2>
                  <p className="text-gray-600 group-hover:text-white">{branch.city}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-100 py-8">
        {/* Информация о филиале */}
        <div className="text-center mb-6">
          <p className="text-gray-700">Филиал: {selectedBranch.name}, {selectedBranch.city}</p>
          {!orderPlaced && (
            <button
              onClick={() => this.setState({ selectedBranch: null })}
              className="text-orange-500 hover:underline text-sm"
            >
              Сменить филиал
            </button>
          )}
        </div>

        {/* Фиксированное меню категорий */}
        <div className="sticky top-0 bg-white shadow-lg z-20 py-4">
          <div className="max-w-[1250px] mx-auto px-4 flex justify-center space-x-6 overflow-x-auto">
            {categories.map((category) => {
              const categoryProducts = products.filter(
                (product) =>
                  product.subcategory.category.toString() === category._id &&
                  product.branch._id.toString() === selectedBranch._id
              );

              if (categoryProducts.length === 0) {
                return null;
              }

              return (
                <button
                  key={category._id}
                  onClick={() => this.scrollToCategory(category._id)}
                  className={`relative text-lg font-semibold transition-all duration-300 whitespace-nowrap px-4 py-2 rounded-full group ${
                    activeCategory === category._id
                      ? 'text-orange-500'
                      : 'text-gray-800 hover:text-orange-500'
                  }`}
                >
                  <span className="flex items-center">
                    {category.emoji && <span className="mr-2 text-xl">{category.emoji}</span>}
                    <span className="relative">
                      {category.name}
                      <span
                        className={`absolute bottom-0 left-0 h-1 bg-orange-500 rounded-full transition-all duration-300 ${
                          activeCategory === category._id ? 'w-full' : 'w-0 group-hover:w-full'
                        }`}
                      ></span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Секции категорий и товаров */}
        <div className="max-w-[1250px] mx-auto px-4 pt-8">
          {loading && <p className="text-center text-gray-600">Загрузка...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && categories.length === 0 && (
            <p className="text-center text-gray-600">Категории не найдены</p>
          )}
          {!loading &&
            !error &&
            categories.map((category) => {
              const categoryProducts = products.filter(
                (product) =>
                  product.subcategory.category.toString() === category._id &&
                  product.branch._id.toString() === selectedBranch._id
              );

              if (categoryProducts.length === 0) {
                return null;
              }

              return (
                <div key={category._id} id={`category-${category._id}`} className="mb-16">
                  <h2 className="text-4xl font-bold text-white mb-10 text-center relative animate-fadeIn">
                    <span
                      className="inline-block px-8 py-3 rounded-lg relative z-10"
                      style={{
                        background:
                          'linear-gradient(90deg, rgba(255, 147, 0, 0) 0%, rgba(255, 147, 0, 0.7) 5%, rgba(255, 147, 0, 1) 20%, rgba(255, 147, 0, 1) 80%, rgba(255, 147, 0, 0.7) 95%, rgba(255, 147, 0, 0) 100%)',
                        textShadow: '4px 4px 8px rgba(0, 0, 0, 0.5)',
                        letterSpacing: '2px',
                        fontFamily: "'Dancing Script', cursive",
                      }}
                    >
                      {category.name} {category.emoji || ''}
                    </span>
                    <span
                      className="absolute inset-0 z-0"
                      style={{
                        background:
                          'linear-gradient(90deg, rgba(255, 147, 0, 0) 0%, rgba(255, 147, 0, 0.5) 10%, rgba(255, 147, 0, 0.8) 50%, rgba(255, 147, 0, 0.5) 90%, rgba(255, 147, 0, 0) 100%)',
                        filter: 'blur(8px)',
                        transform: 'scale(1.15)',
                      }}
                    ></span>
                    <span
                      className="absolute inset-0 z-0"
                      style={{
                        background:
                          'linear-gradient(90deg, rgba(255, 147, 0, 0) 0%, rgba(255, 147, 0, 0.3) 15%, rgba(255, 147, 0, 0.6) 50%, rgba(255, 147, 0, 0.3) 85%, rgba(255, 147, 0, 0) 100%)',
                        filter: 'blur(12px)',
                        transform: 'scale(1.2)',
                      }}
                    ></span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {categoryProducts.map((product) => (
                      <div
                        key={product._id}
                        className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
                      >
                        <div className="relative">
                          <img
                            src={
                              product.image
                                ? `http://localhost:5000${product.image}`
                                : 'https://via.placeholder.com/150?text=Image+Not+Found'
                            }
                            alt={product.name}
                            className="w-full h-56 object-cover"
                            onError={(e) =>
                              (e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found')
                            }
                          />
                          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            Новинка
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                          <p className="text-gray-500 text-sm mt-1">
                            от {product.prices?.small || product.price || 'Не указана'} сом
                          </p>
                          <button
                            onClick={() => this.openModal(product)}
                            className="mt-4 w-full bg-orange-500 text-white py-2.5 rounded-lg hover:bg-orange-600 transition-colors duration-300 font-semibold"
                          >
                            Выбрать
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Модальное окно */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl transform transition-all duration-300 scale-100 hover:scale-105">
              <img
                src={
                  selectedProduct.image
                    ? `http://localhost:5000${selectedProduct.image}`
                    : 'https://via.placeholder.com/150?text=Image+Not+Found'
                }
                alt={selectedProduct.name}
                className="w-full h-40 object-cover rounded-t-xl mb-4"
                onError={(e) =>
                  (e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found')
                }
              />
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                {selectedProduct.name}
              </h2>
              <div className="space-y-3">
                {selectedProduct.prices &&
                Object.keys(selectedProduct.prices).some((size) => selectedProduct.prices[size]) ? (
                  ['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => this.addToCart(size)}
                      className="w-full bg-gray-100 p-3 rounded-lg hover:bg-orange-500 hover:text-white transition-all duration-300 flex justify-between items-center shadow-sm"
                      disabled={!selectedProduct.prices[size]}
                    >
                      <span className="capitalize">
                        {size === 'small' ? 'Маленькая' : size === 'medium' ? 'Средняя' : 'Большая'}
                      </span>
                      <span>
                        {selectedProduct.prices[size]
                          ? `${selectedProduct.prices[size]} сом`
                          : 'Недоступно'}
                      </span>
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() => this.addToCart('single')}
                    className="w-full bg-gray-100 p-3 rounded-lg hover:bg-orange-500 hover:text-white transition-all duration-300 flex justify-between items-center shadow-sm"
                  >
                    <span>Единая цена</span>
                    <span>
                      {selectedProduct.price ? `${selectedProduct.price} сом` : 'Не указана'}
                    </span>
                  </button>
                )}
              </div>
              <button
                onClick={this.closeModal}
                className="mt-4 w-full text-gray-500 hover:text-orange-500 transition-colors duration-300 font-medium"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}

        {/* Корзина */}
        {cart.length > 0 && (
          <button
            onClick={this.goToCheckout}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center space-x-6"
          >
            <div className="flex items-center">
              <span className="font-semibold text-lg">🛒 Заказов:</span>
              <span className="ml-2 text-lg">{totalItems}</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-lg">Сумма:</span>
              <span className="ml-2 text-lg">{totalPrice} сом</span>
            </div>
          </button>
        )}

        {/* Добавляем стили для анимации */}
        <style jsx>{`
          @keyframes fadeIn {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fadeIn {
            animation: fadeIn 0.8s ease-out forwards;
          }
        `}</style>
      </div>
    );
  }
}

// Функциональный компонент-обёртка для использования хука useNavigate
const Product = (props) => {
  const navigate = useNavigate();
  return <ProductClass {...props} navigate={navigate} />;
};

export default Product;