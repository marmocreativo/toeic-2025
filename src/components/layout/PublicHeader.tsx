import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-blue-600">
            TOEIC 2025
          </Link>
          
          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600">
              Inicio
            </Link>
            <Link to="/examenes" className="text-gray-700 hover:text-blue-600">
              Exámenes
            </Link>
            <Link to="/centros" className="text-gray-700 hover:text-blue-600">
              Centros
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-2">
            <Link 
              to="/" 
              className="block py-2 text-gray-700 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link 
              to="/examenes" 
              className="block py-2 text-gray-700 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Exámenes
            </Link>
            <Link 
              to="/centros" 
              className="block py-2 text-gray-700 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Centros
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}