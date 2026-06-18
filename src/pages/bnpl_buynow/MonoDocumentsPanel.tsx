import React, { useMemo, useState } from "react";

const formatNaira = (amount: number | string | null | undefined, inKobo = true) => {
  if (amount == null || amount === "") return "—";
  const n = Number(amount);
  if (Number.isNaN(n)) return "—";
  const naira = inKobo ? n / 100 : n;
  return `₦${naira.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const unwrap = (payload: unknown): Record<string, unknown> | null => {
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as Record<string, unknown>;
  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
    return obj.data as Record<string, unknown>;
  }
  return obj;
};

const display = (value: unknown) => {
  if (value == null || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const field = (label: string, value: unknown) => (
  <div>
    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
    <p className="text-sm font-medium text-gray-900 break-words">{display(value)}</p>
  </div>
);

interface MonoDocumentsPanelProps {
  payload: Record<string, unknown>;
}

const MonoDocumentsPanel: React.FC<MonoDocumentsPanelProps> = ({ payload }) => {
  const [showRaw, setShowRaw] = useState(false);

  const linked = (payload.linked_account || {}) as Record<string, unknown>;
  const account = unwrap(payload.account_details);
  const identity = unwrap(payload.identity);
  const balance = unwrap(payload.balance);
  const statement = unwrap(payload.statement_json);
  const creditSession = (payload.latest_credit_session || null) as Record<string, unknown> | null;
  const partialErrors = (payload.partial_errors || {}) as Record<string, string>;

  const transactions = useMemo(() => {
    const raw =
      statement?.statement ??
      statement?.transactions ??
      (Array.isArray(statement) ? statement : null);
    if (!Array.isArray(raw)) return [];
    return raw.slice(0, 25);
  }, [statement]);

  const meta = (statement?.meta || {}) as Record<string, unknown>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Bank</p>
          <p className="text-sm font-semibold text-gray-900">{String(linked.bank_name || "—")}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Account</p>
          <p className="text-sm font-semibold text-gray-900">
            {String(linked.account_name || "—")}
            {linked.account_number_last4 ? ` ••••${linked.account_number_last4}` : ""}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Available balance</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatNaira(balance?.available_balance as number | string | undefined)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Linked at</p>
          <p className="text-sm font-semibold text-gray-900">{formatDate(linked.linked_at as string)}</p>
        </div>
      </div>

      {Object.keys(partialErrors).length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium mb-1">Some Mono data could not be loaded:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {Object.entries(partialErrors).map(([key, msg]) => (
              <li key={key}>
                <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span> {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900">Account details</h4>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {field("Account name", account?.name || account?.account_name)}
          {field("Account number", account?.account_number)}
          {field("Bank", (account?.institution as { name?: string } | undefined)?.name || (account?.bank as { name?: string } | undefined)?.name)}
          {field("Account type", account?.type)}
          {field("Currency", account?.currency)}
          {field("Mono account ID", payload.mono_account_id as string)}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900">Identity (from bank)</h4>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {field("Full name", identity?.full_name || identity?.fullName)}
          {field("Email", identity?.email)}
          {field("Phone", identity?.phone)}
          {field("BVN", identity?.bvn)}
          {field("DOB", identity?.dob || identity?.date_of_birth)}
          {field("Gender", identity?.gender)}
        </div>
      </section>

      {creditSession && (
        <section className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900">Latest credit session</h4>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {field("Status", creditSession.status)}
            {field(
              "Can afford",
              creditSession.can_afford == null
                ? "—"
                : creditSession.can_afford
                  ? "Yes"
                  : "No"
            )}
            {field("Principal", formatNaira(creditSession.principal_naira as number, false))}
            {field("Monthly payment", formatNaira(creditSession.monthly_payment_naira as number, false))}
            {field("Total debt", formatNaira(creditSession.total_debt_naira as number, false))}
            {field("Date", formatDate(creditSession.created_at as string))}
          </div>
        </section>
      )}

      <section className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-gray-900">Recent transactions (last 6 months)</h4>
          {meta.count != null && (
            <span className="text-xs text-gray-500">{String(meta.count)} transactions</span>
          )}
        </div>
        {transactions.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No transactions returned.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Narration</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Type</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx: Record<string, unknown>, idx: number) => (
                  <tr key={String(tx.id ?? idx)} className="border-t border-gray-50">
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{formatDate(tx.date as string)}</td>
                    <td className="px-4 py-2 text-gray-900 max-w-xs truncate" title={String(tx.narration || "")}>
                      {String(tx.narration || "—")}
                    </td>
                    <td className="px-4 py-2 capitalize text-gray-600">{String(tx.type || "—")}</td>
                    <td
                      className={`px-4 py-2 text-right font-medium ${
                        String(tx.type).toLowerCase() === "credit" ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {formatNaira(tx.amount as number | string)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(meta.total_credits != null || meta.total_debits != null) && (
          <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-600">
            {meta.total_credits != null && (
              <span>Total credits: {formatNaira(meta.total_credits as number | string)}</span>
            )}
            {meta.total_debits != null && (
              <span>Total debits: {formatNaira(meta.total_debits as number | string)}</span>
            )}
          </div>
        )}
      </section>

      <div>
        <button
          type="button"
          onClick={() => setShowRaw((v) => !v)}
          className="text-sm text-[#273E8E] hover:underline font-medium"
        >
          {showRaw ? "Hide raw JSON" : "View raw JSON"}
        </button>
        {showRaw && (
          <pre className="mt-2 text-xs bg-gray-900 text-green-100 p-4 rounded-lg overflow-x-auto max-h-96">
            {JSON.stringify(payload, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default MonoDocumentsPanel;
