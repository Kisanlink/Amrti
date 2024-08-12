import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "../customer/Pages/HomePage";
import Cart from "../customer/components/Cart/Cart";
import Navigation from "../customer/components/Navbar/Navigation";
import Delivery from "../customer/components/Delivery/Delivery";

import ProductDetail from "../customer/Pages/ProductDetail";
import Order from "../customer/components/Order/Order";
import Footer from "../customer/components/Footer/Footer";
import Checkout from "../customer/components/Checkout/Checkout";
import { About } from "../customer/Pages/About";
import  Product  from "../customer/Pages/Products";

import { Faq } from "../customer/Pages/FAQ";
import TnC from "../customer/Pages/TnC";
import Privacy from "../customer/Pages/Privacy";
import AdminPannel from "../Admin/AdminPannel";
import { Recipes } from "../customer/Pages/Recipes";
import SeasameNoodle from "../customer/Pages/SeasameNoodle";
import AchaariPaneerTikka from "../customer/Pages/AchaariPaneerTikka";
import CrispyVegetableTempura from "../customer/Pages/CrispyVegetableTempura";
import ChickpeaStirFry from "../customer/Pages/ChickpeaStirFry";
import Saag from "../customer/Pages/Saag";
import Salad from "../customer/Pages/Salad";
import Return from "../customer/Pages/Return";
import Shipping from "../customer/Pages/Shipping";
import ReportForm from "../customer/Pages/ReportForm";
import Report from "../customer/Pages/Report";
import MooringaSoothie from "../customer/Pages/mooringaSoothie";
import AmlaPowder from "../customer/Pages/AmlaPowderTea";
import BeetRootPowder from "../customer/Pages/BeetrootPowderLatte";
import SpinachPowder from "../customer/Pages/SpinachPowderOmelette";
import Papayapowder from "../customer/Pages/PapayaPowderOvernightOats";
import Tomato from "../customer/Pages/tomato";
import MoringaReport from "../customer/reports/MoringaReport"
import MoringaRecipeCategories from "../customer/reports/MoringaRecipe";
import MoringaFarmerDetails from "../customer/reports/MoringaTraceability";
import MoringaReportViewer from "../customer/reports/MoringaTest";
import EasyToUse from "../customer/reports/MoringaEasy";
import Beverage from "../customer/reports/MoringaTea";
import Smoothie from "../customer/reports/MoringaSmoothie";
import Food from "../customer/reports/MoringaFood";
import MoringaLemon from "../customer/reports/MoringaLemon"
import MoringaIce from "../customer/reports/MoringaIceTea";
import MoringaNormal from "../customer/reports/MoringaNormalTea";
import MoringaLeafAlmondSmoothie from "../customer/reports/MoringaAlmond";
import MoringaLeafBananaSmoothie from "../customer/reports/MoringaBanana";
import MoringaAvocadoToast from "../customer/reports/MoringaToast";
import MoringaChutneyRice from "../customer/reports/MoringaRice";
import MoringaUttapam from "../customer/reports/MoringaUttapam";
import TurmericReportViewer from "../customer/reports/turmeric/TurmericReportViewer";

import TurmericReport from "../customer/reports/turmeric/TurmericReport";
import TurmericRecipeCategories from "../customer/reports/turmeric/TurmericRecipe";
import TurmericFarmerDetails from "../customer/reports/turmeric/TuremericTraceability";
import PaymentCallback from "../customer/components/Delivery/PaymentCallback";
import Orders from "../customer/Pages/CustomerOrders";

