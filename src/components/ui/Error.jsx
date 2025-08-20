import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ message = "Something went wrong", onRetry, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
        <ApperIcon name="AlertTriangle" className="h-8 w-8 text-error" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Oops! Something went wrong
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {message}
      </p>
      
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-secondary to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
        >
          <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
          Try Again
        </motion.button>
      )}
    </motion.div>
  );
};

export default Error;