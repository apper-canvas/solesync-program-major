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
import { PromotionService } from '@/services/api/promotionService';

function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    startDate: '',
    endDate: '',
    status: 'active',
    conditions: {
      minimumAmount: '',
      applicableCategories: [],
      maxUses: '',
      customerTier: ''
    }
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PromotionService.getAll();
      setPromotions(data);
    } catch (err) {
      setError('Failed to load promotions');
      console.error('Failed to load promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromotion = async () => {
    try {
      const promotionData = {
        ...formData,
        value: parseFloat(formData.value),
        conditions: {
          ...formData.conditions,
          minimumAmount: formData.conditions.minimumAmount ? parseFloat(formData.conditions.minimumAmount) : null,
          maxUses: formData.conditions.maxUses ? parseInt(formData.conditions.maxUses) : null
        }
      };

      await PromotionService.create(promotionData);
      toast.success('Promotion created successfully!');
      setShowCreateModal(false);
      resetForm();
      loadPromotions();
    } catch (err) {
      toast.error('Failed to create promotion');
      console.error('Create promotion error:', err);
    }
  };

  const handleEditPromotion = (promotion) => {
    setSelectedPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value.toString(),
      startDate: promotion.startDate.split('T')[0],
      endDate: promotion.endDate.split('T')[0],
      status: promotion.status,
      conditions: {
        minimumAmount: promotion.conditions.minimumAmount?.toString() || '',
        applicableCategories: promotion.conditions.applicableCategories || [],
        maxUses: promotion.conditions.maxUses?.toString() || '',
        customerTier: promotion.conditions.customerTier || ''
      }
    });
    setShowEditModal(true);
  };

  const handleUpdatePromotion = async () => {
    try {
      const promotionData = {
        ...formData,
        value: parseFloat(formData.value),
        conditions: {
          ...formData.conditions,
          minimumAmount: formData.conditions.minimumAmount ? parseFloat(formData.conditions.minimumAmount) : null,
          maxUses: formData.conditions.maxUses ? parseInt(formData.conditions.maxUses) : null
        }
      };

      await PromotionService.update(selectedPromotion.Id, promotionData);
      toast.success('Promotion updated successfully!');
      setShowEditModal(false);
      resetForm();
      loadPromotions();
    } catch (err) {
      toast.error('Failed to update promotion');
      console.error('Update promotion error:', err);
    }
  };

  const showDeleteConfirmation = (promotion) => {
    setSelectedPromotion(promotion);
    setShowDeleteModal(true);
  };

  const handleDeletePromotion = async () => {
    try {
      await PromotionService.delete(selectedPromotion.Id);
      toast.success('Promotion deleted successfully!');
      setShowDeleteModal(false);
      setSelectedPromotion(null);
      loadPromotions();
    } catch (err) {
      toast.error('Failed to delete promotion');
      console.error('Delete promotion error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'percentage',
      value: '',
      startDate: '',
      endDate: '',
      status: 'active',
      conditions: {
        minimumAmount: '',
        applicableCategories: [],
        maxUses: '',
        customerTier: ''
      }
    });
    setSelectedPromotion(null);
  };

  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotion.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || promotion.status === statusFilter;
    const matchesType = typeFilter === 'all' || promotion.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800',
      scheduled: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || colors.inactive;
  };

  const getTypeColor = (type) => {
    const colors = {
      percentage: 'bg-blue-100 text-blue-800',
      fixed: 'bg-green-100 text-green-800',
      bogo: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || colors.percentage;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPromotionValue = (promotion) => {
    switch (promotion.type) {
      case 'percentage':
        return `${promotion.value}% off`;
      case 'fixed':
        return `$${promotion.value} off`;
      case 'bogo':
        return `${promotion.value}% off 2nd item`;
      default:
        return promotion.value;
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadPromotions} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions & Offers</h1>
          <p className="text-gray-600">Manage discounts and special offers</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Create Promotion
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search promotions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
            <option value="scheduled">Scheduled</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="all">All Types</option>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
            <option value="bogo">BOGO</option>
          </select>
          <div className="text-sm text-gray-500 flex items-center">
            {filteredPromotions.length} promotion(s)
          </div>
        </div>
      </Card>

      {/* Promotions List */}
      {filteredPromotions.length === 0 ? (
        <Empty 
          message="No promotions found" 
          description="Create your first promotion to get started"
          actionLabel="Create Promotion"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromotions.map((promotion) => (
            <motion.div
              key={promotion.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}>
              <Card className="h-full">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {promotion.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {promotion.description}
                      </p>
                    </div>
                  </div>

                  {/* Value & Type */}
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {getPromotionValue(promotion)}
                    </div>
                    <div className="flex gap-2 mb-3">
                      <Badge className={getStatusColor(promotion.status)}>
                        {promotion.status}
                      </Badge>
                      <Badge className={getTypeColor(promotion.type)}>
                        {promotion.type}
                      </Badge>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="text-sm text-gray-600 mb-4">
                    <div className="flex items-center mb-1">
                      <ApperIcon name="Calendar" className="h-4 w-4 mr-2" />
                      {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                    </div>
                    <div className="flex items-center">
                      <ApperIcon name="TrendingUp" className="h-4 w-4 mr-2" />
                      Used {promotion.usageCount || 0} times
                    </div>
                  </div>

                  {/* Conditions */}
                  {promotion.conditions.minimumAmount && (
                    <div className="text-sm text-gray-600 mb-4">
                      <span className="font-medium">Min. Amount:</span> ${promotion.conditions.minimumAmount}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditPromotion(promotion)}
                      className="flex-1">
                      <ApperIcon name="Edit" className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => showDeleteConfirmation(promotion)}>
                      <ApperIcon name="Trash2" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {showCreateModal ? 'Create New Promotion' : 'Edit Promotion'}
              </h2>
              
              <div className="space-y-4">
                <Input
                  label="Promotion Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter promotion name"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter promotion description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="percentage">Percentage Discount</option>
                    <option value="fixed">Fixed Amount Discount</option>
                    <option value="bogo">Buy One Get One</option>
                  </select>
                </div>

                <Input
                  label={`Value * (${formData.type === 'percentage' || formData.type === 'bogo' ? '%' : '$'})`}
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder={formData.type === 'percentage' ? '20' : '10.00'}
                  step={formData.type === 'fixed' ? '0.01' : '1'}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Start Date *"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />

                  <Input
                    label="End Date *"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                <Input
                  label="Minimum Amount ($)"
                  type="number"
                  value={formData.conditions.minimumAmount}
                  onChange={(e) => setFormData({
                    ...formData, 
                    conditions: {...formData.conditions, minimumAmount: e.target.value}
                  })}
                  placeholder="25.00"
                  step="0.01"
                />

                <Input
                  label="Maximum Uses"
                  type="number"
                  value={formData.conditions.maxUses}
                  onChange={(e) => setFormData({
                    ...formData, 
                    conditions: {...formData.conditions, maxUses: e.target.value}
                  })}
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={showCreateModal ? handleCreatePromotion : handleUpdatePromotion}
                  className="flex-1"
                  disabled={!formData.name || !formData.description || !formData.value || !formData.startDate || !formData.endDate}>
                  {showCreateModal ? 'Create Promotion' : 'Update Promotion'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Delete Promotion</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the promotion "{selectedPromotion.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="danger"
                  onClick={handleDeletePromotion}
                  className="flex-1">
                  Delete Promotion
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedPromotion(null);
                  }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Promotions;