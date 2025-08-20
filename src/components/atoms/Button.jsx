import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = React.forwardRef(({ 
  children, 
  variant = "primary", 
  size = "md", 
  icon,
  iconPosition = "left",
  loading = false,
  className,
  disabled,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-secondary to-blue-600 text-white hover:shadow-lg focus:ring-secondary",
    secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    success: "bg-gradient-to-r from-success to-green-600 text-white hover:shadow-lg focus:ring-success",
    warning: "bg-gradient-to-r from-warning to-orange-600 text-white hover:shadow-lg focus:ring-warning",
    error: "bg-gradient-to-r from-error to-red-600 text-white hover:shadow-lg focus:ring-error",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      ref={ref}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      disabled={isDisabled}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        isDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {loading ? (
        <ApperIcon name="Loader2" className="h-4 w-4 animate-spin mr-2" />
      ) : (
        icon && iconPosition === "left" && (
          <ApperIcon name={icon} className="h-4 w-4 mr-2" />
        )
      )}
      
      {children}
      
      {!loading && icon && iconPosition === "right" && (
        <ApperIcon name={icon} className="h-4 w-4 ml-2" />
      )}
    </motion.button>
  );
});

Button.displayName = "Button";

export default Button;