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
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, customer: null });
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editFormData, setEditFormData] = useState({
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

  const [loyaltyView, setLoyaltyView] = useState(false);
  const [loyaltyStats, setLoyaltyStats] = useState(null);
  const [selectedCustomerLoyalty, setSelectedCustomerLoyalty] = useState(null);
  const [pointsToAward, setPointsToAward] = useState('');
  const [rewardToRedeem, setRewardToRedeem] = useState('');

  const rewardOptions = [
    { value: 10, label: '$1 Store Credit', cost: 10 },
    { value: 50, label: '$5 Store Credit', cost: 50 },
    { value: 100, label: '$10 Store Credit', cost: 100 },
    { value: 200, label: '$20 Store Credit', cost: 200 },
    { value: 250, label: 'Free Shipping Voucher', cost: 25 },
    { value: 500, label: '$50 Store Credit', cost: 500 }
  ];

  const tierThresholds = {
    bronze: { min: 0, max: 999, color: 'bg-amber-100 text-amber-800' },
    silver: { min: 1000, max: 2499, color: 'bg-gray-100 text-gray-800' },
    gold: { min: 2500, max: 4999, color: 'bg-yellow-100 text-yellow-800' },
    platinum: { min: 5000, max: Infinity, color: 'bg-purple-100 text-purple-800' }
  };

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

function handleEditCustomer(customer) {
    setEditFormData({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zipCode: customer.zipCode || '',
      membershipTier: customer.membershipTier || 'bronze',
      status: customer.status || 'active'
    });
    setEditingCustomer(customer);
  }

  async function handleUpdateCustomer(id, updateData) {
    try {
      await customerService.update(id, updateData || editFormData);
      toast.success('Customer updated successfully');
      setEditingCustomer(null);
      setEditFormData({
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
      await loadCustomers();
    } catch (err) {
      console.error('Error updating customer:', err);
      toast.error('Failed to update customer');
    }
  }

function showDeleteConfirmation(customer) {
    setDeleteConfirmation({ show: true, customer });
  }

  async function handleDeleteCustomer() {
    const { customer } = deleteConfirmation;
    if (!customer) return;

    try {
      await customerService.delete(customer.Id);
      toast.success('Customer deleted successfully');
      setSelectedCustomer(null);
      setDeleteConfirmation({ show: false, customer: null });
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
<Button 
          onClick={() => setShowCreateForm(true)} 
          className="w-full sm:w-auto"
          tooltip="Create a new customer profile"
        >
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
                  
                  {/* Loyalty Information */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ApperIcon name="Star" size={14} />
                      {customer.loyaltyPoints || 0} points
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ApperIcon name="Gift" size={14} />
                      ${customer.rewardsBalance || 0} rewards
                    </div>
                    {customer.tierProgress && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Tier Progress</span>
                          <span>{customer.tierProgress}/{tierThresholds[customer.membershipTier]?.max === Infinity ? '∞' : tierThresholds[customer.membershipTier]?.max}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-accent h-1.5 rounded-full" 
                            style={{ 
                              width: `${tierThresholds[customer.membershipTier]?.max === Infinity ? 100 : Math.min(100, (customer.tierProgress / tierThresholds[customer.membershipTier]?.max) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
<Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCustomer(customer)}
                    className="flex-1"
                    tooltip="View detailed customer information"
                  >
                    <ApperIcon name="Eye" size={14} />
                    View
                  </Button>
<Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCustomerLoyalty(customer)}
                    className="bg-accent/10 hover:bg-accent/20 text-accent"
                    tooltip="Manage loyalty points and rewards"
                  >
                    <ApperIcon name="Star" size={14} />
                  </Button>
<Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCustomer(customer)}
                    tooltip="Edit customer details"
                  >
                    <ApperIcon name="Edit" size={14} />
                  </Button>
<Button
                    variant="outline"
                    size="sm"
                    onClick={() => showDeleteConfirmation(customer)}
                    className="text-red-600 hover:text-red-700"
                    tooltip="Delete customer permanently"
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
                  tooltip="Close create customer form"
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
<Button 
                  onClick={handleCreateCustomer} 
                  className="flex-1"
                  tooltip="Save the new customer profile"
                >
                  Create Customer
                </Button>
<Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                  tooltip="Cancel creating new customer"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Edit Customer</h2>
                <Button
variant="outline"
                  size="sm"
                  onClick={() => setEditingCustomer(null)}
                  tooltip="Close edit customer form"
                >
                  <ApperIcon name="X" size={16} />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name *</label>
                  <Input
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData(prev => ({...prev, firstName: e.target.value}))}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name *</label>
                  <Input
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData(prev => ({...prev, lastName: e.target.value}))}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <Input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData(prev => ({...prev, email: e.target.value}))}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <Input
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData(prev => ({...prev, phone: e.target.value}))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <Input
                    value={editFormData.address}
                    onChange={(e) => setEditFormData(prev => ({...prev, address: e.target.value}))}
                    placeholder="Enter street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <Input
                    value={editFormData.city}
                    onChange={(e) => setEditFormData(prev => ({...prev, city: e.target.value}))}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <Input
                    value={editFormData.state}
                    onChange={(e) => setEditFormData(prev => ({...prev, state: e.target.value}))}
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ZIP Code</label>
                  <Input
                    value={editFormData.zipCode}
                    onChange={(e) => setEditFormData(prev => ({...prev, zipCode: e.target.value}))}
                    placeholder="Enter ZIP code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Membership Tier</label>
                  <select
                    value={editFormData.membershipTier}
                    onChange={(e) => setEditFormData(prev => ({...prev, membershipTier: e.target.value}))}
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
                    value={editFormData.status}
                    onChange={(e) => setEditFormData(prev => ({...prev, status: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
<Button 
                  onClick={() => handleUpdateCustomer(editingCustomer.Id)} 
                  className="flex-1"
                  tooltip="Save changes to customer profile"
                >
                  Update Customer
                </Button>
<Button
                  variant="outline"
                  onClick={() => setEditingCustomer(null)}
                  className="flex-1"
                  tooltip="Cancel editing and discard changes"
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
                  tooltip="Close customer details view"
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
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Loyalty Points</label>
                    <p className="text-gray-900">{selectedCustomer.loyaltyPoints || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Rewards Balance</label>
                    <p className="text-gray-900">${selectedCustomer.rewardsBalance || 0}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
<Button
                    onClick={() => {
                      setEditingCustomer(selectedCustomer);
                      setSelectedCustomer(null);
                    }}
                    className="flex-1"
                    tooltip="Edit this customer's profile"
                  >
                    <ApperIcon name="Edit" size={16} />
                    Edit Customer
                  </Button>
<Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCustomerLoyalty(selectedCustomer);
                      setSelectedCustomer(null);
                    }}
                    className="bg-accent/10 hover:bg-accent/20 text-accent"
                    tooltip="Manage loyalty points and rewards"
                  >
                    <ApperIcon name="Star" size={16} />
                    Loyalty
                  </Button>
<Button
                    variant="outline"
                    onClick={() => showDeleteConfirmation(selectedCustomer)}
                    className="text-red-600 hover:text-red-700"
                    tooltip="Delete this customer permanently"
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

      {/* Loyalty Management Modal */}
      {selectedCustomerLoyalty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Loyalty Program</h2>
                  <p className="text-gray-600">
                    {selectedCustomerLoyalty.firstName} {selectedCustomerLoyalty.lastName}
                  </p>
                </div>
                <Button
variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomerLoyalty(null)}
                  tooltip="Close loyalty management panel"
                >
                  <ApperIcon name="X" size={16} />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Loyalty Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-accent/5 border-accent/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                        <ApperIcon name="Star" size={20} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Loyalty Points</p>
                        <p className="text-xl font-semibold text-accent">{selectedCustomerLoyalty.loyaltyPoints || 0}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                        <ApperIcon name="Gift" size={20} className="text-yellow-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Rewards Balance</p>
                        <p className="text-xl font-semibold text-yellow-700">${selectedCustomerLoyalty.rewardsBalance || 0}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-purple-50 border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                        <ApperIcon name="Award" size={20} className="text-purple-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tier</p>
                        <p className="text-xl font-semibold text-purple-700 capitalize">{selectedCustomerLoyalty.membershipTier}</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Tier Progress */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Tier Progress</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Current: {selectedCustomerLoyalty.tierProgress || 0} points</span>
                      <span>
                        Next Tier: {
                          selectedCustomerLoyalty.membershipTier === 'bronze' ? 'Silver (1000 pts)' :
                          selectedCustomerLoyalty.membershipTier === 'silver' ? 'Gold (2500 pts)' :
                          selectedCustomerLoyalty.membershipTier === 'gold' ? 'Platinum (5000 pts)' :
                          'Max Tier Reached'
                        }
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all" 
                        style={{ 
                          width: `${
                            selectedCustomerLoyalty.membershipTier === 'platinum' ? 100 :
                            selectedCustomerLoyalty.membershipTier === 'gold' ? Math.min(100, ((selectedCustomerLoyalty.tierProgress || 0) / 5000) * 100) :
                            selectedCustomerLoyalty.membershipTier === 'silver' ? Math.min(100, ((selectedCustomerLoyalty.tierProgress || 0) / 2500) * 100) :
                            Math.min(100, ((selectedCustomerLoyalty.tierProgress || 0) / 1000) * 100)
                          }%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </Card>

                {/* Award Points Section */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Award Points</h3>
                  <div className="flex gap-3">
                    <Input
                      type="number"
                      placeholder="Points to award"
                      value={pointsToAward}
                      onChange={(e) => setPointsToAward(e.target.value)}
                      className="flex-1"
                    />
<Button
                      onClick={async () => {
                        if (!pointsToAward || pointsToAward <= 0) {
                          toast.error('Please enter valid points amount');
                          return;
                        }
                        try {
                          await customerService.awardPoints(selectedCustomerLoyalty.Id, parseInt(pointsToAward), 'Manual Award');
                          toast.success(`Awarded ${pointsToAward} points successfully`);
                          setPointsToAward('');
                          loadCustomers();
                          // Update the selected customer data
                          const updatedCustomer = await customerService.getById(selectedCustomerLoyalty.Id);
                          setSelectedCustomerLoyalty(updatedCustomer);
                        } catch (error) {
                          toast.error('Failed to award points');
                        }
                      }}
                      disabled={!pointsToAward || pointsToAward <= 0}
                      tooltip="Add loyalty points to customer's account"
                    >
                      <ApperIcon name="Plus" size={16} />
                      Award Points
                    </Button>
                  </div>
                </Card>

                {/* Redeem Rewards Section */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Redeem Rewards</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
{rewardOptions.map((reward) => (
                        <Button
                          key={reward.value}
                          variant="outline"
                          onClick={async () => {
                            if ((selectedCustomerLoyalty.rewardsBalance || 0) < reward.cost) {
                              toast.error('Insufficient rewards balance');
                              return;
                            }
                            try {
                              await customerService.redeemRewards(selectedCustomerLoyalty.Id, reward.cost, reward.label);
                              toast.success(`Redeemed ${reward.label} successfully`);
                              loadCustomers();
                              const updatedCustomer = await customerService.getById(selectedCustomerLoyalty.Id);
                              setSelectedCustomerLoyalty(updatedCustomer);
                            } catch (error) {
                              toast.error('Failed to redeem reward');
                            }
                          }}
                          disabled={(selectedCustomerLoyalty.rewardsBalance || 0) < reward.cost}
                          className="justify-between"
                          tooltip={`Redeem ${reward.label} for ${reward.cost} points`}
                        >
                          <span>{reward.label}</span>
                          <span className="text-sm text-gray-500">{reward.cost} pts</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Redemption History */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Redemption History</h3>
                  {selectedCustomerLoyalty.redemptionHistory?.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedCustomerLoyalty.redemptionHistory.map((redemption) => (
                        <div key={redemption.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{redemption.item}</p>
                            <p className="text-sm text-gray-600">{formatDate(redemption.date)}</p>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{redemption.amount} pts</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No redemption history</p>
                  )}
                </Card>
              </div>
            </div>
          </Card>
        </div>
      )}
{/* Delete Confirmation Modal */}
      {deleteConfirmation.show && deleteConfirmation.customer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <ApperIcon name="AlertTriangle" size={24} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Delete Customer</h2>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete{' '}
                <span className="font-semibold">
                  {deleteConfirmation.customer.firstName} {deleteConfirmation.customer.lastName}
                </span>
                ? This will permanently remove their profile and all associated data.
              </p>
              
              <div className="flex gap-3">
                <Button
variant="outline"
                  onClick={() => setDeleteConfirmation({ show: false, customer: null })}
                  className="flex-1"
                  tooltip="Cancel delete operation"
                >
                  Cancel
                </Button>
<Button
                  onClick={handleDeleteCustomer}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  tooltip="Permanently delete this customer"
                >
                  <ApperIcon name="Trash2" size={16} />
                  Delete Customer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default CustomerPortal;