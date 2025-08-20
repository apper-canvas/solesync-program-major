import transactionData from "@/services/mockData/transactions.json";

export class TransactionService {
  static async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...transactionData];
  }

  static async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const transaction = transactionData.find(t => t.Id === parseInt(id));
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return { ...transaction };
  }

static async create(transaction) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newId = Math.max(...transactionData.map(t => t.Id), 0) + 1;
    const newTransaction = { 
      ...transaction, 
      Id: newId,
      timestamp: transaction.timestamp || new Date().toISOString()
    };
    transactionData.push(newTransaction);
    return { ...newTransaction };
  }

  static async getSalesData(period = "week") {
    await new Promise(resolve => setTimeout(resolve, 250));
    const now = new Date();
    let startDate;
    
    switch (period) {
      case "day":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return transactionData
      .filter(t => t.type === "sale" && new Date(t.timestamp) >= startDate)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  static async getReturns() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return transactionData.filter(t => t.type === "return");
}

  static async getSizeAnalytics(filters = {}) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter transactions by brand/category if specified
    let filteredTransactions = transactionData.filter(t => t.type === "sale");
    
    if (filters.brand && filters.brand !== "all") {
      filteredTransactions = filteredTransactions.filter(t => 
        t.items.some(item => item.brand === filters.brand)
      );
    }
    
    if (filters.category && filters.category !== "all") {
      filteredTransactions = filteredTransactions.filter(t => 
        t.items.some(item => item.category === filters.category)
      );
    }

    // Extract size data from transactions
    const sizeData = {};
    let totalItems = 0;

    filteredTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const size = item.size;
        if (size) {
          sizeData[size] = (sizeData[size] || 0) + item.quantity;
          totalItems += item.quantity;
        }
      });
    });

    // Sort sizes and calculate percentages
    const sortedSizes = Object.keys(sizeData).sort((a, b) => {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      return numA - numB;
    });

    const percentages = sortedSizes.map(size => 
      ((sizeData[size] / totalItems) * 100).toFixed(1)
    );

    // Find most popular size
    const topSize = sortedSizes.reduce((a, b) => 
      sizeData[a] > sizeData[b] ? a : b
    );

    // Calculate diversity index (entropy-based)
    const diversityIndex = sortedSizes.length > 1 ? 
      (sortedSizes.length / 10 * 100).toFixed(0) : 0;

    return {
      historical: {
        sizes: sortedSizes,
        quantities: sortedSizes.map(size => sizeData[size]),
        percentages: percentages.map(p => parseFloat(p))
      },
      topSize,
      diversityIndex,
      totalSales: totalItems
    };
  }

  static async predictSizeDemand(params = {}) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const { brand = "all", category = "all", days = 30 } = params;
    
    // Get historical data for prediction
    const analytics = await this.getSizeAnalytics({ brand, category });
    const { historical } = analytics;
    
    // Simulate ML prediction algorithm
    const predictions = historical.sizes.map((size, index) => {
      const basePercentage = historical.percentages[index];
      
      // Add seasonal and trend factors
      const seasonalFactor = 1 + (Math.sin(Date.now() / 10000000) * 0.1);
      const trendFactor = 1 + ((parseFloat(size) - 9) * 0.05); // Larger sizes trending up
      const randomFactor = 1 + ((Math.random() - 0.5) * 0.2);
      
      return (basePercentage * seasonalFactor * trendFactor * randomFactor);
    });

    // Generate timeline
    const timeline = Array.from({ length: Math.ceil(days / 7) }, (_, i) => 
      `Week ${i + 1}`
    );

    // Generate trend data
    const historicalTrend = Array.from({ length: timeline.length }, (_, i) => 
      Math.round(50 + (Math.random() * 30))
    );
    
    const forecast = historicalTrend.map((val, i) => 
      Math.round(val * (1 + (i * 0.1) + (Math.random() * 0.3)))
    );

    const confidenceUpper = forecast.map(val => val * 1.2);

    // Generate recommendations
    const recommendations = historical.sizes.map((size, index) => {
      const currentStock = Math.floor(Math.random() * 50) + 5;
      const predictedDemand = Math.round((predictions[index] / 100) * days * 2);
      const recommendedOrder = Math.max(0, predictedDemand - currentStock + 10);
      
      let priority = "low";
      if (recommendedOrder > 30) priority = "high";
      else if (recommendedOrder > 15) priority = "medium";
      
      return {
        size,
        currentStock,
        predictedDemand,
        recommendedOrder,
        confidence: Math.floor(Math.random() * 15) + 85,
        priority
      };
    });

    const totalRecommended = recommendations.reduce((sum, rec) => sum + rec.recommendedOrder, 0);

    return {
      sizeDistribution: predictions,
      timeline,
      historicalTrend,
      forecast,
      confidenceUpper,
      recommendations,
      totalRecommended,
      accuracy: Math.floor(Math.random() * 10) + 85,
      generatedAt: new Date().toISOString()
    };
  }
}