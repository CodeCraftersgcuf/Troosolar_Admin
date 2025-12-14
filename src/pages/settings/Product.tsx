import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { productCategories, brands } from "./product";
import type { ProductCategory, Brand } from "./product";
import AddNewCategory from "./AddNewCategory";
import AddNewBrand from "./AddNewBrand";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";

//Code Related to the Integration
import { getAllCategories } from "../../utils/queries/categories";
import Cookies from "js-cookie";
import { useQuery } from "@tanstack/react-query";
import { deleteCategory } from "../../utils/mutations/categories";
import { useMutation } from "@tanstack/react-query";

import { getAllBrands } from "../../utils/queries/brands";

import { deleteBrand } from "../../utils/mutations/brands";



const IMAGE_BASE_URL = "https://troosolar.hmstech.org";

const Product = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const subtabFromUrl = searchParams.get("subtab") as "categories" | "brand" | null;
  
  const [categories, setCategories] = useState<ProductCategory[]>(productCategories);
  const [brandList, setBrandList] = useState<Brand[]>(brands);
  const [activeTab, setActiveTab] = useState<"categories" | "brand">(
    (subtabFromUrl && ["categories", "brand"].includes(subtabFromUrl)) ? subtabFromUrl : "categories"
  );

  // Update URL when subtab changes (only if different from URL)
  useEffect(() => {
    if (activeTab && activeTab !== subtabFromUrl) {
      const currentTab = searchParams.get("tab") || "product";
      setSearchParams({ tab: currentTab, subtab: activeTab });
    }
  }, [activeTab, setSearchParams, searchParams, subtabFromUrl]);

  // Update subtab when URL changes (only if different from current subtab)
  useEffect(() => {
    if (subtabFromUrl && ["categories", "brand"].includes(subtabFromUrl) && subtabFromUrl !== activeTab) {
      setActiveTab(subtabFromUrl);
    }
  }, [subtabFromUrl, activeTab]);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState(false);
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
  const [editCategoryData, setEditCategoryData] = useState<ProductCategory | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null);
  const [showDeleteBrandModal, setShowDeleteBrandModal] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [editBrandModalOpen, setEditBrandModalOpen] = useState(false);
  const [editBrandData, setEditBrandData] = useState<Brand | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Enhanced dropdown states
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Category options with customizable PNG paths
  const categoryOptions = [
    {
      value: "",
      label: "Categories",
      icon: null,
    },
    {
      value: "solar-panels",
      label: "Solar Panels",
      icon: "/assets/images/solarpanel.png",
    },
    {
      value: "batteries",
      label: "Batteries",
      icon: "/assets/images/batteries.png",
    },
    {
      value: "inverters",
      label: "Inverters",
      icon: "/assets/images/inverters.png",
    },
    {
      value: "mttp-chargers",
      label: "MTTP Chargers",
      icon: "/assets/images/mttpcharger.png",
    },
    {
      value: "led-bulbs",
      label: "LED Bulbs",
      icon: "/assets/images/bulb.png",
    },
    {
      value: "solar-fans",
      label: "Solar Fans",
      icon: "/assets/images/solarfans.png",
    },
  ];

  // Custom dropdown handlers
  const handleCategorySelect = (category: {
    value: string;
    label: string;
    icon: string | null;
  }) => {
    setSelectedCategoryFilter(category.value);
    setIsCategoryDropdownOpen(false);
  };

  const toggleCategoryDropdown = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
  };

  const getSelectedCategoryOption = () => {
    return (
      categoryOptions.find(
        (option) => option.value === selectedCategoryFilter
      ) || categoryOptions[0]
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === id
          ? { ...category, isSelected: !category.isSelected }
          : category
      )
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setCategories((prev) =>
      prev.map((category) => ({ ...category, isSelected: checked }))
    );
  };

  // API integration for categories
  const token = Cookies.get("token");
  const { data: apiCategories, isLoading: isCategoriesLoading, isError: isCategoriesError, refetch } = useQuery({
    queryKey: ["all-categories"],
    queryFn: () => getAllCategories(token || ""),
    enabled: !!token,
  });

  // Map API response to categories
  useEffect(() => {
    if (apiCategories && (apiCategories as any)?.status === "success" && Array.isArray((apiCategories as any).data)) {
      setCategories(
        (apiCategories as any).data.map((cat: any) => ({
          id: String(cat.id),
          categoryName: cat.title,
          image: cat.icon ? `${IMAGE_BASE_URL}${cat.icon}` : "/assets/images/category.png",
          dateCreated: cat.created_at
            ? new Date(cat.created_at).toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }).replace(/\//g, "-").replace(",", "/")
            : "",
          status: "Active", // API doesn't provide status, default to Active
          isSelected: false,
        }))
      );
    }
  }, [apiCategories]);

  // Edit category logic
  const handleEdit = (id: string) => {
    const category = categories.find((cat) => cat.id === id);
    if (category) {
      setEditCategoryData(category);
      setEditCategoryModalOpen(true);
    }
  };

  // Save new category
  const handleAddNewCategory = async (categoryName: string, image: File | null, status: string) => {
    if (image) {
      const imageUrl = URL.createObjectURL(image);
      const newCategory: ProductCategory = {
        id: (categories.length + 1).toString(),
        categoryName,
        image: imageUrl,
        dateCreated: new Date()
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          .replace(/\//g, "-")
          .replace(",", "/"),
        status: status as "Active" | "Pending",
        isSelected: false,
      };
      setCategories((prev) => [...prev, newCategory]);
    }
  };

  // Save edited category
  const handleEditCategorySave = async (_categoryName: string, _image: File | null, _status: string) => {
    // Only close modal and refetch, mutation is now handled in AddNewCategory
    setEditCategoryModalOpen(false);
    setEditCategoryData(null);
    refetch();
  };

  const handleSelectBrand = (id: string) => {
    setBrandList((prev) =>
      prev.map((brand) =>
        brand.id === id ? { ...brand, isSelected: !brand.isSelected } : brand
      )
    );
  };

  const handleSelectAllBrands = (checked: boolean) => {
    setBrandList((prev) =>
      prev.map((brand) => ({ ...brand, isSelected: checked }))
    );
  };

  // Fetch brands from API
  const { data: apiBrands, isLoading: isBrandsLoading, isError: isBrandsError, refetch: refetchBrands } = useQuery({
    queryKey: ["all-brands"],
    queryFn: () => getAllBrands(token || ""),
    enabled: !!token,
  });

  // Map API response to brandList
  useEffect(() => {
    if (apiBrands && (apiBrands as any)?.status === "success" && Array.isArray((apiBrands as any).data)) {
      setBrandList(
        (apiBrands as any).data.map((b: any) => ({
          id: String(b.id),
          brandName: b.title,
          category: b.category_id ? String(b.category_id) : "",
          dateCreated: b.created_at
            ? new Date(b.created_at).toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }).replace(/\//g, "-").replace(",", "/")
            : "",
          status: "Active", // API doesn't provide status, default to Active
          isSelected: false,
        }))
      );
    }
  }, [apiBrands]);

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id, token || ""),
    onSuccess: () => {
      refetch();
    },
  });

  // Show confirmation dialog before delete
  const handleDelete = (id: string) => {
    const category = categories.find((cat) => cat.id === id);
    if (category) {
      setCategoryToDelete(category);
      setShowDeleteModal(true);
    }
  };

  // Confirm delete action
  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.id);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  // Cancel delete action
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  // Delete brand mutation
  const deleteBrandMutation = useMutation({
    mutationFn: (id: string) => deleteBrand(id, token || ""),
    onSuccess: () => {
      refetchBrands();
    },
  });

  // Show confirmation dialog before delete (brand)
  const handleDeleteBrand = (id: string) => {
    const brand = brandList.find((b) => b.id === id);
    if (brand) {
      setBrandToDelete(brand);
      setShowDeleteBrandModal(true);
    }
  };

  // Confirm delete action (brand)
  const confirmDeleteBrand = () => {
    if (brandToDelete) {
      deleteBrandMutation.mutate(brandToDelete.id);
      setShowDeleteBrandModal(false);
      setBrandToDelete(null);
    }
  };

  // Cancel delete action (brand)
  const cancelDeleteBrand = () => {
    setShowDeleteBrandModal(false);
    setBrandToDelete(null);
  };

  // Edit brand logic
  const handleEditBrand = (id: string) => {
    const brand = brandList.find((b) => b.id === id);
    if (brand) {
      setEditBrandData(brand);
      setEditBrandModalOpen(true);
    }
  };

  // Save new brand (just closes modal, mutation handled in AddNewBrand)
  const handleAddNewBrand = async (_categoryName: string, _brandName: string, _status: string) => {
    setIsAddBrandModalOpen(false);
    refetchBrands();
  };

  // Save edited brand (just closes modal, mutation handled in AddNewBrand)
  const handleEditBrandSave = async (_categoryName: string, _brandName: string, _status: string) => {
    setEditBrandModalOpen(false);
    setEditBrandData(null);
    refetchBrands();
  };

  const allSelected = categories.every((category) => category.isSelected);
  const someSelected = categories.some((category) => category.isSelected);

  const allBrandsSelected = brandList.every((brand) => brand.isSelected);
  const someBrandsSelected = brandList.some((brand) => brand.isSelected);

  // Pagination logic
  const currentData = activeTab === "categories" ? categories : brandList;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = currentData.slice(startIndex, endIndex);

  // Reset to first page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  return (
    <div className="w-full ">
      {/* Filters and Add New Category Button */}
      <div className="mb-6 flex justify-between items-center">
        {/* Left side - Tab Navigation / Filters */}
        <div className="flex items-center space-x-4">
          <div className="bg-[#FFFFFF] rounded-full p-2 flex border border-gray-200 cursor-pointer">
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${activeTab === "categories"
                ? "bg-[#273E8E] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
                }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab("brand")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${activeTab === "brand"
                ? "bg-[#273E8E] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
                }`}
            >
              Brand
            </button>
          </div>

          {/* Categories Dropdown Filter */}
          <div className="relative" ref={categoryDropdownRef}>
            <button
              onClick={toggleCategoryDropdown}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 flex items-center justify-between min-w-[140px] focus:ring-2 focus:ring-[#273E8E] focus:border-[#273E8E]"
            >
              <div className="flex items-center">
                {getSelectedCategoryOption().icon && (
                  <img
                    src={getSelectedCategoryOption().icon || ""}
                    alt={getSelectedCategoryOption().label}
                    className="w-4 h-4 mr-2 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                )}
                <span>{getSelectedCategoryOption().label}</span>
              </div>
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Custom Dropdown Menu */}
            {isCategoryDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-y-auto"
                style={{ width: "397px", height: "400px" }}
              >
                <div className="p-3">
                  {categoryOptions.slice(1).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleCategorySelect(option)}
                      className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center transition-colors rounded-lg mb-2 last:mb-0 ${selectedCategoryFilter === option.value
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50 border border-transparent"
                        }`}
                    >
                      {option.icon && (
                        <div className="w-14 h-14 mr-4 flex items-center justify-center bg-[#BEBEF1] rounded-full ">
                          <img
                            src={option.icon || ""}
                            alt={option.label}
                            className="w-12 h-12 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <span className="font-medium text-gray-800">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add New Category Button */}
        <button
          onClick={() => {
            if (activeTab === "categories") {
              setIsAddCategoryModalOpen(true);
            } else {
              setIsAddBrandModalOpen(true);
            }
          }}
          className="bg-[#273E8E] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#1f2f7a] transition-colors cursor-pointer"
        >
          {activeTab === "categories" ? "Add New Category" : "Add New Brand"}
        </button>
      </div>

      {/* Categories Table */}
      {activeTab === "categories" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isCategoriesLoading ? (
            <LoadingSpinner message="Loading categories..." />
          ) : isCategoriesError ? (
            <div className="py-16 text-center text-red-500 text-lg">
              Failed to load categories.
            </div>
          ) : (
            <table className="min-w-full">
              {/* Table Header */}
              <thead className="bg-[#EBEBEB]">
                <tr>
                  <th className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input)
                          input.indeterminate = someSelected && !allSelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-[#273E8E] bg-gray-100 border-gray-300 rounded focus:ring-[#273E8E] focus:ring-2"
                    />
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-black">
                      Category Name
                    </span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-black">Image</span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-black">
                      Date Created
                    </span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-black">Status</span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-black">Action</span>
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100">
                {currentItems.map((item, index) => {
                  const category = item as ProductCategory;
                  return (
                  <tr
                    key={category.id}
                    className={`${index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                      } transition-colors border-b border-gray-100 last:border-b-0 px-6 py-4 `}
                  >
                    {/* Checkbox */}
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={category.isSelected || false}
                        onChange={() => handleSelectCategory(category.id)}
                        className="w-4 h-4 text-[#273E8E] bg-gray-100 border-gray-300 rounded focus:ring-[#273E8E] focus:ring-2"
                      />
                    </td>

                    {/* Category Name */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {category.categoryName}
                      </span>
                    </td>

                    {/* Image */}
                    <td className="px-6 py-4 flex justify-center items-center">
                      <div className="w-12 h-12  overflow-hidden ">
                        <img
                          src={category.image}
                          alt={`${category.categoryName} category`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = "/assets/images/category.png"; // Fallback image
                          }}
                        />
                      </div>
                    </td>

                    {/* Date Created */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600">
                        {category.dateCreated}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {category.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(category.id)}
                          className="bg-[#273E8E] text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-[#1f2f7a] transition-colors cursor-pointer"
                        >
                          Edit Category
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="bg-[#FF0000] text-white px-10 py-3 rounded-full text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          
          {/* Pagination Controls for Categories */}
          {totalPages > 1 && activeTab === "categories" && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing {startIndex + 1} to {Math.min(endIndex, categories.length)} of {categories.length} results
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 text-sm font-medium rounded-md border ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-2 text-sm font-medium rounded-md border ${
                          currentPage === pageNumber
                            ? 'bg-[#273E8E] text-white border-[#273E8E]'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>
                
                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 text-sm font-medium rounded-md border ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {categories.length === 0 && (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No categories found.</p>
            </div>
          )}
          <ConfirmDeleteModal
            isOpen={showDeleteModal}
            onClose={cancelDelete}
            onConfirm={confirmDelete}
            message="Are you sure you want to delete this category?"
          />
        </div>
      )}

      {/* Brand Tab Content */}
      {activeTab === "brand" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isBrandsLoading ? (
            <LoadingSpinner message="Loading brands..." />
          ) : isBrandsError ? (
            <div className="py-16 text-center text-red-500 text-lg">
              Failed to load brands.
            </div>
          ) : (
            <table className="min-w-full">
              {/* Table Header */}
              <thead className="bg-[#EBEBEB]">
                <tr>
                  <th className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={allBrandsSelected}
                      ref={(input) => {
                        if (input)
                          input.indeterminate =
                            someBrandsSelected && !allBrandsSelected;
                      }}
                      onChange={(e) => handleSelectAllBrands(e.target.checked)}
                      className="w-4 h-4 text-[#273E8E] bg-gray-100 border-gray-300 rounded focus:ring-[#273E8E] focus:ring-2"
                    />
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-black">
                      Brand Name
                    </span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-black">
                      Category
                    </span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-black">
                      Date Created
                    </span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-black">Status</span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-black">Action</span>
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100">
                {currentItems.map((item, index) => {
                  const brand = item as Brand;
                  return (
                  <tr
                    key={brand.id}
                    className={`${index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                      } transition-colors border-b border-gray-100 last:border-b-0 px-6 py-4 `}
                  >
                    {/* Checkbox */}
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={brand.isSelected || false}
                        onChange={() => handleSelectBrand(brand.id)}
                        className="w-4 h-4 text-[#273E8E] bg-gray-100 border-gray-300 rounded focus:ring-[#273E8E] focus:ring-2"
                      />
                    </td>

                    {/* Brand Name */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {brand.brandName}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600">
                        {brand.category}
                      </span>
                    </td>

                    {/* Date Created */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600">
                        {brand.dateCreated}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${brand.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {brand.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex space-x-2 justify-center items-center">
                        <button
                          onClick={() => handleEditBrand(brand.id)}
                          className="bg-[#273E8E] text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-[#1f2f7a] transition-colors cursor-pointer"
                        >
                          Edit Brand
                        </button>
                        <button
                          onClick={() => handleDeleteBrand(brand.id)}
                          className="bg-[#FF0000] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          
          {/* Pagination Controls for Brands */}
          {totalPages > 1 && activeTab === "brand" && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing {startIndex + 1} to {Math.min(endIndex, brandList.length)} of {brandList.length} results
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 text-sm font-medium rounded-md border ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-2 text-sm font-medium rounded-md border ${
                          currentPage === pageNumber
                            ? 'bg-[#273E8E] text-white border-[#273E8E]'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>
                
                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 text-sm font-medium rounded-md border ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {brandList.length === 0 && (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No brands found.</p>
            </div>
          )}
          <ConfirmDeleteModal
            isOpen={showDeleteBrandModal}
            onClose={cancelDeleteBrand}
            onConfirm={confirmDeleteBrand}
            message="Are you sure you want to delete this brand?"
          />
        </div>
      )}

      {/* Add New Category Modal */}
      <AddNewCategory
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onSave={handleAddNewCategory}
      />

      {/* Edit Category Modal */}
      <AddNewCategory
        isOpen={editCategoryModalOpen}
        onClose={() => {
          setEditCategoryModalOpen(false);
          setEditCategoryData(null);
        }}
        onSave={handleEditCategorySave}
        editMode={true}
        editData={editCategoryData}
      />

      {/* Add New Brand Modal */}
      <AddNewBrand
        isOpen={isAddBrandModalOpen}
        onClose={() => setIsAddBrandModalOpen(false)}
        onSave={handleAddNewBrand}
      />

      {/* Edit Brand Modal */}
      <AddNewBrand
        isOpen={editBrandModalOpen}
        onClose={() => {
          setEditBrandModalOpen(false);
          setEditBrandData(null);
        }}
        onSave={handleEditBrandSave}
        editMode={true}
        editData={editBrandData || undefined}
      />
    </div>
  );
};

export default Product;
