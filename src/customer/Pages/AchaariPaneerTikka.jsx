import React from "react";
import paneerTikkaImage from "./Paneer.jpg"; // Update the import path and image file name as necessary

const AchaariPaneerTikka = () => {
  return (
    <div className="max-w-screen-lg mx-auto" style={{ paddingTop: "45px" }}>
      <h1 className="text-4xl font-bold text-center my-8">
        Achchaari Paneer Tikka
      </h1>
      <div className="w-full">
        <img
          src={paneerTikkaImage}
          alt="Achchaari Paneer Tikka"
          className="w-full object-cover h-64 md:h-96"
        />
      </div>
      <div className="px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">Ingredients:</h2>
        <p className="font-semibold">For the marinade:</p>
        <ul className="list-disc list-inside mb-4">
          <li>250g paneer (Indian cottage cheese), cut into cubes</li>
          <li>
            2 tablespoons{" "}
             mustard oil
          </li>
          <li>1 tablespoon lemon juice</li>
          <li>2 teaspoons ginger-garlic paste</li>
          <li>1 teaspoon red chili powder</li>
          <li>1 teaspoon{" "}<span style={{ fontWeight: "bold" }}>Amrti's Turmeric powder</span> </li>
          <li>1 teaspoon coriander powder</li>
          <li>1 teaspoon cumin powder</li>
          <li>1 teaspoon garam masala</li>
          <li>Salt to taste</li>
        </ul>
        <p className="font-semibold">
          For the pickling spices (achaari masala):
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>1 tablespoon mustard seeds</li>
          <li>1 tablespoon fennel seeds</li>
          <li>1 tablespoon nigella seeds (kalonji)</li>
          <li>1 tablespoon fenugreek seeds</li>
          <li>1 tablespoon cumin seeds</li>
          <li>1 tablespoon coriander seeds</li>
        </ul>
        <p className="font-semibold">For garnish:</p>
        <ul className="list-disc list-inside mb-8">
          <li>Chopped cilantro (coriander leaves)</li>
          <li>Lemon wedges</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-4">Instructions:</h2>
        <ol className="list-decimal list-inside">
          <li>
            Dry roast mustard seeds, fennel seeds, nigella seeds, fenugreek
            seeds, cumin seeds, and coriander seeds separately until aromatic.
          </li>
          <li>
            Grind the roasted spices into a fine powder using a spice grinder or
            mortar and pestle. Set aside.
          </li>
          <li>
            In a mixing bowl, combine mustard oil, lemon juice, ginger-garlic
            paste, red chili powder, turmeric powder, coriander powder, cumin
            powder, garam masala, and salt to taste.
          </li>
          <li>
            Add the paneer cubes to the marinade and gently toss until well
            coated. Allow it to marinate for at least 30 minutes in the
            refrigerator.
          </li>
          <li>Preheat the grill or oven to medium-high heat.</li>
          <li>Thread the marinated paneer cubes onto skewers.</li>
          <li>
            Grill the paneer skewers for about 5-7 minutes on each side or until
            they are charred and cooked through. Alternatively, you can bake
            them in a preheated oven at 200°C (400°F) for about 15-20 minutes,
            turning halfway through.
          </li>
          <li>
            Once cooked, remove the paneer tikka skewers from the grill or oven.
          </li>
          <li>
            Sprinkle the prepared achaari masala generously over the grilled
            paneer tikka.
          </li>
          <li>
            Garnish with chopped cilantro (coriander leaves) and serve hot with
            lemon wedges on the side.
          </li>
        </ol>
      </div>
    </div>
  );
};

export default AchaariPaneerTikka;
