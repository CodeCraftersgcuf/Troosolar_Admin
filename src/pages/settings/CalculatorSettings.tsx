import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getCalculatorSettings } from "../../utils/queries/calculator";
import { updateCalculatorSettings } from "../../utils/mutations/calculator";

type InverterRange = {
  min_kw: number;
  max_kw: number;
  target_kva: number;
  label: string;
};

type SavingsProfile = {
  key: string;
  label: string;
  hourly_fuel_l: number;
  default_monthly_service: number;
  default_monthly_phcn: number;
  default_cost_of_generator: number;
  cost_of_solar_system: number;
  fuel_cost_per_litre: number;
};

const CalculatorSettings = () => {
  const token = Cookies.get("token") || "";
  const [inverterRanges, setInverterRanges] = useState<InverterRange[]>([]);
  const [profiles, setProfiles] = useState<SavingsProfile[]>([]);
  const [bundleTypes, setBundleTypes] = useState<string[]>(["Inverter + Battery", "Solar+Inverter+Battery"]);
  const [newBundleType, setNewBundleType] = useState("");
  const [maintenance, setMaintenance] = useState<number>(150000);
  const [message, setMessage] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["calculator-settings"],
    queryFn: () => getCalculatorSettings(token),
    enabled: !!token,
  });

  useEffect(() => {
    const payload = data?.data || {};
    if (Array.isArray(payload.inverter_ranges)) {
      setInverterRanges(
        payload.inverter_ranges.map((r: any) => ({
          min_kw: Number(r?.min_kw) || 0,
          max_kw: Number(r?.max_kw) || 0,
          target_kva: Number(r?.target_kva) || 0,
          label: String(r?.label || ""),
        }))
      );
    }
    if (Array.isArray(payload.solar_savings_profiles)) {
      setProfiles(
        payload.solar_savings_profiles.map((p: any) => ({
          key: String(p?.key || ""),
          label: String(p?.label || ""),
          hourly_fuel_l: Number(p?.hourly_fuel_l) || 0,
          default_monthly_service: Number(p?.default_monthly_service) || 0,
          default_monthly_phcn: Number(p?.default_monthly_phcn) || 0,
          default_cost_of_generator: Number(p?.default_cost_of_generator) || 0,
          cost_of_solar_system: Number(p?.cost_of_solar_system) || 0,
          fuel_cost_per_litre: Number(p?.fuel_cost_per_litre) || 0,
        }))
      );
    }
    if (payload.solar_maintenance_5_years != null) {
      setMaintenance(Number(payload.solar_maintenance_5_years) || 0);
    }
    if (Array.isArray(payload.bundle_types)) {
      const normalized = payload.bundle_types
        .map((v: any) => String(v ?? "").trim())
        .filter(Boolean);
      setBundleTypes(normalized.length ? Array.from(new Set(normalized)) : ["Inverter + Battery", "Solar+Inverter+Battery"]);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateCalculatorSettings(
        {
          inverter_ranges: inverterRanges,
          solar_savings_profiles: profiles,
          bundle_types: bundleTypes,
          solar_maintenance_5_years: Number(maintenance) || 0,
        },
        token
      ),
    onSuccess: (res) => {
      setMessage(res?.message || "Calculator settings saved successfully.");
      refetch();
    },
    onError: (err: any) => {
      setMessage(err?.message || "Failed to save calculator settings.");
    },
  });

  const updateRange = (idx: number, key: keyof InverterRange, value: string) => {
    setInverterRanges((prev) =>
      prev.map((row, i) =>
        i === idx
          ? {
              ...row,
              [key]: key === "label" ? value : Number(value || 0),
            }
          : row
      )
    );
  };

  const updateProfile = (idx: number, key: keyof SavingsProfile, value: string) => {
    setProfiles((prev) =>
      prev.map((row, i) =>
        i === idx
          ? {
              ...row,
              [key]:
                key === "key" || key === "label"
                  ? value
                  : Number(value || 0),
            }
          : row
      )
    );
  };

  const addBundleType = () => {
    const trimmed = newBundleType.trim();
    if (!trimmed) return;
    if (bundleTypes.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setNewBundleType("");
      return;
    }
    setBundleTypes((prev) => [...prev, trimmed]);
    setNewBundleType("");
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Calculator Settings</h2>
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
        <div className="py-10 text-center text-gray-500">Loading calculator settings...</div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b bg-gray-50">
              <h3 className="font-semibold text-lg">Inverter Selection Ranges</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#EBEBEB]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm">Min Load (kW)</th>
                    <th className="px-4 py-3 text-left text-sm">Max Load (kW)</th>
                    <th className="px-4 py-3 text-left text-sm">Target (kVA)</th>
                    <th className="px-4 py-3 text-left text-sm">Inverter Label</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inverterRanges.map((row, idx) => (
                    <tr key={`${row.label}-${idx}`}>
                      <td className="px-4 py-2">
                        <input className="w-full border rounded px-2 py-1 text-sm" type="number" step="0.01" value={row.min_kw} onChange={(e) => updateRange(idx, "min_kw", e.target.value)} />
                      </td>
                      <td className="px-4 py-2">
                        <input className="w-full border rounded px-2 py-1 text-sm" type="number" step="0.01" value={row.max_kw} onChange={(e) => updateRange(idx, "max_kw", e.target.value)} />
                      </td>
                      <td className="px-4 py-2">
                        <input className="w-full border rounded px-2 py-1 text-sm" type="number" step="0.1" value={row.target_kva} onChange={(e) => updateRange(idx, "target_kva", e.target.value)} />
                      </td>
                      <td className="px-4 py-2">
                        <input className="w-full border rounded px-2 py-1 text-sm" value={row.label} onChange={(e) => updateRange(idx, "label", e.target.value)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b bg-gray-50">
              <h3 className="font-semibold text-lg">Bundle Types</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBundleType}
                  onChange={(e) => setNewBundleType(e.target.value)}
                  placeholder="Add bundle type"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={addBundleType}
                  className="bg-[#273E8E] text-white px-4 py-2 rounded text-sm"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {bundleTypes.map((type) => (
                  <span key={type} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
                    {type}
                    <button
                      type="button"
                      onClick={() => setBundleTypes((prev) => prev.filter((t) => t !== type))}
                      className="text-red-600 hover:text-red-800"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Solar Savings Profiles</h3>
              <div className="text-sm">
                Maintenance (5 years):{" "}
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-40 ml-2"
                  value={maintenance}
                  onChange={(e) => setMaintenance(Number(e.target.value || 0))}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#EBEBEB]">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs">Key</th>
                    <th className="px-3 py-3 text-left text-xs">Label</th>
                    <th className="px-3 py-3 text-left text-xs">Fuel L/hr</th>
                    <th className="px-3 py-3 text-left text-xs">Service</th>
                    <th className="px-3 py-3 text-left text-xs">PHCN</th>
                    <th className="px-3 py-3 text-left text-xs">Gen Cost</th>
                    <th className="px-3 py-3 text-left text-xs">Solar Cost</th>
                    <th className="px-3 py-3 text-left text-xs">Fuel/Litre</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {profiles.map((row, idx) => (
                    <tr key={`${row.key}-${idx}`}>
                      <td className="px-3 py-2"><input className="w-28 border rounded px-2 py-1 text-xs" value={row.key} onChange={(e) => updateProfile(idx, "key", e.target.value)} /></td>
                      <td className="px-3 py-2"><input className="w-32 border rounded px-2 py-1 text-xs" value={row.label} onChange={(e) => updateProfile(idx, "label", e.target.value)} /></td>
                      <td className="px-3 py-2"><input className="w-24 border rounded px-2 py-1 text-xs" type="number" step="0.01" value={row.hourly_fuel_l} onChange={(e) => updateProfile(idx, "hourly_fuel_l", e.target.value)} /></td>
                      <td className="px-3 py-2"><input className="w-24 border rounded px-2 py-1 text-xs" type="number" value={row.default_monthly_service} onChange={(e) => updateProfile(idx, "default_monthly_service", e.target.value)} /></td>
                      <td className="px-3 py-2"><input className="w-24 border rounded px-2 py-1 text-xs" type="number" value={row.default_monthly_phcn} onChange={(e) => updateProfile(idx, "default_monthly_phcn", e.target.value)} /></td>
                      <td className="px-3 py-2"><input className="w-24 border rounded px-2 py-1 text-xs" type="number" value={row.default_cost_of_generator} onChange={(e) => updateProfile(idx, "default_cost_of_generator", e.target.value)} /></td>
                      <td className="px-3 py-2"><input className="w-24 border rounded px-2 py-1 text-xs" type="number" value={row.cost_of_solar_system} onChange={(e) => updateProfile(idx, "cost_of_solar_system", e.target.value)} /></td>
                      <td className="px-3 py-2"><input className="w-24 border rounded px-2 py-1 text-xs" type="number" value={row.fuel_cost_per_litre} onChange={(e) => updateProfile(idx, "fuel_cost_per_litre", e.target.value)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculatorSettings;

