import React from 'react';
import { useLocation } from 'react-router-dom';

const RecipeDetailPage = ({ recipe }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isRecipesActive = currentPath.includes('/product/turmeric/recipes') || 
                          currentPath.includes('/products/turmeric/recipes');

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-1 p-4 pb-16 overflow-y-auto">
        <h1 className=" mt-16 text-2xl font-bold mb-4">{recipe.title}</h1>
        
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        
        <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
        <ul className="list-disc pl-5 mb-4">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
        
        <h2 className="text-xl font-semibold mb-2">Instructions</h2>
        <ol className="list-decimal pl-5 mb-4">
          {recipe.instructions.map((step, index) => (
            <li key={index} className="mb-2">{step}</li>
          ))}
        </ol>
      </div>
      
      <div className="flex fixed bottom-0 w-full justify-around py-2 bg-white border-t border-gray-200">
        {[
          {icon: <img src='https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/kindness.png' alt='' className="w-5 h-5" />, label: 'Benefits', path:'/product/moringa/101' },
          { icon: <img src='https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/cookbook.png' alt='' className="w-5 h-5" />, label: 'Recipes', path:'/product/moringa/recipes' },
          { icon: <img src='https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/traceability.png' alt='' className="w-5 h-5" />, label: 'Traceability', path:'/product/moringa/farmer-details' },
          { icon: <img src='https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/Quality.png' alt='' className="w-5 h-5" />, label: 'Quality', path:'/product/moringa/product-report' },
        ].map(({ icon, label, path }) => (
          <div 
            key={label} 
            className={`flex flex-col items-center justify-center p-2 rounded-md cursor-pointer ${
              (path === currentPath || (label === 'Recipes' && isRecipesActive)) 
              ? 'bg-green-100' 
              : 'bg-white'
            }`}
          >
            <a href={path}>{icon}</a>
            <span className="text-[10px] mt-0.5 text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeDetailPage;