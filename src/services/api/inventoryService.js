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

  static async getSlowMovingItems(daysThreshold = 30, velocityThreshold = 0.1) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Import transaction data to calculate sales velocity
    const transactionData = await import("@/services/mockData/transactions.json");
    const transactions = transactionData.default;
    
    const currentDate = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(currentDate.getDate() - daysThreshold);
    
    return inventoryData.map(item => {
      // Calculate days since last sold
      const lastSoldDate = item.lastSold ? new Date(item.lastSold) : null;
      const daysSinceLastSold = lastSoldDate ? 
        Math.floor((currentDate - lastSoldDate) / (1000 * 60 * 60 * 24)) : 999;
      
      // Calculate sales velocity (sales per day over last 30 days)
      const recentSales = transactions.filter(transaction => 
        transaction.type === 'sale' &&
        new Date(transaction.timestamp) >= thresholdDate &&
        transaction.items.some(transactionItem => transactionItem.productId === item.Id)
      );
      
      const totalSoldRecently = recentSales.reduce((sum, transaction) => {
        const itemSales = transaction.items
          .filter(transactionItem => transactionItem.productId === item.Id)
          .reduce((itemSum, transactionItem) => itemSum + transactionItem.quantity, 0);
        return sum + itemSales;
      }, 0);
      
      const salesVelocity = totalSoldRecently / daysThreshold;
      const stockTurnoverRatio = item.totalStock > 0 ? salesVelocity / item.totalStock : 0;
      
      // Determine if item is slow-moving
      const isSlowMoving = daysSinceLastSold > daysThreshold || 
                          salesVelocity < velocityThreshold ||
                          stockTurnoverRatio < 0.01;
      
      // Calculate performance score (0-100)
      let performanceScore = 100;
      if (daysSinceLastSold > daysThreshold) performanceScore -= 40;
      if (salesVelocity < velocityThreshold) performanceScore -= 30;
      if (stockTurnoverRatio < 0.01) performanceScore -= 30;
      performanceScore = Math.max(0, performanceScore);
      
      return {
        ...item,
        daysSinceLastSold,
        salesVelocity: Math.round(salesVelocity * 100) / 100,
        stockTurnoverRatio: Math.round(stockTurnoverRatio * 1000) / 1000,
        totalSoldRecently,
        isSlowMoving,
        performanceScore: Math.round(performanceScore),
        stockValue: item.totalStock * item.cost,
        potentialLoss: isSlowMoving ? item.totalStock * item.cost * 0.1 : 0
      };
    }).filter(item => item.isSlowMoving);
  }
}