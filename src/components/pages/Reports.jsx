import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Chart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { DashboardService } from "@/services/api/dashboardService";
import { TransactionService } from "@/services/api/transactionService";

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("sales");

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      setError("");
      const [sales, categories, transactionList] = await Promise.all([
        DashboardService.getSalesChart("month"),
        DashboardService.getSalesByCategory(),
        TransactionService.getSalesData("month")
      ]);
      
      setSalesData(sales);
      setCategoryData(categories);
      setTransactions(transactionList);
    } catch (err) {
      setError("Failed to load reports data");
      console.error("Reports error:", err);
    } finally {
      setLoading(false);
    }
  };

  const salesChartOptions = {
    chart: {
      type: "line",
      height: 350,
      toolbar: { show: true }
    },
    colors: ["#4A90E2"],
    stroke: { 
      curve: "smooth",
      width: 3
    },
    xaxis: {
      categories: salesData.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric" 
        });
      })
    },
    yaxis: {
      labels: {
        formatter: (value) => `$${value}`
      }
    },
    tooltip: {
      y: {
        formatter: (value) => `$${value.toFixed(2)}`
      }
    }
  };

  const categoryChartOptions = {
    chart: {
      type: "donut",
      height: 350
    },
    colors: ["#4A90E2", "#00D084", "#F5A623", "#E74C3C", "#9B59B6"],
    labels: categoryData.map(c => c.category),
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`
    },
    legend: {
      position: "bottom"
    }
  };

  const tabs = [
    { id: "sales", label: "Sales Analysis", icon: "TrendingUp" },
    { id: "inventory", label: "Inventory Reports", icon: "Package" },
    { id: "financial", label: "Financial Reports", icon: "DollarSign" },
    { id: "customers", label: "Customer Analytics", icon: "Users" }
  ];

  if (loading) return <Loading rows={6} />;
  if (error) return <Error message={error} onRetry={loadReportsData} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive business insights and reporting</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="sm" icon="Download">
            Export Data
          </Button>
          <Button variant="secondary" size="sm" icon="Calendar">
            Date Range
          </Button>
          <Button variant="secondary" size="sm" icon="Settings">
            Configure
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-secondary to-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <ApperIcon name={tab.icon} className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Sales Analysis Tab */}
      {activeTab === "sales" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Sales Trend</h2>
                <p className="text-sm text-gray-500">Monthly revenue performance</p>
              </div>
              <Button variant="ghost" size="sm" icon="TrendingUp">
                View Details
              </Button>
            </div>
            
            {salesData.length > 0 && (
              <Chart
                options={salesChartOptions}
                series={[{
                  name: "Sales",
                  data: salesData.map(d => d.sales)
                }]}
                type="line"
                height={350}
              />
            )}
          </Card>

          {/* Category Breakdown */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Sales by Category</h2>
                <p className="text-sm text-gray-500">Revenue distribution</p>
              </div>
              <Button variant="ghost" size="sm" icon="PieChart">
                View Details
              </Button>
            </div>
            
            {categoryData.length > 0 && (
              <Chart
                options={categoryChartOptions}
                series={categoryData.map(c => c.percentage)}
                type="donut"
                height={350}
              />
            )}
          </Card>
        </div>
      )}

      {/* Recent Transactions */}
      {activeTab === "sales" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
              <p className="text-sm text-gray-500">Latest sales activity</p>
            </div>
            <Button variant="secondary" size="sm" icon="ExternalLink">
              View All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Transaction ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Items</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Payment</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 10).map((transaction, index) => (
                  <motion.tr
                    key={transaction.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-4">
                      <div className="font-mono text-sm">#{transaction.Id}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">
                        {transaction.items.length} items
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.items[0]?.name}
                        {transaction.items.length > 1 && ` +${transaction.items.length - 1} more`}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">
                        ${transaction.total.toFixed(2)}
                      </div>
                      {transaction.discount > 0 && (
                        <div className="text-xs text-success">
                          -${transaction.discount.toFixed(2)} discount
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <Badge 
                        variant={transaction.payment.method === "card" ? "primary" : "success"} 
                        size="sm"
                      >
                        {transaction.payment.method}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Other Tab Placeholders */}
      {activeTab !== "sales" && (
        <Card className="p-12 text-center">
          <ApperIcon name="BarChart3" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {tabs.find(t => t.id === activeTab)?.label} Coming Soon
          </h3>
          <p className="text-gray-500">
            This report section is currently under development and will be available in the next update.
          </p>
        </Card>
      )}
    </motion.div>
  );
};

export default Reports;