import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const MetricCard = ({ title, value, change, changeType = "positive", icon, gradient = "bg-gradient-to-br from-secondary to-blue-600" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${gradient}`}>
            <ApperIcon name={icon} className="h-6 w-6 text-white" />
          </div>
          {change && (
            <div className={`flex items-center text-sm font-medium ${
              changeType === "positive" ? "text-success" : "text-error"
            }`}>
              <ApperIcon 
                name={changeType === "positive" ? "TrendingUp" : "TrendingDown"} 
                className="h-4 w-4 mr-1" 
              />
              {change}
            </div>
          )}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </Card>
    </motion.div>
  );
};

export default MetricCard;