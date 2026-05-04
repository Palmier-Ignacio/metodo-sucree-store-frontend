import { Route, Routes } from 'react-router-dom'
import StoreLayout from './layouts/StoreLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Checkout from './pages/Checkout'
import Success from './pages/Success'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductForm from './pages/admin/AdminProductForm'
import AdminUsers from './pages/admin/AdminUsers'
import AdminUserDetail from './pages/admin/AdminUserDetail'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOrderDetail from './pages/admin/AdminOrderDetail'
import AdminRevenue from './pages/admin/AdminRevenue'
import AdminBanners from './pages/admin/AdminBanners'

export default function App() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tienda" element={<Catalog />} />
        <Route path="/producto/:id" element={<Product />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/biblioteca" element={<Profile />} />
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="productos" element={<AdminProducts />} />
              <Route path="productos/nuevo" element={<AdminProductForm />} />
              <Route path="productos/:id/editar" element={<AdminProductForm />} />
              <Route path="usuarios" element={<AdminUsers />} />
              <Route path="usuarios/:id" element={<AdminUserDetail />} />
              <Route path="ordenes" element={<AdminOrders />} />
              <Route path="ordenes/:id" element={<AdminOrderDetail />} />
              <Route path="ingresos" element={<AdminRevenue />} />
              <Route path="banners" element={<AdminBanners />} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
