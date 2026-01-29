import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ManageProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "surf",
    stock: 0,
    image_url: "",
  });
  const [uploading, setUploading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        await axios.put(`${BACKEND_URL}/api/products/${editingProduct.id}`, formData);
        toast.success("Produto atualizado!");
      } else {
        await axios.post(`${BACKEND_URL}/api/products`, formData);
        toast.success("Produto cadastrado!");
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: "", description: "", price: 0, category: "surf", stock: 0, image_url: "" });
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Erro ao salvar produto");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/products/${id}`);
      toast.success("Produto excluído!");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Erro ao excluir produto");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    setUploading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/upload`, formDataUpload);
      setFormData({ ...formData, image_url: response.data.url });
      toast.success("Imagem enviada!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image_url: product.image_url || "",
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ name: "", description: "", price: 0, category: "surf", stock: 0, image_url: "" });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen pt-24" data-testid="manage-products-page">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" data-testid="back-to-dashboard-button">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
            </Link>
            <h1 className="text-4xl font-bold" data-testid="manage-products-title">Gerenciar Produtos</h1>
          </div>
          <Button onClick={openCreateModal} className="rounded-xl" data-testid="add-product-button">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Produto
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="glass-card border-2" data-testid={`product-manage-card-${product.id}`}>
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <CardContent className="p-6">
                <div className="text-xs text-muted-foreground mb-2">{product.category}</div>
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                <p className="text-xl font-bold text-primary mb-2">
                  R$ {product.price.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mb-4">Estoque: {product.stock}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditModal(product)}
                    data-testid={`edit-product-${product.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDelete(product.id)}
                    data-testid={`delete-product-${product.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <Card className="glass-card border-2">
            <CardContent className="p-12 text-center text-muted-foreground">
              Nenhum produto cadastrado
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl" data-testid="product-form-modal">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Produto</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="rounded-lg"
                data-testid="product-name-input"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="rounded-lg"
                rows={3}
                data-testid="product-description-input"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                  className="rounded-lg"
                  data-testid="product-price-input"
                />
              </div>
              <div>
                <Label htmlFor="stock">Estoque</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  required
                  className="rounded-lg"
                  data-testid="product-stock-input"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="rounded-lg"
                  data-testid="product-category-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="image">Imagem do Produto</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="rounded-lg"
                disabled={uploading}
                data-testid="product-image-input"
              />
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />
              )}
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={uploading} data-testid="save-product-button">
              {uploading ? "Enviando..." : editingProduct ? "Atualizar" : "Cadastrar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageProductsPage;
