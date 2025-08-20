import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import StatusIndicator from "@/components/molecules/StatusIndicator";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

const navigationItems = [
    { path: "/", icon: "Home", label: "Dashboard" },
    { path: "/inventory", icon: "Package", label: "Inventory" },
    { path: "/pos", icon: "ShoppingCart", label: "Point of Sale" },
    { path: "/receiving", icon: "Truck", label: "Receiving" },
    { path: "/fulfillment", icon: "MapPin", label: "Fulfillment" },
    { path: "/suppliers", icon: "Users", label: "Supplier Portal" },
    { path: "/reports", icon: "BarChart3", label: "Reports" },
    { path: "/sync", icon: "RefreshCw", label: "Sync" },
    { path: "/settings", icon: "Settings", label: "Settings" }
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Desktop Sidebar (static)
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-6 py-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-secondary to-blue-600 rounded-xl">
              <ApperIcon name="Zap" className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">SoleSync</h1>
              <p className="text-xs text-gray-500">Pro</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-secondary/10 to-blue-100 text-secondary border-r-2 border-secondary"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <ApperIcon 
                  name={item.icon} 
                  className={`mr-3 h-5 w-5 ${
                    active ? "text-secondary" : "text-gray-400 group-hover:text-gray-600"
                  }`} 
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Status */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <StatusIndicator status="synced" />
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar (overlay)
  const MobileSidebar = () => (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="lg:hidden fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-secondary to-blue-600 rounded-xl">
                  <ApperIcon name="Zap" className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">SoleSync</h1>
                  <p className="text-xs text-gray-500">Pro</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ApperIcon name="X" className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigationItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-secondary/10 to-blue-100 text-secondary border-r-2 border-secondary"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <ApperIcon 
                      name={item.icon} 
                      className={`mr-3 h-5 w-5 ${
                        active ? "text-secondary" : "text-gray-400 group-hover:text-gray-600"
                      }`} 
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Status */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <StatusIndicator status="synced" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;