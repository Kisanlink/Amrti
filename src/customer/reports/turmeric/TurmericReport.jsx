import React from "react"
import { useLocation } from 'react-router-dom';

import { Video, Leaf, BookOpen, Map, Award } from 'lucide-react';
const TurmericReport=()=>{
    
        
  const location = useLocation();
  const currentPath = location.pathname;
   
      
          return (
            <div className="flex flex-col w-auto h-auto bg-white overflow-hidden">
              {/* Status bar */}
              {/* <div className="flex justify-between items-center px-4 py-1 bg-white text-xs">
                <span>12:30</span>
                <div className="flex space-x-2">
                  <span>📶</span>
                  <span>🔋</span>
                  <span>100%</span>
                </div> */}
              {/* </div> */}
        
              {/* Video placeholder */}
              <div className="bg-gray-200 h-64 mt-16 flex items-center justify-center">
              <iframe
          className="absolute overflow-hidden h-[250px] w-full  "
   src="https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/0814-1.mp4"
          title="Full Screen Video"
         
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
                {/* <span className="text-gray-600 text-sm">Turmeric Video</span> */}
              </div>
        
              {/* Benefits section */}
              <div className="p-3">
                <h2 className="font-bold mb-1 text-sm">Benefits:</h2>
                <ul className="list-disc pl-5 text-xs space-y-1">
                  <li>Rich in antioxidants;</li>
                  <li>Enhances immunity;</li>
                  <li>Aids digestion;</li>
                  <li>Regulates blood sugar; and</li>
                  <li>Manages cholesterol;</li>
                  <li>Facilitates weight loss; and</li>
                  <li>Promotes healthy skin and hair.</li>
                </ul>
              </div>
        
              {/* Order button */}
              <div className="bg-orange-100 p-3 flex justify-between items-center text-sm">
                <span>Other Products - Order now </span>
                <svg
    fill="#000000"
    width="16px"
    height="16px"
    viewBox="0 0 15 15"
    xmlns="http://www.w3.org/2000/svg"
    id="arrow"
    
  >
    <path d="M8.29289 2.29289C8.68342 1.90237 9.31658 1.90237 9.70711 2.29289L14.2071 6.79289C14.5976 7.18342 14.5976 7.81658 14.2071 8.20711L9.70711 12.7071C9.31658 13.0976 8.68342 13.0976 8.29289 12.7071C7.90237 12.3166 7.90237 11.6834 8.29289 11.2929L11 8.5H1.5C0.947715 8.5 0.5 8.05228 0.5 7.5C0.5 6.94772 0.947715 6.5 1.5 6.5H11L8.29289 3.70711C7.90237 3.31658 7.90237 2.68342 8.29289 2.29289Z" />
  </svg>
                <a href="/products"><img src="https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/4@20x.png" alt="Amrit logo" className="bg-white h-12 w-24" />
                </a></div>
        
              {/* Product images */}
              <div className="flex justify-around p-3">
                
              <a href="/product/65cb3d21dcfb76224065c5c8"><img src="https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/spinach-pouch-1.png" alt=""  className="w-20 h-20 object-cover" /></a>
              <a href="/product/65cb4006dcfb76224065c7c4"> <img src="https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/beetroot-pouch-1.png" alt=""  className="w-20 h-20 object-cover" /></a>
              <a href="/product/6694bf76da8c2b2bddf64753">  <img src="https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/amla-JAR-1.png" alt=""  className="w-20 h-20 object-cover" /></a>


              
              </div>
        
              {/* Bottom navigation */}
              
              <div className="flex fixed bottom-0 w-full justify-around py-2 bg-white">
      {[
        {icon: <img src='https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/kindness.png' alt='' className="w-5 h-5" />, label: 'Benefits', path:'/product/turmeric/101' },
        { icon: <img src='https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/cookbook.png' alt='' className="w-5 h-5" />, label: 'Recipes', path:'/product/turmeric/recipes' },
        { icon: <img src='https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/traceability.png' alt='' className="w-5 h-5" />, label: 'Traceability', path:'/product/turmeric/farmer-details' },
        { icon: <img src='https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/Quality.png' alt='' className="w-5 h-5" />, label: 'Quality', path:'/product/turmeric/product-report' },
      ].map(({ icon, label, path }) => (
        <div 
          key={label} 
          className={`flex flex-col items-center justify-center p-2 rounded-md cursor-pointer ${path === currentPath ? 'bg-green-100' : 'bg-white'}`}
        >
          <a href={path}>{icon}</a>
          <span className="text-[10px] mt-0.5 text-gray-600">{label}</span>
        </div>
      ))}
    </div>
            </div>
          );
        };
        

export default TurmericReport