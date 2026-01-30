import React, { useState } from "react";
import Header from "../../component/Header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getAllBundles } from "../../utils/queries/bundle";
import { addBundle, updateBundle, deleteBundle } from "../../utils/mutations/bundle";
import { getBundleMaterials } from "../../utils/queries/bundleMaterials";
import {
  addBundleMaterial,
  updateBundleMaterial,
  deleteBundleMaterial,
} from "../../utils/mutations/bundleMaterials";
import { getAllMaterials } from "../../utils/queries/materials";

// Types
interface Bundle {
  id: number;
  title: string;
  bundle_type: string;
  total_price: number;
  discount_price: number;
  inver_rating?: string;
  total_output?: string;
  total_load?: string | null;
  bundleItems?: any[];
  customServices?: any[];
  featured_image?: string;
  detailed_description?: string;
  product_model?: string;
  what_is_inside_bundle_text?: string;
  what_bundle_powers_text?: string;
  backup_time_description?: string;
  created_at?: string;
  updated_at?: string;
}

interface BundleMaterial {
  id: number;
  bundle_id: number;
  material_id: number;
  quantity: string;
  created_at?: string;
  updated_at?: string;
  material: {
    id: number;
    name: string;
    unit: string;
    warranty?: number;
    category: {
      id: number;
      name: string;
    };
  };
}

interface Material {
  id: number;
  material_category_id: number;
  name: string;
  unit: string;
  warranty?: number;
  rate: string;
  selling_rate: string;
  profit: string;
  sort_order: number;
  is_active: boolean;
  category?: {
    id: number;
    name: string;
    code: string;
  };
}

