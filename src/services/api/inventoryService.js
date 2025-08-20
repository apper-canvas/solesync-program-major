import inventoryData from "@/services/mockData/inventory.json";

export class InventoryService {
  static async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...inventoryData];
  }

  static async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const item = inventoryData.find(item => item.Id === parseInt(id));
    if (!item) {
      throw new Error("Inventory item not found");
    }
    return { ...item };
  }

  static async create(item) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newId = Math.max(...inventoryData.map(item => item.Id)) + 1;
    const newItem = { ...item, Id: newId };
    inventoryData.push(newItem);
    return { ...newItem };
  }

  static async update(id, data) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = inventoryData.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Inventory item not found");
    }
    inventoryData[index] = { ...inventoryData[index], ...data, Id: parseInt(id) };
    return { ...inventoryData[index] };
  }

  static async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = inventoryData.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Inventory item not found");
    }
    const deletedItem = { ...inventoryData[index] };
    inventoryData.splice(index, 1);
    return deletedItem;
  }

  static async getLowStock() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return inventoryData.filter(item => item.totalStock <= item.reorderPoint);
  }

  static async search(query) {
    await new Promise(resolve => setTimeout(resolve, 250));
    const lowercaseQuery = query.toLowerCase();
    return inventoryData.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.brand.toLowerCase().includes(lowercaseQuery) ||
      item.styleCode.toLowerCase().includes(lowercaseQuery)
    );
  }
}