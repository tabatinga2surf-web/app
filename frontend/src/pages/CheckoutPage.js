import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { QrCode, Share2 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, total, clearCart } = useCart();
  const [showPixModal, setShowPixModal] = useState(false);
  const [settings, setSettings] = useState(null);

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

  const handlePixPayment = () => {
    setShowPixModal(true);
  };

  const shareWhatsApp = () => {
    const items = cart.map(item => `${item.name} (${item.quantity}x) - R$ ${(item.price * item.quantity).toFixed(2)}`).join('\n');
    const message = `*Pedido - tabatinga2surf*\n\n${items}\n\nTotal: R$ ${total.toFixed(2)}\n\nPague via PIX escaneando o QR Code!`;
    
    if (settings?.instagram_handle) {
      const encodedMessage = encodeURIComponent(message + `\n\nSiga-nos: @${settings.instagram_handle}`);
      window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
    } else {
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
    }
    toast.success("Abrindo WhatsApp...");
  };

  const handlePaymentComplete = () => {
    clearCart();
    setShowPixModal(false);
    toast.success("Pedido enviado! Aguardando confirmação do pagamento.");
    setTimeout(() => navigate("/"), 2000);
  };

  if (cart.length === 0) {
    navigate("/carrinho");
    return null;
  }

  return (
    <div className="min-h-screen pt-24" data-testid="checkout-page">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8" data-testid="checkout-page-title">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="glass-card border-2">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Resumo do Pedido</h2>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between" data-testid={`checkout-item-${item.id}`}>
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantidade: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="glass-card border-2 sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Pagamento</h2>
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl border-2 border-emerald-500">
                    <div className="flex items-center gap-3 mb-2">
                      <QrCode className="h-6 w-6 text-emerald-600" />
                      <span className="font-bold text-emerald-600">Pagamento via PIX</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Escaneie o QR Code e pague instantaneamente</p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-emerald-600" data-testid="checkout-total">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  onClick={handlePixPayment}
                  data-testid="pay-pix-button"
                >
                  <QrCode className="mr-2 h-5 w-5" />
                  Pagar com PIX
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* PIX Payment Modal */}
      <Dialog open={showPixModal} onOpenChange={setShowPixModal}>
        <DialogContent className="max-w-md" data-testid="pix-payment-modal">
          <DialogHeader>
            <DialogTitle>Pagamento via PIX</DialogTitle>
          </DialogHeader>
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

            <div className="border-t border-b py-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-2">Valor Total</p>
                <p className="text-4xl font-bold text-emerald-600" data-testid="pix-total">
                  R$ {total.toFixed(2)}
                </p>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} ({item.quantity}x)</span>
                    <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {settings?.pix_qr_url ? (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">Escaneie o QR Code para pagar</p>
                <img
                  src={settings.pix_qr_url}
                  alt="QR Code PIX"
                  className="w-64 h-64 mx-auto border-2 rounded-lg"
                  data-testid="pix-qr-code"
                />
                <p className="text-xs text-muted-foreground mt-3">
                  Após o pagamento, aguarde a confirmação
                </p>
              </div>
            ) : (
              <div className="text-center p-8 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">Configure o QR Code PIX nas configurações</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={shareWhatsApp}
                data-testid="share-pix-button"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
              <Button
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500"
                onClick={handlePaymentComplete}
                data-testid="confirm-payment-button"
              >
                Já Paguei
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
