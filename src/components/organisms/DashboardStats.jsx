import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MetricCard from "@/components/molecules/MetricCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { DashboardService } from "@/services/api/dashboardService";

const DashboardStats = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await DashboardService.getStats();
      setStats(data);
    } catch (err) {
      setError("Failed to load dashboard statistics");
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading rows={2} />;
  if (error) return <Error message={error} onRetry={loadStats} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <MetricCard
          title="Today's Sales"
          value={`$${stats.todaySales?.toFixed(2) || "0.00"}`}
          change={`+${stats.salesGrowth || 0}%`}
          changeType="positive"
          icon="DollarSign"
          gradient="bg-gradient-to-br from-success to-green-600"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <MetricCard
          title="Total Inventory"
          value={stats.totalInventory?.toLocaleString() || "0"}
          change={`${stats.inventoryChange || 0} units`}
          changeType={stats.inventoryChange >= 0 ? "positive" : "negative"}
          icon="Package"
          gradient="bg-gradient-to-br from-secondary to-blue-600"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <MetricCard
          title="Low Stock Items"
          value={stats.lowStockItems?.toString() || "0"}
          change={stats.lowStockChange > 0 ? `+${stats.lowStockChange}` : stats.lowStockChange?.toString() || "0"}
          changeType={stats.lowStockChange <= 0 ? "positive" : "negative"}
          icon="AlertTriangle"
          gradient="bg-gradient-to-br from-warning to-orange-600"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <MetricCard
          title="This Month"
          value={`$${stats.monthlyRevenue?.toFixed(2) || "0.00"}`}
          change={`+${stats.monthlyGrowth || 0}%`}
          changeType="positive"
          icon="TrendingUp"
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </motion.div>
    </div>
  );
};

export default DashboardStats;