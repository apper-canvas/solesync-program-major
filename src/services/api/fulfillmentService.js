import fulfillmentData from "@/services/mockData/fulfillmentOrders.json";

export class OrderFulfillmentService {
  static async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...fulfillmentData];
  }

  static async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const order = fulfillmentData.find(o => o.Id === parseInt(id));
    if (!order) {
      throw new Error("Order not found");
    }
    return { ...order };
  }

  static async getByType(fulfillmentType) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return fulfillmentData.filter(order => order.fulfillmentType === fulfillmentType);
  }

  static async getByStatus(status) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return fulfillmentData.filter(order => order.status === status);
  }

  static async create(order) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newId = Math.max(...fulfillmentData.map(o => o.Id)) + 1;
    const newOrder = { 
      ...order, 
      Id: newId,
      orderDate: new Date().toISOString(),
      status: "pending",
      orderNumber: `ORD${String(newId).padStart(6, '0')}`
    };
    fulfillmentData.push(newOrder);
    return { ...newOrder };
  }

  static async update(id, data) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = fulfillmentData.findIndex(o => o.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Order not found");
    }
    fulfillmentData[index] = { ...fulfillmentData[index], ...data, Id: parseInt(id) };
    return { ...fulfillmentData[index] };
  }

  static async updateStatus(id, status) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = fulfillmentData.findIndex(o => o.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Order not found");
    }
    fulfillmentData[index] = { ...fulfillmentData[index], status, Id: parseInt(id) };
    return { ...fulfillmentData[index] };
  }

  static async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = fulfillmentData.findIndex(o => o.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Order not found");
    }
    const deletedOrder = { ...fulfillmentData[index] };
    fulfillmentData.splice(index, 1);
    return deletedOrder;
  }

  // Get orders that need immediate attention
  static async getUrgentOrders() {
    await new Promise(resolve => setTimeout(resolve, 200));
    const now = new Date();
    const urgentOrders = fulfillmentData.filter(order => {
      if (order.status === 'cancelled' || order.status === 'completed') return false;
      
      if (order.dueDate) {
        const dueDate = new Date(order.dueDate);
        const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);
        return hoursUntilDue <= 24; // Due within 24 hours
      }
      
      return false;
    });

    return urgentOrders.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  // Get fulfillment stats
  static async getStats() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const stats = {
      total: fulfillmentData.length,
      pending: fulfillmentData.filter(o => o.status === 'pending').length,
      processing: fulfillmentData.filter(o => o.status === 'processing').length,
      ready: fulfillmentData.filter(o => o.status === 'ready').length,
      shipped: fulfillmentData.filter(o => o.status === 'shipped').length,
      completed: fulfillmentData.filter(o => o.status === 'completed').length,
      cancelled: fulfillmentData.filter(o => o.status === 'cancelled').length,
      byType: {
        'ship-from-store': fulfillmentData.filter(o => o.fulfillmentType === 'ship-from-store').length,
        'click-and-collect': fulfillmentData.filter(o => o.fulfillmentType === 'click-and-collect').length,
        'store-reservation': fulfillmentData.filter(o => o.fulfillmentType === 'store-reservation').length
      }
    };

    return stats;
  }
}