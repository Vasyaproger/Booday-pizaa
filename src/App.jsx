// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import Slider from './components/Slider';
import LoginAdmin from './components/loginAdmin';
import Product from './components/product';
import Admin from './components/Admin';
import Checkout from './components/Checkout';
import Login from './components/Login'; // Импортируем новый компонент
import { AuthProvider } from './components/context/AuthContext'; // Импортируем AuthProvider

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-100">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route exact path="/" element={<><Slider /><Product /></>} />
              <Route path="/login" element={<Login />} /> {/* Новый маршрут */}
              <Route path="/admin/login" element={<LoginAdmin />} />
              <Route path="/admin/dashboard" element={<Admin />} />
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;