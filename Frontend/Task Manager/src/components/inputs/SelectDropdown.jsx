import { useState } from "react";
import { LuChevronDown } from "react-icons/lu";

const SelectDropdown = ({ option, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      {/* Button Dropdown */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full text-sm text-black outline-none bg-white border border-slate-100 px-2.5 py-3 rounded-md mt-2 flex justify-between items-center"
      >
        {value ? option.find((opt) => opt.value === value)?.label : placeholder}
        <span className="ml-2">
          {isOpen ? (
            <LuChevronDown className="rotate-180" />
          ) : (
            <LuChevronDown />
          )}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute w-full bg-white border border-slate-100 rounded-md mt-1 shadow-md z-10"
        >
          {option.map((opt) => (
            <button
              type="button"
              role="option"
              aria-selected={value === opt.value}
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="block w-full px-3 py-2 text-left text-sm cursor-pointer hover:bg-gray-100"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;
