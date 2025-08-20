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
}