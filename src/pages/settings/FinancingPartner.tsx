import { useState } from "react";
import AddPartner from "./AddPartner";

interface Partner {
  id: string;
  name: string;
  numberOfLoans: number;
  amount: string;
  dateCreated: string;
  status: "Active" | "Inactive";
}

const FinancingPartner = () => {
  const [partners, setPartners] = useState<Partner[]>([
    {
      id: "1",
      name: "ABC Partner",
      numberOfLoans: 10,
      amount: "N10,000,000",
      dateCreated: "05-07-25/07:22AM",
      status: "Active",
    },
    {
      id: "2",
      name: "ABC Partner",
      numberOfLoans: 10,
      amount: "N10,000,000",
      dateCreated: "05-07-25/07:22AM",
      status: "Active",
    },
    {
      id: "3",
      name: "ABC Partner",
      numberOfLoans: 10,
      amount: "N10,000,000",
      dateCreated: "05-07-25/07:22AM",
      status: "Active",
    },
  ]);

  const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);

  const handleAddNewPartner = () => {
    setIsAddPartnerModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddPartnerModalOpen(false);
  };

  const handleSavePartner = (partnerData: any) => {
    const newPartner: Partner = {
      id: (partners.length + 1).toString(),
      name: partnerData.partnerName,
      numberOfLoans: 0,
      amount: "N0",
      dateCreated: new Date().toLocaleDateString(),
      status: partnerData.status,
    };
    setPartners([...partners, newPartner]);
  };

  const handleEditCategory = (partnerId: string) => {
    // Handle edit category logic
    console.log("Edit category for partner:", partnerId);
  };

  const handleDelete = (partnerId: string) => {
    // Handle delete logic
    console.log("Delete partner:", partnerId);
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

      {/* Partners Table */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
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
      </div>

      {/* Add Partner Modal */}
      <AddPartner
        isOpen={isAddPartnerModalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePartner}
      />
    </div>
  );
};

export default FinancingPartner;
