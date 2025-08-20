import React from "react";
import { cn } from "@/utils/cn";

const Badge = React.forwardRef(({ 
  children, 
  variant = "default", 
  size = "md", 
  className,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full";
  
  const variants = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-gradient-to-r from-secondary/10 to-blue-100 text-secondary",
    success: "bg-gradient-to-r from-success/10 to-green-100 text-success",
    warning: "bg-gradient-to-r from-warning/10 to-orange-100 text-warning",
    error: "bg-gradient-to-r from-error/10 to-red-100 text-error",
    info: "bg-gradient-to-r from-info/10 to-blue-100 text-info"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base"
  };

  return (
    <span
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;