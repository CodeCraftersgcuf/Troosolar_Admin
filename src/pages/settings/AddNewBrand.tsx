import { useState, useEffect, useMemo } from 'react';
import images from '../../constants/images';
import { useMutation, useQuery } from '@tanstack/react-query';
import Cookies from "js-cookie";
import { addBrand, updateBrand } from '../../utils/mutations/brands';
import { getAllCategories } from '../../utils/queries/categories';

interface ApiCategory {
  id: number;
  title: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

interface AddNewBrandProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryIds: string[], brandName: string, status: string) => void;
  editMode?: boolean;
  editData?: {
    id: string;
    category: string;
    categoryIds?: string[];
    brandName: string;
    status: string;
  };
}

const AddNewBrand = ({ isOpen, onClose, onSave, editMode = false, editData }: AddNewBrandProps) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [brandName, setBrandName] = useState('');
  const [status, setStatus] = useState('');
  const token = Cookies.get("token");

  const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getAllCategories(token || ''),
    enabled: !!token && isOpen,
  });

  const apiCategories: ApiCategory[] = useMemo(() =>
    (categoriesResponse as { data?: ApiCategory[] })?.data || [],
    [categoriesResponse]
  );

  useEffect(() => {
    if (editMode && editData) {
      const ids = editData.categoryIds?.length
        ? editData.categoryIds
        : editData.category
          ? [editData.category]
          : [];
      setSelectedCategoryIds(ids.map(String));
      setBrandName(editData.brandName || '');
      setStatus(editData.status || '');
    } else {
      setSelectedCategoryIds([]);
      setBrandName('');
      setStatus('');
    }
  }, [editMode, editData, isOpen]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const addMutation = useMutation({
    mutationFn: (payload: { title: string; category_ids: string[] }) =>
      addBrand({ title: payload.title, category_ids: payload.category_ids }, token || ""),
    onSuccess: () => {
      onSave(selectedCategoryIds, brandName, status);
      setSelectedCategoryIds([]);
      setBrandName('');
      setStatus('');
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; title: string; category_ids: string[] }) =>
      updateBrand(payload.id, { title: payload.title, category_ids: payload.category_ids }, token || ""),
    onSuccess: () => {
      onSave(selectedCategoryIds, brandName, status);
      setSelectedCategoryIds([]);
      setBrandName('');
      setStatus('');
      onClose();
    },
  });

  const handleSave = () => {
    if (selectedCategoryIds.length > 0 && brandName.trim() && status) {
      if (editMode && editData) {
        updateMutation.mutate({
          id: editData.id,
          title: brandName,
          category_ids: selectedCategoryIds,
        });
      } else {
        addMutation.mutate({
          title: brandName,
          category_ids: selectedCategoryIds,
        });
      }
    }
  };

  const handleClose = () => {
    setSelectedCategoryIds([]);
    setBrandName('');
    setStatus('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-start justify-end z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{editMode ? "Edit Brand" : "Add Brand"}</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors"
          >
            <img src={images.cross} alt="" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product categories
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Select every category where this brand should appear (e.g. Inverters and Lithium Batteries for Itel).
            </p>
            {categoriesLoading ? (
              <p className="text-sm text-gray-500">Loading categories...</p>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                {apiCategories.map((category) => {
                  const id = String(category.id);
                  const checked = selectedCategoryIds.includes(id);
                  return (
                    <label
                      key={category.id}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCategory(id)}
                        className="h-4 w-4 rounded border-gray-300 text-[#273E8E] focus:ring-[#273E8E]"
                      />
                      <span className="text-sm text-gray-700">{category.title}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Name
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Enter brand name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273E8E] focus:border-[#273E8E] outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273E8E] focus:border-[#273E8E] outline-none appearance-none bg-white text-gray-500"
              >
                <option value="">Select status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <button
            onClick={handleSave}
            disabled={selectedCategoryIds.length === 0 || !brandName.trim() || !status}
            className="w-full bg-[#273E8E] text-white py-3 rounded-full font-medium hover:bg-[#1f2f7a] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {addMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewBrand;
