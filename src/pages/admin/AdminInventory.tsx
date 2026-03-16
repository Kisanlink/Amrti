import React, { useState } from 'react';
import { Layers, RefreshCw, AlertTriangle, XCircle, CheckCircle, X } from 'lucide-react';
import {
  useAdminInventoryList,
  useLowStockInventory,
  useOutOfStockInventory,
  useRestock,
} from '../../hooks/queries/useAdminInventory';
import type { InventoryItem } from '../../services/inventoryService';

type Tab = 'all' | 'low' | 'out';

const StatusBadge: React.FC<{ status: InventoryItem['stock_status'] }> = ({ status }) => {
  switch (status) {
    case 'In Stock':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          In Stock
        </span>
      );
    case 'Low Stock':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Low Stock
        </span>
      );
    case 'Out of Stock':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Out of Stock
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
          {status}
        </span>
      );
  }
};

const RestockModal: React.FC<{
  item: InventoryItem;
  onClose: () => void;
}> = ({ item, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const restockMutation = useRestock();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;
    await restockMutation.mutateAsync({ productId: item.product_id, quantity });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Restock Product</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-slate-600 mb-1">
          Product: <span className="font-medium">{item.product?.name ?? item.product_id}</span>
        </p>
        <p className="text-sm text-slate-600 mb-4">
          Current stock: <span className="font-medium">{item.current_stock}</span>
        </p>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Quantity to add
          </label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 mb-4"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={restockMutation.isPending}
              className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
            >
              {restockMutation.isPending ? 'Restocking...' : 'Restock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InventoryTable: React.FC<{
  items: InventoryItem[];
  onRestock: (item: InventoryItem) => void;
}> = ({ items, onRestock }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Layers className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p>No inventory records found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left px-4 py-3 font-medium text-slate-600">Product</th>
            <th className="text-right px-4 py-3 font-medium text-slate-600">Current</th>
            <th className="text-right px-4 py-3 font-medium text-slate-600">Reserved</th>
            <th className="text-right px-4 py-3 font-medium text-slate-600">Available</th>
            <th className="text-center px-4 py-3 font-medium text-slate-600">Status</th>
            <th className="text-right px-4 py-3 font-medium text-slate-600">Min Level</th>
            <th className="text-right px-4 py-3 font-medium text-slate-600">Reorder At</th>
            <th className="text-center px-4 py-3 font-medium text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-800">
                {item.product?.name ?? item.product_id}
              </td>
              <td className="px-4 py-3 text-right text-slate-700">{item.current_stock}</td>
              <td className="px-4 py-3 text-right text-slate-500">{item.reserved_stock}</td>
              <td className="px-4 py-3 text-right font-medium text-slate-800">
                {item.current_stock - item.reserved_stock}
              </td>
              <td className="px-4 py-3 text-center">
                <StatusBadge status={item.stock_status} />
              </td>
              <td className="px-4 py-3 text-right text-slate-500">{item.min_stock_level}</td>
              <td className="px-4 py-3 text-right text-slate-500">{item.reorder_point}</td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => onRestock(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Restock
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AdminInventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [page, setPage] = useState(1);
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);

  const { data: allData, isLoading: allLoading } = useAdminInventoryList(page, 20);
  const { data: lowData, isLoading: lowLoading } = useLowStockInventory();
  const { data: outData, isLoading: outLoading } = useOutOfStockInventory();

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'low', label: 'Low Stock' },
    { id: 'out', label: 'Out of Stock' },
  ];

  const currentItems: InventoryItem[] =
    activeTab === 'all'
      ? allData?.inventory ?? []
      : activeTab === 'low'
      ? lowData ?? []
      : outData ?? [];

  const isLoading =
    activeTab === 'all' ? allLoading : activeTab === 'low' ? lowLoading : outLoading;

  const pagination = activeTab === 'all' ? allData?.pagination : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Layers className="w-8 h-8" />
          <h2 className="text-3xl font-bold">Inventory</h2>
        </div>
        <p className="text-slate-300">Manage product stock levels and reorder points</p>
      </div>

      {/* Tabs + Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 px-4 pt-2 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-slate-900 border-b-2 border-slate-800'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-slate-500">Loading inventory...</div>
        ) : (
          <InventoryTable items={currentItems} onRestock={setRestockItem} />
        )}

        {/* Pagination (all tab only) */}
        {activeTab === 'all' && pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Total: <span className="font-medium">{pagination.total}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.has_more}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Restock modal */}
      {restockItem && (
        <RestockModal item={restockItem} onClose={() => setRestockItem(null)} />
      )}
    </div>
  );
};

export default AdminInventory;
