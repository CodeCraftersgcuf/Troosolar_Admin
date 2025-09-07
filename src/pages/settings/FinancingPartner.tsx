import { useState, useEffect } from "react";
import AddPartner from "./AddPartner";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

//Code Related to Integration
import { deletePartnerFinancing } from "../../utils/mutations/finance";
import { getAllFinance } from "../../utils/queries/finance";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";

interface Partner {
  id: string;
  name: string;
  partnerEmail?: string;
  numberOfLoans: number;
  amount: string;
  dateCreated: string;
  status: "Active" | "Inactive";
}

const FinancingPartner = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partner | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);
  const [apiMessage, setApiMessage] = useState<string>("");

  // Fetch partners from API
  const token = Cookies.get("token");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["all-finance-partners"],
    queryFn: () => getAllFinance(token || ""),
    enabled: !!token,
  });

  // Set partners when API data changes
  // This replaces the onSuccess option
  useEffect(() => {
    if (data?.status === "success" && Array.isArray(data.data)) {
      setPartners(
        data.data.map((p: any) => ({
          id: String(p.id), // Use API id
          name: p["Partner name"] || "",
          partnerEmail: p["Email"] || "",
          numberOfLoans: p["No of Loans"] ?? 0,
          amount: `N${p["Amount"] ?? 0}`,
          dateCreated: p["Date Created"]
            ? new Date(p["Date Created"]).toLocaleString()
            : "",
          status:
            p["Status"] === "active" || p["Status"] === "Active"
              ? "Active"
              : "Inactive",
        }))
      );
      setApiMessage(data.message || "");
    } else if (data?.message) {
      setApiMessage(data.message);
    }
  }, [data]);

  const handleAddNewPartner = () => {
    setEditMode(false);
    setEditData(null);
    setIsAddPartnerModalOpen(true);
  };

  const handleEditCategory = (partnerId: string) => {
    const partner = partners.find((p) => p.id === partnerId);
    if (partner) {
      setEditMode(true);
      setEditData(partner);
      setIsAddPartnerModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsAddPartnerModalOpen(false);
    setEditMode(false);
    setEditData(null);
  };

  const handleSavePartner = (partnerData: any) => {
    if (editMode && editData) {
      setPartners(
        partners.map((p) =>
          p.id === editData.id
            ? {
                ...p,
                name: partnerData.partnerName,
                status: partnerData.status,
                // Optionally update other fields if needed
              }
            : p
        )
      );
    } else {
      const newPartner: Partner = {
        id: (partners.length + 1).toString(),
        name: partnerData.partnerName,
        numberOfLoans: 0,
        amount: "N0",
        dateCreated: new Date().toLocaleDateString(),
        status: partnerData.status,
      };
      setPartners([...partners, newPartner]);
    }
  };

  // Delete partner mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePartnerFinancing(id, token || ""),
    onSuccess: () => {
      refetch();
    },
  });

  const handleDelete = (partnerId: string) => {
    const partner = partners.find((p) => p.id === partnerId);
    if (partner) {
      setPartnerToDelete(partner);
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = () => {
    if (partnerToDelete) {
      deleteMutation.mutate(partnerToDelete.id);
      setShowDeleteModal(false);
      setPartnerToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPartnerToDelete(null);
  };

  return (
    <div className="w-full">
      {/* Add New Partner Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleAddNewPartner}
          className="bg-[#273E8E] text-white px-6 py-3 rounded-full font-medium hover:bg-[#273E8E] transition-colors cursor-pointer"
        >
          Add New Partner
        </button>
      </div>

      {/* Backend message display */}
      {apiMessage && (
        <div className="mb-4 px-4 py-3 rounded bg-blue-50 text-blue-700 border border-blue-100">
          {apiMessage}
        </div>
      )}

      {/* Partners Table */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-500 text-lg">
            Loading partners...
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-red-500 text-lg">
            Failed to load partners.
          </div>
        ) : (
          <table className="min-w-full">
            {/* Table Header */}
            <thead className="bg-[#EBEBEB]">
              <tr>
                <th className="px-6 py-4 ">
                  <div className="flex justify-center items-center space-x-1">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="font-medium text-black text-sm">
                      Partner Name
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center">
                  <span className="font-medium text-black text-sm">
                    No of loans
                  </span>
                </th>
                <th className="px-6 py-4 text-center">
                  <span className="font-medium text-black text-sm">Amount</span>
                </th>
                <th className="px-6 py-4 text-center">
                  <span className="font-medium text-black text-sm">
                    Date Created
                  </span>
                </th>
                <th className="px-6 py-4 text-center">
                  <span className="font-medium text-black text-sm">Status</span>
                </th>
                <th className="px-6 py-4 text-center">
                  <span className="font-medium text-black text-sm">Action</span>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100">
              {partners.map((partner, index) => (
                <tr
                  key={partner.id}
                  className={`${
                    index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                  } transition-colors border-b border-gray-100 last:border-b-0 px-6 py-4 `}
                >
                  <td className="px-8 py-4 text-center">
                    <div className="flex justify-center items-center space-x-1">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-[#273E8E] border-gray-300 rounded focus:ring-[#273E8E]"
                      />
                      <span className="text-gray-800 text-sm font-medium">
                        {partner.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-600 text-sm">
                      {partner.numberOfLoans}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-600 text-sm">
                      {partner.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-600 text-sm">
                      {partner.dateCreated}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        partner.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {partner.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <button
                        onClick={() => handleEditCategory(partner.id)}
                        className="bg-[#273E8E] text-white px-5 py-3 rounded-full text-sm font-xs hover:bg-[#1f2f7a] transition-colors cursor-pointer"
                      >
                        Edit Category
                      </button>
                      <button
                        onClick={() => handleDelete(partner.id)}
                        className="bg-[#FF0000] text-white px-10 py-3 rounded-full text-sm font-xs hover:bg-[#FF0000] transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Partner Modal */}
      <AddPartner
        isOpen={isAddPartnerModalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePartner}
        editMode={editMode}
        editData={editData}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this partner?"
      />
    </div>
  );
};

export default FinancingPartner;
