import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Input = React.forwardRef(({ 
  label,
  error,
  icon,
  iconPosition = "left",
  className,
  containerClassName,
  ...props 
}, ref) => {
  return (
    <div className={cn("space-y-1", containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === "left" && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <ApperIcon name={icon} className="h-4 w-4 text-gray-400" />
          </div>
        )}
        
        <input
          ref={ref}
          className={cn(
            "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary disabled:opacity-50",
            icon && iconPosition === "left" && "pl-10",
            icon && iconPosition === "right" && "pr-10",
            error && "border-error focus:border-error focus:ring-error",
            className
          )}
          {...props}
        />
        
        {icon && iconPosition === "right" && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <ApperIcon name={icon} className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;