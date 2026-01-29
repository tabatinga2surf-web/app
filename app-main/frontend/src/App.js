import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "@/App.css";
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import SuccessPage from "@/pages/SuccessPage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ManageBoardsPage from "@/pages/ManageBoardsPage";
import ManageProductsPage from "@/pages/ManageProductsPage";
import HistoryPage from "@/pages/HistoryPage";
import SettingsPage from "@/pages/SettingsPage";
import ManageGalleryPage from "@/pages/ManageGalleryPage";
import ReceiptPage from "@/pages/ReceiptPage";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/produtos" element={<ProductsPage />} />
              <Route path="/produto/:id" element={<ProductDetailPage />} />
              <Route path="/carrinho" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/gerenciar-pranchas" element={
                <ProtectedRoute>
                  <ManageBoardsPage />
                </ProtectedRoute>
              } />
              <Route path="/gerenciar-produtos" element={
                <ProtectedRoute>
                  <ManageProductsPage />
                </ProtectedRoute>
              } />
              <Route path="/historico" element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              } />
              <Route path="/configuracoes" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/gerenciar-galeria" element={
                <ProtectedRoute>
                  <ManageGalleryPage />
                </ProtectedRoute>
              } />
              <Route path="/comprovante/:rentalId" element={
                <ProtectedRoute>
                  <ReceiptPage />
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
