import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBNPLSettings } from "../../utils/queries/bnpl";
import { updateBNPLSettings } from "../../utils/mutations/bnpl";

const ProductFinancingSettings = () => {
  const token = Cookies.get("token") || "";
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [creditCheckFee, setCreditCheckFee] = useState("1000");
  /** Same field as BNPL minimum; drives cart “Buy By Loan” + GET /api/config/loan-configuration. */
  const [minimumLoanAmount, setMinimumLoanAmount] = useState("1500000");

  const { data, isLoading } = useQuery({
    queryKey: ["bnpl-settings-product-financing"],
    queryFn: () => getBNPLSettings(token),
    enabled: !!token,
  });

  useEffect(() => {
    const payload = data?.data;
    if (!payload) return;
    setCreditCheckFee(String(payload.credit_check_fee ?? 1000));
    const minLoan = payload.minimum_loan_amount;
    setMinimumLoanAmount(
      minLoan != null && minLoan !== "" ? String(minLoan) : "1500000"
    );
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateBNPLSettings(
        {
          credit_check_fee: Number(creditCheckFee || 0),
          minimum_loan_amount: Number(minimumLoanAmount || 0),
        },
        token
      ),
    onSuccess: () => {
      setMessage("Product financing settings saved successfully.");
      queryClient.invalidateQueries({ queryKey: ["bnpl-settings-product-financing"] });
      queryClient.invalidateQueries({ queryKey: ["bnpl-settings"] });
    },
    onError: (err: any) => {
      setMessage(err?.response?.data?.message || err?.message || "Failed to save settings.");
    },
  });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Product Financing</h2>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="bg-[#273E8E] text-white px-6 py-3 rounded-full font-medium hover:bg-[#1d2f70] disabled:opacity-60 cursor-pointer"
        >
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <div className="mb-4 px-4 py-3 rounded bg-blue-50 text-blue-700 border border-blue-100">
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="py-10 text-center text-gray-500">Loading settings...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-5 space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Minimum order for Buy Now, Pay Later (cart)</h3>
            <p className="text-sm text-gray-600">
              Customers need a cart total (incl. VAT) at least this amount before &quot;Buy By Loan&quot;
              appears and they can start BNPL. The storefront reads this from the public loan configuration
              API (same value as minimum loan amount in BNPL settings).
            </p>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum amount (NGN)
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                value={minimumLoanAmount}
                onChange={(e) => setMinimumLoanAmount(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-lg">BNPL Credit Check Fee</h3>
            <p className="text-sm text-gray-600">
              This fee is charged at the end of the BNPL application flow before processing credit check.
            </p>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credit Check Fee (NGN)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={creditCheckFee}
                onChange={(e) => setCreditCheckFee(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFinancingSettings;

