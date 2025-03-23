import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';

// Классовый компонент Checkout
class CheckoutClass extends Component {
  state = {
    cart: [],
    deliveryMethod: null, // 'pickup' или 'delivery'
    orderConfirmed: false,
    name: '', // Имя пользователя
    phone: '', // Номер телефона
    address: '', // Адрес доставки (для метода 'delivery')
    nameError: '', // Ошибка для имени
    phoneError: '', // Ошибка для номера телефона
  };

  componentDidMount() {
    // Загружаем корзину из localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.setState({ cart: JSON.parse(savedCart) });
    }
  }

  getCartSummary = () => {
    const { cart } = this.state;
    const totalItems = cart.length;
    const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
    return { totalItems, totalPrice };
  };

  handleDeliveryMethod = (method) => {
    this.setState({ deliveryMethod: method });
  };

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });

    // Очищаем ошибки при изменении
    if (name === 'name') {
      this.setState({ nameError: '' });
    } else if (name === 'phone') {
      this.setState({ phoneError: '' });
    }
  };

  validateInputs = () => {
    const { name, phone, deliveryMethod } = this.state;
    let isValid = true;

    // Валидация имени
    if (!name.trim()) {
      this.setState({ nameError: 'Пожалуйста, введите ваше имя' });
      isValid = false;
    } else if (name.length < 2) {
      this.setState({ nameError: 'Имя должно содержать минимум 2 символа' });
      isValid = false;
    }

    // Валидация номера телефона
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phone.trim()) {
      this.setState({ phoneError: 'Пожалуйста, введите ваш номер телефона' });
      isValid = false;
    } else if (!phoneRegex.test(phone)) {
      this.setState({ phoneError: 'Введите корректный номер телефона (например, +996123456789)' });
      isValid = false;
    }

    // Проверка выбора способа доставки
    if (!deliveryMethod) {
      isValid = false;
      alert('Пожалуйста, выберите способ получения заказа');
    }

    return isValid;
  };

  confirmOrder = () => {
    if (this.validateInputs()) {
      this.setState({ orderConfirmed: true });
      // Сохраняем статус заказа в localStorage
      localStorage.setItem('orderPlaced', 'true');
      // Здесь можно добавить логику для отправки заказа на сервер
      const orderData = {
        cart: this.state.cart,
        deliveryMethod: this.state.deliveryMethod,
        name: this.state.name,
        phone: this.state.phone,
        address: this.state.address,
      };
      fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      }).catch((err) => console.error('Ошибка при отправке заказа:', err));
    }
  };

  continueShopping = () => {
    // Перенаправляем на главную страницу без очистки корзины
    this.props.navigate('/');
  };

  goBackToMenu = () => {
    // Очищаем корзину и возвращаемся на главную страницу
    this.setState({ cart: [], deliveryMethod: null, orderConfirmed: false, name: '', phone: '', address: '' });
    localStorage.removeItem('cart');
    localStorage.removeItem('orderPlaced');
    this.props.navigate('/');
  };

  render() {
    const { cart, deliveryMethod, orderConfirmed, name, phone, nameError, phoneError } = this.state;
    const { totalItems, totalPrice } = this.getCartSummary();

    if (cart.length === 0) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="text-center bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Ваша корзина пуста</h1>
            <button
              onClick={this.goBackToMenu}
              className="bg-orange-500 text-white py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors duration-300 font-semibold"
            >
              Вернуться к меню
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-[1250px] mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Оформление заказа
          </h1>

          {/* Список товаров в корзине */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ваш заказ</h2>
            {cart.map((item, index) => (
              <div
                key={index}
                className="flex items-center py-4 border-b border-gray-200 last:border-b-0"
              >
                <img
                  src={
                    item.image
                      ? `http://localhost:5000${item.image}`
                      : 'https://via.placeholder.com/80?text=Image+Not+Found'
                  }
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg mr-4"
                  onError={(e) =>
                    (e.target.src = 'https://via.placeholder.com/80?text=Image+Not+Found')
                  }
                />
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-800">
                    {item.name} ({item.size === 'single' ? 'Единый размер' : item.size})
                  </p>
                  <p className="text-sm text-gray-500">Цена: {item.price} сом</p>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <p className="text-xl font-semibold text-gray-800">Итого:</p>
              <p className="text-xl font-semibold text-gray-800">
                {totalItems} {totalItems === 1 ? 'товар' : 'товаров'} на {totalPrice} сом
              </p>
            </div>
          </div>

          {/* Выбор способа доставки и ввод данных */}
          {!orderConfirmed && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Выберите способ получения
              </h2>
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => this.handleDeliveryMethod('pickup')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    deliveryMethod === 'pickup'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-orange-500 hover:text-white'
                  }`}
                >
                  Забрать с собой
                </button>
                <button
                  onClick={() => this.handleDeliveryMethod('delivery')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    deliveryMethod === 'delivery'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-orange-500 hover:text-white'
                  }`}
                >
                  Доставка
                </button>
              </div>

              {/* Поля для ввода имени и номера телефона */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Ваше имя</label>
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={this.handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      nameError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                    }`}
                    placeholder="Введите ваше имя"
                  />
                  {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Номер телефона</label>
                  <input
                    type="text"
                    name="phone"
                    value={phone}
                    onChange={this.handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                    }`}
                    placeholder="+996123456789"
                  />
                  {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
                </div>

                {/* Поле для адреса (только при выборе доставки) */}
                {deliveryMethod === 'delivery' && (
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Адрес доставки</label>
                    <input
                      type="text"
                      name="address"
                      onChange={this.handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Введите адрес доставки"
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={this.confirmOrder}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors duration-300 font-semibold"
                >
                  Подтвердить заказ
                </button>
                <button
                  onClick={this.continueShopping}
                  className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg hover:bg-gray-400 transition-colors duration-300 font-semibold"
                >
                  Продолжить покупку
                </button>
              </div>
            </div>
          )}

          {/* Сообщение после подтверждения заказа */}
          {orderConfirmed && (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <h2 className="text-2xl font-semibold text-green-600 mb-4">
                Заказ успешно оформлен!
              </h2>
              <p className="text-lg text-gray-700 mb-2">
                С вами скоро свяжутся, ожидайте!
              </p>
              <p className="text-md text-gray-600 mb-6">
                Имя: {name} | Телефон: {phone}
              </p>
              <button
                onClick={this.goBackToMenu}
                className="bg-orange-500 text-white py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors duration-300 font-semibold"
              >
                Вернуться к меню
              </button>
            </div>
          )}
        </div>

        {/* Добавляем стили */}
        <style jsx>{`
          .min-h-screen {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          }

          .bg-white {
            background: #ffffff;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
          }

          .bg-white:hover {
            transform: translateY(-5px);
          }

          .text-gray-800 {
            color: #2d3748;
          }

          .text-orange-500 {
            color: #f97316;
          }

          .bg-orange-500 {
            background-color: #f97316;
          }

          .hover\:bg-orange-600:hover {
            background-color: #ea580c;
          }

          .border-gray-200 {
            border-color: #e2e8f0;
          }

          .rounded-lg {
            border-radius: 0.75rem;
          }

          .shadow-lg {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }

          .transition-colors {
            transition: background-color 0.3s ease, color 0.3s ease;
          }

          .font-semibold {
            font-weight: 600;
          }

          .text-lg {
            font-size: 1.125rem;
          }

          .text-xl {
            font-size: 1.25rem;
          }

          .text-2xl {
            font-size: 1.5rem;
          }

          .text-3xl {
            font-size: 1.875rem;
          }

          .text-4xl {
            font-size: 2.25rem;
          }

          .py-3 {
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
          }

          .px-4 {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .mb-4 {
            margin-bottom: 1rem;
          }

          .mb-6 {
            margin-bottom: 1.5rem;
          }

          .mb-8 {
            margin-bottom: 2rem;
          }

          .mt-4 {
            margin-top: 1rem;
          }

          .mt-6 {
            margin-top: 1.5rem;
          }

          .space-x-4 > * + * {
            margin-left: 1rem;
          }

          .space-y-4 > * + * {
            margin-top: 1rem;
          }

          .flex-1 {
            flex: 1 1 0%;
          }

          .w-full {
            width: 100%;
          }

          .text-center {
            text-align: center;
          }

          .justify-between {
            justify-content: space-between;
          }

          .items-center {
            align-items: center;
          }

          .flex {
            display: flex;
          }
        `}</style>
      </div>
    );
  }
}

// Функциональный компонент-обёртка для использования хука useNavigate
const Checkout = (props) => {
  const navigate = useNavigate();
  return <CheckoutClass {...props} navigate={navigate} />;
};

export default Checkout;