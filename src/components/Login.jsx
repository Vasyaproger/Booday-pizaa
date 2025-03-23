// src/components/Login.jsx
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'; // Для навигации в классовом компоненте
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Импортируем хук для работы с контекстом

class LoginClass extends Component {
  state = {
    isLoginMode: true, // true - вход, false - регистрация
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    emailError: '',
    phoneError: '',
    passwordError: '',
    confirmPasswordError: '',
    successMessage: '',
  };

  // Переключение между режимами входа и регистрации
  toggleMode = () => {
    this.setState((prevState) => ({
      isLoginMode: !prevState.isLoginMode,
      emailError: '',
      phoneError: '',
      passwordError: '',
      confirmPasswordError: '',
      successMessage: '',
    }));
  };

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value, [`${name}Error`]: '' });
  };

  validateInputs = () => {
    const { isLoginMode, email, phone, password, confirmPassword } = this.state;
    let isValid = true;

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      this.setState({ emailError: 'Пожалуйста, введите email' });
      isValid = false;
    } else if (!emailRegex.test(email)) {
      this.setState({ emailError: 'Введите корректный email' });
      isValid = false;
    }

    // Валидация номера телефона
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phone.trim()) {
      this.setState({ phoneError: 'Пожалуйста, введите номер телефона' });
      isValid = false;
    } else if (!phoneRegex.test(phone)) {
      this.setState({ phoneError: 'Введите корректный номер телефона (например, +996123456789)' });
      isValid = false;
    }

    // Валидация пароля
    if (!password.trim()) {
      this.setState({ passwordError: 'Пожалуйста, введите пароль' });
      isValid = false;
    } else if (password.length < 6) {
      this.setState({ passwordError: 'Пароль должен содержать минимум 6 символов' });
      isValid = false;
    }

    // Валидация подтверждения пароля (только для регистрации)
    if (!isLoginMode) {
      if (!confirmPassword.trim()) {
        this.setState({ confirmPasswordError: 'Пожалуйста, подтвердите пароль' });
        isValid = false;
      } else if (confirmPassword !== password) {
        this.setState({ confirmPasswordError: 'Пароли не совпадают' });
        isValid = false;
      }
    }

    return isValid;
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { isLoginMode, email, phone, password } = this.state;
    const { login } = this.props; // Получаем функцию login из контекста

    if (this.validateInputs()) {
      try {
        const url = isLoginMode
          ? 'http://localhost:5000/api/auth/login'
          : 'http://localhost:5000/api/auth/register';
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, phone, password }),
        });

        const data = await response.json();
        if (response.ok) {
          // Успешный вход или регистрация
          const userData = { email, name: data.name || email.split('@')[0] }; // Предполагаем, что сервер возвращает имя
          login(userData); // Сохраняем пользователя в контексте
          this.setState({ successMessage: isLoginMode ? 'Вход успешен!' : 'Регистрация успешна!' });
          setTimeout(() => {
            this.props.navigate('/'); // Перенаправляем на главную страницу
          }, 1500);
        } else {
          this.setState({ passwordError: data.message || 'Ошибка при входе/регистрации' });
        }
      } catch (err) {
        this.setState({ passwordError: 'Ошибка сервера. Попробуйте снова.' });
      }
    }
  };

  render() {
    const {
      isLoginMode,
      email,
      phone,
      password,
      confirmPassword,
      emailError,
      phoneError,
      passwordError,
      confirmPasswordError,
      successMessage,
    } = this.state;

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            {isLoginMode ? 'Вход' : 'Регистрация'}
          </h2>

          {successMessage && (
            <p className="text-green-600 text-center mb-4">{successMessage}</p>
          )}

          <form onSubmit={this.handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={this.handleInputChange}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                }`}
                placeholder="Введите ваш email"
              />
              {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
            </div>

            {/* Номер телефона */}
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

            {/* Пароль */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Пароль</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={this.handleInputChange}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  passwordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                }`}
                placeholder="Введите пароль"
              />
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            </div>

            {/* Подтверждение пароля (только для регистрации) */}
            {!isLoginMode && (
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Подтвердите пароль</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={this.handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    confirmPasswordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                  }`}
                  placeholder="Подтвердите пароль"
                />
                {confirmPasswordError && (
                  <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>
                )}
              </div>
            )}

            {/* Кнопка отправки */}
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors duration-300 font-semibold"
            >
              {isLoginMode ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>

          {/* Переключение между входом и регистрацией */}
          <p className="text-center mt-4">
            {isLoginMode ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
            <button
              onClick={this.toggleMode}
              className="text-orange-500 hover:underline font-medium"
            >
              {isLoginMode ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    );
  }
}

// Обёртка для использования хуков в классовом компоненте
const Login = (props) => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Получаем функцию login из контекста
  return <LoginClass {...props} navigate={navigate} login={login} />;
};

export default Login;