import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Input from '@/components/atoms/Input';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { OrderFulfillmentService } from '@/services/api/fulfillmentService';

const Fulfillment = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortField, setSortField] = useState('orderDate');
  const [sortDirection, setSortDirection] = useState('desc');

  const fulfillmentTypes = [
    { value: 'all', label: 'All Types', icon: 'Package' },
    { value: 'ship-from-store', label: 'Ship from Store', icon: 'Truck' },
    { value: 'click-and-collect', label: 'Click & Collect', icon: 'MapPin' },
    { value: 'store-reservation', label: 'Store Reservation', icon: 'Clock' }
  ];

  const statusTypes = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'processing', label: 'Processing', color: 'info' },
    { value: 'ready', label: 'Ready for Pickup', color: 'accent' },
    { value: 'shipped', label: 'Shipped', color: 'secondary' },
    { value: 'completed', label: 'Completed', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' }
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchTerm, selectedType, selectedStatus, sortField, sortDirection]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await OrderFulfillmentService.getAll();
      setOrders(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(order => order.fulfillmentType === selectedType);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'orderDate' || sortField === 'dueDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(filtered);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await OrderFulfillmentService.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(order => 
        order.Id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success(`Order ${orderId} status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadgeColor = (status) => {
    const statusConfig = statusTypes.find(s => s.value === status);
    return statusConfig?.color || 'secondary';
  };

  const getFulfillmentIcon = (type) => {
    const typeConfig = fulfillmentTypes.find(t => t.value === type);
    return typeConfig?.icon || 'Package';
  };

  const getStatusActions = (order) => {
    const actions = [];
    
    switch (order.status) {
      case 'pending':
        actions.push(
          <Button
            key="process"
            size="sm"
            variant="secondary"
            onClick={() => handleStatusUpdate(order.Id, 'processing')}
          >
            Start Processing
          </Button>
        );
        break;
      case 'processing':
        if (order.fulfillmentType === 'click-and-collect' || order.fulfillmentType === 'store-reservation') {
          actions.push(
            <Button
              key="ready"
              size="sm"
              variant="accent"
              onClick={() => handleStatusUpdate(order.Id, 'ready')}
            >
              Mark Ready
            </Button>
          );
        } else {
          actions.push(
            <Button
              key="ship"
              size="sm"
              variant="secondary"
              onClick={() => handleStatusUpdate(order.Id, 'shipped')}
            >
              Ship Order
            </Button>
          );
        }
        break;
      case 'ready':
        actions.push(
          <Button
            key="complete"
            size="sm"
            variant="success"
            onClick={() => handleStatusUpdate(order.Id, 'completed')}
          >
            Complete Pickup
          </Button>
        );
        break;
      case 'shipped':
        actions.push(
          <Button
            key="deliver"
            size="sm"
            variant="success"
            onClick={() => handleStatusUpdate(order.Id, 'completed')}
          >
            Mark Delivered
          </Button>
        );
        break;
    }

    if (order.status !== 'completed' && order.status !== 'cancelled') {
      actions.push(
        <Button
          key="cancel"
          size="sm"
          variant="error"
          onClick={() => handleStatusUpdate(order.Id, 'cancelled')}
        >
          Cancel
        </Button>
      );
    }

    return actions;
  };

  if (loading) return <Loading rows={8} />;
  if (error) return <Error message={error} onRetry={loadOrders} />;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {fulfillmentTypes.slice(1).map((type) => {
          const typeOrders = orders.filter(o => o.fulfillmentType === type.value);
          const pendingCount = typeOrders.filter(o => ['pending', 'processing'].includes(o.status)).length;
          
          return (
            <Card key={type.value} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{type.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{typeOrders.length}</p>
                  <p className="text-sm text-gray-500">{pendingCount} pending</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-secondary to-blue-600 rounded-lg">
                  <ApperIcon name={type.icon} className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="Search"
          />
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
          >
            {fulfillmentTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
          >
            {statusTypes.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          <div className="flex space-x-2">
            <Button onClick={loadOrders} variant="secondary" icon="RefreshCw">
              Refresh
            </Button>
            <Button variant="primary" icon="Plus">
              New Order
            </Button>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        {filteredOrders.length === 0 ? (
          <Empty 
            title="No orders found"
            description="No orders match your current filters"
            actionText="Reset Filters"
            onAction={() => {
              setSearchTerm('');
              setSelectedType('all');
              setSelectedStatus('all');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('orderNumber')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Order #</span>
                      {sortField === 'orderNumber' && (
                        <ApperIcon name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={12} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fulfillment Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('orderDate')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Order Date</span>
                      {sortField === 'orderDate' && (
                        <ApperIcon name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={12} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <motion.tr
                    key={order.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
                      {order.dueDate && (
                        <div className="text-xs text-gray-500">
                          Due: {new Date(order.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      {order.customerPhone && (
                        <div className="text-xs text-gray-500">{order.customerPhone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <ApperIcon name={getFulfillmentIcon(order.fulfillmentType)} size={16} className="text-gray-600" />
                        <span className="text-sm text-gray-900 capitalize">
                          {order.fulfillmentType.replace('-', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.items.length} items</div>
                      <div className="text-xs text-gray-500">{order.items.reduce((sum, item) => sum + item.quantity, 0)} units</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        {getStatusActions(order)}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Summary */}
      <Card className="p-4">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Showing {filteredOrders.length} of {orders.length} orders</span>
          <span>
            {orders.filter(o => ['pending', 'processing'].includes(o.status)).length} orders need attention
          </span>
        </div>
      </Card>
    </div>
  );
};

export default Fulfillment;