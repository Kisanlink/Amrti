import React from 'react';
import { useLocation } from 'react-router-dom';
import { Download } from 'lucide-react';

const TurmericReportViewer = ({ driveLink }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const getEmbedUrl = (url) => {
    const fileId = url.match(/[-\w]{25,}/);
    return fileId 
      ? `https://drive.google.com/file/d/${fileId[0]}/preview`
      : '';
  };

  const getDownloadUrl = (url) => {
    const fileId = url.match(/[-\w]{25,}/);
    return fileId 
      ? `https://drive.google.com/uc?export=download&id=${fileId[0]}`
      : '';
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 ">
      <div className="flex-1 mt-16">
        <iframe
          src={getEmbedUrl(driveLink)}
          className="w-full h-full border-none"
          title="PDF Viewer"
          allowFullScreen
        />
      </div>
      <div className="mt-8 mb-2 px-4">
        <a
          href={getDownloadUrl(driveLink)}
          download
          className="block w-full text-center bg-green-400 text-black py-2 px-4 rounded hover:bg-green-500 transition-colors duration-200"
        >
          <Download className="w-5 h-5 inline-block mr-2" />
          Download
        </a>
      </div>
      <div className="flex fixed bottom-0 left-0 right-0 justify-around py-2 bg-white border-t border-gray-200">
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

export default TurmericReportViewer;