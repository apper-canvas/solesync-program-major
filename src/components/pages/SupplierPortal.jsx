import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { DocumentService } from '@/services/api/documentService';

export default function SupplierPortal() {
const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [filteredCommunications, setFilteredCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [dragOver, setDragOver] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [activeTab, setActiveTab] = useState('documents');
  const [commSearchTerm, setCommSearchTerm] = useState('');
  const [selectedCommType, setSelectedCommType] = useState('all');
  const [selectedCommSupplier, setSelectedCommSupplier] = useState('all');
  const [selectedCommStatus, setSelectedCommStatus] = useState('all');
  const [showAddCommModal, setShowAddCommModal] = useState(false);
  const [editingComm, setEditingComm] = useState(null);
  const [newComm, setNewComm] = useState({
    supplierId: '',
    supplierName: '',
    type: 'email',
    subject: '',
    content: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    priority: 'medium',
    status: 'pending',
    followUpDate: ''
  });
  const categories = [
    { value: 'all', label: 'All Categories', icon: 'FileText' },
    { value: 'contract', label: 'Contracts', icon: 'FileContract' },
    { value: 'invoice', label: 'Invoices', icon: 'Receipt' },
    { value: 'catalog', label: 'Catalogs', icon: 'Book' },
    { value: 'certificate', label: 'Certificates', icon: 'Award' },
    { value: 'other', label: 'Other', icon: 'File' }
  ];

  const suppliers = [
    { value: 'all', label: 'All Suppliers' },
    { value: 'nike', label: 'Nike Inc.' },
    { value: 'adidas', label: 'Adidas Group' },
    { value: 'puma', label: 'Puma SE' },
    { value: 'newbalance', label: 'New Balance' },
    { value: 'converse', label: 'Converse' }
  ];

useEffect(() => {
    loadDocuments();
    loadCommunications();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedCategory, selectedSupplier]);

  useEffect(() => {
    filterCommunications();
  }, [communications, commSearchTerm, selectedCommType, selectedCommSupplier, selectedCommStatus]);

  async function loadCommunications() {
    try {
      setLoading(true);
      const data = await DocumentService.getCommunications();
      setCommunications(data);
    } catch (err) {
      setError('Failed to load communications');
      toast.error('Failed to load communications');
    } finally {
      setLoading(false);
    }
  }

  function filterCommunications() {
    let filtered = [...communications];

    if (commSearchTerm) {
      const term = commSearchTerm.toLowerCase();
      filtered = filtered.filter(comm =>
        comm.subject.toLowerCase().includes(term) ||
        comm.content.toLowerCase().includes(term) ||
        comm.supplierName.toLowerCase().includes(term) ||
        comm.contactPerson.toLowerCase().includes(term)
      );
    }

    if (selectedCommType !== 'all') {
      filtered = filtered.filter(comm => comm.type === selectedCommType);
    }

    if (selectedCommSupplier !== 'all') {
      filtered = filtered.filter(comm => comm.supplierName === selectedCommSupplier);
    }

    if (selectedCommStatus !== 'all') {
      filtered = filtered.filter(comm => comm.status === selectedCommStatus);
    }

    setFilteredCommunications(filtered);
  }

  async function handleCreateCommunication() {
    try {
      if (!newComm.subject || !newComm.content || !newComm.supplierName) {
        toast.error('Please fill in all required fields');
        return;
      }

      const communicationData = {
        ...newComm,
        createdBy: 'Current User'
      };

      await DocumentService.createCommunication(communicationData);
      await loadCommunications();
      setShowAddCommModal(false);
      setNewComm({
        supplierId: '',
        supplierName: '',
        type: 'email',
        subject: '',
        content: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        priority: 'medium',
        status: 'pending',
        followUpDate: ''
      });
      toast.success('Communication logged successfully');
    } catch (err) {
      toast.error('Failed to create communication');
    }
  }

  async function handleUpdateCommunication(id, updateData) {
    try {
      await DocumentService.updateCommunication(id, updateData);
      await loadCommunications();
      toast.success('Communication updated successfully');
    } catch (err) {
      toast.error('Failed to update communication');
    }
  }

  async function handleDeleteCommunication(id) {
    if (!confirm('Are you sure you want to delete this communication?')) {
      return;
    }

    try {
      await DocumentService.deleteCommunication(id);
      await loadCommunications();
      toast.success('Communication deleted successfully');
    } catch (err) {
      toast.error('Failed to delete communication');
    }
  }

  function getCommTypeIcon(type) {
    const icons = {
      email: 'Mail',
      phone: 'Phone',
      meeting: 'Users',
      note: 'FileText'
    };
    return icons[type] || 'MessageSquare';
  }

  function getCommTypeLabel(type) {
    const labels = {
      email: 'Email',
      phone: 'Phone Call',
      meeting: 'Meeting',
      note: 'Note'
    };
    return labels[type] || type;
  }

  function getPriorityColor(priority) {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  }

  function getStatusColor(status) {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  }

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DocumentService.getAll();
      setDocuments(data);
    } catch (err) {
      setError('Failed to load documents');
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    if (selectedSupplier !== 'all') {
      filtered = filtered.filter(doc => doc.supplierId === selectedSupplier);
    }

    setFilteredDocuments(filtered);
  };

  const handleFileUpload = async (files) => {
    try {
      for (const file of files) {
        const newDocument = {
          name: file.name,
          size: file.size,
          type: file.type,
          category: 'other',
          supplierId: 'nike',
          supplier: 'Nike Inc.',
          description: `Uploaded document: ${file.name}`,
          uploadedAt: new Date().toISOString()
        };

        const created = await DocumentService.create(newDocument);
        setDocuments(prev => [created, ...prev]);
        toast.success(`Document "${file.name}" uploaded successfully`);
      }
    } catch (error) {
      toast.error('Failed to upload document');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    handleFileUpload(files);
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await DocumentService.delete(documentId);
      setDocuments(prev => prev.filter(doc => doc.Id !== documentId));
      setSelectedDocument(null);
      toast.success('Document deleted successfully');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleUpdateCategory = async (documentId, newCategory) => {
    try {
      const updatedDoc = await DocumentService.update(documentId, { category: newCategory });
      setDocuments(prev => prev.map(doc => doc.Id === documentId ? updatedDoc : doc));
      toast.success('Document category updated');
    } catch (error) {
      toast.error('Failed to update document category');
    }
  };

  const getCategoryIcon = (category) => {
    return categories.find(cat => cat.value === category)?.icon || 'FileText';
  };

  const getCategoryLabel = (category) => {
    return categories.find(cat => cat.value === category)?.label || category;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={() => { loadDocuments(); loadCommunications(); }} />;
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-primary">Supplier Portal</h1>
          <p className="text-gray-600">Manage supplier documents and contracts</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => document.getElementById('file-upload').click()}
            className="bg-accent hover:bg-accent/90 text-white"
          >
            <ApperIcon name="Upload" size={16} />
            Upload Document
          </Button>
          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          />
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <ApperIcon name="FileText" size={20} className="text-accent" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-xl font-semibold text-primary">{documents.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <ApperIcon name="Users" size={20} className="text-secondary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Suppliers</p>
              <p className="text-xl font-semibold text-primary">{suppliers.length - 1}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <ApperIcon name="FileContract" size={20} className="text-warning" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Contracts</p>
              <p className="text-xl font-semibold text-primary">
                {documents.filter(doc => doc.category === 'contract').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <ApperIcon name="CheckCircle" size={20} className="text-success" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Recent Uploads</p>
              <p className="text-xl font-semibold text-primary">
                {documents.filter(doc => {
                  const uploadDate = new Date(doc.uploadedAt);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return uploadDate > weekAgo;
                }).length}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Documents
              </label>
              <Input
                type="text"
                placeholder="Search by name, supplier, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="Search"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier
              </label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
              >
                {suppliers.map(supplier => (
                  <option key={supplier.value} value={supplier.value}>
                    {supplier.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card
          className={`p-8 border-2 border-dashed transition-colors ${
            dragOver
              ? 'border-accent bg-accent/5'
              : 'border-gray-300 hover:border-accent/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="text-center">
            <ApperIcon name="Upload" size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Supports PDF, DOC, XLS, and image files up to 10MB
            </p>
            <Button
              onClick={() => document.getElementById('file-upload').click()}
              variant="outline"
            >
              Choose Files
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Documents List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">
                Documents ({filteredDocuments.length})
              </h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <ApperIcon name="Download" size={16} />
                  Export List
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredDocuments.length === 0 ? (
              <Empty
                title="No documents found"
                description="Try adjusting your search filters or upload new documents"
                icon="FileText"
              />
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDocuments.map((document) => (
                    <motion.tr
                      key={document.Id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <ApperIcon
                              name={getCategoryIcon(document.category)}
                              size={16}
                              className="text-gray-600"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {document.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {document.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{document.supplier}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={document.category === 'contract' ? 'success' : 'secondary'}
                        >
                          {getCategoryLabel(document.category)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatFileSize(document.size)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(document.uploadedAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <select
                            value={document.category}
                            onChange={(e) => handleUpdateCategory(document.Id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            {categories.slice(1).map(category => (
                              <option key={category.value} value={category.value}>
                                {category.label}
                              </option>
                            ))}
                          </select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDocument(document)}
                          >
                            <ApperIcon name="Eye" size={14} />
                          </Button>
<Button
                            variant="outline"
                            size="sm"
                          >
                            <ApperIcon name="Download" size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDocument(document.Id)}
                            className="text-error hover:bg-error/10"
                          >
                            <ApperIcon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6">
        <Button
          variant={activeTab === 'documents' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('documents')}
          className="flex items-center space-x-2"
        >
          <ApperIcon name="FileText" size={16} />
          <span>Documents</span>
        </Button>
        <Button
          variant={activeTab === 'communications' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('communications')}
          className="flex items-center space-x-2"
        >
          <ApperIcon name="MessageSquare" size={16} />
          <span>Communication Log</span>
        </Button>
      </div>

      {/* Communication Log Section */}
      {activeTab === 'communications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Communication Filters and Search */}
          <Card>
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <h2 className="text-xl font-semibold text-primary mb-4 lg:mb-0">
                  Communication Log
                </h2>
                <Button
                  onClick={() => setShowAddCommModal(true)}
                  className="flex items-center space-x-2"
                >
                  <ApperIcon name="Plus" size={16} />
                  <span>Log Communication</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Input
                  placeholder="Search communications..."
                  value={commSearchTerm}
                  onChange={(e) => setCommSearchTerm(e.target.value)}
                  icon="Search"
                />
                <select
                  value={selectedCommType}
                  onChange={(e) => setSelectedCommType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="all">All Types</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone Call</option>
                  <option value="meeting">Meeting</option>
                  <option value="note">Note</option>
                </select>
                <select
                  value={selectedCommSupplier}
                  onChange={(e) => setSelectedCommSupplier(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="all">All Suppliers</option>
                  {[...new Set(communications.map(comm => comm.supplierName))].map(supplier => (
                    <option key={supplier} value={supplier}>{supplier}</option>
                  ))}
                </select>
                <select
                  value={selectedCommStatus}
                  onChange={(e) => setSelectedCommStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className="flex items-center justify-center text-sm text-gray-600">
                  {filteredCommunications.length} of {communications.length} communications
                </div>
              </div>
            </div>
          </Card>

          {/* Communications Table */}
          <Card>
            <div className="p-6">
              {filteredCommunications.length === 0 ? (
                <Empty
                  title="No communications found"
                  description="Start logging communications with your suppliers"
                  action={
                    <Button
                      onClick={() => setShowAddCommModal(true)}
                      className="flex items-center space-x-2"
                    >
                      <ApperIcon name="Plus" size={16} />
                      <span>Log Communication</span>
                    </Button>
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Subject</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Supplier</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCommunications.map((comm) => (
                        <motion.tr
                          key={comm.Id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <ApperIcon
                                name={getCommTypeIcon(comm.type)}
                                size={16}
                                className="text-gray-500"
                              />
                              <span className="text-sm">{getCommTypeLabel(comm.type)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="max-w-xs">
                              <div className="font-medium text-gray-900 truncate">
                                {comm.subject}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {comm.content}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-medium text-gray-900">
                              {comm.supplierName}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <div className="text-gray-900">{comm.contactPerson}</div>
                              <div className="text-gray-500">{comm.contactEmail}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-900">
                              {formatDate(comm.createdAt)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant="secondary"
                              className={getPriorityColor(comm.priority)}
                            >
                              {comm.priority}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant="secondary"
                              className={getStatusColor(comm.status)}
                            >
                              {comm.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingComm(comm);
                                  setNewComm({ ...comm });
                                  setShowAddCommModal(true);
                                }}
                              >
                                <ApperIcon name="Edit" size={14} />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteCommunication(comm.Id)}
                                className="text-error hover:bg-error/10"
                              >
                                <ApperIcon name="Trash2" size={14} />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Add/Edit Communication Modal */}
      {showAddCommModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowAddCommModal(false);
            setEditingComm(null);
            setNewComm({
              supplierId: '',
              supplierName: '',
              type: 'email',
              subject: '',
              content: '',
              contactPerson: '',
              contactEmail: '',
              contactPhone: '',
              priority: 'medium',
              status: 'pending',
              followUpDate: ''
            });
          }}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-primary">
                {editingComm ? 'Edit Communication' : 'Log New Communication'}
              </h3>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Communication Type
                  </label>
                  <select
                    value={newComm.type}
                    onChange={(e) => setNewComm({ ...newComm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone Call</option>
                    <option value="meeting">Meeting</option>
                    <option value="note">Note</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier Name
                  </label>
                  <Input
                    value={newComm.supplierName}
                    onChange={(e) => setNewComm({ ...newComm, supplierName: e.target.value })}
                    placeholder="Enter supplier name"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <Input
                    value={newComm.subject}
                    onChange={(e) => setNewComm({ ...newComm, subject: e.target.value })}
                    placeholder="Enter communication subject"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={newComm.content}
                    onChange={(e) => setNewComm({ ...newComm, content: e.target.value })}
                    placeholder="Enter communication details"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person
                  </label>
                  <Input
                    value={newComm.contactPerson}
                    onChange={(e) => setNewComm({ ...newComm, contactPerson: e.target.value })}
                    placeholder="Contact person name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <Input
                    value={newComm.contactEmail}
                    onChange={(e) => setNewComm({ ...newComm, contactEmail: e.target.value })}
                    placeholder="contact@supplier.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newComm.priority}
                    onChange={(e) => setNewComm({ ...newComm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newComm.status}
                    onChange={(e) => setNewComm({ ...newComm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddCommModal(false);
                  setEditingComm(null);
                  setNewComm({
                    supplierId: '',
                    supplierName: '',
                    type: 'email',
                    subject: '',
                    content: '',
                    contactPerson: '',
                    contactEmail: '',
                    contactPhone: '',
                    priority: 'medium',
                    status: 'pending',
                    followUpDate: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingComm ? 
                  () => handleUpdateCommunication(editingComm.Id, newComm) : 
                  handleCreateCommunication
                }
              >
                {editingComm ? 'Update Communication' : 'Log Communication'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Document Preview Modal */}
      {selectedDocument && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDocument(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ApperIcon
                    name={getCategoryIcon(selectedDocument.category)}
                    size={24}
                    className="text-accent"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      {selectedDocument.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedDocument.supplier}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDocument(null)}
                >
                  <ApperIcon name="X" size={16} />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <p className="text-sm text-gray-900">
                      {getCategoryLabel(selectedDocument.category)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">File Size</label>
                    <p className="text-sm text-gray-900">
                      {formatFileSize(selectedDocument.size)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Upload Date</label>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedDocument.uploadedAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">File Type</label>
                    <p className="text-sm text-gray-900">{selectedDocument.type}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedDocument.description}
                  </p>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button className="bg-accent hover:bg-accent/90 text-white">
                    <ApperIcon name="Download" size={16} />
                    Download
                  </Button>
                  <Button variant="outline">
                    <ApperIcon name="Share" size={16} />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteDocument(selectedDocument.Id)}
                    className="text-error hover:bg-error/10"
                  >
                    <ApperIcon name="Trash2" size={16} />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}