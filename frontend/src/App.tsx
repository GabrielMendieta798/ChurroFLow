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
import Pedidos from './pages/Pedidos';
import Repartos from './pages/Repartos';
import Finanzas from './pages/Finanzas';
import Usuarios from './pages/Usuarios';
import type { Role } from './types';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const homeByRole: Record<Role, string> = {
  ADMIN: '/dashboard',
  EMPLEADO: '/pos',
  DEMO: '/dashboard',
};

function RoleHome() {
  const user = useAuthStore((s) => s.user);
  return <Navigate to={user ? homeByRole[user.role] : '/login'} replace />;
}

function RequireRoles({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to={homeByRole[user.role]} replace />;
  return <>{children}</>;
}

const adminOnly: Role[] = ['ADMIN'];
const adminAndDemo: Role[] = ['ADMIN', 'DEMO'];
const staff: Role[] = ['ADMIN', 'EMPLEADO'];
const allRoles: Role[] = ['ADMIN', 'EMPLEADO', 'DEMO'];

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
          <Route index element={<RoleHome />} />
          <Route path="dashboard" element={<RequireRoles roles={adminAndDemo}><Dashboard /></RequireRoles>} />
          <Route path="pos" element={<RequireRoles roles={staff}><POS /></RequireRoles>} />
          <Route path="ventas" element={<RequireRoles roles={allRoles}><Ventas /></RequireRoles>} />
          <Route path="caja" element={<RequireRoles roles={staff}><CajaPage /></RequireRoles>} />
          <Route path="produccion" element={<RequireRoles roles={allRoles}><Produccion /></RequireRoles>} />
          <Route path="productos" element={<RequireRoles roles={adminAndDemo}><Productos /></RequireRoles>} />
          <Route path="insumos" element={<RequireRoles roles={adminAndDemo}><Insumos /></RequireRoles>} />
          <Route path="recetas" element={<RequireRoles roles={adminAndDemo}><Recetas /></RequireRoles>} />
          <Route path="compras" element={<RequireRoles roles={allRoles}><Compras /></RequireRoles>} />
          <Route path="clientes" element={<RequireRoles roles={staff}><Clientes /></RequireRoles>} />
          <Route path="pedidos" element={<RequireRoles roles={staff}><Pedidos /></RequireRoles>} />
          <Route path="repartos" element={<RequireRoles roles={staff}><Repartos /></RequireRoles>} />
          <Route path="finanzas" element={<RequireRoles roles={adminOnly}><Finanzas /></RequireRoles>} />
          <Route path="usuarios" element={<RequireRoles roles={adminOnly}><Usuarios /></RequireRoles>} />
          <Route path="listas-precio" element={<RequireRoles roles={adminAndDemo}><ListasPrecio /></RequireRoles>} />
          <Route path="stock" element={<RequireRoles roles={adminAndDemo}><Stock /></RequireRoles>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
