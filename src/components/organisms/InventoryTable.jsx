import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { InventoryService } from "@/services/api/inventoryService";

const InventoryTable = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await InventoryService.getAll();
      setInventory(data);
    } catch (err) {
      setError("Failed to load inventory data");
      console.error("Error loading inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleStockUpdate = async (id, newStock) => {
    try {
      const item = inventory.find(i => i.Id === id);
      const updatedItem = { ...item, stock: parseInt(newStock) };
      await InventoryService.update(id, updatedItem);
      setInventory(inventory.map(i => i.Id === id ? updatedItem : i));
      toast.success("Stock updated successfully");
    } catch (err) {
      toast.error("Failed to update stock");
    }
  };

  const getStockStatus = (stock, reorderPoint) => {
    if (stock === 0) return { variant: "error", text: "Out of Stock" };
    if (stock <= reorderPoint) return { variant: "warning", text: "Low Stock" };
    return { variant: "success", text: "In Stock" };
  };

  const filteredAndSortedInventory = inventory
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.styleCode.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  if (loading) return <Loading rows={8} />;
  if (error) return <Error message={error} onRetry={loadInventory} />;
  if (inventory.length === 0) return <Empty title="No inventory items" description="Start by adding your first product to inventory" icon="Package" />;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-xl font-semibold text-gray-900">Inventory Management</h2>
          <p className="text-sm text-gray-600">{inventory.length} total items</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="Search"
            className="w-64"
          />
          <Button icon="Filter" variant="secondary" size="sm">
            Filter
          </Button>
          <Button icon="Download" variant="secondary" size="sm">
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th 
                className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:text-secondary"
                onClick={() => handleSort("styleCode")}
              >
                <div className="flex items-center">
                  Style Code
                  <ApperIcon name="ArrowUpDown" className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:text-secondary"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Product
                  <ApperIcon name="ArrowUpDown" className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:text-secondary"
                onClick={() => handleSort("brand")}
              >
                <div className="flex items-center">
                  Brand
                  <ApperIcon name="ArrowUpDown" className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Sizes</th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:text-secondary"
                onClick={() => handleSort("totalStock")}
              >
                <div className="flex items-center">
                  Stock
                  <ApperIcon name="ArrowUpDown" className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:text-secondary"
                onClick={() => handleSort("basePrice")}
              >
                <div className="flex items-center">
                  Price
                  <ApperIcon name="ArrowUpDown" className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedInventory.map((item, index) => {
              const stockStatus = getStockStatus(item.totalStock, item.reorderPoint);
              
              return (
                <motion.tr
                  key={item.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4">
                    <div className="font-mono text-sm text-gray-900">{item.styleCode}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mr-3">
                        <ApperIcon name="Package" className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-900">{item.brand}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {item.availableSizes.slice(0, 3).map(size => (
                        <Badge key={size} variant="default" size="sm">
                          {size}
                        </Badge>
                      ))}
                      {item.availableSizes.length > 3 && (
                        <Badge variant="default" size="sm">
                          +{item.availableSizes.length - 3}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={item.totalStock}
                        onChange={(e) => handleStockUpdate(item.Id, e.target.value)}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:border-secondary focus:outline-none"
                        min="0"
                      />
                      <span className="text-xs text-gray-500">units</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={stockStatus.variant} size="sm">
                      {stockStatus.text}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">
                      ${item.basePrice.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Cost: ${item.cost.toFixed(2)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" icon="Edit">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" icon="Eye">
                        View
                      </Button>
                      <Button variant="ghost" size="sm" icon="MoreHorizontal">
                        More
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Showing {filteredAndSortedInventory.length} of {inventory.length} items
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm" icon="ChevronLeft">
            Previous
          </Button>
          <Button variant="secondary" size="sm" icon="ChevronRight">
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default InventoryTable;