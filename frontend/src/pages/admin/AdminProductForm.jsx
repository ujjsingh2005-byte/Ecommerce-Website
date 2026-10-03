import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Image, Sparkles } from 'lucide-react';
import api from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/common/Loader';

export const AdminProductForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('0');
  const [category, setCategory] = useState('Electronics');
  const [brand, setBrand] = useState('Generic');
  const [stock, setStock] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      const loadProduct = async () => {
        try {
          const res = await api.get(`/products/${id}`);
          if (res.success && res.data) {
            const p = res.data;
            setName(p.name);
            setDescription(p.description);
            setPrice(p.price.toString());
            setDiscountPercentage(p.discountPercentage?.toString() || '0');
            setCategory(p.category);
            setBrand(p.brand || 'Generic');
            setStock(p.stock.toString());
            setIsFeatured(!!p.isFeatured);
            setExistingImages(p.images || []);
            if (p.images && p.images.length > 0) {
              setImageUrlInput(p.images.join('\n'));
            }
          }
        } catch (err) {
          showError('Failed to load product details');
        } finally {
          setFetching(false);
        }
      };
      loadProduct();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !description || price === '' || stock === '') {
      showError('Please fill in all mandatory product fields.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('discountPercentage', discountPercentage);
      formData.append('category', category);
      formData.append('brand', brand);
      formData.append('stock', stock);
      formData.append('isFeatured', isFeatured.toString());

      // If files selected, append files
      if (imageFiles && imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          formData.append('images', imageFiles[i]);
        }
      } else if (imageUrlInput.trim()) {
        // Send image URLs as parsed array
        const urls = imageUrlInput.split('\n').map((u) => u.trim()).filter(Boolean);
        urls.forEach((url) => formData.append('images', url));
      }

      let res;
      if (isEditMode) {
        res = await api.put(`/products/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.success) {
        success(`Product ${isEditMode ? 'updated' : 'created'} successfully!`);
        navigate('/admin/products');
      }
    } catch (err) {
      showError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <Loader message="Fetching product configuration..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h2 className="text-xl font-extrabold text-slate-900">
            {isEditMode ? 'Edit Product Catalog Item' : 'Create New Product'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        
        {/* Product Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Product Title *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sony WH-1000XM5 Wireless Noise-Cancelling Headphones"
            className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        {/* Category, Brand, Price, Discount, Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Category *
            </label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Electronics, Audio, Wearables"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Brand / Manufacturer
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Sony, Apple, Nike"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Base Price (₹) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="2999"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Discount Percentage (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              placeholder="10"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Inventory Stock Count *
            </label>
            <input
              type="number"
              required
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="25"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Featured Product
              </span>
            </label>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Detailed Description *
          </label>
          <textarea
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write complete product specifications, features, and warranty details..."
            className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        {/* Images Upload / URLs */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase">
            Product Images
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Direct URL Inputs */}
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">
                Image Web URLs (One URL per line):
              </span>
              <textarea
                rows={3}
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full p-2.5 text-xs font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {/* File Upload Box */}
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">
                Or Upload File Images (Max 5MB each):
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImageFiles(e.target.files)}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Product...' : isEditMode ? 'Update Product' : 'Create Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
