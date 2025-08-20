import { useState } from "react";
import { motion } from "framer-motion";
import InventoryTable from "@/components/organisms/InventoryTable";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Inventory = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Quick Actions */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-lg font-medium text-gray-900">Inventory Management</h2>
            <p className="text-sm text-gray-500">Manage your footwear inventory with SKU variants</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="secondary" 
              size="sm" 
              icon="Download"
              onClick={() => setShowImportModal(true)}
            >
              Import
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              icon="Upload"
            >
              Export
            </Button>
            <Button 
              icon="Plus"
              onClick={() => setShowAddModal(true)}
            >
              Add Product
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-secondary to-blue-600 rounded-lg">
              <ApperIcon name="Package" className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">124</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-warning to-orange-600 rounded-lg">
              <ApperIcon name="AlertTriangle" className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-error to-red-600 rounded-lg">
              <ApperIcon name="XCircle" className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-success to-green-600 rounded-lg">
              <ApperIcon name="DollarSign" className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">$45.2K</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Inventory Table */}
      <InventoryTable />
    </motion.div>
  );
};

export default Inventory;