const BundleMgt = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [bundleTypeFilter, setBundleTypeFilter] = useState<string>("all");
  
  // Modal states
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [bundleFormData, setBundleFormData] = useState({
    title: "",
    bundle_type: "Inverter + Battery",
    total_price: "",
    discount_price: "",
    inver_rating: "",
    total_output: "",
    total_load: "",
    description: "",
    product_model: "",
    what_is_inside: "",
    what_it_powers: "",
    backup_time_description: "",
  });
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    title: string;
  } | null>(null);

  // Material management states
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<BundleMaterial | null>(null);
  const [materialFormData, setMaterialFormData] = useState({
    material_id: "",
    quantity: "",
  });
  const [showDeleteMaterialModal, setShowDeleteMaterialModal] = useState(false);
  const [deleteMaterialTarget, setDeleteMaterialTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const token = Cookies.get("token") || "";
  const queryClient = useQueryClient();

  // Fetch bundles
  const {
    data: bundlesData,
    isLoading: bundlesLoading,
    isError: bundlesError,
  } = useQuery({
    queryKey: ["bundles", bundleTypeFilter],
    queryFn: () =>
      getAllBundles(token, {
        bundle_type: bundleTypeFilter !== "all" ? bundleTypeFilter : undefined,
      }),
    enabled: !!token,
  });

  const bundles: Bundle[] = (bundlesData as any)?.data || (bundlesData as any) || [];

  // Fetch materials for dropdown
  const { data: materialsData } = useQuery({
    queryKey: ["materials"],
    queryFn: () => getAllMaterials(token),
    enabled: !!token && showAddMaterialModal,
  });

  const allMaterials: Material[] =
    (materialsData as any)?.data || (materialsData as any) || [];

  // Fetch bundle materials
  const {
    data: bundleMaterialsData,
    isLoading: bundleMaterialsLoading,
  } = useQuery({
    queryKey: ["bundle-materials", selectedBundle?.id],
    queryFn: () => getBundleMaterials(selectedBundle!.id, token),
    enabled: !!token && !!selectedBundle && showMaterialsModal,
  });

  const bundleMaterials: BundleMaterial[] =
    (bundleMaterialsData as any)?.data || (bundleMaterialsData as any) || [];

  // Mutations
  const createBundleMutation = useMutation({
    mutationFn: (data: any) => addBundle(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
      setShowBundleModal(false);
      resetBundleForm();
    },
  });

  const updateBundleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateBundle(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
      setShowBundleModal(false);
      setEditingBundle(null);
      resetBundleForm();
    },
  });

  const deleteBundleMutation = useMutation({
    mutationFn: (id: number) => deleteBundle(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
      setShowDeleteModal(false);
      setDeleteTarget(null);
    },
  });

  // Bundle Material Mutations
  const addMaterialMutation = useMutation({
    mutationFn: ({ bundleId, data }: { bundleId: number; data: any }) =>
      addBundleMaterial(bundleId, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundle-materials"] });
      setShowAddMaterialModal(false);
      resetMaterialForm();
    },
  });

  const updateMaterialMutation = useMutation({
    mutationFn: ({
      bundleId,
      materialId,
      data,
    }: {
      bundleId: number;
      materialId: number;
      data: any;
    }) => updateBundleMaterial(bundleId, materialId, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundle-materials"] });
      setShowAddMaterialModal(false);
      setEditingMaterial(null);
      resetMaterialForm();
    },
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: ({ bundleId, materialId }: { bundleId: number; materialId: number }) =>
      deleteBundleMaterial(bundleId, materialId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundle-materials"] });
      setShowDeleteMaterialModal(false);
      setDeleteMaterialTarget(null);
    },
  });

  // Form handlers
  const resetBundleForm = () => {
    setBundleFormData({
      title: "",
      bundle_type: "Inverter + Battery",
      total_price: "",
      discount_price: "",
      inver_rating: "",
      total_output: "",
      total_load: "",
      description: "",
      product_model: "",
      what_is_inside: "",
      what_it_powers: "",
      backup_time_description: "",
    });
    setFeaturedImage(null);
    setImagePreview(null);
    setEditingBundle(null);
  };

  const handleOpenBundleModal = (bundle?: Bundle) => {
    if (bundle) {
      setEditingBundle(bundle);
      setBundleFormData({
        title: bundle.title,
        bundle_type: bundle.bundle_type,
        total_price: bundle.total_price.toString(),
        discount_price: bundle.discount_price?.toString() || "",
        inver_rating: bundle.inver_rating || "",
        total_output: bundle.total_output || "",
        total_load: bundle.total_load || "",
        description: bundle.detailed_description || "",
        product_model: bundle.product_model || "",
        what_is_inside: bundle.what_is_inside_bundle_text || "",
        what_it_powers: bundle.what_bundle_powers_text || "",
        backup_time_description: bundle.backup_time_description || "",
      });
      if (bundle.featured_image) {
        setImagePreview(bundle.featured_image);
      }
    } else {
      resetBundleForm();
    }
    setShowBundleModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBundleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      title: bundleFormData.title,
      bundle_type: bundleFormData.bundle_type,
      total_price: parseFloat(bundleFormData.total_price) || 0,
      discount_price: parseFloat(bundleFormData.discount_price) || 0,
    };

    if (bundleFormData.inver_rating) payload.inver_rating = bundleFormData.inver_rating;
    if (bundleFormData.total_output) payload.total_output = bundleFormData.total_output;
    if (bundleFormData.total_load) payload.total_load = bundleFormData.total_load;
    if (bundleFormData.bundle_type === "Inverter + Battery") payload.total_load = null;
    if (bundleFormData.description) payload.detailed_description = bundleFormData.description;
    if (bundleFormData.product_model) payload.product_model = bundleFormData.product_model;
    if (bundleFormData.what_is_inside) payload.what_is_inside_bundle_text = bundleFormData.what_is_inside;
    if (bundleFormData.what_it_powers) payload.what_bundle_powers_text = bundleFormData.what_it_powers;
    if (bundleFormData.backup_time_description) payload.backup_time_description = bundleFormData.backup_time_description;

    if (featuredImage) payload.featured_image = featuredImage;

    if (editingBundle) {
      updateBundleMutation.mutate({ id: editingBundle.id, data: payload });
    } else {
      createBundleMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number, title: string) => {
    setDeleteTarget({ id, title });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteBundleMutation.mutate(deleteTarget.id);
  };

  // Filtered data
  const filteredBundles = bundles.filter((bundle) =>
    bundle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bundle.bundle_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate discount percentage
  const calculateDiscountPercentage = (total: number, discount: number) => {
    if (total === 0 || discount === 0) return 0;
    return Math.round((discount / total) * 100);
  };

  // Material management handlers
  const handleManageMaterials = (bundle: Bundle) => {
    setSelectedBundle(bundle);
    setShowMaterialsModal(true);
  };

  const handleOpenAddMaterialModal = (material?: BundleMaterial) => {
    if (material) {
      setEditingMaterial(material);
      setMaterialFormData({
        material_id: material.material_id.toString(),
        quantity: material.quantity,
      });
    } else {
      resetMaterialForm();
    }
    setShowAddMaterialModal(true);
  };

  const resetMaterialForm = () => {
    setMaterialFormData({
      material_id: "",
      quantity: "",
    });
    setEditingMaterial(null);
  };

  const handleMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBundle) return;

    const payload = {
      material_id: parseInt(materialFormData.material_id),
      quantity: parseFloat(materialFormData.quantity),
    };

    if (editingMaterial) {
      updateMaterialMutation.mutate({
        bundleId: selectedBundle.id,
        materialId: editingMaterial.id,
        data: { quantity: payload.quantity },
      });
    } else {
      addMaterialMutation.mutate({
        bundleId: selectedBundle.id,
        data: payload,
      });
    }
  };

  const handleDeleteMaterial = (material: BundleMaterial) => {
    setDeleteMaterialTarget({
      id: material.id,
      name: material.material.name,
    });
    setShowDeleteMaterialModal(true);
  };

  const confirmDeleteMaterial = () => {
    if (!deleteMaterialTarget || !selectedBundle) return;
    deleteMaterialMutation.mutate({
      bundleId: selectedBundle.id,
      materialId: deleteMaterialTarget.id,
    });
  };

  return (
    <div className="bg-[#F5F7FF] min-h-screen">
      <Header adminName="Hi, Admin" adminImage="/assets/layout/admin.png" />

      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bundle Management</h1>
        </div>

        {/* Filters and Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative w-[320px]">
              <input
                type="text"
                placeholder="Search bundles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3.5 border border-[#00000080] rounded-lg text-[15px] w-full focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-gray-400"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <select
              value={bundleTypeFilter}
              onChange={(e) => setBundleTypeFilter(e.target.value)}
              className="px-4 py-3.5 border border-[#00000080] rounded-lg text-[15px] bg-white focus:outline-none shadow-[0_2px_6px_rgba(0,0,0,0.05)]"
            >
              <option value="all">All Types</option>
              <option value="Inverter + Battery">Inverter + Battery</option>
              <option value="Solar+Inverter+Battery">Solar+Inverter+Battery</option>
            </select>
          </div>
          <button
            onClick={() => handleOpenBundleModal()}
            className="bg-[#273E8E] hover:bg-[#1e3270] text-white px-8 py-3.5 rounded-full text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            Add Bundle
          </button>
        </div>

        {/* Bundles Table */}
        {bundlesLoading ? (
          <LoadingSpinner message="Loading bundles..." />
        ) : bundlesError ? (
          <div className="p-8 text-center text-red-500">
            Failed to load bundles. Please try again.
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-gray-200 bg-[#EBEBEB]">
                  <th className="px-6 py-4 text-left text-sm font-medium text-black">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-black">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-black">Inverter Rating</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-black">Total Output</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-black">Total Load</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-black">Total Price</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-black">Discount Price</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-black">Discount %</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredBundles.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      No bundles found
                    </td>
                  </tr>
                ) : (
                  filteredBundles.map((bundle, index) => {
                    const discountPercentage = calculateDiscountPercentage(
                      bundle.total_price,
                      bundle.discount_price
                    );
                    return (
                      <tr
                        key={bundle.id}
                        className={`${
                          index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                        } border-b border-gray-100`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {bundle.title}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                              bundle.bundle_type === "Inverter + Battery"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {bundle.bundle_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {bundle.inver_rating || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {bundle.total_output || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {bundle.total_load || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          ₦{bundle.total_price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {bundle.discount_price > 0 ? (
                            <span className="text-green-600">
                              ₦{bundle.discount_price.toLocaleString()}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {discountPercentage > 0 ? (
                            <span className="text-green-600 font-semibold">
                              {discountPercentage}%
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleManageMaterials(bundle)}
                              className="bg-[#E8A91D] hover:bg-[#d89a1a] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                            >
                              Materials
                            </button>
                            <button
                              onClick={() => handleOpenBundleModal(bundle)}
                              className="bg-[#273E8E] hover:bg-[#1e3270] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(bundle.id, bundle.title)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bundle Modal */}
      {showBundleModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBundle ? "Edit Bundle" : "Add Bundle"}
              </h2>
              <button
                onClick={() => {
                  setShowBundleModal(false);
                  resetBundleForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleBundleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bundleFormData.title}
                    onChange={(e) =>
                      setBundleFormData({ ...bundleFormData, title: e.target.value })
                    }
                    placeholder="e.g., Y1.2kVA+1.3kWh"
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bundle Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={bundleFormData.bundle_type}
                    onChange={(e) =>
                      setBundleFormData({ ...bundleFormData, bundle_type: e.target.value })
                    }
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="Inverter + Battery">Inverter + Battery</option>
                    <option value="Solar+Inverter+Battery">Solar+Inverter+Battery</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={bundleFormData.total_price}
                      onChange={(e) =>
                        setBundleFormData({ ...bundleFormData, total_price: e.target.value })
                      }
                      className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={bundleFormData.discount_price}
                      onChange={(e) =>
                        setBundleFormData({ ...bundleFormData, discount_price: e.target.value })
                      }
                      className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Inverter Rating
                    </label>
                    <input
                      type="text"
                      value={bundleFormData.inver_rating}
                      onChange={(e) =>
                        setBundleFormData({ ...bundleFormData, inver_rating: e.target.value })
                      }
                      placeholder="e.g., 1.2 kVA"
                      className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Output
                    </label>
                    <input
                      type="text"
                      value={bundleFormData.total_output}
                      onChange={(e) =>
                        setBundleFormData({ ...bundleFormData, total_output: e.target.value })
                      }
                      placeholder="e.g., 1.3 kWh"
                      className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {bundleFormData.bundle_type === "Solar+Inverter+Battery" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Load (Solar Panel Wattage)
                    </label>
                    <input
                      type="text"
                      value={bundleFormData.total_load}
                      onChange={(e) =>
                        setBundleFormData({ ...bundleFormData, total_load: e.target.value })
                      }
                      placeholder="e.g., 600 W"
                      className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={bundleFormData.description}
                    onChange={(e) =>
                      setBundleFormData({ ...bundleFormData, description: e.target.value })
                    }
                    placeholder="Full description of the bundle and what it powers..."
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Model
                  </label>
                  <input
                    type="text"
                    value={bundleFormData.product_model}
                    onChange={(e) =>
                      setBundleFormData({ ...bundleFormData, product_model: e.target.value })
                    }
                    placeholder="e.g. OG-1P1K2-T - 1.2kVA Yinergy Inverter / GCL 12100 12V 1.3kWh Battery"
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What is inside the bundle
                  </label>
                  <textarea
                    rows={2}
                    value={bundleFormData.what_is_inside}
                    onChange={(e) =>
                      setBundleFormData({ ...bundleFormData, what_is_inside: e.target.value })
                    }
                    placeholder="e.g. 1 unit 1.2kVA Inverter, 1 unit 1.3kWh Battery & Installation Materials"
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What the bundle will power
                  </label>
                  <textarea
                    rows={2}
                    value={bundleFormData.what_it_powers}
                    onChange={(e) =>
                      setBundleFormData({ ...bundleFormData, what_it_powers: e.target.value })
                    }
                    placeholder="e.g. 6–10 LED bulbs, 1 LED TV, 1 Decoder, 1 Fan, 1 Laptop, Wi-Fi"
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Back-up time description
                  </label>
                  <input
                    type="text"
                    value={bundleFormData.backup_time_description}
                    onChange={(e) =>
                      setBundleFormData({ ...bundleFormData, backup_time_description: e.target.value })
                    }
                    placeholder="e.g. 1–9 hours depending on load"
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowBundleModal(false);
                    resetBundleForm();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createBundleMutation.isPending || updateBundleMutation.isPending
                  }
                  className="px-6 py-2 bg-[#273E8E] text-white rounded-full font-medium transition-colors hover:bg-[#1f2f7a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createBundleMutation.isPending || updateBundleMutation.isPending
                    ? "Saving..."
                    : editingBundle
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete bundle <strong>{deleteTarget.title}</strong>? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteBundleMutation.isPending}
                className="px-6 py-2 bg-red-600 text-white rounded-full font-medium transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteBundleMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Materials Management Modal */}
      {showMaterialsModal && selectedBundle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Manage Materials - {selectedBundle.title}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Bundle Type: {selectedBundle.bundle_type}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleOpenAddMaterialModal()}
                  className="bg-[#273E8E] hover:bg-[#1e3270] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                >
                  Add Material
                </button>
                <button
                  onClick={() => {
                    setShowMaterialsModal(false);
                    setSelectedBundle(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {bundleMaterialsLoading ? (
              <LoadingSpinner message="Loading materials..." />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#EBEBEB]">
                      <th className="px-6 py-4 text-left text-sm font-medium text-black">
                        Material Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-black">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-black">Unit</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-black">Quantity</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-black">Warranty</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {bundleMaterials.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No materials found. Add materials to this bundle.
                        </td>
                      </tr>
                    ) : (
                      bundleMaterials.map((bm, index) => (
                        <tr
                          key={bm.id}
                          className={`${
                            index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                          } border-b border-gray-100`}
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {bm.material.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {bm.material.category.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{bm.material.unit}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{bm.quantity}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {bm.material.warranty ? `${bm.material.warranty} years` : "-"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleOpenAddMaterialModal(bm)}
                                className="bg-[#273E8E] hover:bg-[#1e3270] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMaterial(bm)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Material Modal */}
      {showAddMaterialModal && selectedBundle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingMaterial ? "Edit Material" : "Add Material"}
              </h2>
              <button
                onClick={() => {
                  setShowAddMaterialModal(false);
                  resetMaterialForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleMaterialSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    disabled={!!editingMaterial}
                    value={materialFormData.material_id}
                    onChange={(e) =>
                      setMaterialFormData({
                        ...materialFormData,
                        material_id: e.target.value,
                      })
                    }
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  >
                    <option value="">Select Material</option>
                    {allMaterials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.name} ({material.category?.name || "N/A"}) - {material.unit}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    value={materialFormData.quantity}
                    onChange={(e) =>
                      setMaterialFormData({
                        ...materialFormData,
                        quantity: e.target.value,
                      })
                    }
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMaterialModal(false);
                    resetMaterialForm();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    addMaterialMutation.isPending || updateMaterialMutation.isPending
                  }
                  className="px-6 py-2 bg-[#273E8E] text-white rounded-full font-medium transition-colors hover:bg-[#1f2f7a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addMaterialMutation.isPending || updateMaterialMutation.isPending
                    ? "Saving..."
                    : editingMaterial
                    ? "Update"
                    : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Material Confirmation Modal */}
      {showDeleteMaterialModal && deleteMaterialTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Remove</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove <strong>{deleteMaterialTarget.name}</strong> from this
              bundle? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteMaterialModal(false);
                  setDeleteMaterialTarget(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteMaterial}
                disabled={deleteMaterialMutation.isPending}
                className="px-6 py-2 bg-red-600 text-white rounded-full font-medium transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteMaterialMutation.isPending ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BundleMgt;
