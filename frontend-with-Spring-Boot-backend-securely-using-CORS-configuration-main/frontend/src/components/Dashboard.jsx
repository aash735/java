import { useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";
import ProductManager from "./ProductManager";
import UserManager from "./UserManager";

function Dashboard() {
  const { user, role, logout } = useAuth();
  const isAdmin = role === "ADMIN";
  const [activeTab, setActiveTab] = useState("products");

  const tabs = useMemo(() => {
    const baseTabs = [{ key: "products", label: "Products" }];

    if (isAdmin) {
      baseTabs.push({ key: "users", label: "Users" });
    }

    return baseTabs;
  }, [isAdmin]);

  return (
    <div className="page-shell">
      <header className="topbar card">
        <div>
          <h1>Dashboard</h1>
          <p>
            Signed in as <strong>{user?.email || "Unknown user"}</strong> ({role || "USER"})
          </p>
        </div>
        <button className="ghost" onClick={logout}>Logout</button>
      </header>

      <section className="tab-row">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "tab active" : "tab"}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </section>

      <main className="tab-content">
        {activeTab === "products" ? <ProductManager isAdmin={isAdmin} /> : <UserManager isAdmin={isAdmin} />}
      </main>
    </div>
  );
}

export default Dashboard;


