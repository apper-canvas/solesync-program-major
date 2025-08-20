import purchaseOrderData from "@/services/mockData/purchaseOrders.json";

export class PurchaseOrderService {
  static async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...purchaseOrderData];
  }

  static async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const order = purchaseOrderData.find(o => o.Id === parseInt(id));
    if (!order) {
      throw new Error("Purchase order not found");
    }
    return { ...order };
  }

  static async getPending() {
    await new Promise(resolve => setTimeout(resolve, 250));
    return purchaseOrderData.filter(order => order.status === "pending");
  }

  static async create(order) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newId = Math.max(...purchaseOrderData.map(o => o.Id)) + 1;
    const newOrder = { 
      ...order, 
      Id: newId,
      orderDate: new Date().toISOString(),
      status: "pending"
    };
    purchaseOrderData.push(newOrder);
    return { ...newOrder };
  }

  static async update(id, data) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = purchaseOrderData.findIndex(o => o.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Purchase order not found");
    }
    purchaseOrderData[index] = { ...purchaseOrderData[index], ...data, Id: parseInt(id) };
    return { ...purchaseOrderData[index] };
  }

  static async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = purchaseOrderData.findIndex(o => o.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Purchase order not found");
    }
    const deletedOrder = { ...purchaseOrderData[index] };
    purchaseOrderData.splice(index, 1);
return deletedOrder;
  }

  // Get supplier terms and lead times
  static async getSupplierTerms(supplierId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock supplier terms data - in real app this would come from supplier master data
    const supplierTerms = {
      'nike': {
        supplierId: 'nike',
        name: 'Nike Inc.',
        paymentTerms: 'Net 30',
        leadTimeDays: 14,
        minimumOrderValue: 1000,
        currency: 'USD',
        preferredShippingMethod: 'Express',
        qualityRequirements: ['ISO 9001', 'Product Testing'],
        returnPolicy: '30 days',
        warranties: ['Defect replacement', '1 year warranty']
      },
      'adidas': {
        supplierId: 'adidas',
        name: 'Adidas AG',
        paymentTerms: 'Net 45',
        leadTimeDays: 21,
        minimumOrderValue: 1500,
        currency: 'USD',
        preferredShippingMethod: 'Standard',
        qualityRequirements: ['CE Marking', 'Quality Certificates'],
        returnPolicy: '45 days',
        warranties: ['Material defect coverage', '2 year warranty']
      },
      'newbalance': {
        supplierId: 'newbalance',
        name: 'New Balance Inc.',
        paymentTerms: 'Net 30',
        leadTimeDays: 10,
        minimumOrderValue: 800,
        currency: 'USD',
        preferredShippingMethod: 'Express',
        qualityRequirements: ['CPSC Compliance', 'Material Safety'],
        returnPolicy: '60 days',
        warranties: ['Manufacturing defects', '18 months warranty']
      }
    };

    const supplierKey = supplierId.toLowerCase().replace(/[^a-z0-9]/g, '');
    return supplierTerms[supplierKey] || {
      supplierId,
      name: supplierId,
      paymentTerms: 'Net 30',
      leadTimeDays: 14,
      minimumOrderValue: 500,
      currency: 'USD',
      preferredShippingMethod: 'Standard',
      qualityRequirements: [],
      returnPolicy: '30 days',
      warranties: []
    };
  }

  // Get supplier performance metrics
  static async getSupplierPerformance(supplierId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    // Calculate performance from purchase orders
    const allOrders = purchaseOrderData.filter(order => 
      order.supplier.toLowerCase().includes(supplierId.toLowerCase()) ||
      supplierId.toLowerCase().includes(order.supplier.toLowerCase().split(' ')[0])
    );
    
    const receivedOrders = allOrders.filter(order => order.status === 'received');
    
    let totalLeadTime = 0;
    let onTimeDeliveries = 0;
    
    receivedOrders.forEach(order => {
      if (order.receivedDate && order.expectedDate) {
        const expected = new Date(order.expectedDate);
        const received = new Date(order.receivedDate);
        const leadTime = Math.ceil((received - new Date(order.orderDate)) / (1000 * 60 * 60 * 24));
        totalLeadTime += leadTime;
        
        if (received <= expected) {
          onTimeDeliveries++;
        }
      }
    });

    return {
      totalOrders: allOrders.length,
      completedOrders: receivedOrders.length,
      pendingOrders: allOrders.length - receivedOrders.length,
      averageLeadTime: receivedOrders.length > 0 ? Math.round(totalLeadTime / receivedOrders.length) : 0,
      onTimeDeliveryRate: receivedOrders.length > 0 ? Math.round((onTimeDeliveries / receivedOrders.length) * 100) : 0,
      totalOrderValue: allOrders.reduce((sum, order) => sum + order.totalCost, 0),
      lastOrderDate: allOrders.length > 0 ? allOrders[allOrders.length - 1].orderDate : null
    };
  }
}