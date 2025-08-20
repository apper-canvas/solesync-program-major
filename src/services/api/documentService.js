import mockCommunications from "@/services/mockData/communications.json";
import mockDocuments from "@/services/mockData/documents.json";

class DocumentServiceClass {
  constructor() {
    this.documents = [...mockDocuments];
    this.communications = [...mockCommunications];
    this.grnCounter = 1;
  }

  // Generate GRN number in format GRN-YYYY-XXXXXX
  generateGRNNumber() {
    const year = new Date().getFullYear();
    const sequence = String(this.grnCounter++).padStart(6, '0');
    return `GRN-${year}-${sequence}`;
  }

  // Calculate lead time performance
  calculateLeadTime(orderDate, expectedDate, receivedDate) {
    const ordered = new Date(orderDate);
    const expected = new Date(expectedDate);
    const received = new Date(receivedDate);
    
    const actualLeadTime = Math.ceil((received - ordered) / (1000 * 60 * 60 * 24));
    const expectedLeadTime = Math.ceil((expected - ordered) / (1000 * 60 * 60 * 24));
    const variance = actualLeadTime - expectedLeadTime;
    
    return {
      actualLeadTime,
      expectedLeadTime,
      variance,
      performance: variance <= 0 ? 'On Time' : variance <= 2 ? 'Acceptable' : 'Late'
    };
  }

  // Create GRN document automatically
  async createGRN(purchaseOrder, receivedItems) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const grnNumber = this.generateGRNNumber();
    const receivedDate = new Date().toISOString();
    const leadTimeAnalysis = this.calculateLeadTime(
      purchaseOrder.orderDate,
      purchaseOrder.expectedDate,
      receivedDate
    );

    // Calculate totals
    const totalReceivedQty = receivedItems.reduce((sum, item) => sum + item.receivedQty, 0);
    const totalOrderedQty = purchaseOrder.items.reduce((sum, item) => sum + item.orderedQty, 0);
    const totalReceivedValue = receivedItems.reduce((sum, item) => sum + (item.receivedQty * item.unitCost), 0);

    // Create GRN document content
    const grnContent = {
      grnNumber,
      purchaseOrderId: purchaseOrder.Id,
      supplier: {
        name: purchaseOrder.supplier,
        supplierId: purchaseOrder.supplierId || purchaseOrder.supplier.toLowerCase().replace(/[^a-z0-9]/g, '')
      },
      orderDetails: {
        orderDate: purchaseOrder.orderDate,
        expectedDate: purchaseOrder.expectedDate,
        receivedDate,
        totalCost: purchaseOrder.totalCost
      },
      receivedItems: receivedItems.map(item => ({
        productId: item.productId,
        name: item.name,
        barcode: item.barcode,
        size: item.size,
        orderedQty: item.orderedQty,
        receivedQty: item.receivedQty,
        unitCost: item.unitCost,
        totalCost: item.receivedQty * item.unitCost,
        variance: item.receivedQty - item.orderedQty,
        status: item.receivedQty === item.orderedQty ? 'Complete' : item.receivedQty > item.orderedQty ? 'Over-received' : 'Under-received'
      })),
      summary: {
        totalItemsOrdered: purchaseOrder.items.length,
        totalItemsReceived: receivedItems.length,
        totalOrderedQty,
        totalReceivedQty,
        totalReceivedValue,
        completionRate: Math.round((totalReceivedQty / totalOrderedQty) * 100)
      },
      leadTimeAnalysis,
      qualityNotes: [],
      receivedBy: 'System User', // In real app, this would be current user
      createdAt: receivedDate
    };

    // Store as document
    const newId = Math.max(...this.documents.map(doc => doc.Id)) + 1;
    const grnDocument = {
      Id: newId,
      name: `${grnNumber}.json`,
      size: JSON.stringify(grnContent).length,
      type: 'application/json',
      category: 'grn',
      supplierId: grnContent.supplier.supplierId,
      supplier: grnContent.supplier.name,
      description: `Goods Received Note for PO-${purchaseOrder.Id} from ${purchaseOrder.supplier}. Lead time: ${leadTimeAnalysis.actualLeadTime} days (${leadTimeAnalysis.performance})`,
      uploadedAt: receivedDate,
      updatedAt: receivedDate,
      grnContent // Store the actual GRN data
    };

