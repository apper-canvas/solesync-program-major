import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";

const StatusIndicator = ({ status, showIcon = true }) => {
  const statusConfig = {
    online: {
      variant: "success",
      icon: "Wifi",
      text: "Online"
    },
    offline: {
      variant: "error", 
      icon: "WifiOff",
      text: "Offline"
    },
    syncing: {
      variant: "warning",
      icon: "RefreshCw",
      text: "Syncing"
    },
    synced: {
      variant: "success",
      icon: "Check",
      text: "Synced"
    }
  };

  const config = statusConfig[status] || statusConfig.offline;

  return (
    <Badge variant={config.variant} className="flex items-center">
      {showIcon && (
        <ApperIcon 
          name={config.icon} 
          className={`h-3 w-3 mr-1 ${status === "syncing" ? "animate-spin" : ""}`} 
        />
      )}
      {config.text}
    </Badge>
  );
};

export default StatusIndicator;