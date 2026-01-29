import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { ShoppingCart, ArrowLeft } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/products`);
      const found = response.data.find((p) => p.id === id);
      setProduct(found);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast.success("Produto adicionado ao carrinho!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Button onClick={() => navigate("/produtos")}>Voltar para Produtos</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24" data-testid="product-detail-page">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/produtos")}
          className="mb-8"
          data-testid="back-to-products-button"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full rounded-2xl shadow-lg"
                data-testid="product-detail-image"
              />
            ) : (
              <div className="w-full h-96 bg-muted rounded-2xl flex items-center justify-center">
                <p className="text-muted-foreground">Sem imagem</p>
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-2">
              {product.category}
            </div>
            <h1 className="text-4xl font-bold mb-4" data-testid="product-detail-title">{product.name}</h1>
            <p className="text-5xl font-bold text-primary mb-6" data-testid="product-detail-price">
              R$ {product.price.toFixed(2)}
            </p>
            <p className="text-lg text-muted-foreground mb-8" data-testid="product-detail-description">
              {product.description}
            </p>

            <Card className="glass-card border-2 mb-8">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Informações do Produto</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estoque:</span>
                    <span className="font-semibold">{product.stock} unidades</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoria:</span>
                    <span className="font-semibold">{product.category}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full rounded-xl text-lg"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              data-testid="add-to-cart-button"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.stock === 0 ? "Sem estoque" : "Adicionar ao Carrinho"}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
