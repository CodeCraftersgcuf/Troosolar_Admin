import { useState } from "react";
import { solarRoomTypes } from "./solarpanelcal";
import type { SolarApplianceItem } from "./solarpanelcal";
import images from "../../constants/images";

const SolarPanelCal = () => {
  // Solar Panel Calculator state
  const [solarCurrentAppliances, setSolarCurrentAppliances] = useState<
    SolarApplianceItem[]
  >(solarRoomTypes.find((room) => room.id === "1bedroom")?.appliances || []);

  // Calculate total load for solar panel calculator
  const totalLoad = solarCurrentAppliances.reduce(
    (total, appliance) => total + appliance.totalWattage,
    0
  );

  // Calculate inverter rating (typically 20% more than total load)
  const inverterRating = Math.round(totalLoad * 1.2);

  // Solar Panel Calculator handlers
  const handleSolarQuantityChange = (applianceId: string, change: number) => {
    setSolarCurrentAppliances((prev) =>
      prev.map((appliance) => {
        if (appliance.id === applianceId) {
          const newQuantity = Math.max(0, appliance.quantity + change);
          return {
            ...appliance,
            quantity: newQuantity,
            totalWattage: appliance.wattage * newQuantity,
          };
        }
        return appliance;
      })
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-8">
        Solar Panel Calculator
      </h2>

      <div className="flex gap-5">
        {/* Appliances List */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-[#00000080] overflow-hidden">
            {/* Appliances Rows */}
            <div className="divide-y divide-[#CDCDCD]">
              {solarCurrentAppliances.map((appliance) => (
                <div key={appliance.id} className="px-6 py-3">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    {/* Appliance Name */}
                    <div className="text-white bg-[#273E8E] px-2 py-2 rounded-full w-21.5 text-sm font-medium">
                      {appliance.name}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() =>
                          handleSolarQuantityChange(appliance.id, -1)
                        }
                        className="w-8 h-8 flex items-center justify-center transition-colors"
                      >
                        <img src={images.minus} alt="" />
                      </button>
                      <span className="w-8 text-center font-medium text-gray-800">
                        {appliance.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleSolarQuantityChange(appliance.id, 1)
                        }
                        className="w-8 h-8 flex items-center justify-center  transition-colors"
                      >
                        <img src={images.plus} alt="" />
                      </button>
                    </div>

                    {/* Total Wattage */}
                    <div className="text-center">
                      <span className="text-black text-md font-semibold">
                        {appliance.totalWattage}w
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Box */}
        <div className="w-1/3">
          <div className="bg-[#273E8E] text-white rounded-2xl px-6 py-4 shadow-lg">
            <div className="flex gap-4">
              {/* Total Load */}
              <div className="flex-1">
                <h3 className="text-sm font-medium mb-3 text-white">
                  Total Load
                </h3>
                <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-2 text-[#273E8E] shadow-inner">
                  <span className="text-2xl font-bold">
                    {totalLoad.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium mt-3">Watts</span>
                </div>
              </div>

              {/* Inverter Rating */}
              <div className="flex-1">
                <h3 className="text-sm font-medium mb-3 text-white">
                  Inverter Rating
                </h3>
                <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-2 text-[#273E8E] shadow-inner">
                  <span className="text-2xl font-bold">
                    {inverterRating.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium mt-3">VA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolarPanelCal;
