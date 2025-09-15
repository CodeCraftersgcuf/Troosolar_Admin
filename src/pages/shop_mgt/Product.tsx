import { useState, useEffect, useRef, useMemo } from "react";
import { productData } from "./shpmgt";
import type { ProductData } from "./shpmgt";
import ProductDetails from "./ProductDetails";
import AddProduct from "./AddProduct";
import images from "../../constants/images";


//Code Related to the Integration
import { getAllProducts } from "../../utils/queries/product";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getAllBundles } from "../../utils/queries/bundle";
import { getAllCategories } from "../../utils/queries/categories";
import { getAllBrands } from "../../utils/queries/brands";

// API Response Interfaces
interface ApiProductDetail {
  id: number;
  detail: string;
  product_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ApiProductImage {
  id: number;
  product_id: number;
  image: string;
  created_at: string;
  updated_at: string;
}

interface ApiProduct {
  id: number;
  title: string;
  category_id: number;
  brand_id: number;
  price: number;
  discount_price: number;
  discount_end_date: string;
  stock: string;
  installation_price: number | null;
  top_deal: boolean;
  installation_compulsory: boolean;
  featured_image: string;
  created_at: string;
  updated_at: string;
  old_quantity: string;
  featured_image_url: string;
  details: ApiProductDetail[];
  images: ApiProductImage[];
  reviews: unknown[];
}

interface ApiBundleItem {
  id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

interface ApiCustomService {
  id: number;
  name: string;
  price: number;
  created_at: string;
  updated_at: string;
}

interface ApiBundle {
  id: number;
  title: string | null;
  featured_image: string | null;
  bundle_type: string | null;
  total_price: number;
  discount_price: number;
  discount_end_date: string | null;
  created_at: string;
  updated_at: string;
  featured_image_url: string | null;
  bundle_items: ApiBundleItem[];
  custom_services: ApiCustomService[];
}

interface ApiCategory {
  id: number;
  title: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

interface ApiBrand {
  id: number;
  title: string;
  icon: string;
  category_id: number;
  created_at: string;
  updated_at: string;
}


interface DropdownProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

const CustomDropdown = ({ options, selected, onSelect }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-between w-32 cursor-pointer rounded-md border border-[#00000080] bg-white px-2 py-2 text-sm font-medium text-black shadow-sm hover:bg-gray-50 focus:outline-none"
        >
          {selected}
          <img src={images.arrow} alt="" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute mt-2 w-32 origin-top-right rounded-xl shadow-xl bg-white border border-gray-200 z-50">
          <ul className="py-2">
            {options.map((option: string, index: number) => (
              <li
                key={index}
                onClick={() => handleSelect(option)}
                className="px-2 py-2 text-black text-sm cursor-pointer hover:bg-gray-100"
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Product = () => {
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(
    null
  );
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<unknown>(null);
  const [selectedCategory, setSelectedCategory] = useState("Categories");
  const [selectedAvailability, setSelectedAvailability] =
    useState("Availability");
  const [searchQuery, setSearchQuery] = useState("");
  const brandDropdownRef = useRef<HTMLDivElement>(null);
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [bundleImageLoadingStates, setBundleImageLoadingStates] = useState<{ [key: string]: boolean }>({});

  // Get token from cookies
  const token = Cookies.get('token') || '';

  // Fetch products data
  const {
    data: productsResponse,
    isLoading: productsLoading,
    error: productsError
  } = useQuery({
    queryKey: ['products'],
    queryFn: () => getAllProducts(token),
    enabled: !!token,
  });

  // Fetch bundles data
  const {
    data: bundlesResponse,
    isLoading: bundlesLoading,
    error: bundlesError
  } = useQuery({
    queryKey: ['bundles'],
    queryFn: () => getAllBundles(token),
    enabled: !!token,
  });

  // Fetch categories data
  const {
    data: categoriesResponse,
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getAllCategories(token),
    enabled: !!token,
  });

  // Fetch brands data
  const {
    data: brandsResponse,
    isLoading: brandsLoading
  } = useQuery({
    queryKey: ['brands'],
    queryFn: () => getAllBrands(token),
    enabled: !!token,
  });

  // Extract data from API responses
  const apiProducts: ApiProduct[] = useMemo(() => (productsResponse as { data?: ApiProduct[] })?.data || [], [productsResponse]);
  const apiBundles: ApiBundle[] = useMemo(() => (bundlesResponse as { data?: ApiBundle[] })?.data || [], [bundlesResponse]);
  const apiCategories: ApiCategory[] = useMemo(() => (categoriesResponse as { data?: ApiCategory[] })?.data || [], [categoriesResponse]);
  const apiBrands: ApiBrand[] = useMemo(() => (brandsResponse as { data?: ApiBrand[] })?.data || [], [brandsResponse]);

  // Helper function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Helper function to calculate discount percentage
  const calculateDiscountPercentage = (originalPrice: number, discountPrice: number) => {
    if (originalPrice <= 0) return 0;
    return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  };

  // Helper function to get full image URL
  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return '/assets/images/newmanbadge.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_BASE_URL || 'https://troosolar.hmstech.org'}${imagePath}`;
  };

  // Filter products based on selected filters and search query
  const filteredProducts = useMemo(() => {
    let filtered = apiProducts;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "Categories") {
      const selectedCategoryData = apiCategories.find(cat => cat.title === selectedCategory);
      if (selectedCategoryData) {
        filtered = filtered.filter(product => product.category_id === selectedCategoryData.id);
      }
    }

    // Filter by brand
    if (selectedBrand) {
      const selectedBrandData = apiBrands.find(brand => brand.id.toString() === selectedBrand);
      if (selectedBrandData) {
        filtered = filtered.filter(product => product.brand_id === selectedBrandData.id);
      }
    }

    // Filter by availability
    if (selectedAvailability === "Out of Stock") {
      filtered = filtered.filter(product => parseInt(product.stock) === 0);
    } else if (selectedAvailability === "All") {
      // Show all products (no additional filtering)
    }

    return filtered;
  }, [apiProducts, searchQuery, selectedCategory, selectedBrand, selectedAvailability, apiCategories, apiBrands]);

  // Handle image loading states
  const handleImageLoad = (imageId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageId]: false }));
  };

