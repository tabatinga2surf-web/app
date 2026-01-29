import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState("checking");
  const [attempts, setAttempts] = useState(0);
  
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      checkPaymentStatus();
    }
  }, [sessionId]);

  const checkPaymentStatus = async () => {
    const maxAttempts = 5;
    
    if (attempts >= maxAttempts) {
      setStatus("timeout");
      return;
    }

    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/payments/status/${sessionId}`
      );

      if (response.data.payment_status === "paid") {
        setStatus("success");
        clearCart();
      } else if (response.data.status === "expired") {
        setStatus("expired");
      } else {
        setAttempts(attempts + 1);
        setTimeout(() => checkPaymentStatus(), 2000);
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen pt-24" data-testid="success-page">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card className="glass-card border-2">
          <CardContent className="p-12 text-center">
            {status === "checking" && (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
                <h1 className="text-3xl font-bold mb-4">Verificando pagamento...</h1>
                <p className="text-muted-foreground">
                  Por favor, aguarde enquanto confirmamos seu pagamento.
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" data-testid="success-icon" />
                <h1 className="text-3xl font-bold mb-4" data-testid="success-title">Pagamento Confirmado!</h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Obrigado pela sua compra. Seu pedido foi processado com sucesso.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => navigate("/")} data-testid="home-button">
                    Voltar ao Início
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/produtos")} data-testid="continue-shopping-button">
                    Continuar Comprando
                  </Button>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <h1 className="text-3xl font-bold mb-4">Erro ao verificar pagamento</h1>
                <p className="text-muted-foreground mb-8">
                  Houve um problema ao verificar seu pagamento. Por favor, entre em contato.
                </p>
                <Button onClick={() => navigate("/")}>
                  Voltar ao Início
                </Button>
              </>
            )}

            {status === "timeout" && (
              <>
                <h1 className="text-3xl font-bold mb-4">Verificação demorou muito</h1>
                <p className="text-muted-foreground mb-8">
                  Não conseguimos verificar seu pagamento a tempo. Por favor, verifique seu email.
                </p>
                <Button onClick={() => navigate("/")}>
                  Voltar ao Início
                </Button>
              </>
            )}

            {status === "expired" && (
              <>
                <h1 className="text-3xl font-bold mb-4">Sessão expirada</h1>
                <p className="text-muted-foreground mb-8">
                  A sessão de pagamento expirou. Por favor, tente novamente.
                </p>
                <Button onClick={() => navigate("/carrinho")}>
                  Voltar ao Carrinho
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default SuccessPage;
