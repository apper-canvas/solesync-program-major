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
import { PurchaseOrderService } from "@/services/api/purchaseOrderService";
import { InventoryService } from "@/services/api/inventoryService";

const ReceivingInterface = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scanMode, setScanMode] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receivingItems, setReceivingItems] = useState([]);

  useEffect(() => {
    loadPendingOrders();
  }, []);

  const loadPendingOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await PurchaseOrderService.getPending();
      setOrders(data);
    } catch (err) {
      setError("Failed to load pending orders");
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeInput = (barcode) => {
    if (!selectedOrder) {
      toast.error("Please select a purchase order first");
      return;
    }

    const orderItem = selectedOrder.items.find(item => item.barcode === barcode);
    if (!orderItem) {
      toast.error("Barcode not found in selected order");
      return;
    }

    const existingItem = receivingItems.find(item => item.barcode === barcode);
    if (existingItem) {
      setReceivingItems(receivingItems.map(item =>
        item.barcode === barcode
          ? { ...item, receivedQty: item.receivedQty + 1 }
          : item
      ));
    } else {
      setReceivingItems([...receivingItems, {
        ...orderItem,
        receivedQty: 1
      }]);
    }

    toast.success(`Scanned: ${orderItem.name}`);
    setScannedBarcode("");
  };

  const updateReceivedQuantity = (barcode, quantity) => {
    if (quantity <= 0) {
      setReceivingItems(receivingItems.filter(item => item.barcode !== barcode));
    } else {
      setReceivingItems(receivingItems.map(item =>
        item.barcode === barcode
          ? { ...item, receivedQty: quantity }
          : item
      ));
    }
  };

  const processReceiving = async () => {
    if (!selectedOrder || receivingItems.length === 0) {
      toast.error("No items to receive");
      return;
    }

    try {
      // Update inventory levels
      for (const item of receivingItems) {
        const product = await InventoryService.getById(item.productId);
        if (product) {
          await InventoryService.update(item.productId, {
            ...product,
            totalStock: product.totalStock + item.receivedQty
          });
        }
      }

      // Update purchase order status
      await PurchaseOrderService.update(selectedOrder.Id, {
        ...selectedOrder,
        status: "received",
        receivedDate: new Date().toISOString(),
        receivedItems: receivingItems
      });

      toast.success("Receiving completed successfully!");
      setSelectedOrder(null);
      setReceivingItems([]);
      loadPendingOrders();
    } catch (err) {
      toast.error("Failed to process receiving");
      console.error("Receiving error:", err);
    }
  };

  if (loading) return <Loading rows={6} />;
  if (error) return <Error message={error} onRetry={loadPendingOrders} />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Purchase Orders */}
      <div className="lg:col-span-1">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Pending Orders</h2>
            <Badge variant="info" size="sm">
              {orders.length} orders
            </Badge>
          </div>

          {orders.length === 0 ? (
            <Empty 
              title="No pending orders" 
              description="All purchase orders have been received"
              icon="Truck"
            />
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <motion.div
                  key={order.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedOrder?.Id === order.Id
                      ? "border-secondary bg-secondary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">PO-{order.Id}</div>
                    <Badge variant="warning" size="sm">
                      {order.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Supplier: {order.supplier}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.items.length} items • Expected: {new Date(order.expectedDate).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Barcode Scanner & Receiving */}
      <div className="lg:col-span-2">
        <div className="space-y-6">
          {/* Scanner */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Barcode Scanner</h2>
              <Button
                variant={scanMode ? "success" : "secondary"}
                onClick={() => setScanMode(!scanMode)}
                icon="ScanLine"
              >
                {scanMode ? "Scanner Active" : "Start Scanning"}
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <Input
                placeholder="Scan or enter barcode..."
                value={scannedBarcode}
                onChange={(e) => setScannedBarcode(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && scannedBarcode) {
                    handleBarcodeInput(scannedBarcode);
                  }
                }}
                icon="ScanLine"
                className="flex-1"
                disabled={!selectedOrder}
              />
              <Button
                onClick={() => handleBarcodeInput(scannedBarcode)}
                disabled={!scannedBarcode || !selectedOrder}
              >
                Add Item
              </Button>
            </div>

            {!selectedOrder && (
              <div className="mt-4 p-4 bg-warning/10 rounded-lg">
                <div className="flex items-center text-warning">
                  <ApperIcon name="AlertTriangle" className="h-4 w-4 mr-2" />
                  <span className="text-sm">Please select a purchase order to begin receiving items</span>
                </div>
              </div>
            )}
          </Card>

          {/* Receiving Items */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Receiving Items</h2>
              {receivingItems.length > 0 && (
                <Button onClick={processReceiving} icon="Check">
                  Complete Receiving
                </Button>
              )}
            </div>

            {receivingItems.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="Package" className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No items scanned yet</p>
                <p className="text-sm text-gray-400">Start scanning barcodes to add items</p>
              </div>
            ) : (
              <div className="space-y-3">
                {receivingItems.map((item) => (
                  <div key={item.barcode} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-secondary to-blue-600 rounded-lg flex items-center justify-center">
                        <ApperIcon name="Package" className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          Barcode: {item.barcode} • Size: {item.size}
                        </div>
                        <div className="text-sm text-gray-500">
                          Expected: {item.orderedQty} units
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-600">Received:</div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateReceivedQuantity(item.barcode, item.receivedQty - 1)}
                        >
                          <ApperIcon name="Minus" className="h-3 w-3" />
                        </Button>
                        <input
                          type="number"
                          value={item.receivedQty}
                          onChange={(e) => updateReceivedQuantity(item.barcode, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center"
                          min="0"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateReceivedQuantity(item.barcode, item.receivedQty + 1)}
                        >
                          <ApperIcon name="Plus" className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Badge
                        variant={item.receivedQty === item.orderedQty ? "success" : "warning"}
                        size="sm"
                      >
                        {item.receivedQty === item.orderedQty ? "Complete" : "Partial"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReceivingInterface;