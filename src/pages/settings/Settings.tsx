import { useState } from "react";
import Admin from "./Admin.tsx";
import Header from "../../component/Header.tsx";
import FinancingPartner from "./FinancingPartner.tsx";
import Tools from "./Tools.tsx";
import Notifications from "./Notifications.tsx";
import Product from "./Product.tsx";



const Settings = () => {
  const [activeTab, setActiveTab] = useState<
    "admins" | "tools" | "product" | "financing" | "notifications"
  >("admins");

  const tabs = [
    { id: "admins", label: "Admins" },
    { id: "tools", label: "Tools" },
    { id: "product", label: "Product" },
    { id: "financing", label: "Financing Partner" },
    { id: "notifications", label: "Notifications" },
  ];

  return (
    <div className="min-[#F5F7FF]  bg-[#F5F7FF]">
      {/* Header */}
      <Header />

      <div className="p-6">
        <h1 className="text-3xl font-semibold mb-8">Settings</h1>

        {/* Tab Navigation */}
        <div className="flex gap-8 border-b border-gray-200 text-md mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 cursor-pointer relative ${activeTab === tab.id
                ? "text-black font-semibold"
                : "text-[#00000080]"
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#273E8E] rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={activeTab === "admins" ? "" : "px-6"}>
          {activeTab === "admins" && <Admin />}
          {activeTab === "tools" && <Tools />}
          {activeTab === "product" && <Product />}
          {activeTab === "financing" && <FinancingPartner />}
          {activeTab === "notifications" && <Notifications />}
        </div>
      </div>
    </div>
  );
};

export default Settings;
