import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getReferralSettings } from "../../utils/queries/referral";
import { updateReferralSettings } from "../../utils/mutations/referral";

const PricingRewardsSettings = () => {
  const token = Cookies.get("token") || "";
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const [outrightDiscountPercentage, setOutrightDiscountPercentage] = useState("0");
  const [referralRewardType, setReferralRewardType] = useState<"percentage" | "fixed">("percentage");
  const [referralRewardValue, setReferralRewardValue] = useState("0");
  const [minimumWithdrawal, setMinimumWithdrawal] = useState("0");

  const { data, isLoading } = useQuery({
    queryKey: ["referral-settings"],
    queryFn: () => getReferralSettings(token),
    enabled: !!token,
  });

  useEffect(() => {
    const payload = data?.data;
    if (!payload) return;
    setOutrightDiscountPercentage(String(payload.outright_discount_percentage ?? 0));
    setReferralRewardType((payload.referral_reward_type as "percentage" | "fixed") || "percentage");
    setReferralRewardValue(String(payload.referral_reward_value ?? payload.commission_percentage ?? 0));
    setMinimumWithdrawal(String(payload.minimum_withdrawal ?? 0));
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateReferralSettings(
        {
          outright_discount_percentage: Number(outrightDiscountPercentage || 0),
          referral_reward_type: referralRewardType,
          referral_reward_value: Number(referralRewardValue || 0),
          minimum_withdrawal: Number(minimumWithdrawal || 0),
        },
        token
      ),
    onSuccess: () => {
      setMessage("Settings saved successfully.");
      queryClient.invalidateQueries({ queryKey: ["referral-settings"] });
    },
    onError: (err: any) => {
      setMessage(err?.message || "Failed to save settings.");
    },
  });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Pricing & Rewards</h2>
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
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-semibold text-lg">Buy Now Discount</h3>
            <p className="text-sm text-gray-600">
              Applied as a global discount to outright purchases (Buy Now checkout).
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Outright Discount Percentage (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={outrightDiscountPercentage}
                onChange={(e) => setOutrightDiscountPercentage(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-semibold text-lg">Referral Reward</h3>
            <p className="text-sm text-gray-600">
              Buy Now rewards are credited after order completion. BNPL rewards are credited after down payment.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reward Type</label>
                <select
                  value={referralRewardType}
                  onChange={(e) => setReferralRewardType(e.target.value as "percentage" | "fixed")}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reward Value {referralRewardType === "percentage" ? "(%)" : "(NGN)"}
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={referralRewardValue}
                  onChange={(e) => setReferralRewardValue(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-semibold text-lg">Referral Withdrawal</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Withdrawal (NGN)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={minimumWithdrawal}
                onChange={(e) => setMinimumWithdrawal(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingRewardsSettings;

