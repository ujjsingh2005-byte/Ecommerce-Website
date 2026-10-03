import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import api from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/common/Loader';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteProductTarget, setDeleteProductTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { success, error: showError } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products?limit=100${search ? `&search=${encodeURIComponent(search)}` : ''}`);
      if (res.success && res.data) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleDeleteConfirm = async () => {
    if (!deleteProductTarget) return;

    try {
      setDeleting(true);
      const res = await api.delete(`/products/${deleteProductTarget._id}`);
      if (res.success) {
        success(`Product '${deleteProductTarget.name}' deleted successfully.`);
        setDeleteProductTarget(null);
        fetchProducts();
      }
    } catch (err) {
      showError(err.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Product Inventory</h2>
          <p className="text-xs text-slate-500">Manage catalog listings, prices, and stock reserves</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/30"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <Link
            to="/admin/products/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Product Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8">
            <Loader message="Loading catalog..." />
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No products found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-4">Product Info</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock Level</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => {
                  const isOutOfStock = prod.stock <= 0;
                  const isLowStock = prod.stock > 0 && prod.stock <= 5;

                  return (
                    <tr key={prod._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-50 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 line-clamp-1">{prod.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono">Brand: {prod.brand}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-100 text-slate-700">
                          {prod.category}
                        </span>
                      </td>

                      <td className="p-4 font-bold text-slate-900">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </td>

                      <td className="p-4">
                        {isOutOfStock ? (
                          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                            Out of Stock (0)
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            Low Stock ({prod.stock})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            In Stock ({prod.stock})
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {prod.discountPercentage > 0 ? (
                          <span className="font-bold text-rose-600">{prod.discountPercentage}% OFF</span>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/products/${prod._id}`}
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/admin/products/${prod._id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => setDeleteProductTarget(prod)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Product Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteProductTarget}
        title="Delete Product from Store"
        message={`Are you sure you want to permanently delete "${deleteProductTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteProductTarget(null)}
      />
    </div>
  );
};
