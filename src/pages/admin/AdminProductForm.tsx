import React, { useState, useRef } from 'react';
import { X, Upload, Trash2, Star, Loader2 } from 'lucide-react';
import type { Product } from '../../context/AppContext';
import type { CreateProductRequest } from '../../services/productService';
import {
  useCreateProduct,
  useUpdateProduct,
  useAdminProductImages,
  useUploadProductImage,
  useDeleteProductImage,
  useSetImageAsPrimary,
} from '../../hooks/queries/useAdminProducts';

interface AdminProductFormProps {
  product?: Product | null;
  onClose: () => void;
}

const CATEGORIES = ['Superfoods', 'Herbs', 'Supplements', 'Spices', 'Oils', 'Others'];

const emptyForm: CreateProductRequest = {
  name: '',
  description: '',
  category: '',
  price: 0,
  actual_price: 0,
  discount_percent: 0,
  stock: 0,
  min_stock_level: 0,
  max_stock_level: 0,
  reorder_point: 0,
};

const AdminProductForm: React.FC<AdminProductFormProps> = ({ product, onClose }) => {
  const isEditing = !!product;
  const [form, setForm] = useState<CreateProductRequest>(
    product
      ? {
          name: product.name,
          description: (product as any).description || '',
          category: product.category,
          price: product.price,
          actual_price: (product as any).actual_price || product.price,
          discount_percent: (product as any).discount_percent || 0,
          stock: product.stock,
          min_stock_level: (product as any).min_stock_level || 0,
          max_stock_level: (product as any).max_stock_level || 0,
          reorder_point: (product as any).reorder_point || 0,
        }
      : emptyForm
  );
  const [errors, setErrors] = useState<Partial<Record<keyof CreateProductRequest, string>>>({});
  const [createdProductId, setCreatedProductId] = useState<string | null>(
    product?.id || null
  );
  const [imageAltText, setImageAltText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const uploadImageMutation = useUploadProductImage(createdProductId || '');
  const deleteImageMutation = useDeleteProductImage(createdProductId || '');
  const setPrimaryMutation = useSetImageAsPrimary(createdProductId || '');

  const { data: imagesData, refetch: refetchImages } = useAdminProductImages(createdProductId || '');

  const images: any[] = React.useMemo(() => {
    if (!imagesData) return [];
    if (Array.isArray(imagesData)) return imagesData;
    if (imagesData.data && Array.isArray(imagesData.data)) return imagesData.data;
    if (imagesData.data?.images && Array.isArray(imagesData.data.images)) return imagesData.data.images;
    return [];
  }, [imagesData]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateProductRequest, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.category) newErrors.category = 'Category is required';
    if (form.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (form.actual_price <= 0) newErrors.actual_price = 'Actual price must be greater than 0';
    if (form.discount_percent !== undefined && (form.discount_percent < 0 || form.discount_percent > 100)) {
      newErrors.discount_percent = 'Discount must be between 0 and 100';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    }));
    if (errors[name as keyof CreateProductRequest]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && product?.id) {
      await updateMutation.mutateAsync({ id: product.id, data: form });
      onClose();
    } else {
      const result = await createMutation.mutateAsync(form);
      const newId = result?.data?.id || result?.data?.product?.id || result?.id;
      if (newId) {
        setCreatedProductId(newId);
      } else {
        onClose();
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !createdProductId) return;
    await uploadImageMutation.mutateAsync({ file, altText: imageAltText || undefined });
    setImageAltText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    refetchImages();
  };

  const handleDeleteImage = async (imageId: string) => {
    await deleteImageMutation.mutateAsync(imageId);
    refetchImages();
  };

  const handleSetPrimary = async (imageId: string) => {
    await setPrimaryMutation.mutateAsync(imageId);
    refetchImages();
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-900">
            {createdProductId && !isEditing ? 'Upload Images' : isEditing ? 'Edit Product' : 'Add Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product form (shown until product is created) */}
        {!createdProductId || isEditing ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Moringa Powder 200g"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.name ? 'border-red-400' : 'border-slate-300'}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Product description..."
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none ${errors.description ? 'border-red-400' : 'border-slate-300'}`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.category ? 'border-red-400' : 'border-slate-300'}`}
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            {/* Price row */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price || ''}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                  placeholder="299"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.price ? 'border-red-400' : 'border-slate-300'}`}
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Actual Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="actual_price"
                  value={form.actual_price || ''}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                  placeholder="399"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.actual_price ? 'border-red-400' : 'border-slate-300'}`}
                />
                {errors.actual_price && <p className="text-red-500 text-xs mt-1">{errors.actual_price}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Discount %</label>
                <input
                  type="number"
                  name="discount_percent"
                  value={form.discount_percent ?? ''}
                  onChange={handleChange}
                  min={0}
                  max={100}
                  placeholder="25"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.discount_percent ? 'border-red-400' : 'border-slate-300'}`}
                />
                {errors.discount_percent && <p className="text-red-500 text-xs mt-1">{errors.discount_percent}</p>}
              </div>
            </div>

            {/* Stock row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock ?? ''}
                  onChange={handleChange}
                  min={0}
                  placeholder="100"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Min Stock</label>
                <input
                  type="number"
                  name="min_stock_level"
                  value={form.min_stock_level ?? ''}
                  onChange={handleChange}
                  min={0}
                  placeholder="10"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Stock</label>
                <input
                  type="number"
                  name="max_stock_level"
                  value={form.max_stock_level ?? ''}
                  onChange={handleChange}
                  min={0}
                  placeholder="500"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reorder Point</label>
                <input
                  type="number"
                  name="reorder_point"
                  value={form.reorder_point ?? ''}
                  onChange={handleChange}
                  min={0}
                  placeholder="20"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEditing ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        ) : (
          /* Image upload section — shown after product is created */
          <div className="p-6 space-y-5">
            <p className="text-sm text-slate-600">
              Product created! Upload images below, then click Done.
            </p>

            {/* Existing images */}
            {images.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Uploaded Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img: any) => (
                    <div
                      key={img.id}
                      className="relative group border border-slate-200 rounded-lg overflow-hidden"
                    >
                      <img
                        src={img.image_url}
                        alt={img.alt_text || 'Product image'}
                        className="w-full h-32 object-cover"
                      />
                      {img.is_primary && (
                        <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" /> Primary
                        </span>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 flex items-center justify-around p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!img.is_primary && (
                          <button
                            onClick={() => handleSetPrimary(img.id)}
                            disabled={setPrimaryMutation.isPending}
                            className="text-white hover:text-amber-300 transition-colors"
                            title="Set as primary"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          disabled={deleteImageMutation.isPending}
                          className="text-white hover:text-red-400 transition-colors"
                          title="Delete image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload new image */}
            {images.length < 4 && (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 mb-3">
                  JPEG, PNG or WebP — max 10 MB ({images.length}/4 uploaded)
                </p>
                <div className="flex gap-2 justify-center mb-3">
                  <input
                    type="text"
                    value={imageAltText}
                    onChange={e => setImageAltText(e.target.value)}
                    placeholder="Alt text (optional)"
                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 w-48"
                  />
                </div>
                <label className="cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={uploadImageMutation.isPending}
                  />
                  <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                    {uploadImageMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="w-4 h-4" /> Choose File</>
                    )}
                  </span>
                </label>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductForm;
