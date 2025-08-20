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
}