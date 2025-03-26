import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginAdmin = () => {
    const [state, setState] = useState({
        username: '',
        password: '',
        error: '',
        message: '',
        loading: false,
    });

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setState((prev) => ({ ...prev, [e.target.name]: e.target.value, error: '', message: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, password } = state;
        setState((prev) => ({ ...prev, loading: true, error: '', message: '' }));

        if (!username || !password) {
            setState((prev) => ({ ...prev, error: 'Пожалуйста, заполните все поля', loading: false }));
            return;
        }

        try {
            console.log('Sending login request:', { username, password });
            const response = await fetch('http://localhost:8000/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            console.log('Response from server:', data);

            if (response.ok) {
                // Успешный вход, перенаправляем на страницу админки
                setState((prev) => ({ ...prev, message: 'Вход успешен', loading: false }));
                // Сохраняем только индикатор успешного входа
                localStorage.setItem('isAdminLoggedIn', 'true');
                setTimeout(() => {
                    navigate('/admin/dashboard');
                }, 1000); // Задержка, чтобы пользователь увидел сообщение
            } else {
                setState((prev) => ({ ...prev, error: data.message || 'Ошибка входа', loading: false }));
            }
        } catch (err) {
            console.error('Error during login:', err);
            setState((prev) => ({ ...prev, error: 'Ошибка сервера. Попробуйте позже.', loading: false }));
        }
    };

    const { username, password, error, message, loading } = state;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-500 hover:shadow-3xl">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Вход для администратора</h2>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center animate-pulse">{error}</div>
                )}
                {message && (
                    <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-center animate-pulse">{message}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Логин</label>
                        <input
                            type="text"
                            name="username"
                            value={username}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
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
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                            placeholder="Введите пароль"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-300 ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
                        } shadow-md hover:shadow-lg`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Вход...
                            </div>
                        ) : (
                            'Войти'
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-500 mt-4 text-sm">
                    Забыли пароль?{' '}
                    <a href="#" className="text-orange-600 hover:underline">
                        Свяжитесь с поддержкой
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginAdmin;