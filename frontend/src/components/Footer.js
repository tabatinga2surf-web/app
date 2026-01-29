import { Link } from "react-router-dom";
import { Instagram, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Footer = () => {
  const [settings, setSettings] = useState(null);
  const latitude = -7.319496369476916;
  const longitude = -34.800865213216525;

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

  return (
    <footer className="bg-card border-t border-border mt-20" data-testid="footer">
      {/* Mapa */}
      <div className="w-full h-96">
        <iframe
          src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.0!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMTknMTAuMiJTIDM0wrA0OCcwMy4xIlc!5e0!3m2!1spt-BR!2sbr!4v1234567890123!5m2!1spt-BR!2sbr`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Localização Tabatinga2Surf"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">tabatinga2surf</h3>
            <p className="text-muted-foreground mb-4">
              Sua loja de surf, bodyboard e mergulho em Tabatinga, Paraíba.
            </p>
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5 mt-1 flex-shrink-0" />
              <p className="text-sm">
                Tabatinga, Conde<br />
                Paraíba, Brasil
              </p>
            </div>
            <a 
              href="https://wa.me/5583996666411" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-green-500 transition-colors mt-3"
              data-testid="footer-whatsapp-link"
            >
              <Phone className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">(83) 99666-6411</span>
            </a>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <div className="flex flex-col gap-2">
              <Link to="/produtos" className="text-muted-foreground hover:text-primary transition-colors">
                Produtos
              </Link>
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                Sobre Nós
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Redes Sociais</h4>
            {settings?.instagram_handle && (
              <a
                href={`https://instagram.com/${settings.instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                data-testid="footer-instagram-link"
              >
                <Instagram className="h-5 w-5" />
                @{settings.instagram_handle}
              </a>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
          <p>© 2025 tabatinga2surf. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