    this.documents.push(grnDocument);
    return { ...grnDocument };
  }

  // Get all GRN documents
  async getGRNs() {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.documents.filter(doc => doc.category === 'grn');
  }

  // Get GRNs by supplier
  async getGRNsBySupplier(supplierId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.documents.filter(doc => doc.category === 'grn' && doc.supplierId === supplierId);
  }

  // Get GRN analytics
  async getGRNAnalytics() {
    await new Promise(resolve => setTimeout(resolve, 300));
    const grns = this.documents.filter(doc => doc.category === 'grn' && doc.grnContent);
    
    const analytics = {
      totalGRNs: grns.length,
      avgLeadTime: 0,
      onTimeDeliveries: 0,
      lateDeliveries: 0,
      supplierPerformance: {},
      monthlyTrends: {}
    };

    if (grns.length > 0) {
      let totalLeadTime = 0;
      grns.forEach(grn => {
        const leadTime = grn.grnContent.leadTimeAnalysis;
        totalLeadTime += leadTime.actualLeadTime;
        
        if (leadTime.performance === 'On Time' || leadTime.performance === 'Acceptable') {
          analytics.onTimeDeliveries++;
        } else {
          analytics.lateDeliveries++;
        }

        // Supplier performance tracking
        const supplier = grn.supplier;
        if (!analytics.supplierPerformance[supplier]) {
          analytics.supplierPerformance[supplier] = {
            totalDeliveries: 0,
            onTimeDeliveries: 0,
            avgLeadTime: 0,
            totalLeadTime: 0
          };
        }
        
        analytics.supplierPerformance[supplier].totalDeliveries++;
        analytics.supplierPerformance[supplier].totalLeadTime += leadTime.actualLeadTime;
        analytics.supplierPerformance[supplier].avgLeadTime = 
          analytics.supplierPerformance[supplier].totalLeadTime / analytics.supplierPerformance[supplier].totalDeliveries;
        
        if (leadTime.performance === 'On Time' || leadTime.performance === 'Acceptable') {
          analytics.supplierPerformance[supplier].onTimeDeliveries++;
        }
      });

      analytics.avgLeadTime = totalLeadTime / grns.length;
    }

    return analytics;
  }

  // Document Methods
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.documents];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const document = this.documents.find(doc => doc.Id === parseInt(id));
    if (!document) {
      throw new Error('Document not found');
    }
    return { ...document };
  }

  async getBySupplier(supplierId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.documents.filter(doc => doc.supplierId === supplierId);
  }

  async getByCategory(category) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.documents.filter(doc => doc.category === category);
  }

  async create(documentData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newId = Math.max(...this.documents.map(doc => doc.Id)) + 1;
    const newDocument = {
      ...documentData,
      Id: newId,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.documents.push(newDocument);
    return { ...newDocument };
  }

  async update(id, updateData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.documents.findIndex(doc => doc.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Document not found');
    }
    this.documents[index] = {
      ...this.documents[index],
      ...updateData,
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    };
    return { ...this.documents[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.documents.findIndex(doc => doc.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Document not found');
    }
    const deletedDocument = { ...this.documents[index] };
    this.documents.splice(index, 1);
    return deletedDocument;
  }

  async search(query) {
    await new Promise(resolve => setTimeout(resolve, 250));
    const searchTerm = query.toLowerCase();
    return this.documents.filter(doc =>
      doc.name.toLowerCase().includes(searchTerm) ||
      doc.description.toLowerCase().includes(searchTerm) ||
      doc.supplier.toLowerCase().includes(searchTerm) ||
      doc.category.toLowerCase().includes(searchTerm)
    );
  }

  async getStats() {
    await new Promise(resolve => setTimeout(resolve, 200));
    const stats = {
      total: this.documents.length,
      byCategory: {},
      bySupplier: {},
      totalSize: this.documents.reduce((sum, doc) => sum + doc.size, 0)
    };

    this.documents.forEach(doc => {
      stats.byCategory[doc.category] = (stats.byCategory[doc.category] || 0) + 1;
      stats.bySupplier[doc.supplier] = (stats.bySupplier[doc.supplier] || 0) + 1;
    });

    return stats;
  }

  // Communication Methods
  async getCommunications() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.communications];
  }

  async getCommunicationById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const communication = this.communications.find(comm => comm.Id === parseInt(id));
    if (!communication) {
      throw new Error('Communication not found');
    }
    return { ...communication };
  }

  async getCommunicationsBySupplier(supplierId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.communications.filter(comm => comm.supplierId === supplierId);
  }

  async createCommunication(communicationData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newId = Math.max(...this.communications.map(comm => comm.Id)) + 1;
    const newCommunication = {
      ...communicationData,
      Id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.communications.push(newCommunication);
    return { ...newCommunication };
  }

  async updateCommunication(id, updateData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.communications.findIndex(comm => comm.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Communication not found');
    }
    this.communications[index] = {
      ...this.communications[index],
      ...updateData,
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    };
    return { ...this.communications[index] };
  }

  async deleteCommunication(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.communications.findIndex(comm => comm.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Communication not found');
    }
    const deletedCommunication = { ...this.communications[index] };
    this.communications.splice(index, 1);
    return deletedCommunication;
  }

  async searchCommunications(query) {
    await new Promise(resolve => setTimeout(resolve, 250));
    const searchTerm = query.toLowerCase();
    return this.communications.filter(comm =>
      comm.subject.toLowerCase().includes(searchTerm) ||
      comm.message.toLowerCase().includes(searchTerm) ||
      comm.supplier.toLowerCase().includes(searchTerm)
    );
  }

  async getCommunicationStats() {
    await new Promise(resolve => setTimeout(resolve, 200));
    const stats = {
      total: this.communications.length,
      byType: {},
      byStatus: {},
      byPriority: {}
    };

    this.communications.forEach(comm => {
      stats.byType[comm.type] = (stats.byType[comm.type] || 0) + 1;
      stats.byStatus[comm.status] = (stats.byStatus[comm.status] || 0) + 1;
      stats.byPriority[comm.priority] = (stats.byPriority[comm.priority] || 0) + 1;
    });

    return stats;
  }
}

const documentService = new DocumentServiceClass();
export default documentService;