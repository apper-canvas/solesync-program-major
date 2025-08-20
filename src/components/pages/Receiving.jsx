import { motion } from "framer-motion";
import ReceivingInterface from "@/components/organisms/ReceivingInterface";

const Receiving = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Receiving & Stock Management</h1>
        <p className="text-gray-600">Scan and receive inventory shipments with barcode tracking</p>
      </div>

      {/* Receiving Interface */}
      <ReceivingInterface />
    </motion.div>
  );
};

export default Receiving;