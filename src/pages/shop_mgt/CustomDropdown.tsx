import { useState } from "react";
import images from "../../constants/images";

interface DropdownProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

const CustomDropdown = ({ options, selected, onSelect }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-between w-48 cursor-pointer rounded-md border border-[#00000080] bg-white px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-gray-50 focus:outline-none"
        >
          {selected}
          <img src={images.arrow} alt="" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute mt-2 w-48 origin-top-right rounded-xl shadow-xl bg-white border border-gray-200 z-50">
          <ul className="py-2">
            {options.map((option: string, index: number) => (
              <li
                key={index}
                onClick={() => handleSelect(option)}
                className="px-4 py-2 text-black text-sm cursor-pointer hover:bg-gray-100"
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
