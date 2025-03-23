// src/components/Header.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Импортируем хук для работы с контекстом
import logo from '../assets/logo.547d126e583b202d1e5f.png'; // Замените на ваш логотип

// Иконки (можно использовать библиотеку react-icons, но здесь я использую эмодзи для простоты)
const icons = {
  WhatsApp: '📱',
  Telegram: '✈️',
  Instagram: '📸',
  Позвонить: '📞',
  'Яндекс.Карты': '🗺️',
  'Google Maps': '🌍',
  '2ГИС': '📍',
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth(); // Получаем данные пользователя и функцию logout
  const navigate = useNavigate();

  const handleLoginClick = () => {
    setIsMenuOpen(false);
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* Backdrop for blur effect */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md transition-opacity duration-700 z-5 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      <header className="bg-white shadow-md fixed w-full z-20">
        <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-8 relative">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-boodai-orange rounded-full shadow-lg"></div>
              <img
                src={logo}
                alt="BOODAI PIZZA Logo"
                className="relative h-12 w-12 p-1 rounded-full"
              />
            </div>
            <h1 className="text-2xl font-bold text-boodai-orange">BOODAI PIZZA</h1>
          </div>

          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white bg-black rounded-full w-12 h-12 flex items-center justify-center md:bg-boodai-orange md:text-white focus:outline-none transition-transform duration-300 shadow-md hover:shadow-lg"
          >
            <span className={isMenuOpen ? 'rotate-90' : ''}>!</span>
          </button>
        </div>
      </header>

      {/* Dropdown Menu */}
      <nav
        className={`fixed top-0 left-0 w-64 md:w-full h-screen bg-boodai-orange md:bg-white p-6 md:p-12 transition-all duration-700 transform z-10 flex flex-col justify-center items-center ${
          isMenuOpen
            ? 'translate-x-0 opacity-100 scale-100'
            : '-translate-x-full md:-translate-y-full opacity-0 scale-95'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsMenuOpen(false)}
          className="absolute top-6 right-6 text-white md:text-boodai-orange text-4xl focus:outline-none group hover:bg-boodai-orange md:hover:bg-boodai-orange hover:bg-opacity-20 rounded-full p-2 transition-all duration-300"
        >
          <span className="transition-transform duration-500 group-hover:rotate-180 group-hover:text-white">
            ✕
          </span>
        </button>

        {/* Menu Items */}
        <div className="flex flex-col md:flex-row md:flex-wrap md:gap-8 space-y-6 md:space-y-0">
          {[
            { name: 'WhatsApp', href: 'https://wa.me/+9960998064064' },
            { name: 'Telegram', href: 'https://t.me/+9960998064064' },
            { name: 'Instagram', href: 'https://instagram.com' },
            { name: 'Позвонить', href: 'tel:+9960998064064' },
            { name: 'Яндекс.Карты', href: 'https://yandex.com/maps' },
            { name: 'Google Maps', href: 'https://google.com/maps' },
            { name: '2ГИС', href: 'https://2gis.com' },
          ].map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`block text-white md:text-white py-4 md:py-5 px-6 md:px-8 text-xl md:text-2xl rounded-xl bg-white bg-opacity-20 md:bg-boodai-orange hover:bg-opacity-30 md:hover:bg-orange-600 transition-all duration-500 transform hover:scale-105 hover:shadow-xl group animate-fade-in-up delay-${
                index * 100
              }`}
            >
              <span className="flex items-center space-x-3">
                <span className="text-2xl group-hover:animate-pulse">{icons[item.name]}</span>
                <span>{item.name}</span>
              </span>
            </a>
          ))}
        </div>

        {/* Отображение имени пользователя или кнопки входа/выхода */}
        <div className="mt-8 flex flex-col items-center space-y-4">
          {user ? (
            <>
              <p className="text-white md:text-boodai-orange text-xl font-semibold">
                Привет, {user.name}!
              </p>
              <button
                onClick={handleLogout}
                className="relative bg-gradient-to-r from-white to-gray-100 text-boodai-orange px-8 py-4 rounded-2xl overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-500"
              >
                <span className="relative z-10 text-xl font-semibold">Выход</span>
                <span className="absolute inset-0 bg-gradient-to-r from-boodai-orange to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="absolute w-3 h-3 bg-white rounded-full top-2 left-2 animate-ping"></span>
                  <span className="absolute w-3 h-3 bg-white rounded-full top-4 right-2 animate-ping delay-100"></span>
                  <span className="absolute w-3 h-3 bg-white rounded-full bottom-2 left-4 animate-ping delay-200"></span>
                  <span className="absolute w-3 h-3 bg-white rounded-full bottom-4 right-4 animate-ping delay-300"></span>
                </span>
              </button>
            </>
          ) : (
            <button
              onClick={handleLoginClick}
              className="relative bg-gradient-to-r from-white to-gray-100 text-boodai-orange px-8 py-4 rounded-2xl overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-500"
            >
              <span className="relative z-10 text-xl font-semibold">Вход</span>
              <span className="absolute inset-0 bg-gradient-to-r from-boodai-orange to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="absolute w-3 h-3 bg-white rounded-full top-2 left-2 animate-ping"></span>
                <span className="absolute w-3 h-3 bg-white rounded-full top-4 right-2 animate-ping delay-100"></span>
                <span className="absolute w-3 h-3 bg-white rounded-full bottom-2 left-4 animate-ping delay-200"></span>
                <span className="absolute w-3 h-3 bg-white rounded-full bottom-4 right-4 animate-ping delay-300"></span>
              </span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
};

export default Header;