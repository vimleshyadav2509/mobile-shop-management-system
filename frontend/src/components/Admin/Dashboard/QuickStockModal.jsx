import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Check, 
  IndianRupee
} from 'lucide-react';
import { SUPPORTED_MOBILE_BRANDS } from '../../../data/mockData';

const BRANDS = SUPPORTED_MOBILE_BRANDS;
const STORAGE_OPTIONS = ['6GB / 128GB', '8GB / 128GB', '8GB / 256GB', '12GB / 256GB', '16GB / 512GB'];

export default function QuickStockModal({ isOpen, onClose, onAddProduct }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    brand: 'Samsung',
    model: '',
    title: '',
    condition: 'new',
    ram_storage: '8GB / 128GB',
    price: '',
    original_price: '',
    stock_count: 5,
    color: 'Black',
    emi_bajaj: true,
    emi_tvs: true,
    emi_samsung: true,
    image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
    description: ''
  });

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'model' || field === 'brand') {
        const brand = field === 'brand' ? value : prev.brand;
        const model = field === 'model' ? value : prev.model;
        if (model) {
          next.title = `${brand} ${model}`;
        }
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.model || !formData.price) return;

    setLoading(true);
    try {
      await onAddProduct({
        ...formData,
        price: Number(formData.price),
        original_price: formData.original_price ? Number(formData.original_price) : Number(formData.price) * 1.1,
        stock_count: Number(formData.stock_count),
        in_stock: Number(formData.stock_count) > 0,
        description: formData.description || `Official ${formData.brand} ${formData.model} with shop warranty and 0% EMI.`
      });
      onClose();
    } catch (err) {
      console.error('Failed to create product:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
      >
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary-400" />
            <h3 className="text-sm font-bold text-white font-['Poppins']">
              Quick Mobile Stock Entry
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto text-xs">
          
          {/* Brand & Model */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Brand</label>
              <select
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                {BRANDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Model Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Galaxy S24 Ultra"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>
          </div>

          {/* Full Title & Condition */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-medium text-slate-300 mb-1">Full Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Product title"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => handleChange('condition', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value="new">Brand New</option>
                <option value="like_new">Like New</option>
                <option value="good">Used</option>
              </select>
            </div>
          </div>

          {/* RAM/Storage & Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-medium text-slate-300 mb-1">Variant</label>
              <select
                value={formData.ram_storage}
                onChange={(e) => handleChange('ram_storage', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                {STORAGE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Stock Units</label>
              <input
                type="number"
                min="0"
                value={formData.stock_count}
                onChange={(e) => handleChange('stock_count', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>
          </div>

          {/* Price & MSRP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Selling Price (₹)</label>
              <input
                type="number"
                required
                placeholder="39999"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Original MSRP (₹)</label>
              <input
                type="number"
                placeholder="44999"
                value={formData.original_price}
                onChange={(e) => handleChange('original_price', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>
          </div>

          {/* EMI Checkboxes */}
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="block font-medium text-slate-300 mb-1.5">
              Finance Eligibility
            </span>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.emi_bajaj}
                  onChange={(e) => handleChange('emi_bajaj', e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-primary-600"
                />
                <span>Bajaj</span>
              </label>

              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.emi_tvs}
                  onChange={(e) => handleChange('emi_tvs', e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-primary-600"
                />
                <span>TVS</span>
              </label>

              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.emi_samsung}
                  onChange={(e) => handleChange('emi_samsung', e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-primary-600"
                />
                <span>Samsung+</span>
              </label>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">Image URL</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => handleChange('image_url', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-primary-700 hover:bg-primary-600 text-white text-xs font-semibold"
            >
              {loading ? 'Saving...' : 'Add Product'}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
