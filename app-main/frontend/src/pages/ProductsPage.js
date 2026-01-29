import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const categories = ["all", ...new Set(products.map((p) => p.category))];
  const filteredProducts =
    filter === "all"
      ? products
      : products.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen pt-24" data-testid="products-page">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8" data-testid="products-page-title">Nossos Produtos</h1>

        <div className="flex gap-2 mb-8 flex-wrap" data-testid="category-filters">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={filter === cat ? "default" : "outline"}
              onClick={() => setFilter(cat)}
              className="rounded-full"
              data-testid={`category-filter-${cat}`}
            >
              {cat === "all" ? "Todos" : cat}
            </Button>
          ))}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="glass-card border-2 overflow-hidden hover:shadow-xl transition-shadow"
                data-testid={`product-card-${product.id}`}
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardContent className="p-6">
                  <div className="text-xs text-muted-foreground mb-2">
                    {product.category}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="text-2xl font-bold text-primary mb-4">
                    R$ {product.price.toFixed(2)}
                  </p>
                  <Link to={`/produto/${product.id}`}>
                    <Button className="w-full rounded-xl" data-testid={`view-product-detail-${product.id}`}>
                      Ver Detalhes
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-card border-2">
            <CardContent className="p-12 text-center text-muted-foreground">
              Nenhum produto encontrado
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductsPage;
