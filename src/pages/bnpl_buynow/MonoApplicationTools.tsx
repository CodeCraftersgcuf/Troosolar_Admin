import React, { useState } from "react";
import { getMonoUserDocuments } from "../../utils/queries/bnpl";
import {
  fetchMonoUserStatementPdf,
  runMonoUserCreditCheck,
} from "../../utils/mutations/bnpl";
import MonoDocumentsPanel from "./MonoDocumentsPanel";

type MonoApplicationLike = {
  credit_check_method?: string | null;
  mono_credit_status?: string | null;
  mono_can_afford?: boolean | null;
  mono_monthly_payment_kobo?: number | null;
  mono_credit_report?: Record<string, unknown> | null;
  mono_account_id?: string | null;
  loan_amount?: number | string | null;
  repayment_duration?: number | null;
};

interface MonoApplicationToolsProps {
  token: string;
  userId: number;
  userName: string;
  application?: MonoApplicationLike | null;
  onCreditCheckStarted?: () => void;
}

const formatNaira = (amount: number | null | undefined) => {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return `₦${Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const statusColor = (status?: string | null) => {
  const s = String(status || "").toLowerCase();
  if (s === "completed" || s === "success") return "text-green-700";
  if (s === "processing" || s === "pending") return "text-amber-700";
  if (s === "failed" || s === "error") return "text-red-700";
  return "text-gray-700";
};

const MonoApplicationTools: React.FC<MonoApplicationToolsProps> = ({
  token,
  userId,
  userName,
  application,
  onCreditCheckStarted,
}) => {
  const [loadingAction, setLoadingAction] = useState<
    "documents" | "pdf" | "credit" | null
  >(null);
  const [documentsPayload, setDocumentsPayload] = useState<unknown>(null);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [creditPrincipal, setCreditPrincipal] = useState("");
  const [creditTerm, setCreditTerm] = useState("12");
  const [showCreditModal, setShowCreditModal] = useState(false);

  const isAuto =
    String(application?.credit_check_method || "").toLowerCase() === "auto" ||
    Boolean(application?.mono_account_id);

  const openCreditModal = () => {
    const amount = application?.loan_amount;
    setCreditPrincipal(
      amount != null && !Number.isNaN(Number(amount)) ? String(amount) : ""
    );
    setCreditTerm(
      application?.repayment_duration != null && application.repayment_duration > 0
        ? String(application.repayment_duration)
        : "12"
    );
    setShowCreditModal(true);
  };

  const handleLoadDocuments = async () => {
    setLoadingAction("documents");
    try {
      const res = await getMonoUserDocuments(userId, token);
      if (res?.status === "success") {
        setDocumentsPayload(res.data);
        setShowDocumentsModal(true);
      } else {
        alert(res?.message || "Failed to fetch Mono bank data.");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to fetch Mono bank data.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStatementPdf = async () => {
    setLoadingAction("pdf");
    try {
      const res = await fetchMonoUserStatementPdf(
        userId,
        { period: "last6months" },
        token
      );
      if (res?.status === "success" && res?.data?.download_url) {
        window.open(res.data.download_url, "_blank", "noopener,noreferrer");
      } else {
        alert(res?.message || "Statement PDF is still processing. Try again shortly.");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to fetch statement PDF.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRunCreditCheck = async () => {
    const principal = Number(String(creditPrincipal).replace(/,/g, "").trim());
    if (!Number.isFinite(principal) || principal < 1) {
      alert("Enter a valid loan principal (₦).");
      return;
    }
    const term = parseInt(creditTerm, 10);
    if (!Number.isFinite(term) || term < 1) {
      alert("Enter a valid repayment term in months.");
      return;
    }

    setLoadingAction("credit");
    try {
      const res = await runMonoUserCreditCheck(
        userId,
        { loan_amount: principal, repayment_duration: term },
        token
      );
      if (res?.status === "success") {
        alert(
          res?.message ||
            "Credit check started. Results arrive via webhook — refresh this application in a few moments."
        );
        setShowCreditModal(false);
        onCreditCheckStarted?.();
      } else {
        alert(res?.message || "Failed to start credit check.");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to start credit check.");
    } finally {
      setLoadingAction(null);
    }
  };

  if (!isAuto) {
    return null;
  }

  const monoResultMessage =
    application?.mono_credit_report &&
    typeof application.mono_credit_report === "object" &&
    "message" in application.mono_credit_report
      ? String((application.mono_credit_report as { message?: string }).message || "")
      : null;

  return (
    <>
      <div className="bg-white rounded-lg border border-indigo-200 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 text-sm font-bold">
                M
              </span>
              Mono bank tools
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xl">
              View linked bank statement, identity, balance, and credit check results for this
              application — same data as Mono Loans.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <div>
            <p className="text-xs text-gray-500 mb-1">Credit status</p>
            <p className={`text-sm font-medium capitalize ${statusColor(application?.mono_credit_status)}`}>
              {application?.mono_credit_status || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Can afford loan</p>
            <p className="text-sm font-medium text-gray-900">
              {application?.mono_can_afford == null
                ? "—"
                : application.mono_can_afford
                  ? "Yes"
                  : "No"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Est. monthly payment</p>
            <p className="text-sm font-medium text-gray-900">
              {application?.mono_monthly_payment_kobo != null
                ? formatNaira(application.mono_monthly_payment_kobo / 100)
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Mono account</p>
            <p className="text-xs font-mono text-gray-700 break-all">
              {application?.mono_account_id || "—"}
            </p>
          </div>
        </div>

        {monoResultMessage && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Mono result: {monoResultMessage}
          </div>
        )}

        {application?.mono_credit_status === "processing" && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
            Credit check is still running in the background. Refresh this application in a few
            minutes to see updated results.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loadingAction != null}
            onClick={handleLoadDocuments}
            className="px-4 py-2 rounded-lg bg-[#273E8E] text-white text-sm font-medium hover:bg-[#1e3270] disabled:opacity-50"
          >
            {loadingAction === "documents" ? "Loading..." : "View bank data"}
          </button>
          <button
            type="button"
            disabled={loadingAction != null}
            onClick={handleStatementPdf}
            className="px-4 py-2 rounded-lg border border-[#273E8E] text-[#273E8E] text-sm font-medium hover:bg-indigo-50 disabled:opacity-50"
          >
            {loadingAction === "pdf" ? "Fetching..." : "Statement PDF"}
          </button>
          <button
            type="button"
            disabled={loadingAction != null}
            onClick={openCreditModal}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Run credit check
          </button>
        </div>
      </div>

      {showDocumentsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Mono bank data — {userName}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowDocumentsModal(false);
                  setDocumentsPayload(null);
                }}
                className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {documentsPayload ? (
                <MonoDocumentsPanel
                  payload={documentsPayload as Record<string, unknown>}
                  userId={userId}
                  userName={userName}
                  token={token}
                />
              ) : (
                <p className="text-sm text-gray-500">No data.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreditModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Run Mono credit check</h3>
              <button
                type="button"
                onClick={() => setShowCreditModal(false)}
                disabled={loadingAction === "credit"}
                className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Run a new credit check for <strong>{userName}</strong>. Application loan amount is
                pre-filled when available.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan principal (₦) *
                </label>
                <input
                  type="number"
                  min={1}
                  value={creditPrincipal}
                  onChange={(e) => setCreditPrincipal(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Term (months)
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={creditTerm}
                  onChange={(e) => setCreditTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreditModal(false)}
                  disabled={loadingAction === "credit"}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loadingAction === "credit"}
                  onClick={handleRunCreditCheck}
                  className="px-4 py-2 rounded-lg bg-[#273E8E] text-white text-sm font-medium disabled:opacity-50"
                >
                  {loadingAction === "credit" ? "Starting..." : "Run check"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MonoApplicationTools;
