import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { MessageCircle, ArrowLeft, Printer, Download, CheckCircle, Clock, User, Waves } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ReceiptPage = () => {
  const { rentalId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [rental, setRental] = useState(location.state?.rental || null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(!location.state?.rental);

  useEffect(() => {
    if (!rental) {
      fetchRental();
    }
    fetchSettings();
  }, [rentalId]);

  const fetchRental = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/rentals/${rentalId}`);
      setRental(response.data);
    } catch (error) {
      console.error("Error fetching rental:", error);
      toast.error("Erro ao carregar comprovante");
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "0min";
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 1000 / 60);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const generateWhatsAppMessage = () => {
    if (!rental) return "";
    
    const message = `
🏄 *COMPROVANTE DE LOCAÇÃO*
━━━━━━━━━━━━━━━━━━━━
🏪 *Tabatinga2Surf*
📍 Tabatinga, Paraíba

👤 *Locatário:* ${rental.renter_name}
🏄 *Prancha:* ${rental.surfboard_name}

📅 *Início:* ${formatDate(rental.start_time)}
📅 *Término:* ${formatDate(rental.end_time)}
⏱️ *Duração:* ${formatDuration(rental.start_time, rental.end_time)}

💰 *VALOR TOTAL: R$ ${(rental.final_amount || 0).toFixed(2)}*
━━━━━━━━━━━━━━━━━━━━

Obrigado pela preferência! 🤙
Volte sempre!
    `.trim();
    
    return encodeURIComponent(message);
  };

  const handleSendWhatsApp = () => {
    if (!rental) return;
    
    const message = generateWhatsAppMessage();
    // Open WhatsApp with the message (user can choose the contact)
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, "_blank");
    toast.success("Abrindo WhatsApp...");
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando comprovante...</p>
        </div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="min-h-screen pt-24">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <Card className="glass-card border-2">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Comprovante não encontrado</p>
              <Button className="mt-4" onClick={() => navigate("/dashboard")}>
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-b from-background to-muted/30" data-testid="receipt-page">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="rounded-xl"
            data-testid="back-to-dashboard"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="rounded-xl"
              data-testid="print-receipt"
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>

        {/* Receipt Card */}
        <Card className="glass-card border-2 overflow-hidden" data-testid="receipt-card">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Locação Finalizada!</h1>
            </div>
            <p className="text-white/80">Comprovante de Locação</p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Logo */}
            {settings?.logo_url && (
              <div className="text-center py-4 border-b">
                <img 
                  src={settings.logo_url} 
                  alt="Logo" 
                  className="h-16 mx-auto"
                  data-testid="receipt-logo"
                />
              </div>
            )}

            {/* Store Info */}
            <div className="text-center">
              <h2 className="text-xl font-bold">Tabatinga2Surf</h2>
              <p className="text-sm text-muted-foreground">Tabatinga, Paraíba</p>
            </div>

            {/* Rental Details */}
            <div className="space-y-4">
              {/* Renter */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                <div className="p-3 bg-primary/10 rounded-full">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Locatário</p>
                  <p className="text-lg font-bold" data-testid="receipt-renter-name">{rental.renter_name}</p>
                </div>
              </div>

              {/* Board */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Waves className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prancha</p>
                  <p className="text-lg font-bold" data-testid="receipt-board-name">{rental.surfboard_name}</p>
                </div>
              </div>

              {/* Time Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Início</p>
                  <p className="font-semibold" data-testid="receipt-start-time">{formatDate(rental.start_time)}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Término</p>
                  <p className="font-semibold" data-testid="receipt-end-time">{formatDate(rental.end_time)}</p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duração Total</p>
                  <p className="text-xl font-bold text-blue-600" data-testid="receipt-duration">
                    {formatDuration(rental.start_time, rental.end_time)}
                  </p>
                </div>
              </div>

              {/* Total Amount */}
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <p className="text-sm text-muted-foreground text-center mb-2">Valor Total</p>
                <p className="text-4xl font-bold text-green-600 text-center" data-testid="receipt-total-amount">
                  R$ {(rental.final_amount || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* WhatsApp Button */}
            <div className="pt-4 border-t print:hidden">
              <Button
                className="w-full h-14 text-lg rounded-xl bg-green-500 hover:bg-green-600"
                onClick={handleSendWhatsApp}
                data-testid="send-whatsapp-button"
              >
                <MessageCircle className="mr-3 h-6 w-6" />
                Enviar via WhatsApp
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Clique para enviar o comprovante pelo WhatsApp
              </p>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Obrigado pela preferência! 🤙
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Comprovante gerado em {new Date().toLocaleString("pt-BR")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* New Rental Button */}
        <div className="mt-6 text-center print:hidden">
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl"
            onClick={() => navigate("/dashboard")}
            data-testid="new-rental-button"
          >
            Iniciar Nova Locação
          </Button>
        </div>
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptPage;
