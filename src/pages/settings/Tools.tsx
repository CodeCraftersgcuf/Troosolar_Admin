import { useState } from 'react';
import { toolCategories } from './inverterloadcal';
import InverterLoadCal from './InverterLoadCal.tsx';
import SolarPanelCal from './SolarPanelCal.tsx';

const Tools = () => {
  const [activeCategory, setActiveCategory] = useState('inverter');

  return (
    <div className="w-full ">
      {/* Tool Categories */}
      <div className="inline-flex bg-white rounded-full p-2 mb-8 border border-[#CDCDCD]">
        {toolCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeCategory === category.id
                ? 'bg-[#273E8E] text-white shadow-xs'
                : 'text-[#000000B2] hover:text-black'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Inverter Load Calculator */}
      {activeCategory === 'inverter' && <InverterLoadCal />}

      {/* Solar Panel Calculator */}
      {activeCategory === 'solar' && <SolarPanelCal />}

      {activeCategory === 'battery' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Battery Estimator</h2>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-600">Battery Estimator - Coming Soon</p>
          </div>
        </div>
      )}

      {activeCategory === 'savings' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Solar Savings Estimator</h2>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-600">Solar Savings Estimator - Coming Soon</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tools;
