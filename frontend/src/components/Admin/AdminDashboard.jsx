import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchAdminStats,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchRepairs,
  updateRepairStatus,
  createRepairTicket
} from '../../services/api';
import { INITIAL_PRODUCTS, MOCK_REPAIRS } from '../../data/mockData';
import AdminLayout from './AdminLayout';
import DashboardOverview from './DashboardOverview';
import ProductsManager from './ProductsManager';
import RepairsManager from './RepairsManager';
import InventoryManager from './InventoryManager';
import EmiManager from './EmiManager';
import SettingsManager from './SettingsManager';
import WhatsAppInquiriesManager from './WhatsAppInquiriesManager';
import SalesAnalyticsManager from './SalesAnalyticsManager';

export default function AdminDashboard() {
  const { admin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Live Stats
  const [stats, setStats] = useState({
    total_products: 0,
    in_stock_products: 0,
    total_repairs: 0,
    pending_repairs: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Products Data
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Repairs Data
  const [repairs, setRepairs] = useState(() => Object.values(MOCK_REPAIRS));

  // Load live stats from backend API
  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err) {
      console.warn('[Admin] Live stats API failed, calculating local fallback metrics:', err);
      // Fallback metrics calculated from local state
      const inStock = products.filter((p) => p.in_stock).length;
      const pending = repairs.filter(
        (r) => !['delivered', 'cancelled'].includes((r.status || '').toLowerCase())
      ).length;
      setStats({
        total_products: products.length,
        in_stock_products: inStock,
        total_repairs: repairs.length,
        pending_repairs: pending
      });
    } finally {
      setLoadingStats(false);
    }
  };

  // Load all products from API for admin view
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const prods = await fetchProducts(null, null, true);
      if (Array.isArray(prods) && prods.length > 0) {
        setProducts(prods);
      }
    } catch (err) {
      console.warn('[Admin] Products fetch fallback:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Load all repairs from API for admin view
  const loadRepairs = async () => {
    try {
      const data = await fetchRepairs();
      if (Array.isArray(data) && data.length > 0) {
        setRepairs(data);
      }
    } catch (err) {
      console.warn('[Admin] Repairs fetch fallback:', err);
    }
  };

  useEffect(() => {
    loadStats();
    loadProducts();
    loadRepairs();
  }, []);

  // Handlers for product management connected to backend CRUD
  const handleAddProduct = async (newProdData) => {
    const created = await createProduct(newProdData);
    setProducts((prev) => [created, ...prev]);
    loadStats();
    return created;
  };

  const handleUpdateProduct = async (updatedProdData) => {
    const updated = await updateProduct(updatedProdData.id, updatedProdData);
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    loadStats();
    return updated;
  };

  const handleDeleteProduct = async (productId) => {
    await deleteProduct(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    loadStats();
  };

  // Handlers for repairs management connected to backend API
  const handleUpdateRepairStatus = async (jobSheetId, newStatus, technicianNotes) => {
    const updated = await updateRepairStatus(jobSheetId, newStatus, technicianNotes);
    setRepairs((prev) =>
      prev.map((r) =>
        r.job_sheet_id === updated.job_sheet_id || r.id === updated.id ? updated : r
      )
    );
    loadStats();
    return updated;
  };

  const handleCreateRepairJob = async (newJob) => {
    try {
      const created = await createRepairTicket(newJob);
      setRepairs((prev) => [created, ...prev]);
      loadStats();
      return created;
    } catch (err) {
      console.warn('[Admin] Create repair ticket error:', err);
      setRepairs((prev) => [newJob, ...prev]);
      loadStats();
    }
  };

  const handleRefreshAll = () => {
    loadStats();
    loadProducts();
    loadRepairs();
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      admin={admin}
      logout={logout}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      showSearch={true}
      onRefresh={handleRefreshAll}
      loadingStats={loadingStats}
    >
      {activeTab === 'dashboard' && (
        <DashboardOverview
          admin={admin}
          stats={stats}
          loadingStats={loadingStats}
          onRefresh={loadStats}
          products={products}
          repairs={repairs}
          onNavigateTab={setActiveTab}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {activeTab === 'inventory' && (
        <InventoryManager
          products={products}
          onUpdateProduct={handleUpdateProduct}
        />
      )}

      {activeTab === 'emi' && <EmiManager />}

      {activeTab === 'inquiries' && <WhatsAppInquiriesManager />}

      {activeTab === 'analytics' && <SalesAnalyticsManager />}

      {activeTab === 'products' && (
        <ProductsManager
          products={products}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {activeTab === 'repairs' && (
        <RepairsManager
          repairs={repairs}
          onUpdateRepairStatus={handleUpdateRepairStatus}
          onCreateRepairJob={handleCreateRepairJob}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {activeTab === 'settings' && <SettingsManager admin={admin} />}
    </AdminLayout>
  );
}
