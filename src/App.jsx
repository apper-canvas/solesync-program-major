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
import Reports from "@/components/pages/Reports";
import Sync from "@/components/pages/Sync";
import Settings from "@/components/pages/Settings";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case "/": return "Dashboard";
      case "/inventory": return "Inventory Management";
      case "/pos": return "Point of Sale";
      case "/receiving": return "Receiving & Stock";
      case "/reports": return "Reports & Analytics";
      case "/sync": return "Sync Management";
      case "/settings": return "Settings";
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
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/sync" element={<Sync />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </main>
              </>
            } />
          </Routes>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </BrowserRouter>
  );
}

export default App;