const CustomerRouters = () => {
  return (
    <div>
      <div>
        <Routes>
      <Route path="/product/moringa/101" element={<MoringaReport/>}></Route>
      <Route path="/product/moringa/recipes" element={<MoringaRecipeCategories/>}></Route>
      <Route path="/product/moringa/farmer-details" element={<MoringaFarmerDetails/>}></Route>
      <Route path="/product/moringa/product-report" element={<MoringaReportViewer driveLink={"https://drive.google.com/file/d/1cJZtTmaSuZpT6SLJZC0TL2D0GZet7I2l/view?usp=sharing"}/>}></Route>
      <Route path="/product/moringa/recipes/easy-to-use" element={<EasyToUse/>}></Route>
      <Route path="/product/moringa/recipes/beverage" element={<Beverage/>}></Route>
      <Route path="/product/moringa/recipes/smoothie" element={<Smoothie/>}></Route>
      <Route path="/product/moringa/recipes/food" element={<Food/>}></Route>
      <Route path="/product/moringa/recipes/easy-to-use/moringa-lemon-water" element={<MoringaLemon/>}></Route>
      <Route path="/product/moringa/recipes/easy-to-use/moringa-ice-tea" element={<MoringaIce/>}></Route>
      <Route path="/product/moringa/recipes/easy-to-use/moringa-Normal-tea" element={<MoringaNormal/>}></Route>
      <Route path="/product/moringa/recipes/easy-to-use/moringa-banana-smoothie" element={<MoringaLeafBananaSmoothie/>}></Route>
      <Route path="/product/moringa/recipes/easy-to-use/moringa-almond-smoothie" element={<MoringaLeafAlmondSmoothie/>}></Route>
      <Route path="/product/moringa/recipes/easy-to-use/moringa-uttapam" element={<MoringaUttapam/>}></Route>
      <Route path="/product/moringa/recipes/easy-to-use/moringa-rice" element={<MoringaChutneyRice/>}></Route>
      <Route path="/product/moringa/recipes/easy-to-use/moringa-toast" element={<MoringaAvocadoToast/>}></Route>
      <Route path="/product/turmeric/101" element={<TurmericReport/>}></Route>
      <Route path="/product/turmeric/recipes" element={<TurmericRecipeCategories/>}></Route>
      <Route path="/product/turmeric/farmer-details" element={<TurmericFarmerDetails/>}></Route>
      {/* /* change report link */}
      <Route path="/product/turmeric/product-report" element={<TurmericReportViewer driveLink={"https://drive.google.com/file/d/1cJZtTmaSuZpT6SLJZC0TL2D0GZet7I2l/view?usp=sharing"}/>}></Route> 


      </Routes>
      </div>
      <div className="nav">
        <Navigation />

      </div>
      
      <div>
        <Routes>
          <Route path="/" element={<HomePage />}></Route>
          <Route path="/TnC" element={<TnC />}></Route>
          <Route path="/privacy" element={<Privacy />}></Route>
          <Route path="/about" element={<About />}></Route>
          <Route path="/products" element={<Product/>}></Route>
          <Route path="/login" element={<HomePage />}></Route>
          <Route path="/register" element={<HomePage />}></Route>
          <Route path="/cart" element={<Cart />}></Route>
          <Route path="/delivery" element={<Delivery/>}></Route>
          <Route path="/orders" element={<Orders/>}></Route>
         
        <Route path="/payment-callback" element={<PaymentCallback />} />
          <Route path="/faq" element={<Faq />}></Route>
          <Route path="/product/:productId" element={<ProductDetail />}></Route>
          <Route path="/reports/:reportId" element={<Report />}></Route>
          <Route path="/orders" element={<Order />}></Route>
          <Route path="/recipes" element={<Recipes />}></Route>
          <Route path="/checkout" element={<Checkout />}></Route>
          
          <Route
            path="/recipes/seasmeNoodles"
            element={<SeasameNoodle />}
          ></Route>

           <Route
            path="/recipes/mooringaSoothie"
            element={<MooringaSoothie/>}
          ></Route>

         <Route
            path="/recipes/AmlaPowder"
            element={<AmlaPowder/>}
          ></Route>

          <Route
            path="/recipes/BeetRootPowder"
            element={<BeetRootPowder/>}
          ></Route>

         <Route
            path="/recipes/SpinachPowder"
            element={<SpinachPowder/>}
          ></Route>

          <Route
            path="/recipes/PapayaPowder"
            element={<Papayapowder/>}
          ></Route>
         
         <Route
            path="/recipes/Tomato"
            element={<Tomato />}
          ></Route>


          <Route
            path="/recipes/paneerTikka"
            element={<AchaariPaneerTikka />}
          ></Route>
          <Route
            path="/recipes/tempura"
            element={<CrispyVegetableTempura />}
          ></Route>
          <Route path="/recipes/chickpea" element={<ChickpeaStirFry />}></Route>
          <Route path="/recipes/saag" element={<Saag />}></Route>

          <Route path="/recipes/salad" element={<Salad />}></Route>

          
          <Route path="/return" element={<Return />}></Route>
          <Route path="/shipping" element={<Shipping />}></Route>
          <Route path="/form" element={<ReportForm />}></Route>
        </Routes>
        <div></div>

        <Footer />
      </div>
    </div>
  );
};

export default CustomerRouters;
