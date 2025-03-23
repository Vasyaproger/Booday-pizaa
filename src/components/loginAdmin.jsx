import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate

const LoginAdmin = () => {
  const [state, setState] = useState({
    username: '',
    password: '',
    error: '',
    loading: false,
  });

  const navigate = useNavigate(); // Хук для навигации

  const handleInputChange = (e) => {
    setState((prev) => ({ ...prev, [e.target.name]: e.target.value, error: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = state;
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin/dashboard'); // Используем navigate для редиректа
      } else {
        setState((prev) => ({ ...prev, error: data.message || 'Ошибка входа' }));
      }
    } catch (err) {
      setState((prev) => ({ ...prev, error: 'Ошибка сервера. Попробуйте позже.' }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const { username, password, error, loading } = state;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:shadow-3xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Вход для администратора</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Логин</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-boodai-orange transition-all duration-300"
              placeholder="Введите логин"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Пароль</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-boodai-orange transition-all duration-300"
              placeholder="Введите пароль"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-300 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-boodai-orange hover:bg-orange-600'
            }`}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-4 text-sm">
          Забыли пароль?{' '}
          <a href="#" className="text-boodai-orange hover:underline">
            Свяжитесь с поддержкой
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginAdmin;