import React, { useState } from 'react';
import { ShoppingCart, CheckCircle, Truck, Package, Clock, X, Eye } from 'lucide-react';
import {
  useAdminOrderList,
  useAdminOrderDetail,
  useConfirmOrder,
  useUpdateOrderStatus,
} from '../../hooks/queries/useAdminOrders';
import type { AdminOrder } from '../../services/adminOrderService';

type StatusTab = 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered';

const STATUS_TABS: { id: StatusTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
];

const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = status?.toLowerCase();
  if (s === 'delivered')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
        <CheckCircle className="w-3 h-3" /> Delivered
      </span>
    );
  if (s === 'shipped')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <Truck className="w-3 h-3" /> Shipped
      </span>
    );
  if (s === 'confirmed')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200">
        <Package className="w-3 h-3" /> Confirmed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
      <Clock className="w-3 h-3" /> {status ?? 'Pending'}
    </span>
  );
};

const PaymentBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = status?.toLowerCase();
  const color =
    s === 'paid' || s === 'captured'
      ? 'bg-green-50 text-green-700 border-green-200'
      : s === 'failed'
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-slate-50 text-slate-600 border-slate-200';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
      {status ?? 'Pending'}
    </span>
  );
};

const OrderDetailModal: React.FC<{ orderId: string; onClose: () => void }> = ({
  orderId,
  onClose,
}) => {
  const { data: order, isLoading } = useAdminOrderDetail(orderId);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Order Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : order ? (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Order ID</p>
                <p className="font-medium text-slate-800 truncate">{order.id}</p>
              </div>
              <div>
                <p className="text-slate-500">Date</p>
                <p className="font-medium text-slate-800">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Customer</p>
                <p className="font-medium text-slate-800">
                  {order.customer?.name ?? 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Phone</p>
                <p className="font-medium text-slate-800">
                  {order.customer?.phone ?? 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Status</p>
                <OrderStatusBadge status={order.status} />
              </div>
              <div>
                <p className="text-slate-500">Payment</p>
                <PaymentBadge status={order.payment_status} />
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Items</p>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-slate-600">Product</th>
                        <th className="text-right px-3 py-2 font-medium text-slate-600">Qty</th>
                        <th className="text-right px-3 py-2 font-medium text-slate-600">Price</th>
                        <th className="text-right px-3 py-2 font-medium text-slate-600">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-3 py-2 text-slate-800">
                            {item.product?.name ?? item.product_id}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-600">{item.quantity}</td>
                          <td className="px-3 py-2 text-right text-slate-600">
                            ₹{(item.unit_price ?? 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-slate-800">
                            ₹{(item.total_price ?? 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="border-t border-slate-200 pt-4 text-sm space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{((order.total_amount ?? 0) - (order.shipping_charges ?? 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>₹{(order.shipping_charges ?? 0).toFixed(2)}</span>
              </div>
              {(order.discount_amount ?? 0) > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount</span>
                  <span>-₹{(order.discount_amount ?? 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-slate-900 text-base border-t border-slate-200 pt-2 mt-2">
                <span>Total</span>
                <span>₹{(order.total_amount ?? 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">Order not found</div>
        )}
      </div>
    </div>
  );
};

const AdminOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const statusFilter = activeTab === 'all' ? undefined : activeTab;
  const { data, isLoading } = useAdminOrderList(page, statusFilter);
  const confirmMutation = useConfirmOrder();

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingCart className="w-8 h-8" />
          <h2 className="text-3xl font-bold">Orders</h2>
        </div>
        <p className="text-slate-300">Manage and confirm customer orders</p>
      </div>

      {/* Tabs + Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-4 pt-2 gap-1">
          {STATUS_TABS.map((tab) => (
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
          <div className="text-center py-16 text-slate-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Order ID</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Payment</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order: AdminOrder) => {
                  const isPending =
                    !order.status || order.status.toLowerCase() === 'pending';
                  return (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 max-w-[120px] truncate">
                        {order.id}
                      </td>
                      <td className="px-4 py-3 text-slate-800">
                        {order.customer?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800">
                        ₹{(order.total_amount ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <PaymentBadge status={order.payment_status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedOrderId(order.id)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isPending && (
                            <button
                              onClick={() => confirmMutation.mutate(order.id)}
                              disabled={confirmMutation.isPending}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 disabled:opacity-50 transition-colors"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Confirm
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && (
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

      {/* Order detail modal */}
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
};

export default AdminOrders;
