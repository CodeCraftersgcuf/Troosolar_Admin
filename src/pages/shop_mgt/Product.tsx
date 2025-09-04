import { useState, useEffect, useRef } from "react";
import { productData } from "./shpmgt";
import type { ProductData } from "./shpmgt";
import ProductDetails from "./ProductDetails";
import images from "../../constants/images";

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
  const [selectedCategory, setSelectedCategory] = useState("Categories");
  const [selectedAvailability, setSelectedAvailability] =
    useState("Availability");
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  // Brand options with customizable PNG paths - CUSTOMIZE THESE PATHS
  // To add your own icons, replace the icon paths below with your actual PNG file paths
  // Example: icon: "/assets/images/your-icon-name.png"
  const brandOptions = [
    // {
    //   value: "",
    //   label: "Brand",
    //   icon: null,
    // },
    {
      value: "solar-panels",
      label: "Solar Panels",
      icon: "/assets/images/solarpanel.png", // REPLACE WITH YOUR PNG PATH
    },
    {
      value: "batteries",
      label: "Batteries",
      icon: "/assets/images/batteries.png", // REPLACE WITH YOUR PNG PATH
    },
    {
      value: "inverters",
      label: "Inverters",
      icon: "/assets/images/inverters.png", // REPLACE WITH YOUR PNG PATH
    },
    {
      value: "mttp-chargers",
      label: "MTTP Chargers",
      icon: "/assets/images/mttpcharger.png", // REPLACE WITH YOUR PNG PATH
    },
    {
      value: "led-bulbs",
      label: "LED Bulbs",
      icon: "/assets/images/bulb.png", // REPLACE WITH YOUR PNG PATH
    },
    {
      value: "solar-fans",
      label: "Solar Fans",
      icon: "/assets/images/solarfans.png", // REPLACE WITH YOUR PNG PATH
    },
  ];

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

  const getSelectedBrandOption = () => {
    return (
      brandOptions.find((option) => option.value === selectedBrand) ||
      brandOptions[0]
    );
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
              "Solar Equipment",
              "Energy Storage",
              "Accessories",
              "Electronics",
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
                {brandOptions.map((option, index) => (
                  <button
                    key={option.value}
                    onClick={() => handleBrandSelect(option)}
                    className={`w-full flex items-center px-4 py-4 rounded-2xl mb-2 transition-colors ${
                      selectedBrand === option.value
                        ? "bg-blue-50 text-blue-600"
                        : "bg-[#f3f3f3] text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    <div className="w-14 h-14 mr-4 flex items-center justify-center bg-[#bebef1] rounded-full">
                      <img
                        src={option.icon}
                        alt={option.label}
                        className="w-12 h-12 object-contain"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
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
            placeholder="Search"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {productData.map((product: ProductData) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-[#CDCDCD] shadow-sm hover:shadow-lg transition-shadow relative overflow-hidden cursor-pointer"
              >
                {/* Product Image - You can customize the image source here */}
                <div className="aspect-square bg-white overflow-hidden p-2.5 ">
                  <img
                    src={product.image || "/assets/images/newman1.png"} // Default fallback image
                    alt={product.name}
                    className="w-full h-full"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = "/assets/images/newmanbadge.png";
                    }}
                  />
                </div>

                {/* Separator Line */}
                {/* <div className=" border-gray-200"></div> */}

                {/* Product Info */}
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
                            className={`w-3 h-3 ${
                              star <= 4 ? "text-[#273E8E]" : "text-[#D9D9D9]"
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

        {/* Bundles Section */}
        <div className="w-60 border-l border-[#00000080] pl-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Bundles</h2>

          {/* Bundle Cards */}
          <div className="space-y-4">
            {/* Bundle 1 */}
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

                <div className=" border-t pt-3 pb-3 border-[#CDCDCD] flex flex-row justify-between">
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
                          className={`w-3 h-3 ${
                            star <= 4 ? "text-[#273E8E]" : "text-[#D9D9D9]"
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

            {/* Bundle 2 */}
            <div className="bg-white rounded-lg border border-[#FF0000] shadow-sm relative">
              <div className="aspect-[4/3] bg-white rounded-lg overflow-hidden p-1.5">
                <img
                  src={images.maxibundle}
                  alt="Newman Inverter Bundle"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-2.5">
                <h3 className="font-medium text-gray-900 text-md mb-2">
                  2 Newman Inverters + 1 Solar panel + 4 LED bulbs
                </h3>

                <div className=" border-t pt-3 pb-3 border-[#CDCDCD] flex flex-row justify-between">
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
                          className={`w-3 h-3 ${
                            star <= 4 ? "text-[#273E8E]" : "text-[#D9D9D9]"
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
      </div>

      {/* Product Details Modal */}
      <ProductDetails
        isOpen={isProductDetailsOpen}
        onClose={handleCloseProductDetails}
        product={selectedProduct}
      />
    </>
  );
};

export default Product;
