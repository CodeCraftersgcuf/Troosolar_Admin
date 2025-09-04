import React, { ChangeEvent } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps {
  type?: string;
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isPassword?: boolean;
  hidePassword?: boolean;
  setHidePassword?: (hide: boolean) => void;
  isMobile?: boolean;
  icon?: string | React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  type = "text",
  id,
  label,
  placeholder,
  value,
  onChange,
  isPassword = false,
  hidePassword = false,
  setHidePassword,
  isMobile = false,
  icon,
}) => {
  return (
    <div className={isMobile ? "" : "mb-4"}>
      <label htmlFor={id} className="block mb-3  text-[16px] text-gray-600">
        {label}
      </label>
      <div className="relative">
        {/* Input Field */}
        <input
          type={isPassword ? (hidePassword ? "password" : "text") : type}
          id={id}
          placeholder={placeholder}
          className="w-full border border-gray-300 bg-white rounded-lg p-3 pr-12  focus:outline-none focus:ring-2 text-[16px] focus:ring-blue-500"
          value={value}
          onChange={onChange}
        />

        {/* Icon on the left (if provided and not password) */}
        {!isPassword && icon && (
          typeof icon === "string" ? (
            <img
              src={icon}
              alt=""
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
            />
          ) : (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {icon}
            </span>
          )
        )}

        {/* Password Eye Toggle */}
        {isPassword && setHidePassword && (
          <div
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
            onClick={() => setHidePassword(!hidePassword)}
          >
            {hidePassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </div>
        )}
      </div>
    </div>
  );
};
