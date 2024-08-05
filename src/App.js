import logo from "./logo.svg";
import "./App.css";
import Navigation from "./customer/components/Navbar/Navigation";
import HomePage from "./customer/Pages/HomePage";
import { Height } from "@mui/icons-material";
import Footer from "./customer/components/Footer/Footer";
import ProductDetail from "./customer/Pages/ProductDetail";
import Cart from "./customer/components/Cart/Cart";
import Checkout from "./customer/components/Checkout/Checkout";
import Order from "./customer/components/Order/Order";
import { Navigate, Route, Routes } from "react-router-dom";
import CustomerRouters from "./Routers/CustomerRouters";
import AdminPannel from "./Admin/AdminPannel";
import { getUser, logout } from "../src/State/Auth/Action";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import AdminRoutes from "./Routers/AdminRoutes";
import { messaging } from "./firebase";
import { getToken } from "firebase/messaging";
import { Analytics } from "@vercel/analytics/react";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

const requestPermission = async (userId) => {
  if (!userId) {
    console.log("User not logged in. Skipping notification permission request.");
    return;
  }

  var token = "";
  
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    // Generate Token
    token = await getToken(messaging, {
      vapidKey: 'BBtiyt1cTyjluSNQYD35ymJKBXH0sWW-iVwMZ8Gafm-b1D94qyJvi6YgOEsNhBbdRll-aac7Fkg8xA-YJMUpnpw',
    });
    console.log('Token Gen', token);
  } else if (permission === 'denied') {
    alert('You denied the notification');
    return;
  }

  const response = await fetch('http://localhost:4000/api/v1/amrti/users/updateWebToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: userId,
      webToken: token
    })
  });
  console.log(response);
};

function App() {
  const { auth, cart } = useSelector((store) => store);
  const token = getCookie("jwtToken");
  const [user, setUser] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(
          "http://localhost:4000/api/v1/amrti/users/role",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        console.log(result);
        setUser(result.role);
        setUserId(result.userId); // Assuming the API returns a userId
        
        // Call requestPermission only if userId is available
        if (result.userId) {
          requestPermission(result.userId);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    }
    fetchUser();
  }, []);

  const getRoutes = () => {
    console.log(user);

    if (user === "admin") {
      console.log("Hi");
      return <AdminRoutes />;
    } else {
      return <CustomerRouters />;
    }
  };

  return (
    <div>
      <Analytics></Analytics>
      <Routes>
        <Route path="/*" element={getRoutes()} />
      </Routes>
    </div>
  );
}

export default App;