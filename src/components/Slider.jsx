import { useState, useEffect } from 'react';
import slide1 from '../images/dostavka.df7ba24b6dc55888ffcf.jpg';
import slide2 from '../images/dostavka.df7ba24b6dc55888ffcf.jpg';
import slide3 from '../images/dostavka.df7ba24b6dc55888ffcf.jpg';

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [slide1, slide2, slide3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="pt-20">
      <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-2xl shadow-2xl">
        {/* Slides */}
        <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <img
              key={index}
              src={slide}
              alt={`Slide ${index + 1}`}
              className={`absolute top-0 left-0 w-full h-64 md:h-96 object-cover transition-all duration-1000 transform ${
                currentSlide === index
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-95'
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevSlide}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white bg-boodai-orange bg-opacity-70 hover:bg-opacity-100 p-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
            ←
          </span>
        </button>
        <button
          onClick={goToNextSlide}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white bg-boodai-orange bg-opacity-70 hover:bg-opacity-100 p-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
            →
          </span>
        </button>

        {/* Dots (Indicators) */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 transform hover:scale-125 ${
                currentSlide === index
                  ? 'bg-boodai-orange scale-125'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-80'
              }`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Slider;
