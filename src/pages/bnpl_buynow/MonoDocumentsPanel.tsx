import React, { useMemo } from "react";
import { fetchMonoUserStatementPdf } from "../../utils/mutations/bnpl";

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

const dash = (value: unknown) => {
  if (value == null || value === "") return "—";
  return String(value);
};

interface MonoDocumentsPanelProps {
  payload: Record<string, unknown>;
  userId: number;
  userName: string;
  token: string;
}

const MonoDocumentsPanel: React.FC<MonoDocumentsPanelProps> = ({
  payload,
  userId,
  userName,
  token,
}) => {
  const summary = (payload.summary || {}) as Record<string, unknown>;
  const identity = (payload.identity || {}) as Record<string, unknown>;
  const transactions = (payload.transactions || []) as Array<Record<string, unknown>>;
  const statementMeta = (payload.statement_meta || {}) as Record<string, unknown>;
  const creditSession = (payload.latest_credit_session || null) as Record<string, unknown> | null;
  const partialErrors = (payload.partial_errors || {}) as Record<string, string>;
  const statementPdf = (payload.statement_pdf || {}) as Record<string, unknown>;

  const accountLabel = useMemo(() => {
    const name = dash(summary.account_name);
    const last4 = summary.account_number_last4;
    if (name !== "—" && last4) return `${name} ••••${last4}`;
    if (summary.account_number) return String(summary.account_number);
    return name;
  }, [summary]);

  const downloadCsv = () => {
    if (transactions.length === 0) {
      alert("No transactions to export.");
      return;
    }
    const header = ["Date", "Narration", "Type", "Amount (NGN)", "Category"];
    const rows = transactions.map((tx) => [
      dash(tx.date),
      `"${String(tx.narration || "").replace(/"/g, '""')}"`,
      dash(tx.type),
      tx.amount_naira != null ? String(tx.amount_naira) : "",
      dash(tx.category),
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mono-statement-${userName.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSummaryJson = () => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mono-documents-${userName.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openStatementPdf = async () => {
    const directUrl = statementPdf.download_url as string | undefined;
    if (directUrl) {
      window.open(directUrl, "_blank", "noopener,noreferrer");
      return;
    }
    try {
      const res = await fetchMonoUserStatementPdf(userId, { period: "last6months" }, token);
      if (res?.status === "success" && res?.data?.download_url) {
        window.open(res.data.download_url, "_blank", "noopener,noreferrer");
      } else {
        alert(res?.message || "Bank statement PDF is still processing. Try again in a few seconds.");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to download statement PDF.");
    }
  };

  const printReport = () => {
    window.print();
  };

  const field = (label: string, value: unknown) => (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900 break-words">{dash(value)}</p>
    </div>
  );

  return (
    <div className="space-y-6 mono-documents-print">
      <div className="flex flex-wrap gap-2 print:hidden">
        <button
          type="button"
          onClick={openStatementPdf}
          className="px-4 py-2 rounded-lg bg-[#273E8E] text-white text-sm font-medium hover:bg-[#1e3270]"
        >
          Download bank statement (PDF)
        </button>
        <button
          type="button"
          onClick={downloadCsv}
          disabled={transactions.length === 0}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Download transactions (CSV)
        </button>
        <button
          type="button"
          onClick={downloadSummaryJson}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Download full report (JSON)
        </button>
        <button
          type="button"
          onClick={printReport}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Print summary
        </button>
      </div>

      {Object.keys(partialErrors).length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium mb-1">Some items could not be loaded from Mono:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {Object.entries(partialErrors).map(([key, msg]) => (
              <li key={key}>
                <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span> {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Bank</p>
          <p className="text-base font-semibold text-gray-900 mt-1">{dash(summary.bank_name)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Account holder</p>
          <p className="text-base font-semibold text-gray-900 mt-1">{accountLabel}</p>
          {summary.account_number ? (
            <p className="text-xs text-gray-500 mt-1 font-mono">{String(summary.account_number)}</p>
          ) : null}
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Available balance</p>
          <p className="text-base font-semibold text-gray-900 mt-1">
            {formatNaira(summary.balance_naira as number | undefined)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Linked on</p>
          <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(summary.linked_at as string)}</p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900">Account information</h4>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {field("Account type", summary.account_type)}
          {field("Currency", summary.currency)}
          {field("Mono account ID", summary.mono_account_id)}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900">Identity (from linked bank)</h4>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {field("Full name", identity.full_name)}
          {field("Email", identity.email)}
          {field("Phone", identity.phone)}
          {field("BVN", identity.bvn)}
          {field("Date of birth", identity.dob)}
          {field("Gender", identity.gender)}
        </div>
      </section>

      {creditSession && (
        <section className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900">Latest credit check</h4>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {field("Status", creditSession.status)}
            {field(
              "Can afford loan",
              creditSession.can_afford == null ? "—" : creditSession.can_afford ? "Yes" : "No"
            )}
            {field("Loan principal", formatNaira(creditSession.principal_naira as number))}
            {field("Monthly payment", formatNaira(creditSession.monthly_payment_naira as number))}
            {field("Total debt", formatNaira(creditSession.total_debt_naira as number))}
            {field("Checked on", formatDate(creditSession.created_at as string))}
          </div>
        </section>
      )}

      <section className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-gray-900">Bank statement — last 6 months</h4>
          <span className="text-xs text-gray-500">
            {transactions.length} transaction{transactions.length === 1 ? "" : "s"}
            {statementMeta.count != null ? ` (${String(statementMeta.count)} from Mono)` : ""}
          </span>
        </div>
        {transactions.length === 0 ? (
          <p className="p-6 text-sm text-gray-500 text-center">
            No transactions returned from Mono for this account.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Description</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => (
                  <tr key={String(tx.id ?? idx)} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{formatDate(tx.date as string)}</td>
                    <td className="px-4 py-2.5 text-gray-900">{dash(tx.narration)}</td>
                    <td className="px-4 py-2.5 capitalize text-gray-600">{dash(tx.type)}</td>
                    <td
                      className={`px-4 py-2.5 text-right font-medium ${
                        String(tx.type).toLowerCase() === "credit" ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {formatNaira(tx.amount_naira as number)}
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

export default MonoDocumentsPanel;
