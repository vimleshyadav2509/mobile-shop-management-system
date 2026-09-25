import React, { useState, useMemo, useRef } from 'react';
import {
  Smartphone,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Package,
  Layers,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
  RefreshCw,
  Check
} from 'lucide-react';
import { uploadProductImage } from '../../services/api';

const CATEGORIES = ['Smartphones', 'Tablets', 'Feature Phones', 'Accessories'];

export default function ProductsManager({
  products = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  searchQuery = '',
  setSearchQuery = () => {}
}) {
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStockFilter, setSelectedStockFilter] = useState('all');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [uploadErrorMsg, setUploadErrorMsg] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  // Custom Delete Modal State
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fileInputRef = useRef(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('Samsung');
  const [formModel, setFormModel] = useState('');
  const [formCategory, setFormCategory] = useState('Smartphones');
  const [formVariant, setFormVariant] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formCondition, setFormCondition] = useState('new');
  const [formRamStorage, setFormRamStorage] = useState('8GB / 128GB');
  const [formColor, setFormColor] = useState('');
  const [formBatteryHealth, setFormBatteryHealth] = useState('');
  const [formWarrantyInfo, setFormWarrantyInfo] = useState('Shop Warranty Included');
  const [formStock, setFormStock] = useState(true);
  const [formStockCount, setFormStockCount] = useState('5');
  const [formStockStatus, setFormStockStatus] = useState('AUTO');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formEmiBajaj, setFormEmiBajaj] = useState(true);
  const [formEmiTvs, setFormEmiTvs] = useState(true);
  const [formEmiSamsung, setFormEmiSamsung] = useState(true);
  const [formError, setFormError] = useState('');

  // Extract unique brands from catalogue
  const brands = useMemo(() => {
    const list = new Set(products.map((p) => p.brand).filter(Boolean));
    return ['all', ...Array.from(list)];
  }, [products]);

  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.model && p.model.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));

      const matchesBrand =
        selectedBrand === 'all' || (p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase());

      const matchesCondition =
        selectedCondition === 'all' ||
        (selectedCondition === 'new' && p.condition === 'new') ||
        (selectedCondition === 'refurbished' && p.condition !== 'new');

      const matchesCategory =
        selectedCategory === 'all' ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

      const matchesStock =
        selectedStockFilter === 'all' ||
        (selectedStockFilter === 'in_stock' && p.in_stock) ||
        (selectedStockFilter === 'out_of_stock' && !p.in_stock);

      return matchesSearch && matchesBrand && matchesCondition && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, selectedBrand, selectedCondition, selectedCategory, selectedStockFilter]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormBrand('Samsung');
    setFormModel('');
    setFormCategory('Smartphones');
    setFormVariant('');
    setFormPrice('');
    setFormOriginalPrice('');
    setFormCondition('new');
    setFormRamStorage('8GB / 128GB');
    setFormColor('Black');
    setFormBatteryHealth('100%');
    setFormWarrantyInfo('1 Year Official Brand Warranty');
    setFormStock(true);
    setFormStockCount('5');
    setFormStockStatus('AUTO');
    setFormImageUrl('https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80');
    setFormDescription('');
    setFormEmiBajaj(true);
    setFormEmiTvs(true);
    setFormEmiSamsung(true);
    setFormError('');
    setUploadSuccessMsg('');
    setUploadErrorMsg('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormName(p.title || '');
    setFormBrand(p.brand || 'Samsung');
    setFormModel(p.model || '');
    setFormCategory(p.category || 'Smartphones');
    setFormVariant(p.variant || '');
    setFormPrice(p.price ? String(p.price) : '');
    setFormOriginalPrice(p.original_price ? String(p.original_price) : '');
    setFormCondition(p.condition || 'new');
    setFormRamStorage(p.ram_storage || '8GB / 128GB');
    setFormColor(p.color || '');
    setFormBatteryHealth(p.battery_health || (p.condition === 'new' ? '100%' : '90%'));
    setFormWarrantyInfo(p.warranty_info || (p.condition === 'new' ? '1 Year Official Brand Warranty' : '6 Months Shop Warranty'));
    setFormStock(p.in_stock !== false);
    setFormStockCount(p.stock_count !== undefined ? String(p.stock_count) : (p.in_stock ? '5' : '0'));
    setFormStockStatus(p.stock_status || 'AUTO');
    setFormImageUrl(p.image_url || '');
    setFormDescription(p.description || '');
    setFormEmiBajaj(p.emi_bajaj !== false);
    setFormEmiTvs(p.emi_tvs !== false);
    setFormEmiSamsung(p.emi_samsung !== false);
    setFormError('');
    setUploadSuccessMsg('');
    setUploadErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleImageFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError('');
    setUploadSuccessMsg('');
    setUploadErrorMsg('');
    try {
      const res = await uploadProductImage(file);
      if (res && res.url) {
        setFormImageUrl(res.url);
        setUploadSuccessMsg('Image uploaded successfully! (Saved to catalogue)');
      }
    } catch (err) {
      const errorText = err.message || 'Image upload failed. Please try a valid image under 5MB.';
      setUploadErrorMsg(errorText);
      setFormError(errorText);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim() || !formPrice) {
      setFormError('Please enter product title and price.');
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError('Please enter a valid non-negative selling price in Rupees.');
      return;
    }

    const countNum = parseInt(formStockCount, 10);
    const stockCountVal = isNaN(countNum) || countNum < 0 ? 0 : countNum;

    const payload = {
      title: formName.trim(),
      brand: formBrand,
      model: formModel.trim() || formName.trim(),
      category: formCategory,
      variant: formVariant.trim() || null,
      price: priceNum,
      original_price: formOriginalPrice ? parseFloat(formOriginalPrice) : null,
      condition: formCondition,
      ram_storage: formRamStorage || 'Standard Specs',
      color: formColor || 'Standard',
      battery_health: formBatteryHealth || (formCondition === 'new' ? '100%' : '88%'),
      warranty_info: formWarrantyInfo || (formCondition === 'new' ? '1 Year Official Brand Warranty' : '6 Months Shop Warranty'),
      in_stock: Boolean(formStock) && stockCountVal > 0,
      stock_count: stockCountVal,
      stock_status: formStockStatus === 'AUTO' ? null : formStockStatus,
      image_url: formImageUrl || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
      description: formDescription || `${formBrand} ${formName.trim()} with Amit Mobile Shop warranty & finance options.`,
      emi_bajaj: formEmiBajaj,
      emi_tvs: formEmiTvs,
      emi_samsung: formEmiSamsung
    };

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await onUpdateProduct({ ...payload, id: editingProduct.id });
      } else {
        await onAddProduct(payload);
      }
      setIsAddModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to persist product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStock = async (productId, currentStatus) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    setTogglingId(productId);
    try {
      const nextStatus = !currentStatus;
      await onUpdateProduct({
        ...target,
        in_stock: nextStatus,
        stock_count: nextStatus ? (target.stock_count > 0 ? target.stock_count : 5) : 0
      });
    } catch (err) {
      console.error('Quick stock toggle failed:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDeleteProduct(productToDelete.id);
      setProductToDelete(null);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete product from database.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedBrand('all');
    setSelectedCondition('all');
    setSelectedCategory('all');
    setSelectedStockFilter('all');
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-card-fade">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] tracking-tight">
            Products & Inventory Management
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'device' : 'devices'} displayed • Synced with customer storefront
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="admin-btn-primary w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card p-3 sm:p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, brand, model, specs..."
              className="admin-input pl-9 text-xs"
            />
          </div>

          {/* Brand Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="admin-input py-2 text-xs w-full"
            >
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b === 'all' ? 'All Brands' : b}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="admin-input py-2 text-xs w-full"
            >
              <option value="all">All Conditions</option>
              <option value="new">Brand New</option>
              <option value="refurbished">Certified Pre-Owned</option>
            </select>
          </div>

          {/* Stock Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedStockFilter}
              onChange={(e) => setSelectedStockFilter(e.target.value)}
              className="admin-input py-2 text-xs w-full"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock (Available)</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Content List */}
      {filteredProducts.length === 0 ? (
        <div className="admin-card p-8 sm:p-12 text-center text-[var(--muted-foreground)]">
          <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-500" />
          <p className="text-sm font-semibold text-[var(--foreground)]">No products match current filters</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Try adjusting your search query or filter selections.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-[var(--card-elevated)] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Management Table (>= 768px) */}
          <div className="hidden md:block admin-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[var(--table-header-bg)] text-[var(--muted-foreground)] border-b border-[var(--border)]">
                    <th className="py-3 px-4 font-semibold">Image</th>
                    <th className="py-3 px-4 font-semibold">Product Title & Specs</th>
                    <th className="py-3 px-4 font-semibold">Brand / Category</th>
                    <th className="py-3 px-4 font-semibold">Condition</th>
                    <th className="py-3 px-4 font-semibold">Selling Price</th>
                    <th className="py-3 px-4 font-semibold">Stock Qty</th>
                    <th className="py-3 px-4 font-semibold">Shelf Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-[var(--card-hover)] transition-colors">
                      <td className="py-3 px-4">
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-11 h-11 rounded-xl object-contain bg-white/5 border border-[var(--border)] p-0.5"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80";
                          }}
                        />
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-bold text-[var(--foreground)] line-clamp-1">{product.title}</p>
                        <p className="text-[11px] text-[var(--muted-foreground)]">
                          {product.ram_storage || 'Standard Specs'} • {product.color || 'Standard'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[var(--foreground)] block">{product.brand}</span>
                        <span className="text-[10px] text-[var(--muted-foreground)]">{product.category || 'Smartphones'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          product.condition === 'new'
                            ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                            : 'bg-teal-500/10 text-teal-500 border-teal-500/20'
                        }`}>
                          {product.condition === 'new' ? 'Brand New' : 'Certified Refurb'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[var(--foreground)] font-bold block">
                          ₹{Number(product.price)?.toLocaleString()}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-[10px] text-[var(--muted-foreground)] line-through">
                            ₹{Number(product.original_price)?.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[var(--muted-foreground)] font-medium">
                        {product.stock_count !== undefined ? `${product.stock_count} units` : (product.in_stock ? 'In Stock' : '0 units')}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          disabled={togglingId === product.id}
                          onClick={() => handleToggleStock(product.id, product.in_stock)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                            product.in_stock
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20'
                          } ${togglingId === product.id ? 'opacity-50 cursor-wait' : ''}`}
                          title="Click to toggle stock status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${product.in_stock ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span>{product.in_stock ? 'In Stock' : 'Out of Stock'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            className="p-2 rounded-lg text-[var(--muted-foreground)] hover:text-indigo-500 hover:bg-[var(--card-hover)] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="Edit product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setProductToDelete(product);
                              setDeleteError(null);
                            }}
                            className="p-2 rounded-lg text-[var(--muted-foreground)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Product Cards (< 768px, 44px+ touch targets) */}
          <div className="md:hidden space-y-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="admin-card p-4 flex flex-col gap-3 relative overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-16 h-16 rounded-xl object-contain bg-white/5 border border-[var(--border)] p-1 shrink-0"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] uppercase font-extrabold text-indigo-500 tracking-wider">
                        {product.brand}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        product.condition === 'new'
                          ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                          : 'bg-teal-500/10 text-teal-500 border-teal-500/20'
                      }`}>
                        {product.condition === 'new' ? 'New' : 'Refurb'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[var(--foreground)] truncate mt-0.5">
                      {product.title}
                    </h3>

                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      {product.ram_storage || 'Standard Specs'} • {product.category || 'Smartphones'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs">
                  <div>
                    <span className="text-base font-extrabold text-[var(--foreground)]">
                      ₹{Number(product.price)?.toLocaleString()}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-[10px] text-[var(--muted-foreground)] line-through ml-1.5">
                        ₹{Number(product.original_price)?.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--muted-foreground)]">
                      Qty: <span className="text-[var(--foreground)] font-semibold">{product.stock_count !== undefined ? product.stock_count : (product.in_stock ? '5' : '0')}</span>
                    </span>

                    <button
                      type="button"
                      disabled={togglingId === product.id}
                      onClick={() => handleToggleStock(product.id, product.in_stock)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border min-h-[32px] ${
                        product.in_stock
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      } ${togglingId === product.id ? 'opacity-50' : ''}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${product.in_stock ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span>{product.in_stock ? 'In Stock' : 'Out'}</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Action Buttons (44px min touch target) */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(product)}
                    className="admin-btn-secondary min-h-[44px] text-xs flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-4 h-4 text-indigo-500" />
                    <span>Edit Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProductToDelete(product);
                      setDeleteError(null);
                    }}
                    className="min-h-[44px] p-2.5 rounded-xl bg-[var(--card-elevated)] text-[var(--muted-foreground)] hover:text-rose-500 hover:bg-rose-500/10 border border-[var(--border)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="admin-card w-full max-w-xl p-5 sm:p-6 shadow-2xl relative animate-card-fade max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)]">
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  {editingProduct ? 'Edit Product Details' : 'Add New Product to Store'}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Configure catalogue details, pricing, inventory stock, and financing
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              {/* Title / Name */}
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                  Product Title / Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Samsung Galaxy S24 Ultra 5G"
                  className="admin-input"
                />
              </div>

              {/* Brand, Model, Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Brand *
                  </label>
                  <select
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="admin-input"
                  >
                    <option value="Samsung">Samsung</option>
                    <option value="Vivo">Vivo</option>
                    <option value="Apple">Apple</option>
                    <option value="OnePlus">OnePlus</option>
                    <option value="Realme">Realme</option>
                    <option value="Xiaomi">Xiaomi / Redmi</option>
                    <option value="Oppo">Oppo</option>
                    <option value="Motorola">Motorola</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Model
                  </label>
                  <input
                    type="text"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="e.g. S24 Ultra"
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="admin-input"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Condition & RAM/Storage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Condition *
                  </label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value)}
                    className="admin-input"
                  >
                    <option value="new">Brand New (Box Pack / Sealed)</option>
                    <option value="like_new">Certified Refurbished (Like New)</option>
                    <option value="good">Pre-Owned (Good Condition)</option>
                    <option value="fair">Budget Pre-Owned (Fair Condition)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    RAM / Storage
                  </label>
                  <input
                    type="text"
                    value={formRamStorage}
                    onChange={(e) => setFormRamStorage(e.target.value)}
                    placeholder="e.g. 12GB / 256GB"
                    className="admin-input"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="e.g. 41999"
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Original Price / MRP (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    placeholder="e.g. 46999 (for discount badge)"
                    className="admin-input"
                  />
                </div>
              </div>

              {/* Color, Battery Health, Warranty */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Color Variant
                  </label>
                  <input
                    type="text"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    placeholder="e.g. Andaman Blue"
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Battery Health
                  </label>
                  <input
                    type="text"
                    value={formBatteryHealth}
                    onChange={(e) => setFormBatteryHealth(e.target.value)}
                    placeholder="e.g. 100% or 92%"
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Warranty Info
                  </label>
                  <input
                    type="text"
                    value={formWarrantyInfo}
                    onChange={(e) => setFormWarrantyInfo(e.target.value)}
                    placeholder="e.g. 1 Year Official Brand Warranty"
                    className="admin-input"
                  />
                </div>
              </div>

              {/* Device Variant / Edition */}
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                  Device Variant / Edition (Optional)
                </label>
                <input
                  type="text"
                  value={formVariant}
                  onChange={(e) => setFormVariant(e.target.value)}
                  placeholder="e.g. 5G Indian Retail, Global Edition, Titanium Special"
                  className="admin-input"
                />
              </div>

              {/* Stock Quantity, Status Override & Shelf Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-[var(--card-elevated)] border border-[var(--border)]">
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Stock Quantity (Units)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formStockCount}
                    onChange={(e) => setFormStockCount(e.target.value)}
                    placeholder="e.g. 5"
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Stock Status Control
                  </label>
                  <select
                    value={formStockStatus}
                    onChange={(e) => setFormStockStatus(e.target.value)}
                    className="admin-input text-xs"
                  >
                    <option value="AUTO">Auto Calculate (from units)</option>
                    <option value="IN STOCK">IN STOCK (&gt;5)</option>
                    <option value="LOW STOCK">LOW STOCK (1-5)</option>
                    <option value="OUT OF STOCK">OUT OF STOCK (0)</option>
                    <option value="COMING SOON">COMING SOON</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formStock}
                      onChange={(e) => setFormStock(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded bg-[var(--input-bg)] border-[var(--border)] focus:ring-indigo-500"
                    />
                    <span>Available on Shelf</span>
                  </label>
                </div>
              </div>

              {/* Image Handling (URL or Local Counter Upload) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[var(--foreground)]">
                  Product Image (URL or Counter Photo)
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or upload below"
                    className="admin-input flex-1"
                  />
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileSelected}
                    accept="image/*"
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="admin-btn-secondary px-3 flex items-center gap-1.5 whitespace-nowrap min-h-[42px]"
                    title="Upload photo from mobile counter or storage"
                  >
                    {uploadingImage ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                    ) : (
                      <Upload className="w-4 h-4 text-indigo-500" />
                    )}
                    <span className="text-xs font-bold">{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                  </button>
                </div>

                {uploadSuccessMsg && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-card-fade">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{uploadSuccessMsg}</span>
                  </div>
                )}

                {uploadErrorMsg && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold animate-card-fade">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{uploadErrorMsg}</span>
                  </div>
                )}

                {formImageUrl && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-[var(--border)]">
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      className="w-12 h-12 object-contain rounded-lg border border-[var(--border)] bg-white/5"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80";
                      }}
                    />
                    <div className="text-[11px] text-[var(--muted-foreground)] truncate flex-1">
                      <span className="font-semibold text-[var(--foreground)] block">Image Preview</span>
                      <span className="truncate block">{formImageUrl}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                  Description / Counter Notes
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Key features, condition assessment, included accessories in box..."
                  className="admin-input py-2 text-xs"
                />
              </div>

              {/* EMI Eligibility Flags */}
              <div className="pt-2 border-t border-[var(--border)]">
                <span className="block text-xs font-semibold text-[var(--foreground)] mb-2">
                  Finance & EMI Eligibility (Displayed to Customer)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-[var(--card-elevated)] border border-[var(--border)] text-[11px] font-medium text-[var(--foreground)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formEmiBajaj}
                      onChange={(e) => setFormEmiBajaj(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Bajaj 0%</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-[var(--card-elevated)] border border-[var(--border)] text-[11px] font-medium text-[var(--foreground)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formEmiTvs}
                      onChange={(e) => setFormEmiTvs(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>TVS Credit</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-[var(--card-elevated)] border border-[var(--border)] text-[11px] font-medium text-[var(--foreground)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formEmiSamsung}
                      onChange={(e) => setFormEmiSamsung(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Samsung+</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[var(--border)] flex gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddModalOpen(false)}
                  className="admin-btn-secondary flex-1 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="admin-btn-primary flex-1 min-h-[44px] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{editingProduct ? 'Updating...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <span>{editingProduct ? 'Update Product' : 'Save Product'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-card-fade">
          <div className="admin-card w-full max-w-md p-5 sm:p-6 shadow-2xl relative border-2 border-rose-500/30">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  Delete Product?
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
                  Are you sure you want to permanently delete{' '}
                  <strong className="text-[var(--foreground)]">"{productToDelete.title}"</strong> from the store catalogue?
                  This product will be removed from both the admin dashboard and customer Buying Hub.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setProductToDelete(null);
                  setDeleteError(null);
                }}
                className="admin-btn-secondary flex-1 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Product</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
