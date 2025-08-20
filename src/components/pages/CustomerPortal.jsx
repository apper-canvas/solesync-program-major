import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Loading from '@/components/ui/Loading';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import Input from '@/components/atoms/Input';
import { customerService } from '@/services/api/customerService';

function CustomerPortal() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    membershipTier: 'bronze',
    status: 'active'
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, statusFilter]);

  async function loadCustomers() {
    try {
      setLoading(true);
      setError(null);
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (err) {
      console.error('Error loading customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }

  function filterCustomers() {
    let filtered = customers;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.firstName.toLowerCase().includes(search) ||
        customer.lastName.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.phone.includes(search)
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.status === statusFilter);
    }

    setFilteredCustomers(filtered);
  }

  async function handleCreateCustomer() {
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await customerService.create(newCustomer);
      toast.success('Customer created successfully');
      setNewCustomer({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        membershipTier: 'bronze',
        status: 'active'
      });
      setShowCreateForm(false);
      await loadCustomers();
    } catch (err) {
      console.error('Error creating customer:', err);
      toast.error('Failed to create customer');
    }
  }

  async function handleUpdateCustomer(id, updateData) {
    try {
      await customerService.update(id, updateData);
      toast.success('Customer updated successfully');
      setEditingCustomer(null);
      await loadCustomers();
    } catch (err) {
      console.error('Error updating customer:', err);
      toast.error('Failed to update customer');
    }
  }

  async function handleDeleteCustomer(id) {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      await customerService.delete(id);
      toast.success('Customer deleted successfully');
      setSelectedCustomer(null);
      await loadCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
      toast.error('Failed to delete customer');
    }
  }

  function getTierColor(tier) {
    const colors = {
      bronze: 'bg-amber-100 text-amber-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-purple-100 text-purple-800'
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
  }

  function getStatusColor(status) {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadCustomers} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
          <p className="text-gray-600">Manage customer relationships and profiles</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
          <ApperIcon name="Plus" size={16} />
          Add Customer
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </Card>

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <Empty 
          message="No customers found" 
          description="Try adjusting your search filters or add a new customer."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {customer.firstName} {customer.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getTierColor(customer.membershipTier)}>
                      {customer.membershipTier}
                    </Badge>
                    <Badge className={getStatusColor(customer.status)}>
                      {customer.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ApperIcon name="Phone" size={14} />
                      {customer.phone}
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ApperIcon name="MapPin" size={14} />
                      {customer.city}, {customer.state}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ApperIcon name="Calendar" size={14} />
                    Joined {formatDate(customer.dateJoined)}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCustomer(customer)}
                    className="flex-1"
                  >
                    <ApperIcon name="Eye" size={14} />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCustomer(customer)}
                  >
                    <ApperIcon name="Edit" size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCustomer(customer.Id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <ApperIcon name="Trash2" size={14} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Customer Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Add New Customer</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  <ApperIcon name="X" size={16} />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name *</label>
                  <Input
                    value={newCustomer.firstName}
                    onChange={(e) => setNewCustomer(prev => ({...prev, firstName: e.target.value}))}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name *</label>
                  <Input
                    value={newCustomer.lastName}
                    onChange={(e) => setNewCustomer(prev => ({...prev, lastName: e.target.value}))}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <Input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({...prev, email: e.target.value}))}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <Input
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer(prev => ({...prev, phone: e.target.value}))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <Input
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer(prev => ({...prev, address: e.target.value}))}
                    placeholder="Enter street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <Input
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer(prev => ({...prev, city: e.target.value}))}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <Input
                    value={newCustomer.state}
                    onChange={(e) => setNewCustomer(prev => ({...prev, state: e.target.value}))}
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Membership Tier</label>
                  <select
                    value={newCustomer.membershipTier}
                    onChange={(e) => setNewCustomer(prev => ({...prev, membershipTier: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={newCustomer.status}
                    onChange={(e) => setNewCustomer(prev => ({...prev, status: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleCreateCustomer} className="flex-1">
                  Create Customer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Customer Details</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomer(null)}
                >
                  <ApperIcon name="X" size={16} />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <ApperIcon name="User" size={24} className="text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      <Badge className={getTierColor(selectedCustomer.membershipTier)}>
                        {selectedCustomer.membershipTier}
                      </Badge>
                      <Badge className={getStatusColor(selectedCustomer.status)}>
                        {selectedCustomer.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-gray-900">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                    <p className="text-gray-900">{selectedCustomer.phone || 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                    <p className="text-gray-900">
                      {selectedCustomer.address ? (
                        <>
                          {selectedCustomer.address}<br />
                          {selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.zipCode}
                        </>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Date Joined</label>
                    <p className="text-gray-900">{formatDate(selectedCustomer.dateJoined)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Total Orders</label>
                    <p className="text-gray-900">{selectedCustomer.totalOrders}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => {
                      setEditingCustomer(selectedCustomer);
                      setSelectedCustomer(null);
                    }}
                    className="flex-1"
                  >
                    <ApperIcon name="Edit" size={16} />
                    Edit Customer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteCustomer(selectedCustomer.Id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <ApperIcon name="Trash2" size={16} />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default CustomerPortal;