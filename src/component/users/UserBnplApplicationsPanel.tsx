import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getBNPLApplications, getBNPLOrders } from "../../utils/queries/bnpl";

interface UserBnplApplicationsPanelProps {
  userId: string;
}

const formatCurrency = (amount: number | string | null | undefined) => {
  if (amount == null || amount === "") return "—";
  const n = Number(amount);
  if (Number.isNaN(n)) return "—";
  return `₦${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const statusClass = (status?: string | null) => {
  const s = String(status || "").toLowerCase();
  if (s === "approved" || s === "delivered") return "text-green-700 bg-green-50";
  if (s === "rejected" || s === "cancelled") return "text-red-700 bg-red-50";
  if (s === "pending" || s === "processing") return "text-amber-700 bg-amber-50";
  return "text-gray-700 bg-gray-50";
};

const UserBnplApplicationsPanel: React.FC<UserBnplApplicationsPanelProps> = ({ userId }) => {
  const token = Cookies.get("token") || "";

  const {
    data: applicationsData,
    isLoading: applicationsLoading,
    isError: applicationsError,
  } = useQuery({
    queryKey: ["user-bnpl-applications", userId],
    queryFn: () =>
      getBNPLApplications(token, {
        user_id: userId,
        per_page: 50,
        page: 1,
      }),
    enabled: !!token && !!userId,
  });

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
  } = useQuery({
    queryKey: ["user-bnpl-orders", userId],
    queryFn: () =>
      getBNPLOrders(token, {
        user_id: userId,
        per_page: 50,
        page: 1,
      }),
    enabled: !!token && !!userId,
  });

  const applications: any[] = applicationsData?.data?.data ?? [];
  const orders: any[] = ordersData?.data?.data ?? [];

  if (applicationsLoading || ordersLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
        BNPL loan applications and orders for this user. Open any application in{" "}
        <strong>BNPL &amp; Buy Now</strong> for full review, Mono bank data, and approval actions.
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">BNPL applications</h2>
        {applicationsError ? (
          <p className="text-sm text-red-600">Failed to load applications.</p>
        ) : applications.length === 0 ? (
          <p className="text-sm text-gray-500">No BNPL applications for this user.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Loan amount</th>
                  <th className="px-4 py-3">Term</th>
                  <th className="px-4 py-3">Credit check</th>
                  <th className="px-4 py-3">Mono status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">#{app.id}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusClass(app.status)}`}
                      >
                        {app.status || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatCurrency(app.loan_amount)}</td>
                    <td className="px-4 py-3">
                      {app.repayment_duration != null ? `${app.repayment_duration} mo` : "—"}
                    </td>
                    <td className="px-4 py-3 capitalize">{app.credit_check_method || "—"}</td>
                    <td className="px-4 py-3 capitalize">{app.mono_credit_status || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(app.created_at)}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/bnpl-buynow?tab=applications&applicationId=${app.id}`}
                        className="text-[#273E8E] font-medium hover:underline"
                      >
                        Open in BNPL Admin
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">BNPL orders</h2>
        {ordersError ? (
          <p className="text-sm text-red-600">Failed to load orders.</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-gray-500">No BNPL orders for this user yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">#{order.id}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusClass(order.order_status)}`}
                      >
                        {order.order_status || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatCurrency(order.total_price)}</td>
                    <td className="px-4 py-3 capitalize">{order.payment_status || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/bnpl-buynow?tab=orders&orderId=${order.id}`}
                        className="text-[#273E8E] font-medium hover:underline"
                      >
                        Open order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default UserBnplApplicationsPanel;
