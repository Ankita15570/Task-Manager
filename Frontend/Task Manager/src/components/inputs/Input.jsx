import { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const Input = ({
  type,
  value,
  onChange,
  label,
  placeholder,
  autoComplete,
  required = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div className="min-w-0">
      <label htmlFor={inputId} className="text-[13px] text-slate-800">
        {label}
      </label>
      <div className="input-box">
        <input
          id={inputId}
          type={
            type === "password" ? (showPassword ? "text" : "password") : type
          }
          placeholder={placeholder}
          className="w-full min-w-0 bg-transparent outline-none"
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
        />
        {type === "password" && (
          <button
            type="button"
            className="shrink-0 rounded p-1 text-slate-500 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((visible) => !visible)}
          >
            {showPassword ? (
              <FaRegEye size={18} aria-hidden="true" />
            ) : (
              <FaRegEyeSlash size={18} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
