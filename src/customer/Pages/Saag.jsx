import React from "react";
import sarsonKaSaagImage from "./saag.jpg";

const Saag = () => {
  return (
    <div className="max-w-screen-lg mx-auto" style={{ paddingTop: "45px" }}>
      <h1 className="text-4xl font-bold text-center my-8">Sarson ka Saag</h1>
      <div className="w-full">
        <img
          src={sarsonKaSaagImage}
          alt="Sarson ka Saag"
          className="w-full object-cover h-64 md:h-96"
        />
      </div>
      <div className="px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">Ingredients:</h2>
        <ul className="list-disc list-inside mb-8">
          <li>500 grams mustard greens (sarson), washed and chopped</li>
          <li>250 grams spinach leaves, washed and chopped</li>
          <li>2 green chilies, chopped (adjust to taste)</li>
          <li>
            1 tablespoon{" "}
            Mustard Oil
          </li>
          <li>1 onion, finely chopped</li>
          <li>2 tomatoes, chopped</li>
          <li>4 cloves garlic, minced</li>
          <li>1-inch piece of ginger, grated</li>
          <li>1 teaspoon cumin seeds</li>
          <li>1 teaspoon coriander powder</li>
          <li>1/2 teaspoon  <span style={{ fontWeight: "bold" }}>Amrti's Turmeric powder</span></li>
          <li>Salt to taste</li>
          <li>Water, as needed</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-4">Instructions:</h2>
        <ol className="list-decimal list-inside">
          <li>Wash and chop the mustard greens and spinach leaves.</li>
          <li>
            Boil water and cook the greens with green chilies until tender, then
            drain.
          </li>
          <li>
            Heat Amrti's Mustard Oil in a pan, add cumin seeds until they
            splutter.
          </li>
          <li>
            Sauté garlic and ginger, then add onions until translucent, followed
            by tomatoes until mushy.
          </li>
          <li>
            Mix in the spices, then add the cooked greens and combine well.
          </li>
          <li>
            Mash the mixture to your preferred consistency and simmer for 10-15
            minutes.
          </li>
          <li>
            Serve hot with makki di roti or chapati and a dollop of butter or
            ghee.
          </li>
        </ol>
      </div>
      <div style={{ height: "200px" }}></div>
    </div>
  );
};

export default Saag;
