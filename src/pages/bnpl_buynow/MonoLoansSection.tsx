import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  getMonoLinkedAccounts,
  getMonoCreditSessions,
  getMonoCreditSession,
  getMonoWebhookEvents,
  getMonoUserDocuments,
} from "../../utils/queries/bnpl";
import {
  runMonoUserCreditCheck,
  fetchMonoUserStatementPdf,
} from "../../utils/mutations/bnpl";

type MonoSubTab = "Linked Accounts" | "Credit Sessions" | "Webhook Events";

interface MonoLoansSectionProps {
  token: string;
}

const formatNaira = (amount: number | null | undefined) => {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return `₦${Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const MonoLoansSection: React.FC<MonoLoansSectionProps> = ({ token }) => {
  const queryClient = useQueryClient();
  const [monoSubTab, setMonoSubTab] = useState<MonoSubTab>("Linked Accounts");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedWebhookPayload, setSelectedWebhookPayload] = useState<unknown>(null);
  const [documentsPayload, setDocumentsPayload] = useState<unknown>(null);
  const [documentsTitle, setDocumentsTitle] = useState("");
  const [actionUserId, setActionUserId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"credit" | "documents" | "pdf" | null>(null);

  const listParams = {
    search: searchQuery || undefined,
    per_page: 15,
    page,
  };

  const { data: linkedData, isLoading: linkedLoading } = useQuery({
    queryKey: ["mono-linked-accounts", token, listParams],
    queryFn: () => getMonoLinkedAccounts(token, listParams),
    enabled: !!token && monoSubTab === "Linked Accounts",
  });

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ["mono-credit-sessions", token, listParams],
    queryFn: () => getMonoCreditSessions(token, listParams),
    enabled: !!token && monoSubTab === "Credit Sessions",
  });

  const { data: webhooksData, isLoading: webhooksLoading } = useQuery({
    queryKey: ["mono-webhook-events", token, listParams],
    queryFn: () => getMonoWebhookEvents(token, listParams),
    enabled: !!token && monoSubTab === "Webhook Events",
  });

  const { data: sessionDetail, isLoading: sessionDetailLoading } = useQuery({
    queryKey: ["mono-credit-session", selectedSessionId, token],
    queryFn: () => getMonoCreditSession(selectedSessionId as number, token),
    enabled: !!token && selectedSessionId != null,
  });

  const isLoading =
    (monoSubTab === "Linked Accounts" && linkedLoading) ||
    (monoSubTab === "Credit Sessions" && sessionsLoading) ||
    (monoSubTab === "Webhook Events" && webhooksLoading);

  const pagination =
    monoSubTab === "Linked Accounts"
      ? linkedData?.data
      : monoSubTab === "Credit Sessions"
        ? sessionsData?.data
        : webhooksData?.data;

  const rows: any[] = pagination?.data ?? [];

  const handleCheckCreditScore = async (userId: number, userName: string) => {
    if (!token) return;
    setActionUserId(userId);
    setActionType("credit");
    try {
      const res = await runMonoUserCreditCheck(userId, {}, token);
      if (res?.status === "success") {
        alert(
          res?.message ||
            `Credit check started for ${userName}. Check the Credit Sessions tab in a few moments.`
        );
        queryClient.invalidateQueries({ queryKey: ["mono-credit-sessions"] });
      } else {
        alert(res?.message || "Failed to start credit check.");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to start credit check.");
    } finally {
      setActionUserId(null);
      setActionType(null);
    }
  };

  const handleGetDocuments = async (userId: number, userName: string) => {
    if (!token) return;
    setActionUserId(userId);
    setActionType("documents");
    try {
      const res = await getMonoUserDocuments(userId, token);
      if (res?.status === "success") {
        setDocumentsTitle(`Mono Documents — ${userName}`);
        setDocumentsPayload(res.data);
      } else {
        alert(res?.message || "Failed to fetch documents.");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to fetch documents.");
    } finally {
      setActionUserId(null);
      setActionType(null);
    }
  };

  const handleGetStatementPdf = async (userId: number, _userName: string) => {
    if (!token) return;
    setActionUserId(userId);
    setActionType("pdf");
    try {
      const res = await fetchMonoUserStatementPdf(userId, { period: "last6months" }, token);
      if (res?.status === "success" && res?.data?.download_url) {
        window.open(res.data.download_url, "_blank", "noopener,noreferrer");
      } else if (res?.status === "success") {
        alert(res?.message || "PDF is still processing. Try again shortly.");
      } else {
        alert(res?.message || "Failed to fetch statement PDF.");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to fetch statement PDF.");
    } finally {
      setActionUserId(null);
      setActionType(null);
    }
  };

  const statusPill = (status: string) => {
    const s = String(status || "").toLowerCase();
    let bg = "#6B7280";
    if (s === "linked" || s === "completed" || s === "success") bg = "#10B981";
    if (s === "pending" || s === "processing") bg = "#F59E0B";
    if (s === "failed" || s === "error") bg = "#EF4444";
    return (
      <span
        className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize"
        style={{ backgroundColor: bg, color: "white" }}
      >
        {status || "—"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Mono Loans</h2>
        <p className="text-sm text-gray-500 mt-1">
          View linked bank accounts, run Mono credit checks, and pull account documents or statement PDFs — same data used in the BNPL flow.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
        {(["Linked Accounts", "Credit Sessions", "Webhook Events"] as MonoSubTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setMonoSubTab(tab);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              monoSubTab === tab
                ? "bg-[#273E8E] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
        </div>
        <input
          type="text"
          placeholder="Search user, email, bank, Mono ID..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-[#273E8E]"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading Mono data..." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                {monoSubTab === "Linked Accounts" && (
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">User</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Bank</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Account</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Mono Account ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Linked At</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                )}
                {monoSubTab === "Credit Sessions" && (
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">User</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Can Afford</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Principal</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Monthly (Mono)</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Total Debt</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Action</th>
                  </tr>
                )}
                {monoSubTab === "Webhook Events" && (
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Event</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Mono Account ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Processed</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Received</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Action</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No records found.
                    </td>
                  </tr>
                ) : monoSubTab === "Linked Accounts" ? (
                  rows.map((row) => (
                    <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {row.user?.full_name || "—"}
                        </div>
                        <div className="text-xs text-gray-500">{row.user?.email || "—"}</div>
                      </td>
                      <td className="px-4 py-3">{row.bank_name || row.display_label || "—"}</td>
                      <td className="px-4 py-3">
                        {row.account_name || "—"}
                        {row.account_number_last4 ? ` ••••${row.account_number_last4}` : ""}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs break-all">{row.mono_account_id || "—"}</td>
                      <td className="px-4 py-3">{statusPill(row.status)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(row.linked_at || row.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5 min-w-[160px]">
                          <button
                            type="button"
                            disabled={actionUserId === row.user_id}
                            onClick={() => handleCheckCreditScore(row.user_id, row.user?.full_name || "User")}
                            className="text-left text-[#273E8E] hover:underline font-medium disabled:opacity-50"
                          >
                            {actionUserId === row.user_id && actionType === "credit"
                              ? "Checking..."
                              : "Check credit score"}
                          </button>
                          <button
                            type="button"
                            disabled={actionUserId === row.user_id}
                            onClick={() => handleGetDocuments(row.user_id, row.user?.full_name || "User")}
                            className="text-left text-[#273E8E] hover:underline font-medium disabled:opacity-50"
                          >
                            {actionUserId === row.user_id && actionType === "documents"
                              ? "Loading..."
                              : "Get documents"}
                          </button>
                          <button
                            type="button"
                            disabled={actionUserId === row.user_id}
                            onClick={() => handleGetStatementPdf(row.user_id, row.user?.full_name || "User")}
                            className="text-left text-[#273E8E] hover:underline font-medium disabled:opacity-50"
                          >
                            {actionUserId === row.user_id && actionType === "pdf"
                              ? "Fetching PDF..."
                              : "Statement PDF"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : monoSubTab === "Credit Sessions" ? (
                  rows.map((row) => (
                    <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{row.user?.full_name || "—"}</div>
                        <div className="text-xs text-gray-500">{row.user?.email || "—"}</div>
                      </td>
                      <td className="px-4 py-3">{statusPill(row.status)}</td>
                      <td className="px-4 py-3">
                        {row.can_afford == null ? (
                          "—"
                        ) : (
                          <span className={row.can_afford ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                            {row.can_afford ? "Yes" : "No"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">{formatNaira(row.principal_naira)}</td>
                      <td className="px-4 py-3">{formatNaira(row.monthly_payment_naira)}</td>
                      <td className="px-4 py-3">{formatNaira(row.total_debt_naira)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(row.created_at)}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedSessionId(row.id)}
                          className="text-[#273E8E] hover:underline font-medium"
                        >
                          View response
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{row.event}</td>
                      <td className="px-4 py-3 font-mono text-xs break-all">{row.mono_account_id || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(row.processed_at)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(row.created_at)}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedWebhookPayload(row.payload)}
                          className="text-[#273E8E] hover:underline font-medium"
                        >
                          View payload
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= pagination.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedSessionId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Mono Credit Response — Session #{selectedSessionId}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedSessionId(null)}
                className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {sessionDetailLoading ? (
                <LoadingSpinner message="Loading session..." />
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">User:</span> {sessionDetail?.data?.user?.full_name}</div>
                    <div><span className="text-gray-500">Status:</span> {sessionDetail?.data?.status}</div>
                    <div><span className="text-gray-500">Can afford:</span> {String(sessionDetail?.data?.can_afford ?? "—")}</div>
                    <div><span className="text-gray-500">BVN:</span> {sessionDetail?.data?.bvn || "—"}</div>
                    <div><span className="text-gray-500">Mono account:</span> {sessionDetail?.data?.mono_account_id || "—"}</div>
                    {sessionDetail?.data?.error_message && (
                      <div className="md:col-span-2 text-red-600">
                        <span className="text-gray-500">Error:</span> {sessionDetail.data.error_message}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Full credit worthiness payload</p>
                    <pre className="text-xs bg-gray-900 text-green-100 p-4 rounded-lg overflow-x-auto max-h-96">
                      {JSON.stringify(sessionDetail?.data?.credit_worthiness_payload ?? {}, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {documentsPayload != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{documentsTitle}</h3>
              <button
                type="button"
                onClick={() => {
                  setDocumentsPayload(null);
                  setDocumentsTitle("");
                }}
                className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <p className="text-sm text-gray-600 mb-3">
                Account details, identity, balance, JSON statement, and latest credit session from Mono.
              </p>
              <pre className="text-xs bg-gray-900 text-green-100 p-4 rounded-lg overflow-x-auto max-h-[70vh]">
                {JSON.stringify(documentsPayload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {selectedWebhookPayload != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Mono Webhook Payload</h3>
              <button
                type="button"
                onClick={() => setSelectedWebhookPayload(null)}
                className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <pre className="text-xs bg-gray-900 text-green-100 p-4 rounded-lg overflow-x-auto max-h-[70vh]">
                {JSON.stringify(selectedWebhookPayload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonoLoansSection;
