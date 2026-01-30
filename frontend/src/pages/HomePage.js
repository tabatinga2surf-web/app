import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sun, Wind, Droplets, Waves, ExternalLink, TrendingUp, TrendingDown, Compass, Thermometer, CloudRain, Sunrise, Sunset, Navigation, Instagram, Play, Camera } from "lucide-react";
import { toast } from "sonner";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [tides, setTides] = useState(null);
  const [waves, setWaves] = useState(null);
  const [news, setNews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);
  const location = useLocation();

  useEffect(() => {
    fetchProducts();
    fetchWeather();
    fetchTides();
    fetchWaves();
    fetchNews();
    fetchGallery();
  }, []);

  useEffect(() => {
    if (location.state?.scrollTo) {
      const section = location.state.scrollTo;
      setTimeout(() => {
        const element = document.getElementById(`${section}-section`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [location]);

  const fetchGallery = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/gallery`);
      setGallery(response.data);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    }
  };

  const fetchTides = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/tides`);
      setTides(response.data);
    } catch (error) {
      console.error("Error fetching tides:", error);
    }
  };

  const fetchWaves = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/waves`);
      setWaves(response.data);
    } catch (error) {
      console.error("Error fetching waves:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/products`);
      setProducts(response.data.slice(0, 4));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchWeather = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/weather`);
      setWeather(response.data);
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  const fetchNews = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/news`);
      setNews(response.data);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  // Get wave direction rotation for compass icon
  const getDirectionRotation = (direction) => {
    const directions = {
      'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
      'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
      'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
      'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
    };
    return directions[direction] || 0;
  };

  // Get surf rating color
  const getSurfRatingColor = (rating) => {
    if (rating === 'Excelente') return 'text-green-600 bg-green-100';
    if (rating === 'Bom') return 'text-blue-600 bg-blue-100';
    if (rating === 'Regular') return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="min-h-screen pt-20" data-testid="homepage">
      <Navbar />
      
      {/* Hero Image Estática */}
      <section data-testid="hero-section">
        <div className="relative h-[500px]">
          <img
            src="https://customer-assets.emergentagent.com/job_beachboard/artifacts/796a3nkz_IMG_20251201_140640607.jpg"
            alt="Praia de Tabatinga"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
          <div className="absolute bottom-0 left-0 right-0 p-12 text-center">
            <h1 className="text-5xl font-bold text-white mb-4">
              Bem-vindo ao Paraíso do bodyboard
            </h1>
            <p className="text-xl text-white/90">
              Tabatinga, Paraíba - O melhor lugar para surfar
            </p>
          </div>
        </div>
      </section>

      {/* Painel de Condições para Surf - Design Harmonioso */}
      <section className="max-w-7xl mx-auto px-4 py-8" id="info-menu" data-testid="surf-conditions-section">
        <h2 className="text-3xl font-bold text-center mb-2">Condições do Mar</h2>
        <p className="text-center text-muted-foreground mb-8">Tabatinga, Paraíba - Atualizado em tempo real</p>
        
        {/* Grid Principal com 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card Clima */}
          <Card className="glass-card border-2 border-amber-200 hover:shadow-xl transition-all hover:scale-[1.02] overflow-hidden" data-testid="clima-card">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Sun className="h-6 w-6" />
                  <h3 className="font-bold text-lg">Clima</h3>
                </div>
                {weather && (
                  <span className="text-3xl font-bold">{Math.round(weather.temp)}°C</span>
                )}
              </div>
            </div>
            <CardContent className="p-4">
              {weather ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center capitalize">{weather.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 bg-amber-50 p-2 rounded-lg">
                      <Thermometer className="h-4 w-4 text-amber-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Sensação</p>
                        <p className="font-semibold">{Math.round(weather.feels_like)}°C</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-50 p-2 rounded-lg">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Umidade</p>
                        <p className="font-semibold">{weather.humidity}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-50 p-2 rounded-lg">
                      <Wind className="h-4 w-4 text-teal-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Vento</p>
                        <p className="font-semibold">{weather.wind_speed} km/h {weather.wind_direction}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-50 p-2 rounded-lg">
                      <CloudRain className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="text-xs text-muted-foreground">Chuva</p>
                        <p className="font-semibold">{weather.rain_chance || 0}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span className="flex items-center gap-1"><Sunrise className="h-3 w-3" /> {weather.sunrise}</span>
                    <span className="flex items-center gap-1"><Sunset className="h-3 w-3" /> {weather.sunset}</span>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">Carregando...</p>
              )}
            </CardContent>
          </Card>

          {/* Card Ondas */}
          <Card className="glass-card border-2 border-cyan-200 hover:shadow-xl transition-all hover:scale-[1.02] overflow-hidden" data-testid="ondas-card">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Waves className="h-6 w-6" />
                  <h3 className="font-bold text-lg">Ondas</h3>
                </div>
                {waves && (
                  <span className="text-3xl font-bold">{waves.wave_height}m</span>
                )}
              </div>
            </div>
            <CardContent className="p-4">
              {waves ? (
                <div className="space-y-3">
                  <div className="text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getSurfRatingColor(waves.surf_rating)}`}>
                      {waves.surf_rating}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 bg-cyan-50 p-2 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-cyan-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Altura máx.</p>
                        <p className="font-semibold">{waves.wave_height_max}m</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-cyan-50 p-2 rounded-lg">
                      <Navigation className="h-4 w-4 text-blue-500" style={{transform: `rotate(${getDirectionRotation(waves.wave_direction)}deg)`}} />
                      <div>
                        <p className="text-xs text-muted-foreground">Direção</p>
                        <p className="font-semibold">{waves.wave_direction}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-cyan-50 p-2 rounded-lg">
                      <Compass className="h-4 w-4 text-indigo-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Período</p>
                        <p className="font-semibold">{waves.swell_period}s</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-cyan-50 p-2 rounded-lg">
                      <Thermometer className="h-4 w-4 text-teal-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Água</p>
                        <p className="font-semibold">{waves.water_temp}°C</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-xs text-muted-foreground pt-2 border-t">
                    <p className="font-medium text-cyan-700">Melhor horário: {waves.best_time}</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">Carregando...</p>
              )}
            </CardContent>
          </Card>

          {/* Card Marés */}
          <Card className="glass-card border-2 border-blue-200 hover:shadow-xl transition-all hover:scale-[1.02] overflow-hidden" data-testid="mares-card">
            <div className="bg-gradient-to-br from-blue-400 to-indigo-600 p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <h3 className="font-bold text-lg">Marés</h3>
                </div>
                <span className="text-sm">Hoje</span>
              </div>
            </div>
            <CardContent className="p-4">
              {tides && tides.tides ? (
                <div className="space-y-2">
                  {tides.tides.map((tide, index) => (
                    <div key={index} className={`flex items-center justify-between p-2 rounded-lg ${tide.type === 'alta' ? 'bg-blue-50' : 'bg-indigo-50'}`}>
                      <div className="flex items-center gap-2">
                        {tide.type === 'alta' ? (
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-indigo-600" />
                        )}
                        <span className="text-sm font-medium">
                          {tide.type === 'alta' ? 'Alta' : 'Baixa'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{tide.time}</p>
                        <p className="text-xs text-muted-foreground">{tide.height}</p>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-center text-muted-foreground pt-2 border-t mt-2">
                    {tides.location || 'Tabatinga, PB'}
                  </p>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">Carregando...</p>
              )}
            </CardContent>
          </Card>

          {/* Card Lua */}
          <Card className="glass-card border-2 border-purple-200 hover:shadow-xl transition-all hover:scale-[1.02] overflow-hidden" data-testid="lua-card">
            <div className="bg-gradient-to-br from-purple-400 to-indigo-700 p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-400" />
                  <h3 className="font-bold text-lg">Lua</h3>
                </div>
                <span className="text-sm">Crescente</span>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-lg" 
                       style={{clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 40% 100%)'}} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">Lua Crescente</p>
                  <p className="text-sm text-muted-foreground">51% iluminada</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-purple-50 p-2 rounded-lg text-center">
                    <p className="text-muted-foreground">Influência</p>
                    <p className="font-semibold">Marés moderadas</p>
                  </div>
                  <div className="bg-purple-50 p-2 rounded-lg text-center">
                    <p className="text-muted-foreground">Pesca</p>
                    <p className="font-semibold">Boa</p>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground pt-2 border-t">
                  Próxima lua cheia: 5 dias
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo das Condições */}
        {waves && weather && (
          <Card className="glass-card border-2 mt-6 bg-gradient-to-r from-cyan-50 to-blue-50" data-testid="surf-summary">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-full shadow-md">
                    <Waves className="h-8 w-8 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Condições para Surf</h3>
                    <p className="text-muted-foreground">{waves.conditions_summary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-cyan-600">{waves.wave_height}m</p>
                    <p className="text-xs text-muted-foreground">Altura</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{waves.wave_direction}</p>
                    <p className="text-xs text-muted-foreground">Direção</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-600">{waves.swell_period}s</p>
                    <p className="text-xs text-muted-foreground">Período</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16" data-testid="featured-products-section">
        <h2 className="text-3xl font-bold mb-8 text-center">Produtos em Destaque</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="glass-card border-2 overflow-hidden hover:shadow-xl transition-shadow" data-testid={`product-card-${product.id}`}>
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                <p className="text-2xl font-bold text-primary mb-4">
                  R$ {product.price.toFixed(2)}
                </p>
                <Link to={`/produto/${product.id}`}>
                  <Button className="w-full rounded-xl" data-testid={`view-product-button-${product.id}`}>
                    Ver Detalhes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        {products.length > 0 && (
          <div className="text-center mt-8">
            <Link to="/produtos">
              <Button variant="outline" size="lg" className="rounded-full" data-testid="view-all-products-button">
                Ver Todos os Produtos
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Galeria Instagram */}
      <section className="py-16 bg-gradient-to-b from-purple-50 to-pink-50" data-testid="instagram-gallery-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl">
                <Instagram className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold">Siga-nos no Instagram</h2>
            </div>
            <a 
              href="https://instagram.com/bodyboardtabatinga2" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-80 transition-opacity"
              data-testid="instagram-profile-link"
            >
              @bodyboardtabatinga2
            </a>
            <p className="text-muted-foreground mt-2">Fotos e vídeos das melhores ondas de Tabatinga</p>
          </div>

          {/* Grid de Galeria Estilo Instagram */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {gallery.length > 0 ? (
              gallery.slice(0, 8).map((item, index) => (
                <a
                  key={item.id || index}
                  href="https://instagram.com/bodyboardtabatinga2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
                  data-testid={`gallery-item-${index}`}
                >
                  <img
                    src={item.image_url}
                    alt={item.title || `Foto ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-4 text-white">
                      <Camera className="h-6 w-6" />
                    </div>
                  </div>
                </a>
              ))
            ) : (
              // Placeholder images quando não há galeria cadastrada
              [...Array(8)].map((_, index) => (
                <a
                  key={index}
                  href="https://instagram.com/bodyboardtabatinga2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600"
                  data-testid={`gallery-placeholder-${index}`}
                >
                  <img
                    src={`https://images.unsplash.com/photo-${[
                      '1502680390469-be75c86b636f',
                      '1507525428034-b723cf961d3e',
                      '1455729552865-3658a5d39692',
                      '1519046904884-53103b34b206',
                      '1509233725247-49e657c54213',
                      '1544551763-46a013bb70d5',
                      '1559827291-9e2d2a43e2eb',
                      '1505142468610-359e7d316be0'
                    ][index]}?w=400&h=400&fit=crop`}
                    alt={`Surf ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-4 text-white">
                      {index % 3 === 0 ? <Play className="h-8 w-8" /> : <Camera className="h-6 w-6" />}
                    </div>
                  </div>
                  {index % 3 === 0 && (
                    <div className="absolute top-2 right-2">
                      <Play className="h-5 w-5 text-white drop-shadow-lg" />
                    </div>
                  )}
                </a>
              ))
            )}
          </div>

          {/* Botão para Ver Mais */}
          <div className="text-center mt-8">
            <a
              href="https://instagram.com/bodyboardtabatinga2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                size="lg" 
                className="rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white border-0"
                data-testid="instagram-follow-button"
              >
                <Instagram className="mr-2 h-5 w-5" />
                Ver mais no Instagram
              </Button>
            </a>
          </div>

          {/* Stats do Instagram */}
          <div className="flex justify-center gap-8 mt-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">500+</p>
              <p className="text-sm text-muted-foreground">Publicações</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">2.5K</p>
              <p className="text-sm text-muted-foreground">Seguidores</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">10+</p>
              <p className="text-sm text-muted-foreground">Anos de ondas</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16" data-testid="news-section">
        <h2 className="text-3xl font-bold mb-2 text-center">Notícias do Mundo Aquático</h2>
        <p className="text-center text-muted-foreground mb-8">Surf, Bodyboard e Mergulho</p>
        {news.length > 0 && !news.error ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.slice(0, 6).map((item, index) => (
              <Card key={index} className="glass-card border-2 hover:shadow-xl transition-all hover:scale-[1.02] overflow-hidden" data-testid={`news-card-${index}`}>
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-40 object-cover"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      item.category === 'Surf' || item.category === 'Surf Brasil' 
                        ? 'bg-cyan-100 text-cyan-700' 
                        : item.category === 'Bodyboard' 
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.category === 'Surf' ? '🏄 Surf' : 
                       item.category === 'Surf Brasil' ? '🇧🇷 Surf Brasil' :
                       item.category === 'Bodyboard' ? '🏊 Bodyboard' : 
                       '🤿 Mergulho'}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-3 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{item.summary}</p>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-2 font-medium"
                    data-testid={`news-link-${index}`}
                  >
                    Ler mais <ExternalLink className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-card border-2">
            <CardContent className="p-8 text-center text-muted-foreground">
              Notícias não disponíveis no momento
            </CardContent>
          </Card>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
