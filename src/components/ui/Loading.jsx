import { motion } from "framer-motion";

const Loading = ({ rows = 6 }) => {
  return (
    <div className="p-6">
      {/* Header skeleton */}
      <div className="mb-6">
        <motion.div 
          className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-64"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          style={{ 
            backgroundSize: "200% 100%",
            background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)"
          }}
        />
      </div>

      {/* Table skeleton */}
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/2" />
              </div>
              <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-20" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Loading;