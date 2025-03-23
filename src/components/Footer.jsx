// Footer.jsx
import React from 'react';
import logo from '../images/logo.png'; // Замените на путь к вашему логотипу

const Footer = () => {
  return (
    <footer className="bg-black text-white py-6 mt-auto">
      <div className="max-w-[1250px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col min-h-[200px] justify-between">
          {/* Верхняя часть: Логотип и Меню */}
          <div>
            {/* Логотип */}
            <div className="flex justify-center mb-6">
              <img 
                src={logo} 
                alt="Logo" 
                className="h-10 w-auto filter brightness-0 saturate-100 invert-[0%] sepia-[100%] hue-rotate-[15deg] contrast-100"
              />
            </div>

            {/* Меню */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center sm:text-left">
              {/* Навигация */}
              <div>
                <h3 className="text-base font-semibold text-boodai-orange mb-2">Навигация</h3>
                <ul className="space-y-1.5">
                  <li>
                    <a href="/" className="text-boodai-orange text-sm hover:text-orange-300 transition-colors duration-300">
                      Главная
                    </a>
                  </li>
                  <li>
                    <a href="/about" className="text-boodai-orange text-sm hover:text-orange-300 transition-colors duration-300">
                      О нас
                    </a>
                  </li>
                  <li>
                    <a href="/services" className="text-boodai-orange text-sm hover:text-orange-300 transition-colors duration-300">
                      Услуги
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className="text-boodai-orange text-sm hover:text-orange-300 transition-colors duration-300">
                      Контакты
                    </a>
                  </li>
                </ul>
              </div>

              {/* Ресурсы */}
              <div>
                <h3 className="text-base font-semibold text-boodai-orange mb-2">Ресурсы</h3>
                <ul className="space-y-1.5">
                  <li>
                    <a href="/blog" className="text-boodai-orange text-sm hover:text-orange-300 transition-colors duration-300">
                      Блог
                    </a>
                  </li>
                  <li>
                    <a href="/faq" className="text-boodai-orange text-sm hover:text-orange-300 transition-colors duration-300">
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a href="/support" className="text-boodai-orange text-sm hover:text-orange-300 transition-colors duration-300">
                      Поддержка
                    </a>
                  </li>
                </ul>
              </div>

              {/* Контакты и разработчик */}
              <div>
                <h3 className="text-base font-semibold text-boodai-orange mb-2">Связь</h3>
                <ul className="space-y-1.5">
                  <li className="text-boodai-orange text-sm">Email: info@example.com</li>
                  <li className="text-boodai-orange text-sm">Телефон: +7 (999) 123-45-67</li>
                  <li>
                    <a 
                      href="https://github.com/yourusername" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-boodai-orange text-sm hover:text-orange-300 transition-colors duration-300"
                    >
                      Разработчик: @yourusername
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Нижняя часть: Копирайт и разработчик */}
          <div className="mt-6 pt-4 border-t border-gray-800">
            <div className="flex flex-col items-center space-y-2">
              <p className="text-gray-400 text-xs sm:text-sm text-center">
                © {new Date().getFullYear()} Ваш бренд. Все права защищены.
              </p>
              <p className="text-gray-500 text-xs sm:text-sm text-center">
                Designed & Developed by{' '}
                <a 
                  href="https://github.com/yourusername" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-boodai-orange hover:text-orange-300 hover:underline transition-colors duration-300"
                >
                  Your Name
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;