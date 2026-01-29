import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, Waves } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Navbar = () => {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/settings`);
        setSettings(response.data);
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const scrollToSection = (section) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: section } });
    } else {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="bamboo-navbar" data-testid="main-navbar">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 bamboo-logo" data-testid="nav-logo-link">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-20 w-auto" data-testid="nav-logo-image" />
            ) : (
              <span className="text-2xl font-bold text-primary" data-testid="nav-logo-text">tabatinga2surf</span>
            )}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/" data-testid="nav-home-link">
              <button className="bamboo-button">
                Início
              </button>
            </Link>
            
            <button 
              onClick={() => scrollToSection('info-menu')} 
              className="bamboo-button"
              data-testid="nav-condicoes-link"
            >
              <Waves className="h-4 w-4" />
              Condições
            </button>

            <Link to="/produtos" data-testid="nav-products-link">
              <button className="bamboo-button">
                Produtos
              </button>
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" data-testid="nav-dashboard-link">
                  <button className="bamboo-button">
                    Dashboard
                  </button>
                </Link>
                <button className="bamboo-button" onClick={handleLogout} data-testid="nav-logout-button">
                  Sair
                </button>
              </>
            ) : (
              <Link to="/login" data-testid="nav-login-link">
                <button className="bamboo-button-primary">
                  Login
                </button>
              </Link>
            )}

            <Link to="/carrinho" className="relative" data-testid="nav-cart-link">
              <button className="bamboo-button-cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold" data-testid="nav-cart-count">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button - APENAS em mobile */}
          <div className="flex md:hidden">
            <button
              className="bamboo-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="nav-mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Apenas em mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-2 bamboo-mobile-menu" data-testid="nav-mobile-menu">
            <Link to="/">
              <button className="bamboo-button w-full text-left">Início</button>
            </Link>
            <button onClick={() => { scrollToSection('info-menu'); setMobileMenuOpen(false); }} className="bamboo-button w-full text-left flex items-center gap-2">
              <Waves className="h-4 w-4" /> Condições do Mar
            </button>
            <Link to="/produtos">
              <button className="bamboo-button w-full text-left">Produtos</button>
            </Link>
            {user ? (
              <>
                <Link to="/dashboard">
                  <button className="bamboo-button w-full text-left">Dashboard</button>
                </Link>
                <button className="bamboo-button w-full text-left" onClick={handleLogout}>Sair</button>
              </>
            ) : (
              <Link to="/login">
                <button className="bamboo-button-primary w-full">Login</button>
              </Link>
            )}
            <Link to="/carrinho">
              <button className="bamboo-button w-full text-left">Carrinho ({cartItemCount})</button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
