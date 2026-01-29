import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Play, Pause, Square, Clock, DollarSign, Settings, Image as ImageIcon } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DashboardPage = () => {
  const navigate = useNavigate();
  const [surfboards, setSurfboards] = useState([]);
  const [activeRentals, setActiveRentals] = useState({});
  const [showStartModal, setShowStartModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [renterName, setRenterName] = useState("");
  const [estimatedTime, setEstimatedTime] = useState(60);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [completingRental, setCompletingRental] = useState(null);
  const [alerted, setAlerted] = useState({});
  const { isSupported, subscribeToPush } = usePushNotifications();

  useEffect(() => {
    fetchSurfboards();
    fetchActiveRentals();
    
    // Request push notification permission
    if (isSupported) {
      subscribeToPush();
    }
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Check for rental alerts every 30 seconds
    const alertInterval = setInterval(() => {
      checkRentalAlerts();
    }, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(alertInterval);
    };
  }, []);

  useEffect(() => {
    checkOverdueRentals();
  }, [currentTime, activeRentals]);

  const checkRentalAlerts = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/rentals/check-alerts`);
      const alerts = response.data;
      
      alerts.forEach((alert) => {
        if (!alerted[alert.rental_id]) {
          showNotification(
            `Atenção: ${alert.surfboard_name}`,
            `Locação de ${alert.renter_name} atingiu 80% do tempo estimado!`
          );
          setAlerted(prev => ({ ...prev, [alert.rental_id]: true }));
        }
      });
    } catch (error) {
      console.error("Error checking alerts:", error);
    }
  };

  const showNotification = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/logo192.png" });
    }
    toast.warning(`${title} - ${body}`, { duration: 10000 });
  };

  const fetchSurfboards = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/surfboards`);
      setSurfboards(response.data);
    } catch (error) {
      console.error("Error fetching surfboards:", error);
    }
  };

  const fetchActiveRentals = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/rentals/active`);
      const rentalsMap = {};
      response.data.forEach((rental) => {
        rentalsMap[rental.surfboard_id] = rental;
      });
      setActiveRentals(rentalsMap);
    } catch (error) {
      console.error("Error fetching rentals:", error);
    }
  };

  const checkOverdueRentals = () => {
    Object.entries(activeRentals).forEach(([boardId, rental]) => {
      if (rental.status === "active") {
        const elapsed = calculateElapsedTime(rental);
        if (elapsed >= rental.estimated_time && !alerted[rental.id]) {
          playAlert();
          toast.error(`Prancha ${rental.surfboard_name}: Tempo estimado atingido!`, {
            duration: 10000
          });
          setAlerted(prev => ({ ...prev, [rental.id]: true }));
        }
      }
    });
  };

  const playAlert = () => {
    const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIF2i67OmfTRAMUKfj8LZjHAU6kdvy0H8tBSp3yPDckz4LFFyx6OKpVRQKRp/g8r5sIQUsgc7y2Yo2CBdouuzpn00QDFCn4/C2YxwFOpHb8tF/LQUqd8jw3JM+CxRcsejiqlUUCkaf4PK+bCEFLIHO8tmKNggXaLrs6Z9NEAxQp+PwtmMcBjqQ2/LRfy0GKnfI8NyTPQsUXLHo4qpVFApGn+DyvmwhBiyBzvLZijYIF2i67OmfTRAMUKfj8LZjHAY6kNvy0X8tBip3yPDckz0LFFyx6OKqVRQKRp/g8r5sIQYsgc7y2Yo2CBdouuzpn00QDFCn4/C2YxwGOpDb8tF/LQYqd8jw3JM9CxRcsejiqlUUCkaf4PK+bCEGLIHO8tmKNggXaLrs6Z9NEAxQp+PwtmMcBjqQ2/LRfy0GKnfI8NyTPQsUXLHo4qpVFApGn+DyvmwhBiyBzvLZijYIF2i67OmfTRAMUKfj8LZjHAY6kNvy0X8tBip3yPDckz0LFFyx6OKqVRQKRp/g8r5sIQYsgc7y2Yo2CBdouuzpn00QDFCn4/C2YxwGOpDb8tF/LQYqd8jw3JM9CxRcsejiqlUUCkaf4PK+bCEGLIHO8tmKNggXaLrs6Z9NEAxQp+PwtmMcBjqQ2/LRfy0GKnfI8NyTPQsUXLHo4qpVFApGn+DyvmwhBiyBzvLZijYIF2i67OmfTRAMUKfj8LZjHAY6kNvy0X8tBip3yPDckz0LFFyx6OKqVRQKRp/g8r5sIQYsgc7y2Yo2CBdouuzpn00QDFCn4/C2YxwGOpDb8tF/LQYqd8jw3JM9CxRcsejiqlUUCg==");
    audio.play().catch(e => console.log("Audio play failed:", e));
  };

  const calculateElapsedTime = (rental) => {
    if (!rental) return 0;
    
    const startTime = new Date(rental.start_time);
    let elapsed = (currentTime - startTime) / 1000 / 60;
    
    if (rental.status === "paused" && rental.pause_time) {
      const pauseTime = new Date(rental.pause_time);
      elapsed = (pauseTime - startTime) / 1000 / 60;
    }
    
    elapsed -= rental.total_paused_duration || 0;
    
    return Math.max(0, elapsed);
  };

  const calculateAmount = (rental) => {
    if (!rental) return 0;
    const elapsed = calculateElapsedTime(rental);
    return (elapsed / 60) * rental.hourly_rate;
  };

  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes % 1) * 60);
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRental = async () => {
    if (!selectedBoard || !renterName || !estimatedTime) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/rentals/start`, {
        surfboard_id: selectedBoard.id,
        renter_name: renterName,
        estimated_time: estimatedTime,
      });

      toast.success("Locação iniciada!");
      setShowStartModal(false);
      setRenterName("");
      setEstimatedTime(60);
      setSelectedBoard(null);
      fetchSurfboards();
      fetchActiveRentals();
    } catch (error) {
      console.error("Error starting rental:", error);
      toast.error("Erro ao iniciar locação");
    }
  };

  const handlePauseResume = async (boardId, action) => {
    const rental = activeRentals[boardId];
    if (!rental) return;

    try {
      await axios.put(`${BACKEND_URL}/api/rentals/${rental.id}`, { action });
      toast.success(action === "pause" ? "Locação pausada" : "Locação retomada");
      fetchSurfboards();
      fetchActiveRentals();
    } catch (error) {
      console.error("Error updating rental:", error);
      toast.error("Erro ao atualizar locação");
    }
  };

  const handleCompleteRental = async () => {
    if (!completingRental) return;

    const rental = activeRentals[completingRental.id];
    const finalAmount = calculateAmount(rental);

    try {
      const response = await axios.put(`${BACKEND_URL}/api/rentals/${rental.id}`, {
        action: "complete",
        final_amount: finalAmount,
      });

      toast.success("Locação finalizada!");
      setShowCompleteModal(false);
      setCompletingRental(null);
      
      // Navigate to receipt page with rental data
      if (response.data.rental) {
        navigate(`/comprovante/${rental.id}`, { 
          state: { rental: response.data.rental } 
        });
      } else {
        navigate(`/comprovante/${rental.id}`);
      }
    } catch (error) {
      console.error("Error completing rental:", error);
      toast.error("Erro ao finalizar locação");
    }
  };

  const getBoardStatus = (board) => {
    const rental = activeRentals[board.id];
    if (!rental) return "available";
    if (rental.status === "paused") return "paused";
    
    const elapsed = calculateElapsedTime(rental);
    if (elapsed >= rental.estimated_time) return "overdue";
    return "rented";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "status-available";
      case "rented":
        return "status-rented";
      case "paused":
        return "status-paused";
      case "overdue":
        return "status-overdue";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen pt-24" data-testid="dashboard-page">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold" data-testid="dashboard-title">Controle de Pranchas</h1>
          <div className="flex gap-4">
            <Link to="/gerenciar-pranchas">
              <Button variant="outline" className="rounded-xl" data-testid="manage-boards-link">
                <Settings className="mr-2 h-4 w-4" />
                Gerenciar Pranchas
              </Button>
            </Link>
            <Link to="/gerenciar-galeria">
              <Button variant="outline" className="rounded-xl" data-testid="manage-gallery-link">
                <ImageIcon className="mr-2 h-4 w-4" />
                Galeria
              </Button>
            </Link>
            <Link to="/historico">
              <Button variant="outline" className="rounded-xl" data-testid="history-link">
                <Clock className="mr-2 h-4 w-4" />
                Histórico
              </Button>
            </Link>
            <Link to="/gerenciar-produtos">
              <Button variant="outline" className="rounded-xl" data-testid="manage-products-link">
                Gerenciar Produtos
              </Button>
            </Link>
            <Link to="/configuracoes">
              <Button variant="outline" className="rounded-xl" data-testid="settings-link">
                Configurações
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {surfboards.map((board) => {
            const status = getBoardStatus(board);
            const rental = activeRentals[board.id];
            const elapsed = rental ? calculateElapsedTime(rental) : 0;
            const amount = rental ? calculateAmount(rental) : 0;

            return (
              <Card
                key={board.id}
                className={`board-card ${getStatusColor(status)} glass-card overflow-hidden`}
                data-testid={`board-card-${board.id}`}
              >
                {board.image_url && (
                  <img
                    src={board.image_url}
                    alt={board.name}
                    className="w-full h-32 object-cover"
                  />
                )}
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2" data-testid={`board-name-${board.id}`}>{board.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    R$ {board.hourly_rate.toFixed(2)}/hora
                  </p>

                  {rental ? (
                    <>
                      <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Locatário:</p>
                        <p className="font-semibold text-sm" data-testid={`renter-name-${board.id}`}>{rental.renter_name}</p>
                      </div>
                      
                      <div className="mb-3 p-3 bg-primary/10 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Tempo:</p>
                        <p className="timer-display text-primary" data-testid={`timer-${board.id}`}>
                          {formatTime(elapsed)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Est: {rental.estimated_time}min
                        </p>
                      </div>

                      <div className="mb-4 p-3 bg-secondary/10 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Valor:</p>
                        <p className="text-xl font-bold text-secondary" data-testid={`amount-${board.id}`}>
                          R$ {amount.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {rental.status === "active" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handlePauseResume(board.id, "pause")}
                            data-testid={`pause-button-${board.id}`}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handlePauseResume(board.id, "resume")}
                            data-testid={`resume-button-${board.id}`}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => {
                            setCompletingRental(board);
                            setShowCompleteModal(true);
                          }}
                          data-testid={`complete-button-${board.id}`}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button
                      className="w-full mt-4 rounded-xl"
                      onClick={() => {
                        setSelectedBoard(board);
                        setShowStartModal(true);
                      }}
                      data-testid={`start-rental-button-${board.id}`}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Iniciar
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {surfboards.length === 0 && (
          <Card className="glass-card border-2">
            <CardContent className="p-12 text-center text-muted-foreground">
              Nenhuma prancha cadastrada. <Link to="/gerenciar-pranchas" className="text-primary hover:underline">Adicionar prancha</Link>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Start Rental Modal */}
      <Dialog open={showStartModal} onOpenChange={setShowStartModal}>
        <DialogContent data-testid="start-rental-modal">
          <DialogHeader>
            <DialogTitle>Iniciar Locação - {selectedBoard?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="renterName">Nome do Locatário</Label>
              <Input
                id="renterName"
                value={renterName}
                onChange={(e) => setRenterName(e.target.value)}
                className="rounded-lg"
                data-testid="renter-name-input"
              />
            </div>
            <div>
              <Label htmlFor="estimatedTime">Tempo Estimado (minutos)</Label>
              <Input
                id="estimatedTime"
                type="number"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(parseInt(e.target.value))}
                className="rounded-lg"
                data-testid="estimated-time-input"
              />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Valor Estimado:</p>
              <p className="text-2xl font-bold text-primary">
                R$ {((estimatedTime / 60) * (selectedBoard?.hourly_rate || 0)).toFixed(2)}
              </p>
            </div>
            <Button
              className="w-full rounded-xl"
              onClick={handleStartRental}
              data-testid="confirm-start-rental-button"
            >
              Iniciar Locação
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Rental Modal */}
      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent data-testid="complete-rental-modal">
          <DialogHeader>
            <DialogTitle>Finalizar Locação</DialogTitle>
          </DialogHeader>
          {completingRental && activeRentals[completingRental.id] && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Prancha:</p>
                <p className="font-bold">{completingRental.name}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Locatário:</p>
                <p className="font-bold">{activeRentals[completingRental.id].renter_name}</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Tempo Total:</p>
                <p className="text-xl font-bold">
                  {formatTime(calculateElapsedTime(activeRentals[completingRental.id]))}
                </p>
              </div>
              <div className="p-4 bg-secondary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Valor Total:</p>
                <p className="text-3xl font-bold text-secondary" data-testid="final-amount">
                  R$ {calculateAmount(activeRentals[completingRental.id]).toFixed(2)}
                </p>
              </div>
              <Button
                className="w-full rounded-xl"
                onClick={handleCompleteRental}
                data-testid="confirm-complete-rental-button"
              >
                Finalizar e Gerar Comprovante
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
