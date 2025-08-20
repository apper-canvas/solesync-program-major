import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    storeName: "Main Store Location",
    storeAddress: "123 Main Street, City, State 12345",
    currency: "USD",
    taxRate: "8.25",
    autoSync: true,
    lowStockThreshold: "10",
    emailNotifications: true,
    smsAlerts: false,
    darkMode: false
  });

  const tabs = [
    { id: "general", label: "General", icon: "Settings" },
    { id: "inventory", label: "Inventory", icon: "Package" },
    { id: "pos", label: "Point of Sale", icon: "ShoppingCart" },
    { id: "sync", label: "Synchronization", icon: "RefreshCw" },
    { id: "notifications", label: "Notifications", icon: "Bell" },
    { id: "users", label: "Users & Access", icon: "Users" }
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    toast.success("Settings saved successfully!");
  };

  const resetSettings = () => {
    setSettings({
      storeName: "Main Store Location",
      storeAddress: "123 Main Street, City, State 12345",
      currency: "USD",
      taxRate: "8.25",
      autoSync: true,
      lowStockThreshold: "10",
      emailNotifications: true,
      smsAlerts: false,
      darkMode: false
    });
    toast.info("Settings reset to defaults");
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
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your SoleSync Pro preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" onClick={resetSettings} icon="RotateCcw">
            Reset
          </Button>
          <Button onClick={saveSettings} icon="Save">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Navigation */}
      <Card className="p-1">
        <div className="flex flex-wrap gap-1">
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

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Store Information</h2>
            <div className="space-y-4">
              <Input
                label="Store Name"
                value={settings.storeName}
                onChange={(e) => handleSettingChange("storeName", e.target.value)}
                placeholder="Enter store name"
              />
              <Input
                label="Store Address"
                value={settings.storeAddress}
                onChange={(e) => handleSettingChange("storeAddress", e.target.value)}
                placeholder="Enter store address"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select 
                    value={settings.currency}
                    onChange={(e) => handleSettingChange("currency", e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>
                <Input
                  label="Tax Rate (%)"
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => handleSettingChange("taxRate", e.target.value)}
                  placeholder="8.25"
                  step="0.01"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">System Preferences</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Dark Mode</h3>
                  <p className="text-sm text-gray-500">Switch to dark theme</p>
                </div>
                <button
                  onClick={() => handleSettingChange("darkMode", !settings.darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.darkMode ? "bg-secondary" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.darkMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Auto Backup</h3>
                  <p className="text-sm text-gray-500">Automatic data backup</p>
                </div>
                <Badge variant="success" size="sm">Enabled</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Offline Mode</h3>
                  <p className="text-sm text-gray-500">Work without internet connection</p>
                </div>
                <Badge variant="info" size="sm">Available</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Inventory Settings */}
      {activeTab === "inventory" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Stock Management</h2>
            <div className="space-y-4">
              <Input
                label="Low Stock Threshold"
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => handleSettingChange("lowStockThreshold", e.target.value)}
                placeholder="10"
                min="0"
              />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Auto Reorder</h3>
                  <p className="text-sm text-gray-500">Generate POs automatically</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-secondary`}
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Barcode Scanning</h3>
                  <p className="text-sm text-gray-500">Enable camera scanning</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-secondary`}
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Categories</h2>
            <div className="space-y-3">
              {["Sneakers", "Running", "Basketball", "Casual", "Boots", "Sandals"].map((category, index) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <ApperIcon name="Package" className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="font-medium text-gray-900">{category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default" size="sm">
                      {Math.floor(Math.random() * 50) + 10} items
                    </Badge>
                    <Button variant="ghost" size="sm" icon="Edit" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* POS Settings */}
      {activeTab === "pos" && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Point of Sale Configuration</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Payment Methods</h3>
              {["Cash", "Credit Card", "Debit Card", "Mobile Payment", "Store Credit"].map((method) => (
                <div key={method} className="flex items-center justify-between">
                  <span className="text-sm text-gray-900">{method}</span>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-secondary">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Receipt Settings</h3>
              <Input
                label="Receipt Header"
                value="Thank you for shopping with us!"
                placeholder="Enter receipt header"
              />
              <Input
                label="Receipt Footer"
                value="Visit us again soon!"
                placeholder="Enter receipt footer"
              />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Print Receipts</h4>
                  <p className="text-sm text-gray-500">Automatically print receipts</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-secondary">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Other tabs placeholder */}
      {!["general", "inventory", "pos"].includes(activeTab) && (
        <Card className="p-12 text-center">
          <ApperIcon name="Settings" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {tabs.find(t => t.id === activeTab)?.label} Settings
          </h3>
          <p className="text-gray-500">
            This settings section is currently under development and will be available in the next update.
          </p>
        </Card>
      )}
    </motion.div>
  );
};

export default Settings;