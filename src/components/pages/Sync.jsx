import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import StatusIndicator from "@/components/molecules/StatusIndicator";

const Sync = () => {
  const [syncStatus, setSyncStatus] = useState("synced");
  const [lastSync, setLastSync] = useState(new Date());
  const [syncProgress, setSyncProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("online");

  const syncChannels = [
    {
      id: "inventory",
      name: "Inventory Data",
      description: "Product catalog, stock levels, and pricing",
      status: "synced",
      lastSync: "2 minutes ago",
      icon: "Package"
    },
    {
      id: "orders",
      name: "Order Management",
      description: "Sales transactions and customer orders",
      status: "synced",
      lastSync: "5 minutes ago",
      icon: "ShoppingCart"
    },
    {
      id: "marketplace",
      name: "Online Marketplace",
      description: "E-commerce platform synchronization",
      status: "syncing",
      lastSync: "In progress",
      icon: "Globe"
    },
    {
      id: "accounting",
      name: "Financial Data",
      description: "Sales reports and tax information",
      status: "error",
      lastSync: "2 hours ago",
      icon: "Calculator"
    }
  ];

  const performFullSync = async () => {
    setSyncStatus("syncing");
    setSyncProgress(0);
    
    // Simulate sync progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setSyncProgress(i);
    }
    
    setSyncStatus("synced");
    setLastSync(new Date());
    setSyncProgress(0);
    toast.success("Full synchronization completed successfully!");
  };

  const syncChannel = async (channelId) => {
    toast.success(`${channelId} synchronization started`);
    // Simulate channel sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success(`${channelId} synchronization completed`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sync Management</h1>
          <p className="text-gray-600">Manage data synchronization across all channels</p>
        </div>
        <div className="flex items-center space-x-3">
          <StatusIndicator status={connectionStatus} />
          <Button 
            onClick={performFullSync}
            disabled={syncStatus === "syncing"}
            loading={syncStatus === "syncing"}
            icon="RefreshCw"
          >
            Full Sync
          </Button>
        </div>
      </div>

      {/* Sync Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-success to-green-600 rounded-xl">
              <ApperIcon name="CheckCircle" className="h-6 w-6 text-white" />
            </div>
            <StatusIndicator status={syncStatus} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">4/5</p>
            <p className="text-sm text-gray-600">Channels Synced</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-secondary to-blue-600 rounded-xl">
              <ApperIcon name="Clock" className="h-6 w-6 text-white" />
            </div>
            <Badge variant="info" size="sm">Auto</Badge>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">15m</p>
            <p className="text-sm text-gray-600">Sync Interval</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-warning to-orange-600 rounded-xl">
              <ApperIcon name="Activity" className="h-6 w-6 text-white" />
            </div>
            <Badge variant="success" size="sm">
              {connectionStatus === "online" ? "Online" : "Offline"}
            </Badge>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-sm text-gray-600">Last Sync</p>
          </div>
        </Card>
      </div>

      {/* Sync Progress */}
      {syncStatus === "syncing" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Synchronization in Progress</h2>
              <p className="text-sm text-gray-500">Please wait while we sync your data...</p>
            </div>
            <div className="text-2xl font-bold text-secondary">{syncProgress}%</div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-secondary to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${syncProgress}%` }}
            />
          </div>
        </Card>
      )}

      {/* Sync Channels */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sync Channels</h2>
            <p className="text-sm text-gray-500">Monitor and control individual sync channels</p>
          </div>
          <Button variant="secondary" size="sm" icon="Settings">
            Configure
          </Button>
        </div>

        <div className="space-y-4">
          {syncChannels.map((channel, index) => (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <ApperIcon name={channel.icon} className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{channel.name}</h3>
                  <p className="text-sm text-gray-500">{channel.description}</p>
                  <p className="text-xs text-gray-400">Last sync: {channel.lastSync}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <StatusIndicator status={channel.status} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => syncChannel(channel.name)}
                  disabled={channel.status === "syncing"}
                >
                  {channel.status === "syncing" ? (
                    <ApperIcon name="Loader2" className="h-4 w-4 animate-spin" />
                  ) : (
                    <ApperIcon name="RefreshCw" className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" icon="Settings">
                  Config
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Sync History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Recent Sync Activity</h2>
            <p className="text-sm text-gray-500">Historical sync operations and results</p>
          </div>
          <Button variant="secondary" size="sm" icon="History">
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {[
            { time: "2:30 PM", action: "Full sync completed", status: "success", duration: "45s" },
            { time: "2:15 PM", action: "Inventory sync started", status: "info", duration: "12s" },
            { time: "2:00 PM", action: "Marketplace sync failed", status: "error", duration: "3s" },
            { time: "1:45 PM", action: "Orders sync completed", status: "success", duration: "8s" },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === "success" ? "bg-success" :
                  activity.status === "error" ? "bg-error" : "bg-secondary"
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {activity.duration}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default Sync;