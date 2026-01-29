import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Upload } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ManageGalleryPage = () => {
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    image_url: "",
    order: 0,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/gallery`);
      setImages(response.data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image_url) {
      toast.error("Por favor, faça upload de uma imagem primeiro");
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/gallery`, formData);
      toast.success("✅ Imagem salva na galeria com sucesso!");
      setShowModal(false);
      setFormData({ title: "", image_url: "", order: 0 });
      fetchImages();
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error("Erro ao salvar imagem na galeria");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta imagem?")) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/gallery/${id}`);
      toast.success("Imagem excluída!");
      fetchImages();
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Erro ao excluir imagem");
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

  return (
    <div className="min-h-screen pt-24" data-testid="manage-gallery-page">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" data-testid="back-to-dashboard-button">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
            </Link>
            <h1 className="text-4xl font-bold" data-testid="manage-gallery-title">Gerenciar Galeria</h1>
          </div>
          <Button onClick={() => setShowModal(true)} className="rounded-xl" data-testid="add-image-button">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Imagem
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {images.map((image) => (
            <Card key={image.id} className="glass-card border-2 overflow-hidden" data-testid={`gallery-card-${image.id}`}>
              <img
                src={image.image_url}
                alt={image.title || "Gallery image"}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{image.title || "Sem título"}</h3>
                <p className="text-sm text-muted-foreground mb-4">Ordem: {image.order}</p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => handleDelete(image.id)}
                  data-testid={`delete-image-${image.id}`}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {images.length === 0 && (
          <Card className="glass-card border-2">
            <CardContent className="p-12 text-center text-muted-foreground">
              Nenhuma imagem na galeria
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent data-testid="gallery-form-modal">
          <DialogHeader>
            <DialogTitle>Adicionar Imagem à Galeria</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título (opcional)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="rounded-lg"
                placeholder="Ex: Praia de Tabatinga"
                data-testid="image-title-input"
              />
            </div>
            <div>
              <Label htmlFor="order">Ordem de Exibição</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="rounded-lg"
                placeholder="1, 2, 3..."
                data-testid="image-order-input"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Define a posição no carrossel (menor número aparece primeiro)
              </p>
            </div>
            <div>
              <Label htmlFor="image">Upload da Imagem</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="rounded-lg"
                disabled={uploading}
                data-testid="gallery-image-input"
              />
              {uploading && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">⏳ Enviando imagem...</p>
                </div>
              )}
              {formData.image_url && !uploading && (
                <div className="mt-3 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                  <p className="text-sm text-green-700 font-semibold mb-2">✅ Imagem carregada! Pronta para salvar</p>
                  <img src={formData.image_url} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                </div>
              )}
            </div>
            
            {formData.image_url && (
              <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4">
                <p className="text-sm font-semibold text-amber-800 mb-2">⚠️ IMPORTANTE:</p>
                <p className="text-sm text-amber-700">
                  A imagem foi carregada, mas ainda não foi salva na galeria. 
                  Clique no botão abaixo para adicionar ao carrossel.
                </p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full rounded-xl text-lg py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" 
              disabled={uploading || !formData.image_url} 
              data-testid="save-gallery-image-button"
            >
              {uploading ? (
                "⏳ Enviando Imagem..."
              ) : !formData.image_url ? (
                "📤 Faça Upload Primeiro"
              ) : (
                "💾 SALVAR FOTO NA GALERIA"
              )}
            </Button>
            
            {!formData.image_url && (
              <p className="text-xs text-center text-muted-foreground">
                Primeiro faça o upload da imagem, depois clique em salvar
              </p>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageGalleryPage;
