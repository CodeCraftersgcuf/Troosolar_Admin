import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import './App.css'
import Layout from './layout/Layout';
import Dashboard from "./pages/dashboard/Dashboard";
import User_mgt from "./pages/user_mgt/User_mgt";
import UserActivity from "./pages/user_mgt/UserActivity";
import UserLoans from "./pages/user_mgt/UserLoans";
import UserTransactions from "./pages/user_mgt/UserTransactions";
import UserOrders from "./pages/user_mgt/UserOrders";
import Credit_score from "./pages/credit_score/Credit_score";
import Loans_mgt from "./pages/loans_mgt/Loans_mgt";
import Loans_disbursement from "./pages/loans_disbursement/Loans_disbursement";
import Transactions from "./pages/transactions/Transactions";
import Balances from "./pages/balances/Balances";
import Shop_mgt from "./pages/shop_mgt/Shop_mgt";
import Referral_mgt from "./pages/referral_mgt/Referral_mgt";
import Analytics from "./pages/analytics/Analytics.tsx";
import Settings from "./pages/settings/Settings";
import Login from "./pages/auth/Login.tsx";
import Cookies from "js-cookie";
import Tickets from "./pages/tickets/Tickets.tsx";
import User_approval from "./pages/loans_approval/User_approval.tsx";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = Cookies.get("token");
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL || "/"}>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          {/* Index route for Dashboard */}
          <Route index element={<Dashboard />} />
          {/* All other routes */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="user-mgt" element={<User_mgt />} />
          <Route path="credit-score" element={<Credit_score />} />
          <Route path="loans-mgt" element={<Loans_mgt />} />
          <Route path="loans-approval" element={<User_approval />} />
          <Route path="loans-disbursement" element={<Loans_disbursement />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="balances" element={<Balances />} />
          <Route path="shop-mgt" element={<Shop_mgt />} />
          <Route path="referral-mgt" element={<Referral_mgt />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="user-activity/:id" element={<UserActivity />} />
          {/* Route for all users' loans view */}
          <Route path="user-activity/:id/loans" element={<UserLoans />} />
          {/* Route for user transactions */}
          <Route path="user-activity/:id/transactions" element={<UserTransactions />} />
          {/* Route for user orders */}
          <Route path="user-activity/:id/orders" element={<UserOrders />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
