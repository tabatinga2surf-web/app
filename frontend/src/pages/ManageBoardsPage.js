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
import { ArrowLeft, Plus, Edit, Trash2, Upload } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ManageBoardsPage = () => {
  const [boards, setBoards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    hourly_rate: 30,
    image_url: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/surfboards`);
      setBoards(response.data);
    } catch (error) {
      console.error("Error fetching boards:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingBoard) {
        await axios.put(`${BACKEND_URL}/api/surfboards/${editingBoard.id}`, formData);
        toast.success("Prancha atualizada!");
      } else {
        await axios.post(`${BACKEND_URL}/api/surfboards`, formData);
        toast.success("Prancha cadastrada!");
      }

      setShowModal(false);
      setEditingBoard(null);
      setFormData({ name: "", hourly_rate: 30, image_url: "" });
      fetchBoards();
    } catch (error) {
      console.error("Error saving board:", error);
      toast.error("Erro ao salvar prancha");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta prancha?")) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/surfboards/${id}`);
      toast.success("Prancha excluída!");
      fetchBoards();
    } catch (error) {
      console.error("Error deleting board:", error);
      toast.error("Erro ao excluir prancha");
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

  const openEditModal = (board) => {
    setEditingBoard(board);
    setFormData({
      name: board.name,
      hourly_rate: board.hourly_rate,
      image_url: board.image_url || "",
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingBoard(null);
    setFormData({ name: "", hourly_rate: 30, image_url: "" });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen pt-24" data-testid="manage-boards-page">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" data-testid="back-to-dashboard-button">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
            </Link>
            <h1 className="text-4xl font-bold" data-testid="manage-boards-title">Gerenciar Pranchas</h1>
          </div>
          <Button onClick={openCreateModal} className="rounded-xl" data-testid="add-board-button">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Prancha
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {boards.map((board) => (
            <Card key={board.id} className="glass-card border-2" data-testid={`board-manage-card-${board.id}`}>
              {board.image_url && (
                <img
                  src={board.image_url}
                  alt={board.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">{board.name}</h3>
                <p className="text-xl font-bold text-primary mb-4">
                  R$ {board.hourly_rate.toFixed(2)}/hora
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditModal(board)}
                    data-testid={`edit-board-${board.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDelete(board.id)}
                    data-testid={`delete-board-${board.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {boards.length === 0 && (
          <Card className="glass-card border-2">
            <CardContent className="p-12 text-center text-muted-foreground">
              Nenhuma prancha cadastrada
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent data-testid="board-form-modal">
          <DialogHeader>
            <DialogTitle>{editingBoard ? "Editar Prancha" : "Nova Prancha"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Prancha</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="rounded-lg"
                data-testid="board-name-input"
              />
            </div>
            <div>
              <Label htmlFor="hourly_rate">Valor por Hora (R$)</Label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
                required
                className="rounded-lg"
                data-testid="board-rate-input"
              />
            </div>
            <div>
              <Label htmlFor="image">Imagem da Prancha</Label>
              <div className="flex gap-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="rounded-lg"
                  disabled={uploading}
                  data-testid="board-image-input"
                />
              </div>
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />
              )}
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={uploading} data-testid="save-board-button">
              {uploading ? "Enviando..." : editingBoard ? "Atualizar" : "Cadastrar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageBoardsPage;
