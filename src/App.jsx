import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Sidebar from "@/components/organisms/Sidebar";
import Header from "@/components/organisms/Header";

// Pages
import Dashboard from "@/components/pages/Dashboard";
import Inventory from "@/components/pages/Inventory";
import POS from "@/components/pages/POS";
import Receiving from "@/components/pages/Receiving";
import Fulfillment from "@/components/pages/Fulfillment";
import Reports from "@/components/pages/Reports";
import Sync from "@/components/pages/Sync";
import Settings from "@/components/pages/Settings";
import SupplierPortal from "@/components/pages/SupplierPortal";
import CustomerPortal from "@/components/pages/CustomerPortal";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

const getPageTitle = (pathname) => {
    switch (pathname) {
      case "/": return "Dashboard";
      case "/inventory": return "Inventory Management";
      case "/pos": return "Point of Sale";
      case "/receiving": return "Receiving & Stock";
      case "/fulfillment": return "Fulfillment Command Center";
      case "/reports": return "Reports & Analytics";
      case "/sync": return "Sync Management";
      case "/settings": return "Settings";
      case "/suppliers": return "Supplier Portal";
      case "/customers": return "Customer Portal";
      default: return "SoleSync Pro";
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        <div className="lg:ml-64">
          <Routes>
            <Route path="*" element={
              <>
                <Header 
                  onMenuClick={() => setSidebarOpen(true)}
                  title={getPageTitle(window.location.pathname)}
                />
                <main className="p-6">
<Routes>
<Route path="/" element={<Dashboard />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/pos" element={<POS />} />
                    <Route path="/receiving" element={<Receiving />} />
                    <Route path="/fulfillment" element={<Fulfillment />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/sync" element={<Sync />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/suppliers" element={<SupplierPortal />} />
                    <Route path="/customers" element={<CustomerPortal />} />
                  </Routes>
                </main>
              </>
            } />
          </Routes>
        </div>

<ToastContainer
          position="top-center"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 99999 }}
          toastClassName="!relative !transform-none !top-0 !left-0 !right-0 !bottom-auto !w-auto !max-w-md !mx-auto !mt-4"
          bodyClassName="!text-sm !font-medium"
          progressClassName="!bg-white/30"
        />
      </div>
    </BrowserRouter>
  );
}

export default App;