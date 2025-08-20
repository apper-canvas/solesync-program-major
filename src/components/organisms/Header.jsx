import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Header = ({ onMenuClick, title = "Dashboard" }) => {
  const [notifications] = useState(3);

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="lg:ml-64 bg-white border-b border-gray-200 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            icon="Menu"
            onClick={onMenuClick}
            className="lg:hidden mr-3"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString("en-US", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="secondary" size="sm" icon="Plus">
              Quick Add
            </Button>
            <Button variant="secondary" size="sm" icon="ScanLine">
              Scan
            </Button>
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="sm" icon="Bell" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-error to-red-600 text-white text-xs rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </div>

          {/* User */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">Store Manager</p>
              <p className="text-xs text-gray-500">Main Store</p>
            </div>
            <div className="h-8 w-8 bg-gradient-to-br from-secondary to-blue-600 rounded-full flex items-center justify-center">
              <ApperIcon name="User" className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;