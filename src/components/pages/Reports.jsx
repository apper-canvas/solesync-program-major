import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Chart from "react-apexcharts";
import { toast } from "react-hot-toast";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import { InventoryService } from "@/services/api/inventoryService";
import { TransactionService } from "@/services/api/transactionService";
import { DashboardService } from "@/services/api/dashboardService";

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
const [transactions, setTransactions] = useState([]);
  const [slowMovingItems, setSlowMovingItems] = useState([]);
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
      const [sales, categories, transactionList, slowItems] = await Promise.all([
        DashboardService.getSalesChart("month"),
        DashboardService.getSalesByCategory(),
        TransactionService.getSalesData("month"),
        InventoryService.getSlowMovingItems()
      ]);
      
      setSalesData(sales);
      setCategoryData(categories);
      setTransactions(transactionList);
      setSlowMovingItems(slowItems);
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
      {activeTab === "inventory" && (
        <InventoryAnalysisTab 
          slowMovingItems={slowMovingItems}
          loading={loading}
        />
      )}

      {activeTab !== "sales" && activeTab !== "inventory" && (
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
}

// Inventory Analysis Tab Component
function InventoryAnalysisTab({ slowMovingItems, loading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("daysSinceLastSold");
  const [sortDirection, setSortDirection] = useState("desc");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Filter and sort items
  const filteredItems = slowMovingItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.styleCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const multiplier = sortDirection === "asc" ? 1 : -1;
      return (aVal > bVal ? 1 : -1) * multiplier;
    });

  const categories = [...new Set(slowMovingItems.map(item => item.category))];
  
  const totalSlowMovingValue = slowMovingItems.reduce((sum, item) => sum + item.stockValue, 0);
  const totalPotentialLoss = slowMovingItems.reduce((sum, item) => sum + item.potentialLoss, 0);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleReorder = (item) => {
    toast.success(`Reorder initiated for ${item.name}`);
  };

  const handleViewDetails = (item) => {
    toast.info(`Viewing details for ${item.name}`);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <ApperIcon name="Package" className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Slow-Moving Items</p>
              <p className="text-xl font-semibold text-gray-900">{slowMovingItems.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-error/10 rounded-lg">
              <ApperIcon name="DollarSign" className="h-5 w-5 text-error" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Stock Value</p>
              <p className="text-xl font-semibold text-gray-900">${totalSlowMovingValue.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <ApperIcon name="TrendingDown" className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Potential Loss</p>
              <p className="text-xl font-semibold text-gray-900">${totalPotentialLoss.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="Search"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Items Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Product</span>
                    {sortField === "name" && (
                      <ApperIcon name={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"} className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("daysSinceLastSold")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Days Since Last Sold</span>
                    {sortField === "daysSinceLastSold" && (
                      <ApperIcon name={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"} className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("salesVelocity")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Sales Velocity</span>
                    {sortField === "salesVelocity" && (
                      <ApperIcon name={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"} className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("totalStock")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Current Stock</span>
                    {sortField === "totalStock" && (
                      <ApperIcon name={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"} className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("stockValue")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Stock Value</span>
                    {sortField === "stockValue" && (
                      <ApperIcon name={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"} className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("performanceScore")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Performance</span>
                    {sortField === "performanceScore" && (
                      <ApperIcon name={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"} className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <motion.tr
                  key={item.Id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.brand} • {item.styleCode}</div>
                      <Badge variant="default" size="sm" className="mt-1">{item.category}</Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Badge 
                        variant={item.daysSinceLastSold > 60 ? "error" : item.daysSinceLastSold > 30 ? "warning" : "success"}
                        size="sm"
                      >
                        {item.daysSinceLastSold > 999 ? "Never" : `${item.daysSinceLastSold} days`}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.salesVelocity}/day</div>
                    <div className="text-xs text-gray-500">{item.totalSoldRecently} sold (30d)</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.totalStock} units</div>
                    <div className="text-xs text-gray-500">Reorder at {item.reorderPoint}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${item.stockValue.toLocaleString()}</div>
                    {item.potentialLoss > 0 && (
                      <div className="text-xs text-error">Risk: ${item.potentialLoss.toLocaleString()}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            item.performanceScore >= 70 ? 'bg-success' :
                            item.performanceScore >= 40 ? 'bg-warning' : 'bg-error'
                          }`}
                          style={{ width: `${item.performanceScore}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900">{item.performanceScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleReorder(item)}
                    >
                      Reorder
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleViewDetails(item)}
                    >
                      Details
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="p-8 text-center">
            <ApperIcon name="Package" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No slow-moving items found matching your criteria.</p>
          </div>
)}
      </Card>
    </div>
  );
};

export default Reports;