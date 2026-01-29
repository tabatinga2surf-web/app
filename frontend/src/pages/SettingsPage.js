import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    logo_url: "",
    pix_qr_url: "",
    instagram_handle: "",
  });
  const [uploading, setUploading] = useState({ logo: false, pix: false });
  const [weatherApiKey, setWeatherApiKey] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await axios.put(`${BACKEND_URL}/api/settings`, settings);
      toast.success("Configurações salvas!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erro ao salvar configurações");
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading({ ...uploading, [type]: true });
    try {
      const response = await axios.post(`${BACKEND_URL}/api/upload`, formData);
      
      if (type === "logo") {
        setSettings({ ...settings, logo_url: response.data.url });
      } else if (type === "pix") {
        setSettings({ ...settings, pix_qr_url: response.data.url });
      }
      
      toast.success("Imagem enviada!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  return (
    <div className="min-h-screen pt-24" data-testid="settings-page">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" data-testid="back-to-dashboard-button">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
          </Link>
          <h1 className="text-4xl font-bold" data-testid="settings-title">Configurações</h1>
        </div>

        <div className="space-y-6">
          <Card className="glass-card border-2">
            <CardHeader>
              <CardTitle>Logo do Negócio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="logo">Upload do Logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "logo")}
                  className="rounded-lg"
                  disabled={uploading.logo}
                  data-testid="logo-upload-input"
                />
                {settings.logo_url && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                    <img
                      src={settings.logo_url}
                      alt="Logo"
                      className="h-20 object-contain"
                      data-testid="logo-preview"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-2">
            <CardHeader>
              <CardTitle>QR Code PIX</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pix">Upload do QR Code PIX</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Este QR Code será exibido nos comprovantes de locação
                </p>
                <Input
                  id="pix"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "pix")}
                  className="rounded-lg"
                  disabled={uploading.pix}
                  data-testid="pix-upload-input"
                />
                {settings.pix_qr_url && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                    <img
                      src={settings.pix_qr_url}
                      alt="QR Code PIX"
                      className="w-48 h-48 object-contain"
                      data-testid="pix-preview"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-2">
            <CardHeader>
              <CardTitle>Instagram</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="instagram">Handle do Instagram (sem @)</Label>
                <Input
                  id="instagram"
                  value={settings.instagram_handle || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, instagram_handle: e.target.value })
                  }
                  placeholder="tabatinga2surf"
                  className="rounded-lg"
                  data-testid="instagram-input"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-2">
            <CardHeader>
              <CardTitle>API do OpenWeatherMap</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="weather-api">API Key</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Para exibir as condições climáticas, configure sua API key do OpenWeatherMap.
                  Obtenha em: <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">openweathermap.org/api</a>
                </p>
                <Input
                  id="weather-api"
                  type="text"
                  value={weatherApiKey}
                  onChange={(e) => setWeatherApiKey(e.target.value)}
                  placeholder="Cole sua API key aqui"
                  className="rounded-lg"
                  data-testid="weather-api-input"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Nota: A API key deve ser configurada no arquivo .env do backend
                </p>
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full rounded-xl"
            onClick={handleSaveSettings}
            data-testid="save-settings-button"
          >
            <Save className="mr-2 h-5 w-5" />
            Salvar Configurações
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