  const handleImageError = (imageId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageId]: false }));
  };

  const handleBundleImageLoad = (imageId: string) => {
    setBundleImageLoadingStates(prev => ({ ...prev, [imageId]: false }));
  };

  const handleBundleImageError = (imageId: string) => {
    setBundleImageLoadingStates(prev => ({ ...prev, [imageId]: false }));
  };

  // Set initial loading states for images
  useEffect(() => {
    if (apiProducts.length > 0) {
      const initialStates: { [key: string]: boolean } = {};
      apiProducts.forEach(product => {
        initialStates[`product-${product.id}`] = true;
      });
      setImageLoadingStates(initialStates);
    }
  }, [apiProducts]);

  useEffect(() => {
    if (apiBundles.length > 0) {
      const initialStates: { [key: string]: boolean } = {};
      apiBundles.forEach(bundle => {
        initialStates[`bundle-${bundle.id}`] = true;
      });
      setBundleImageLoadingStates(initialStates);
    }
  }, [apiBundles]);

  // Brand options from API data
  const brandOptions = useMemo(() => {
    if (brandsLoading) {
      return [{
        value: "",
        label: "Loading...",
        icon: null,
      }];
    }

    return apiBrands.map(brand => ({
      value: brand.id.toString(),
      label: brand.title,
      icon: getImageUrl(brand.icon),
    }));
  }, [apiBrands, brandsLoading]);

  // Custom dropdown handlers
  const handleBrandSelect = (brand: {
    value: string;
    label: string;
    icon: string | null;
  }) => {
    setSelectedBrand(brand.value);
    setIsBrandDropdownOpen(false);
  };

  const toggleBrandDropdown = () => {
    setIsBrandDropdownOpen(!isBrandDropdownOpen);
  };


  // Handle opening product details modal
  const handleViewDetails = (product: ProductData) => {
    setSelectedProduct(product);
    setIsProductDetailsOpen(true);
  };

  const handleCloseProductDetails = () => {
    setIsProductDetailsOpen(false);
    setSelectedProduct(null);
  };

  const handleEditProduct = (product: unknown) => {
    setEditingProduct(product);
    setIsAddProductOpen(true);
    setIsProductDetailsOpen(false);
  };

  const handleCloseAddProduct = () => {
    setIsAddProductOpen(false);
    setEditingProduct(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBrandDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Header with filters */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          {/* Filter Dropdowns */}
          <CustomDropdown
            options={[
              "Categories",
              ...(categoriesLoading ? ["Loading..."] : apiCategories.map(cat => cat.title))
            ]}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />

          <div className="relative" ref={brandDropdownRef}>
            <button
              onClick={toggleBrandDropdown}
              className="px-4 py-2 border border-[#00000080] rounded-lg text-sm font-medium bg-white hover:bg-gray-100 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer flex items-center justify-between w-[120px]"
            >
              <span>
                {selectedBrand
                  ? brandOptions.find((opt) => opt.value === selectedBrand)
                    ?.label
                  : "Brand"}
              </span>

              <svg
                className="w-4 h-4 text-gray-500 ml-2"
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

            {/* Dropdown Menu */}
            {isBrandDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-2xl shadow-xl z-50 overflow-y-auto p-2"
                style={{ width: "400px", height: "auto", maxHeight: "450px" }}
              >
                {brandOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleBrandSelect(option)}
                    className={`w-full flex items-center px-4 py-4 rounded-2xl mb-2 transition-colors ${selectedBrand === option.value
                      ? "bg-blue-50 text-blue-600"
                      : "bg-[#f3f3f3] text-gray-800 hover:bg-gray-200"
                      }`}
                  >
                    <div className="w-14 h-14 mr-4 flex items-center justify-center bg-[#bebef1] rounded-full">
                      <img
                        src={option.icon || ''}
                        alt={option.label}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    </div>
                    <span className="text-lg font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <CustomDropdown
            options={["Availability", "All", "Out of Stock"]}
            selected={selectedAvailability}
            onSelect={setSelectedAvailability}
          />
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-[#00000080] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-180"
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
      </div>

      {/* Main Content Layout */}
      <div className="flex gap-4">
        {/* All Products Section */}
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900 mb-6">All Products</h2>

          {/* Product Grid */}
          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {[...Array(8)].map((_, _index) => (
                <div
                  key={_index}
                  className="bg-white rounded-2xl border border-[#CDCDCD] shadow-sm animate-pulse"
                >
                  <div className="aspect-square bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-2.5">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="border-b border-t pt-3 pb-3 border-[#CDCDCD]">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="flex justify-between items-center mt-5">
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-8 bg-gray-200 rounded-full w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : productsError ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error loading products. Using fallback data.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
                {productData.map((product: ProductData) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-[#CDCDCD] shadow-sm hover:shadow-lg transition-shadow relative overflow-hidden cursor-pointer"
                  >
                    <div className="aspect-square bg-white overflow-hidden p-2.5">
                      <img
                        src={product.image || "/assets/images/newman1.png"}
                        alt={product.name}
                        className="w-full h-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/assets/images/newmanbadge.png";
                        }}
                      />
                    </div>
                    <div className="p-2.5">
                      <h3 className="font-medium text-black text-md leading-tight mb-2">
                        {product.name}
                      </h3>
                      <div className="border-b border-t pt-3 pb-3 border-[#CDCDCD] flex flex-row justify-between">
                        <div className="flex flex-col">
                          <div>
                            <span className="text-[#273E8E] font-bold text-[20px]">
                              N2,500,000
                            </span>
                          </div>
                          <div className="flex flex-row gap-1.5">
                            <div>
                              <span className="line-through text-[#00000080] text-[13px]">
                                N5,500,000
                              </span>
                            </div>
                            <div>
                              <span className="text-[#FFA500] bg-[#FFA50033] rounded-full p-1">
                                -50%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col mt-[-5px]">
                          <div>
                            <span className="text-sm font-medium text-black text-[10px]">
                              12/50
                            </span>
                            <div className="w-16 bg-[#D9D9D9] rounded-full h-2 mt-1">
                              <div
                                className="bg-gradient-to-r from-red-600 to-green-600 h-2 rounded-full"
                                style={{ width: "75%" }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex flex-row mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-3 h-3 ${star <= 4 ? "text-[#273E8E]" : "text-[#D9D9D9]"
                                  }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-5">
                        <span className="text-xs font-semibold text-black text-[15px]">
                          {product.stock} Orders
                        </span>
                        <button
                          onClick={() => handleViewDetails(product)}
                          className="bg-[#273E8E] hover:bg-[#1e3270] text-white py-3 px-6 rounded-full text-xs font-semibold transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {filteredProducts.length > 0 ? filteredProducts.map((product: ApiProduct) => {
                const discountPercentage = calculateDiscountPercentage(product.price, product.discount_price);
                const stockPercentage = product.old_quantity ?
                  Math.round((parseInt(product.stock) / parseInt(product.old_quantity)) * 100) : 0;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-[#CDCDCD] shadow-sm hover:shadow-lg transition-shadow relative overflow-hidden cursor-pointer"
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-white overflow-hidden p-2.5 relative">
                      {imageLoadingStates[`product-${product.id}`] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#273E8E]"></div>
                        </div>
                      )}
                      <img
                        src={getImageUrl(product.featured_image_url)}
                        alt={product.title}
                        className="w-full h-full"
                        onLoad={() => handleImageLoad(`product-${product.id}`)}
                        onError={() => {
                          handleImageError(`product-${product.id}`);
                          const img = document.querySelector(`img[alt="${product.title}"]`) as HTMLImageElement;
                          if (img) img.src = "/assets/images/newmanbadge.png";
                        }}
                        style={{ display: imageLoadingStates[`product-${product.id}`] ? 'none' : 'block' }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-2.5">
                      <h3 className="font-medium text-black text-md leading-tight mb-2">
                        {product.title}
                      </h3>

                      <div className="border-b border-t pt-3 pb-3 border-[#CDCDCD] flex flex-row justify-between">
                        <div className="flex flex-col">
                          <div>
                            <span className="text-[#273E8E] font-bold text-[20px]">
                              {formatPrice(product.discount_price)}
                            </span>
                          </div>
                          <div className="flex flex-row gap-1.5">
                            <div>
                              <span className="line-through text-[#00000080] text-[13px]">
                                {formatPrice(product.price)}
                              </span>
                            </div>
                            {discountPercentage > 0 && (
                              <div>
                                <span className="text-[#FFA500] bg-[#FFA50033] rounded-full p-1">
                                  -{discountPercentage}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col mt-[-5px]">
                          <div>
                            <span className="text-sm font-medium text-black text-[10px]">
                              {product.stock}/{product.old_quantity}
                            </span>
                            <div className="w-16 bg-[#D9D9D9] rounded-full h-2 mt-1">
                              <div
                                className="bg-gradient-to-r from-red-600 to-green-600 h-2 rounded-full"
                                style={{ width: `${stockPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex flex-row mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-3 h-3 ${star <= 4 ? "text-[#273E8E]" : "text-[#D9D9D9]"
                                  }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section - Orders and Button */}
                      <div className="flex items-center justify-between mt-5">
                        <span className="text-xs font-semibold text-black text-[15px]">
                          {product.stock} Orders
                        </span>
                        <button
                          onClick={() => {
                            // Convert API product to ProductData format for compatibility
                            const convertedProduct: ProductData = {
                              id: product.id.toString(),
                              name: product.title,
                              category: "Solar Equipment", // Default category
                              price: formatPrice(product.discount_price),
                              stock: parseInt(product.stock),
                              status: "Active",
                              image: getImageUrl(product.featured_image_url),
                              description: product.details.map(d => d.detail).join(", ") || "No description available"
                            };
                            handleViewDetails(convertedProduct);
                          }}
                          className="bg-[#273E8E] hover:bg-[#1e3270] text-white py-3 px-6 rounded-full text-xs font-semibold transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">
                    {searchQuery || selectedCategory !== "Categories" || selectedBrand || selectedAvailability !== "Availability"
                      ? "No products found matching your filters"
                      : "No products available"}
                  </p>
                  {(searchQuery || selectedCategory !== "Categories" || selectedBrand || selectedAvailability !== "Availability") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("Categories");
                        setSelectedBrand("");
                        setSelectedAvailability("Availability");
                      }}
                      className="mt-2 text-blue-500 hover:text-blue-700 text-sm underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bundles Section */}
        <div className="w-60 border-l border-[#00000080] pl-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Bundles</h2>

          {/* Bundle Cards */}
          {bundlesLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, _index) => (
                <div
                  key={_index}
                  className="bg-white rounded-lg border border-[#800080] shadow-sm animate-pulse"
                >
                  <div className="aspect-[4/3] bg-gray-200 rounded-lg"></div>
                  <div className="p-2.5">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="border-t pt-3 pb-3 border-[#CDCDCD]">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : bundlesError ? (
            <div className="text-center py-4">
              <p className="text-red-500 text-sm">Error loading bundles</p>
              <div className="space-y-4 mt-4">
                {/* Fallback Bundle 1 */}
                <div className="bg-white rounded-lg border border-[#800080] shadow-sm relative">
                  <div className="aspect-[4/3] bg-white rounded-lg overflow-hidden p-1.5">
                    <img
                      src={images.minibundle}
                      alt="Newman Inverter Bundle"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-2.5">
                    <h3 className="font-medium text-gray-900 text-md mb-2">
                      2 Newman Inverters + 1 Solar panel + 4 LED bulbs
                    </h3>
                    <div className="border-t pt-3 pb-3 border-[#CDCDCD] flex flex-row justify-between">
                      <div className="flex flex-col">
                        <div>
                          <span className="text-[#273E8E] font-bold text-[20px]">
                            N2,500,000
                          </span>
                        </div>
                        <div className="flex flex-row gap-1.5">
                          <div>
                            <span className="line-through text-[#00000080] text-[13px]">
                              N5,500,000
                            </span>
                          </div>
                          <div>
                            <span className="text-[#FFA500] bg-[#FFA50033] rounded-full p-1">
                              -50%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col mt-[-5px]">
                        <div>
                          <span className="text-sm font-medium text-black text-[10px]">
                            12/50
                          </span>
                          <div className="w-16 bg-[#D9D9D9] rounded-full h-2 mt-1">
                            <div
                              className="bg-gradient-to-r from-red-600 to-green-600 h-2 rounded-full"
                              style={{ width: "75%" }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex flex-row mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-3 h-3 ${star <= 4 ? "text-[#273E8E]" : "text-[#D9D9D9]"
                                }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {apiBundles.length > 0 ? apiBundles.map((bundle: ApiBundle) => {
                // Skip bundles with no title or invalid data
                if (!bundle.title || bundle.total_price === 0) return null;

                const discountPercentage = calculateDiscountPercentage(bundle.total_price, bundle.discount_price);
                const borderColor = bundle.bundle_type === 'Mini' ? '#800080' : '#FF0000';

                return (
                  <div
                    key={bundle.id}
                    className="bg-white rounded-lg border shadow-sm relative"
                    style={{ borderColor }}
                  >
                    <div className="aspect-[4/3] bg-white rounded-lg overflow-hidden p-1.5 relative">
                      {bundleImageLoadingStates[`bundle-${bundle.id}`] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#273E8E]"></div>
                        </div>
                      )}
                      <img
                        src={getImageUrl(bundle.featured_image_url)}
                        alt={bundle.title}
                        className="w-full h-full object-contain"
                        onLoad={() => handleBundleImageLoad(`bundle-${bundle.id}`)}
                        onError={() => {
                          handleBundleImageError(`bundle-${bundle.id}`);
                          const img = document.querySelector(`img[alt="${bundle.title}"]`) as HTMLImageElement;
                          if (img) {
                            img.src = bundle.bundle_type === 'Mini' ? images.minibundle : images.maxibundle;
                          }
                        }}
                        style={{ display: bundleImageLoadingStates[`bundle-${bundle.id}`] ? 'none' : 'block' }}
                      />
                    </div>

                    <div className="p-2.5">
                      <h3 className="font-medium text-gray-900 text-md mb-2">
                        {bundle.title}
                      </h3>

                      <div className="border-t pt-3 pb-3 border-[#CDCDCD] flex flex-row justify-between">
                        <div className="flex flex-col">
                          <div>
                            <span className="text-[#273E8E] font-bold text-[20px]">
                              {formatPrice(bundle.discount_price)}
                            </span>
                          </div>
                          <div className="flex flex-row gap-1.5">
                            <div>
                              <span className="line-through text-[#00000080] text-[13px]">
                                {formatPrice(bundle.total_price)}
                              </span>
                            </div>
                            {discountPercentage > 0 && (
                              <div>
                                <span className="text-[#FFA500] bg-[#FFA50033] rounded-full p-1">
                                  -{discountPercentage}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col mt-[-5px]">
                          <div>
                            <span className="text-sm font-medium text-black text-[10px]">
                              {bundle.bundle_items.length} items
                            </span>
                            <div className="w-16 bg-[#D9D9D9] rounded-full h-2 mt-1">
                              <div
                                className="bg-gradient-to-r from-red-600 to-green-600 h-2 rounded-full"
                                style={{ width: "75%" }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex flex-row mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-3 h-3 ${star <= 4 ? "text-[#273E8E]" : "text-[#D9D9D9]"
                                  }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }).filter(Boolean) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No bundles available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Details Modal */}
      <ProductDetails
        isOpen={isProductDetailsOpen}
        onClose={handleCloseProductDetails}
        product={selectedProduct}
        onEdit={handleEditProduct}
      />

      {/* Add/Edit Product Modal */}
      <AddProduct
        isOpen={isAddProductOpen}
        onClose={handleCloseAddProduct}
        editingProduct={editingProduct}
      />
    </>
  );
};

export default Product;
