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

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};
async function requestPermission() {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    // Generate Token
    const token = await getToken(messaging, {
      vapidKey:
        "BBtiyt1cTyjluSNQYD35ymJKBXH0sWW-iVwMZ8Gafm-b1D94qyJvi6YgOEsNhBbdRll-aac7Fkg8xA-YJMUpnpw",
    });
    console.log("Token Gen", token);
    // Send this token  to server ( db)
  } else if (permission === "denied") {
    alert("You denied for the notification");
  }
}

function App() {
  const { auth, cart } = useSelector((store) => store);
  // const dispatch = useDispatch();
  // const jwt = localStorage.getItem("jwt");
  const token = getCookie("jwtToken");
  const [user, setUser] = useState("");
  useEffect(() => {
    //   if (jwt) {
    //     dispatch(getUser(jwt));
    //   }
    // }, [])
    async function fetchUser() {
      try {
        const response = await fetch(
          "https://amrti-main-backend.vercel.app/api/v1/amrti/users/role",
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
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    }
    fetchUser();
    // requestPermission()
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
      <Routes>
        <Route path="/*" element={getRoutes()} />

        {/* <Route path="/admin/*" element={<AdminPannel />}></Route> */}
      </Routes>
    </div>
  );
}

export default App;