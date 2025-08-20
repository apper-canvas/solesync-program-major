import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Chart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import DashboardStats from "@/components/organisms/DashboardStats";
import ApperIcon from "@/components/ApperIcon";
import { DashboardService } from "@/services/api/dashboardService";

const Dashboard = () => {
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartPeriod, setChartPeriod] = useState("week");

  useEffect(() => {
    loadDashboardData();
  }, [chartPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const [chart, products, activity] = await Promise.all([
        DashboardService.getSalesChart(chartPeriod),
        DashboardService.getTopProducts(5),
        DashboardService.getRecentActivity(6)
      ]);
      
      setChartData(chart);
      setTopProducts(products);
      setRecentActivity(activity);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    chart: {
      type: "area",
      height: 350,
      toolbar: { show: false },
      sparkline: { enabled: false }
    },
    colors: ["#4A90E2", "#00D084"],
    dataLabels: { enabled: false },
    stroke: { 
      curve: "smooth",
      width: 3
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        opacityFrom: 0.7,
        opacityTo: 0.3
      }
    },
    xaxis: {
      categories: chartData.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric" 
        });
      }),
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        formatter: (value) => `$${value}`
      }
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 5
    },
    tooltip: {
      y: {
        formatter: (value) => `$${value.toFixed(2)}`
      }
    },
    legend: {
      position: "top",
      horizontalAlign: "right"
    }
  };

  const chartSeries = [
    {
      name: "Sales",
      data: chartData.map(d => d.sales)
    },
    {
      name: "Orders",
      data: chartData.map(d => d.orders * 10) // Scale for visualization
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case "sale": return "ShoppingCart";
      case "stock_update": return "Package";
      case "low_stock": return "AlertTriangle";
      default: return "Activity";
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "sale": return "text-success";
      case "stock_update": return "text-secondary";
      case "low_stock": return "text-warning";
      default: return "text-gray-500";
    }
  };

  if (loading) return <Loading rows={8} />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <DashboardStats />

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Sales Overview</h2>
                <p className="text-sm text-gray-500">Revenue and orders over time</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={chartPeriod === "week" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setChartPeriod("week")}
                >
                  Week
                </Button>
                <Button
                  variant={chartPeriod === "month" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setChartPeriod("month")}
                >
                  Month
                </Button>
              </div>
            </div>
            
            {chartData.length > 0 && (
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="area"
                height={350}
              />
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <Button variant="ghost" size="sm" icon="RefreshCw">
                Refresh
              </Button>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.Id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50"
                >
                  <div className={`p-2 rounded-lg bg-gray-100 ${getActivityColor(activity.type)}`}>
                    <ApperIcon 
                      name={getActivityIcon(activity.type)} 
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                    {activity.amount && (
                      <p className="text-xs text-success font-medium">
                        ${activity.amount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Top Products */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Top Selling Products</h2>
            <p className="text-sm text-gray-500">Best performing items this month</p>
          </div>
          <Button variant="secondary" size="sm" icon="TrendingUp">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {topProducts.map((product, index) => (
            <motion.div
              key={product.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-secondary to-blue-600 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Package" className="h-5 w-5 text-white" />
                </div>
                <Badge variant="success" size="sm">
                  #{index + 1}
                </Badge>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm truncate mb-1">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{product.unitsSold} sold</span>
                  <span className="font-medium text-success">
                    ${product.revenue.toFixed(0)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;