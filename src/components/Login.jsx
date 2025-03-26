import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

class LoginClass extends Component {
  state = {
    isLoginMode: true,
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    emailError: '',
    phoneError: '',
    passwordError: '',
    confirmPasswordError: '',
    successMessage: '',
    serverError: '', // Добавляем для отображения ошибок с сервера
  };

  toggleMode = () => {
    this.setState((prevState) => ({
      isLoginMode: !prevState.isLoginMode,
      emailError: '',
      phoneError: '',
      passwordError: '',
      confirmPasswordError: '',
      successMessage: '',
      serverError: '',
    }));
  };

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value, [`${name}Error`]: '', serverError: '' });
  };

  validateInputs = () => {
    const { isLoginMode, email, phone, password, confirmPassword } = this.state;
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      this.setState({ emailError: 'Пожалуйста, введите email' });
      isValid = false;
    } else if (!emailRegex.test(email)) {
      this.setState({ emailError: 'Введите корректный email' });
      isValid = false;
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phone.trim()) {
      this.setState({ phoneError: 'Пожалуйста, введите номер телефона' });
      isValid = false;
    } else if (!phoneRegex.test(phone)) {
      this.setState({ phoneError: 'Введите корректный номер телефона (например, +996123456789)' });
      isValid = false;
    }

    if (!password.trim()) {
      this.setState({ passwordError: 'Пожалуйста, введите пароль' });
      isValid = false;
    } else if (password.length < 6) {
      this.setState({ passwordError: 'Пароль должен содержать минимум 6 символов' });
      isValid = false;
    }

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
    const { login } = this.props;

    if (this.validateInputs()) {
      try {
        const payload = { email, phone, password };
        console.log('Sending data:', payload); // Отладка
        const url = isLoginMode
          ? 'http://localhost:8000/api/auth/login'
          : 'http://localhost:8000/api/auth/register';
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log('Response:', data); // Отладка
        if (response.ok) {
          const userData = { email, name: data.name || email.split('@')[0] };
          login(userData);
          this.setState({ successMessage: data.message || (isLoginMode ? 'Вход успешен!' : 'Регистрация успешна!'), serverError: '' });
          setTimeout(() => {
            this.props.navigate('/');
          }, 1500);
        } else {
          this.setState({ serverError: data.message || 'Ошибка при входе/регистрации' });
        }
      } catch (err) {
        console.error('Error:', err); // Отладка
        this.setState({ serverError: 'Ошибка сервера. Попробуйте снова.' });
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
      serverError,
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
          {serverError && (
            <p className="text-red-600 text-center mb-4">{serverError}</p>
          )}

          <form onSubmit={this.handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors duration-300 font-semibold"
            >
              {isLoginMode ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>

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

const Login = (props) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  return <LoginClass {...props} navigate={navigate} login={login} />;
};

export default Login;