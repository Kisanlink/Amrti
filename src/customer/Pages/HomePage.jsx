import React from 'react'
import  MainCarousel  from '../components/Carousel/MainCarousel'
import Testimonial from '../components/Testimonial/Testimonial'
import Checkout from '../components/Checkout/Checkout'
import { Values } from '../components/values/values'
import { Mission } from '../components/mission/mission'
import { Vision } from '../components/vision/vision'
import ProductCarousel from './ProductCarousel'
// import { Process } from '../components/vision/Process'
import './Home.css'
import Story from '../components/vision/Storyy'
import Compare from './Compare'
import Report from './Report'


const HomePage = () => {
  const slides = ["https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/web-banner-new-amrti.jpg","https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/web-banner-new-amrti-2.jpg","https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/web-banner-new-amrti-1.jpg"];
  return (
    <div className="overflow-hidden mt-16" >
      <MainCarousel autoSlide={true}>
        {[...slides.map((s) => <img className='w-[1560px] h-[680px]' src={s} key={s} />)]}
      </MainCarousel>

      {/* <MainCarousel className="car" /> */}
      <div style={{ background: "white", margin: "0", padding: "0" }}>
      
        <Mission />
        <Vision />
      </div>

      <div class="contain" style={{ margin: "0" }}>
        <svg viewBox="0 0 500 500" preserveAspectRatio="xMinYMin meet">
          <path
            d="M20,0 C150,0 350,100 500,0 L500,00 L0,0 Z"
            style={{ stroke: "none", fill: "white" }}
          ></path>
        </svg>
      </div>
      <div style={{ background: "#f9f1e1", margin: "0", padding: "0" }}>
        <Values />
      </div>

      <div class="contain" style={{ margin: "0", background: "white" }}>
        <svg viewBox="0 0 500 500" preserveAspectRatio="xMinYMin meet">
          <path
            d="M20,0 C150,0 350,100 500,0 L500,00 L0,0 Z"
            style={{ stroke: "none", fill: "#f9f1e1" }}
          ></path>
        </svg>
      </div>
      <div style={{ background: "white", margin: "0", padding: "0" }}>
        <Story />
      </div>
      {/* <div class="contain" style={{ margin: "0" }}>
        <svg viewBox="0 0 500 500" preserveAspectRatio="xMinYMin meet">
          <path
            d="M20,0 C150,0 350,100 500,0 L500,00 L0,0 Z"
            style={{ stroke: "none", fill: "white" }}
          ></path>
        </svg>
      </div> */}
      {/* <div style={{ background: "#f9f1e1", margin: "0", padding: "0" }}>
        <Process />
      </div> */}

      {/* <div class="contain" style={{ margin: "0", background: "white" }}>
        <svg viewBox="0 0 500 500" preserveAspectRatio="xMinYMin meet">
          <path
            d="M20,0 C150,0 350,100 500,0 L500,00 L0,0 Z"
            style={{ stroke: "none", fill: "#f9f1e1" }}
          ></path>
        </svg>
      </div> */}
      <div className=" pt-6 bg-white">
        <ProductCarousel />
        <Testimonial />
        
        <div style={{ height: "100px" }}></div>
      </div>
    </div>
  );
}

export default HomePage
