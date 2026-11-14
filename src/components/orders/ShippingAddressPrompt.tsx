import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, AlertTriangle } from 'lucide-react';
import { OrderService, type Order, type ShippingAddressPayload } from '../../services/orderService';
import { useNotification } from '../../context/NotificationContext';

interface ShippingAddressPromptProps {
  order: Order;
  /** Called after a successful submit (or a 409) so the parent can refetch the order. */
  onUpdated: () => void;
}

type FormState = {
  name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
};

const emptyForm: FormState = {
  name: '',
  phone: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  postal_code: '',
};

/**
 * Shown on a paid order that is stuck in needs_manual_fulfillment because no
 * deliverable address was captured at payment time. Lets the authenticated owner
 * supply the shipping address, which re-drives fulfillment on the backend.
 */
const ShippingAddressPrompt: React.FC<ShippingAddressPromptProps> = ({ order, onUpdated }) => {
  const { showNotification } = useNotification();
  const [form, setForm] = useState<FormState>({ ...emptyForm });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  // Server-side submission error (an HTTP 400 field correction, or a request/transport failure).
  // Kept separate from the per-field `errors` (client-side validation) and rendered beside the form
  // so the server's correction detail stays visible after the transient notification closes. Cleared
  // when the customer edits a field or retries.
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
      // Editing any field invalidates a prior server rejection; clear it so stale detail isn't shown.
      setSubmitError((prev) => (prev ? null : prev));
    };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.address_line_1.trim()) next.address_line_1 = 'Address line 1 is required';
    if (!form.city.trim()) next.city = 'City is required';
    if (!form.state.trim()) next.state = 'State is required';
    if (!/^\d{6}$/.test(form.postal_code.trim())) {
      next.postal_code = 'Enter a valid 6-digit pincode';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    const orderId = order.id || order.order_id;
    if (!orderId) {
      showNotification({ type: 'error', message: 'Missing order reference.' });
      return;
    }

    const payload: ShippingAddressPayload = {
      name: form.name.trim() || undefined,
      phone: form.phone.trim() || undefined,
      address_line_1: form.address_line_1.trim(),
      address_line_2: form.address_line_2.trim() || undefined,
      city: form.city.trim(),
      state: form.state.trim(),
      postal_code: form.postal_code.trim(),
    };

    try {
      setSubmitting(true);
      setSubmitError(null); // retrying clears any prior server rejection
      const result = await OrderService.submitShippingAddress(orderId, payload);

      if (result.status === 200 && result.success) {
        showNotification({
          type: 'success',
          message: result.waybill
            ? `Address saved — shipment created (waybill ${result.waybill}).`
            : 'Address saved. Your order has been queued for shipping.',
        });
        onUpdated();
      } else if (result.status === 409) {
        // No longer eligible (e.g. already shipping). Refresh so the form drops away.
        showNotification({
          type: 'info',
          message: result.error || 'This order can no longer accept a new delivery address.',
        });
        onUpdated();
      } else if (result.status === 400) {
        const message = result.error || 'Please check the address details and try again.';
        setSubmitError(message);
        showNotification({ type: 'error', message });
      } else {
        const message =
          result.error || result.message || 'Could not save the address. Please try again.';
        setSubmitError(message);
        showNotification({ type: 'error', message });
      }
    } catch (err: any) {
      const message = err?.message || 'Could not save the address. Please try again.';
      setSubmitError(message);
      showNotification({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: keyof FormState) =>
    `w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="bg-amber-50 border border-amber-200 rounded-xl shadow-sm p-4 sm:p-6"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-amber-100 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-amber-900 flex items-center">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" />
            Delivery address needed
          </h2>
          <p className="text-sm text-amber-800 mt-1">
            Your payment was received, but we couldn't capture a deliverable address for this order.
            Enter your shipping address below and we'll dispatch it right away.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Full name</label>
            <input
              type="text"
              value={form.name}
              onChange={handleChange('name')}
              className={inputClass('name')}
              placeholder="Recipient name (optional)"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={handleChange('phone')}
              className={inputClass('phone')}
              placeholder="Contact number (optional)"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Address line 1 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.address_line_1}
            onChange={handleChange('address_line_1')}
            className={inputClass('address_line_1')}
            placeholder="House/flat no., building, street"
          />
          {errors.address_line_1 && (
            <p className="text-xs text-red-600 mt-1">{errors.address_line_1}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Address line 2</label>
          <input
            type="text"
            value={form.address_line_2}
            onChange={handleChange('address_line_2')}
            className={inputClass('address_line_2')}
            placeholder="Area, landmark (optional)"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.city}
              onChange={handleChange('city')}
              className={inputClass('city')}
              placeholder="City"
            />
            {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.state}
              onChange={handleChange('state')}
              className={inputClass('state')}
              placeholder="State"
            />
            {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Pincode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={form.postal_code}
              onChange={handleChange('postal_code')}
              className={inputClass('postal_code')}
              placeholder="6-digit pincode"
            />
            {errors.postal_code && (
              <p className="text-xs text-red-600 mt-1">{errors.postal_code}</p>
            )}
          </div>
        </div>

        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            )}
            {submitting ? 'Saving…' : 'Save address & ship'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ShippingAddressPrompt;
