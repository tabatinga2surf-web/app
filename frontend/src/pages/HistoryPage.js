import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const HistoryPage = () => {
  const [rentals, setRentals] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchRentals();
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

  const fetchRentals = async (date = "") => {
    try {
      const url = date
        ? `${BACKEND_URL}/api/rentals/history?date=${date}`
        : `${BACKEND_URL}/api/rentals/history`;
      const response = await axios.get(url);
      setRentals(response.data);
    } catch (error) {
      console.error("Error fetching rentals:", error);
    }
  };

  const handleDateFilter = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    fetchRentals(date);
  };

  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hrs}h ${mins}min`;
  };

  const calculateDuration = (rental) => {
    const start = new Date(rental.start_time);
    const end = new Date(rental.end_time);
    const duration = (end - start) / 1000 / 60;
    return duration - (rental.total_paused_duration || 0);
  };

  const shareWhatsApp = (rental) => {
    const duration = calculateDuration(rental);
    const message = `*Comprovante de Locação - tabatinga2surf*\n\n` +
      `Prancha: ${rental.surfboard_name}\n` +
      `Locatário: ${rental.renter_name}\n` +
      `Duração: ${formatTime(duration)}\n` +
      `Valor: R$ ${rental.final_amount.toFixed(2)}\n\n` +
      `Data: ${new Date(rental.start_time).toLocaleDateString("pt-BR")}\n\n` +
      `Obrigado pela preferência!`;

    if (settings?.instagram_handle) {
      const encodedMessage = encodeURIComponent(message + `\n\nSiga-nos: @${settings.instagram_handle}`);
      window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
    } else {
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
    }
    toast.success("Abrindo WhatsApp...");
  };

  const viewReceipt = (rental) => {
    setSelectedRental(rental);
    setShowReceipt(true);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen pt-24" data-testid="history-page">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" data-testid="back-to-dashboard-button">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
            </Link>
            <h1 className="text-4xl font-bold" data-testid="history-title">Histórico de Locações</h1>
          </div>
        </div>

        <Card className="glass-card border-2 mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="date">Filtrar por Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={handleDateFilter}
                  max={today}
                  className="rounded-lg"
                  data-testid="date-filter-input"
                />
              </div>
              {selectedDate && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDate("");
                    fetchRentals();
                  }}
                  data-testid="clear-filter-button"
                >
                  Limpar Filtro
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {rentals.map((rental) => {
            const duration = calculateDuration(rental);
            return (
              <Card key={rental.id} className="glass-card border-2" data-testid={`rental-history-card-${rental.id}`}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Prancha</p>
                      <p className="font-bold">{rental.surfboard_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Locatário</p>
                      <p className="font-bold">{rental.renter_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duração</p>
                      <p className="font-bold">{formatTime(duration)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor</p>
                      <p className="font-bold text-primary text-xl">
                        R$ {rental.final_amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewReceipt(rental)}
                        data-testid={`view-receipt-${rental.id}`}
                      >
                        Ver Comprovante
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => shareWhatsApp(rental)}
                        data-testid={`share-whatsapp-${rental.id}`}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Início: {new Date(rental.start_time).toLocaleString("pt-BR")} |
                      Fim: {new Date(rental.end_time).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {rentals.length === 0 && (
          <Card className="glass-card border-2">
            <CardContent className="p-12 text-center text-muted-foreground">
              Nenhuma locação encontrada para {selectedDate ? "esta data" : "o histórico"}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Receipt Modal */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md" data-testid="receipt-modal">
          <DialogHeader>
            <DialogTitle>Comprovante de Locação</DialogTitle>
          </DialogHeader>
          {selectedRental && (
            <div className="space-y-4">
              {settings?.logo_url && (
                <div className="text-center">
                  <img src={settings.logo_url} alt="Logo" className="h-16 mx-auto mb-4" />
                </div>
              )}
              
              <div className="text-center">
                <h2 className="text-2xl font-bold">tabatinga2surf</h2>
                {settings?.instagram_handle && (
                  <p className="text-sm text-muted-foreground">@{settings.instagram_handle}</p>
                )}
              </div>

              <div className="border-t border-b py-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prancha:</span>
                  <span className="font-bold">{selectedRental.surfboard_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Locatário:</span>
                  <span className="font-bold">{selectedRental.renter_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duração:</span>
                  <span className="font-bold">{formatTime(calculateDuration(selectedRental))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-bold">
                    {new Date(selectedRental.start_time).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>

              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">Valor Total</p>
                <p className="text-4xl font-bold text-primary" data-testid="receipt-total">
                  R$ {selectedRental.final_amount.toFixed(2)}
                </p>
              </div>

              {settings?.pix_qr_url && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Pague via PIX</p>
                  <img
                    src={settings.pix_qr_url}
                    alt="QR Code PIX"
                    className="w-48 h-48 mx-auto"
                    data-testid="pix-qr-code"
                  />
                </div>
              )}

              <Button
                className="w-full rounded-xl"
                onClick={() => shareWhatsApp(selectedRental)}
                data-testid="share-receipt-button"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar no WhatsApp
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HistoryPage;
