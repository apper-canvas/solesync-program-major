import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data found", 
  description = "Get started by adding your first item", 
  actionText = "Add Item",
  onAction,
  icon = "Package",
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center p-12 text-center ${className}`}
    >
      <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <ApperIcon name={icon} className="h-10 w-10 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md">
        {description}
      </p>
      
      {onAction && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-secondary to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
        >
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          {actionText}
        </motion.button>
      )}
    </motion.div>
  );
};

export default Empty;