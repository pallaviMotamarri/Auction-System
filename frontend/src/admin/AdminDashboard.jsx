import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Gavel,
  Crown,
  CreditCard,
  Menu,
  ChevronLeft,
} from "lucide-react";

import AdminHandleUsers from "./AdminHandleUsers";
import AdminHandleAuctions from "./AdminHandleAuctions";
import AdminHandleCrownScore from "./AdminHandleCrownScore";
import AdminPaymentDetails from "./AdminPaymentDetails";

import "./admin.css";

const menuItems = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { key: "users", label: "Handle Users", icon: <Users size={20} /> },
  { key: "auctions", label: "Handle Auctions", icon: <Gavel size={20} /> },
  { key: "crown", label: "Handle Crown Score", icon: <Crown size={20} /> },
  { key: "payment", label: "Payment Details", icon: <CreditCard size={20} /> },
];

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("dashboard");

  return (
    <div className={`admin-dashboard ${collapsed ? "collapsed" : ""}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <Menu size={20} /> : 
              <span>
                🧑‍💼 Auction Admin
                <ChevronLeft size={20} />
              </span>
            }
          </button>
        </div>

        <nav>
          <ul>
            {menuItems.map((item) => (
              <li
                key={item.key}
                className={active === item.key ? "active" : ""}
                onClick={() => setActive(item.key)}
                style={{ flexDirection: "column", alignItems: "center", justifyContent: "center" }}
              >
                <span className="icon">{item.icon}</span>
                {!collapsed && <span className="label">{item.label}</span>}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {active === "dashboard" && <h2>📊 Welcome to Admin Dashboard</h2>}
        {active === "users" && <AdminHandleUsers />}
        {active === "auctions" && <AdminHandleAuctions />}
        {active === "crown" && <AdminHandleCrownScore />}
        {active === "payment" && <AdminPaymentDetails />}
      </main>
    </div>
  );
};

export default AdminDashboard;
