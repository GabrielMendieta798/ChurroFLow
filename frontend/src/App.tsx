import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Insumos from './pages/Insumos';
import Recetas from './pages/Recetas';
import POS from './pages/POS';
import CajaPage from './pages/CajaPage';
import Compras from './pages/Compras';
import Stock from './pages/Stock';
import Ventas from './pages/Ventas';
import Clientes from './pages/Clientes';
import ListasPrecio from './pages/ListasPrecio';
import Produccion from './pages/Produccion';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="caja" element={<CajaPage />} />
          <Route path="produccion" element={<Produccion />} />
          <Route path="productos" element={<Productos />} />
          <Route path="insumos" element={<Insumos />} />
          <Route path="recetas" element={<Recetas />} />
          <Route path="compras" element={<Compras />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="listas-precio" element={<ListasPrecio />} />
          <Route path="stock" element={<Stock />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
