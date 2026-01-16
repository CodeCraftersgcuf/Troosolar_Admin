import React, { useState, useEffect } from "react";
import Header from "../../component/Header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  getAllMaterialCategories,
  getAllMaterials,
  getMaterialCategory,
  getMaterial,
} from "../../utils/queries/materials";
import {
  createMaterialCategory,
  updateMaterialCategory,
  deleteMaterialCategory,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../../utils/mutations/materials";

// Types
interface MaterialCategory {
  id: number;
  name: string;
  code: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  materials?: Material[];
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
  created_at?: string;
  updated_at?: string;
  category?: {
    id: number;
    name: string;
    code: string;
  };
}

const MaterialMgt = () => {
  const [activeTab, setActiveTab] = useState<"categories" | "materials">("categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  
  // Modal states for categories
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MaterialCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    code: "",
    description: "",
    sort_order: 0,
    is_active: true,
  });

  // Modal states for materials
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [materialFormData, setMaterialFormData] = useState({
    material_category_id: "",
    name: "",
    unit: "",
    warranty: "",
    rate: "",
    selling_rate: "",
    profit: "",
    sort_order: 0,
    is_active: true,
  });

  // Delete confirmation states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "category" | "material";
    id: number;
    name: string;
  } | null>(null);

  const token = Cookies.get("token") || "";
  const queryClient = useQueryClient();

  // Fetch material categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery({
    queryKey: ["material-categories"],
    queryFn: () => getAllMaterialCategories(token),
    enabled: !!token,
  });

  // Fetch materials
  const {
    data: materialsData,
    isLoading: materialsLoading,
    isError: materialsError,
  } = useQuery({
    queryKey: ["materials", categoryFilter, activeFilter, searchQuery],
    queryFn: () =>
      getAllMaterials(token, {
        category_id: categoryFilter !== "all" ? categoryFilter : undefined,
        is_active: activeFilter === "all" ? undefined : activeFilter === "active",
        search: searchQuery || undefined,
      }),
    enabled: !!token,
  });

  const categories: MaterialCategory[] = 
    (categoriesData as any)?.data || (categoriesData as any) || [];
  const materials: Material[] = 
    (materialsData as any)?.data || (materialsData as any) || [];

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => createMaterialCategory(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-categories"] });
      setShowCategoryModal(false);
      resetCategoryForm();
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateMaterialCategory(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-categories"] });
      setShowCategoryModal(false);
      setEditingCategory(null);
      resetCategoryForm();
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => deleteMaterialCategory(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-categories"] });
      setShowDeleteModal(false);
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      alert(error?.message || "Failed to delete category. It may have associated materials.");
      setShowDeleteModal(false);
      setDeleteTarget(null);
    },
  });

  // Material mutations
  const createMaterialMutation = useMutation({
    mutationFn: (data: any) => createMaterial(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      setShowMaterialModal(false);
      resetMaterialForm();
    },
  });

  const updateMaterialMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateMaterial(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      setShowMaterialModal(false);
      setEditingMaterial(null);
      resetMaterialForm();
    },
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: (id: number) => deleteMaterial(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      setShowDeleteModal(false);
      setDeleteTarget(null);
    },
  });

  // Form handlers
  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      code: "",
      description: "",
      sort_order: 0,
      is_active: true,
    });
    setEditingCategory(null);
  };

  const resetMaterialForm = () => {
    setMaterialFormData({
      material_category_id: "",
      name: "",
      unit: "",
      warranty: "",
      rate: "",
      selling_rate: "",
      profit: "",
      sort_order: 0,
      is_active: true,
    });
    setEditingMaterial(null);
  };

  const handleOpenCategoryModal = (category?: MaterialCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        name: category.name,
        code: category.code || "",
        description: category.description || "",
        sort_order: category.sort_order,
        is_active: category.is_active,
      });
    } else {
      resetCategoryForm();
    }
    setShowCategoryModal(true);
  };

  const handleOpenMaterialModal = (material?: Material) => {
    if (material) {
      setEditingMaterial(material);
      setMaterialFormData({
        material_category_id: material.material_category_id.toString(),
        name: material.name,
        unit: material.unit,
        warranty: material.warranty?.toString() || "",
        rate: material.rate,
        selling_rate: material.selling_rate,
        profit: material.profit,
        sort_order: material.sort_order,
        is_active: material.is_active,
      });
    } else {
      resetMaterialForm();
    }
    setShowMaterialModal(true);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      name: categoryFormData.name,
      sort_order: categoryFormData.sort_order,
      is_active: categoryFormData.is_active,
    };
    if (categoryFormData.code) payload.code = categoryFormData.code;
    if (categoryFormData.description) payload.description = categoryFormData.description;

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: payload });
    } else {
      createCategoryMutation.mutate(payload);
    }
  };

  const handleMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      material_category_id: parseInt(materialFormData.material_category_id),
      name: materialFormData.name,
      unit: materialFormData.unit,
      sort_order: materialFormData.sort_order,
      is_active: materialFormData.is_active,
    };
    if (materialFormData.warranty) payload.warranty = parseInt(materialFormData.warranty);
    if (materialFormData.rate) payload.rate = parseFloat(materialFormData.rate);
    if (materialFormData.selling_rate) payload.selling_rate = parseFloat(materialFormData.selling_rate);
    if (materialFormData.profit) payload.profit = parseFloat(materialFormData.profit);

    if (editingMaterial) {
      updateMaterialMutation.mutate({ id: editingMaterial.id, data: payload });
    } else {
      createMaterialMutation.mutate(payload);
    }
  };

  const handleDelete = (type: "category" | "material", id: number, name: string) => {
    setDeleteTarget({ type, id, name });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "category") {
      deleteCategoryMutation.mutate(deleteTarget.id);
    } else {
      deleteMaterialMutation.mutate(deleteTarget.id);
    }
  };

  // Filtered data
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMaterials = materials.filter((mat) =>
    mat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#F5F7FF] min-h-screen">
      <Header adminName="Hi, Admin" adminImage="/assets/layout/admin.png" />

      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Material Management</h1>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`py-2 px-1 border-b-4 font-medium text-md cursor-pointer ${
                  activeTab === "categories"
                    ? "border-[#273E8E] text-black"
                    : "border-transparent text-[#00000080]"
                }`}
                onClick={() => setActiveTab("categories")}
              >
                Material Categories
              </button>
              <button
                className={`py-2 px-1 border-b-4 font-medium text-md cursor-pointer ${
                  activeTab === "materials"
                    ? "border-[#273E8E] text-black"
                    : "border-transparent text-[#00000080]"
                }`}
                onClick={() => setActiveTab("materials")}
              >
                Materials
              </button>
            </nav>
          </div>
        </div>

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-[320px]">
                <input
                  type="text"
                  placeholder="Search categories..."
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
              <button
                onClick={() => handleOpenCategoryModal()}
                className="bg-[#273E8E] hover:bg-[#1e3270] text-white px-8 py-3.5 rounded-full text-sm font-medium transition-colors shadow-sm cursor-pointer"
              >
                Add Category
              </button>
            </div>

            {categoriesLoading ? (
              <LoadingSpinner message="Loading categories..." />
            ) : categoriesError ? (
              <div className="p-8 text-center text-red-500">
                Failed to load categories. Please try again.
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#EBEBEB]">
                      <th className="px-6 py-4 text-left text-sm font-medium text-black">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-black">Code</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-black">Description</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-black">Sort Order</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-black">Status</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No categories found
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((category, index) => (
                        <tr
                          key={category.id}
                          className={`${
                            index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                          } border-b border-gray-100`}
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {category.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{category.code || "-"}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {category.description || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{category.sort_order}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                                category.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {category.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleOpenCategoryModal(category)}
                                className="bg-[#273E8E] hover:bg-[#1e3270] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete("category", category.id, category.name)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                              >
                                Delete
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
        )}

        {/* Materials Tab */}
        {activeTab === "materials" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative w-[320px]">
                  <input
                    type="text"
                    placeholder="Search materials..."
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
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-3.5 border border-[#00000080] rounded-lg text-[15px] bg-white focus:outline-none shadow-[0_2px_6px_rgba(0,0,0,0.05)]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="px-4 py-3.5 border border-[#00000080] rounded-lg text-[15px] bg-white focus:outline-none shadow-[0_2px_6px_rgba(0,0,0,0.05)]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <button
                onClick={() => handleOpenMaterialModal()}
                className="bg-[#273E8E] hover:bg-[#1e3270] text-white px-8 py-3.5 rounded-full text-sm font-medium transition-colors shadow-sm cursor-pointer"
              >
                Add Material
              </button>
            </div>

            {materialsLoading ? (
              <LoadingSpinner message="Loading materials..." />
            ) : materialsError ? (
              <div className="p-8 text-center text-red-500">
                Failed to load materials. Please try again.
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#EBEBEB]">
                      <th className="px-6 py-4 text-left text-sm font-medium text-black">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-black">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-black">Unit</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-black">Warranty</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-black">Rate</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-black">Selling Rate</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-black">Profit</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-black">Status</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {filteredMaterials.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                          No materials found
                        </td>
                      </tr>
                    ) : (
                      filteredMaterials.map((material, index) => (
                        <tr
                          key={material.id}
                          className={`${
                            index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                          } border-b border-gray-100`}
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {material.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {material.category?.name || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{material.unit}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {material.warranty ? `${material.warranty} years` : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            ₦{parseFloat(material.rate || "0").toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            ₦{parseFloat(material.selling_rate || "0").toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            ₦{parseFloat(material.profit || "0").toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                                material.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {material.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleOpenMaterialModal(material)}
                                className="bg-[#273E8E] hover:bg-[#1e3270] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete("material", material.id, material.name)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                              >
                                Delete
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
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  resetCategoryForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCategorySubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryFormData.name}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, name: e.target.value })
                    }
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                  <input
                    type="text"
                    value={categoryFormData.code}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, code: e.target.value })
                    }
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={categoryFormData.description}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={categoryFormData.sort_order}
                    onChange={(e) =>
                      setCategoryFormData({
                        ...categoryFormData,
                        sort_order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={categoryFormData.is_active}
                      onChange={(e) =>
                        setCategoryFormData({
                          ...categoryFormData,
                          is_active: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    resetCategoryForm();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createCategoryMutation.isPending || updateCategoryMutation.isPending
                  }
                  className="px-6 py-2 bg-[#273E8E] text-white rounded-full font-medium transition-colors hover:bg-[#1f2f7a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createCategoryMutation.isPending || updateCategoryMutation.isPending
                    ? "Saving..."
                    : editingCategory
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Material Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingMaterial ? "Edit Material" : "Add Material"}
              </h2>
              <button
                onClick={() => {
                  setShowMaterialModal(false);
                  resetMaterialForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleMaterialSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={materialFormData.material_category_id}
                    onChange={(e) =>
                      setMaterialFormData({
                        ...materialFormData,
                        material_category_id: e.target.value,
                      })
                    }
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={materialFormData.name}
                    onChange={(e) =>
                      setMaterialFormData({ ...materialFormData, name: e.target.value })
                    }
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={materialFormData.unit}
                    onChange={(e) =>
                      setMaterialFormData({ ...materialFormData, unit: e.target.value })
                    }
                    placeholder="e.g., Nos, Mtrs"
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Warranty (years)</label>
                  <input
                    type="number"
                    value={materialFormData.warranty}
                    onChange={(e) =>
                      setMaterialFormData({ ...materialFormData, warranty: e.target.value })
                    }
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={materialFormData.rate}
                    onChange={(e) => {
                      const rate = e.target.value;
                      const sellingRate = materialFormData.selling_rate
                        ? parseFloat(materialFormData.selling_rate)
                        : 0;
                      const profit = sellingRate - (parseFloat(rate) || 0);
                      setMaterialFormData({
                        ...materialFormData,
                        rate,
                        profit: profit > 0 ? profit.toFixed(2) : "",
                      });
                    }}
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selling Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={materialFormData.selling_rate}
                    onChange={(e) => {
                      const sellingRate = e.target.value;
                      const rate = materialFormData.rate ? parseFloat(materialFormData.rate) : 0;
                      const profit = parseFloat(sellingRate) - rate;
                      setMaterialFormData({
                        ...materialFormData,
                        selling_rate: sellingRate,
                        profit: profit > 0 ? profit.toFixed(2) : "",
                      });
                    }}
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profit</label>
                  <input
                    type="number"
                    step="0.01"
                    value={materialFormData.profit}
                    onChange={(e) =>
                      setMaterialFormData({ ...materialFormData, profit: e.target.value })
                    }
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={materialFormData.sort_order}
                    onChange={(e) =>
                      setMaterialFormData({
                        ...materialFormData,
                        sort_order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={materialFormData.is_active}
                      onChange={(e) =>
                        setMaterialFormData({
                          ...materialFormData,
                          is_active: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowMaterialModal(false);
                    resetMaterialForm();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createMaterialMutation.isPending || updateMaterialMutation.isPending
                  }
                  className="px-6 py-2 bg-[#273E8E] text-white rounded-full font-medium transition-colors hover:bg-[#1f2f7a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMaterialMutation.isPending || updateMaterialMutation.isPending
                    ? "Saving..."
                    : editingMaterial
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
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>? This action cannot be undone.
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
                disabled={
                  deleteCategoryMutation.isPending || deleteMaterialMutation.isPending
                }
                className="px-6 py-2 bg-red-600 text-white rounded-full font-medium transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteCategoryMutation.isPending || deleteMaterialMutation.isPending
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialMgt;
