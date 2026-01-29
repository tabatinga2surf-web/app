import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { Trash2, Plus, Minus } from "lucide-react";

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, total } = useCart();

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen pt-24" data-testid="cart-page">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8" data-testid="cart-page-title">Carrinho de Compras</h1>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item.id} className="glass-card border-2" data-testid={`cart-item-${item.id}`}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                        <p className="text-primary font-bold">
                          R$ {item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          data-testid={`remove-item-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            data-testid={`decrease-quantity-${item.id}`}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold" data-testid={`item-quantity-${item.id}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            data-testid={`increase-quantity-${item.id}`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card className="glass-card border-2 sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Resumo</h2>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">R$ {total.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total</span>
                        <span className="text-primary" data-testid="cart-total">R$ {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="w-full rounded-xl"
                    onClick={handleCheckout}
                    data-testid="proceed-to-checkout-button"
                  >
                    Finalizar Compra
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="glass-card border-2">
            <CardContent className="p-12 text-center">
              <p className="text-lg text-muted-foreground mb-6">Seu carrinho está vazio</p>
              <Button onClick={() => navigate("/produtos")} data-testid="continue-shopping-button">
                Continuar Comprando
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
