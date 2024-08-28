import React from 'react';
// import { Coffee, Book, GitBranch, Award } from 'lucide-react';
import { Video, Leaf, BookOpen, Map, Award } from 'lucide-react';
import { useLocation } from 'react-router-dom';


const TurmericRecipeCategories = () => {
  const categories = [
    { title: 'Easy to make Recepies', image: 'https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/tea-Turmeric-scaled.jpg', url:"/product/Turmeric/recipes/easy-to-use" },
    { title: 'Beverages', image: 'https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/Turmeric-smoothie-scaled.jpg', url:"/product/Turmeric/recipes/beverage" },
    { title: 'Desserts', image: 'https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/Turmeric-dessert-scaled.jpg',url:"/product/Turmeric/recipes/smoothie" },
    { title: 'Food Recepies', image: 'https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/dosa-Turmeric-1-scaled.jpg',url:"/product/Turmeric/recipes/food" },
  ];
  const location = useLocation();
  const currentPath = location.pathname;
 
  // const bottomIcons = [
  //   { Icon: Coffee, label: 'Benefits' },
  //   { Icon: Book, label: 'Recepies' },
  //   { Icon: GitBranch, label: 'Traceability' },
  //   { Icon: Award, label: 'Quality' },
  // ];

  return (
    <div className="flex flex-col h-auto w-auto mt-16 bg-gray-100">
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category, index) => (
          <div key={index} className="flex flex-col">
            <div className="bg-gray-300 aspect-video mb-2 flex items-center justify-center text-gray-600">
              <a href={category.url}><img src={category.image} alt="" /></a>
            </div>
            <div className="bg-orange-200 p-2 h-auto text-center text-sm">
              {category.title}
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="h-60">

    </div>
    {/* <div className="flex fixed bottom-0 w-full justify-around items-center bg-white p-4 border-t border-gray-200">
      {bottomIcons.map(({ Icon, label }, index) => (
        <div key={index} className="flex flex-col items-center">
          <Icon className="w-6 h-6 mb-1" />
          <span className="text-xs">{label}</span>
        </div>
      ))}
    </div> */}
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

export default TurmericRecipeCategories;