import dashboardData from "@/services/mockData/dashboardStats.json";

export class DashboardService {
  static async getStats() {
    await new Promise(resolve => setTimeout(resolve, 400));
    return { ...dashboardData };
  }

  static async getTopProducts(limit = 5) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return dashboardData.topSellingProducts.slice(0, limit);
  }

  static async getSalesByCategory() {
    await new Promise(resolve => setTimeout(resolve, 250));
    return [...dashboardData.salesByCategory];
  }

  static async getRecentActivity(limit = 10) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return dashboardData.recentActivity.slice(0, limit);
  }

  static async getSalesChart(period = "week") {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    // Generate sample chart data based on period
    const now = new Date();
    const data = [];
    let days = 7;
    
    if (period === "month") days = 30;
    else if (period === "year") days = 365;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const sales = Math.floor(Math.random() * 2000) + 500; // Random sales between 500-2500
      
      data.push({
        date: date.toISOString().split("T")[0],
        sales: sales,
        orders: Math.floor(sales / 80) // Approximate orders from sales
      });
    }

    return data;
  }
}