import { motion } from "framer-motion";
import POSInterface from "@/components/organisms/POSInterface";

const POS = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
        <p className="text-gray-600">Process sales transactions quickly and efficiently</p>
      </div>

      {/* POS Interface */}
      <POSInterface />
    </motion.div>
  );
};

export default POS;