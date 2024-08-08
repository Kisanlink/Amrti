import about from './about us.jpg'
export const About = () => {
  return (

    <div>
      <div className="flex justify-center mt-16">
              <iframe
           
                src="https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/amrti-new-teaser.mp4"
                title={`Product Video `}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="shadow-lg rounded-lg w-full h-screen"
              ></iframe>
            </div>
   
    <div style={{ paddingTop: "100px" }}>
      <h2 className=" mb-6 font-sans text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl sm:leading-none text-center">
        About Us
      </h2>
      <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:w-full  md:px-24 lg:px-8 lg:py-20">
        <div className="grid gap-12 row-gap-8 lg:grid-cols-2">
          <div className="flex flex-col ml-24 justify-center">
            <div className=" mb-6">
              <p className="text-base w-[900px] text-gray-700 md:text-lg">
              Amrti is a brand conceived with the intention of empowering farmers and Self-Help Groups (SHGs) through an innovative buy-back model utilizing solar dryers. Our mission is to transform the agricultural landscape by providing farmers with sustainable solutions that enhance their livelihoods while promoting eco-friendly practices.              </p>
            </div>
           
            <div className=" w-[900px] mb-6">
              <p className="text-base  text-gray-700 md:text-lg">
              At Amrti, we specialize in processing dried vegetables and fruits into high-quality powders. This not only extends the shelf life of these nutritious products but also adds value to the raw materials sourced from our farmers. Our packaging ensures that the essence and health benefits of the produce are preserved, making it convenient for consumers to incorporate these powders into their diets.              </p>
            </div>
            <h1 className=" font-sans font-bold  text-gray-900 mb-4 sm:text-xl sm:leading-none ">
            The holistic benefits of our approach are significant:
</h1>
<ul className='w-[900px] list-inside list-disc '>
  <li>Empowerment for Farmers: By offering a reliable buy-back model, we provide farmers with a steady income stream, reducing their dependency on fluctuating market prices.</li>
  <li>Support for SHGs: We collaborate with Self-Help Groups to foster community development and enhance the skills of local women, creating opportunities for economic growth.</li>
  <li>Consumer Health: Our processed powders are rich in nutrients, offering consumers a convenient way to access healthy food options that are free from preservatives and additives.
  </li>
  <li>Sustainability: Utilizing solar dryers not only reduces energy consumption but also minimizes waste, making our processes environmentally friendly.</li>
</ul>
            <br />
          </div>
          <div>
            <img
              className="object-cover ml-64 mt-8  w-96 h-96 rounded shadow-lg sm:h-96"
              src="https://d33hqsk72xx8w2.cloudfront.net/wp-content/uploads/infographics-new.png"
              alt=""
            />
          </div>
        </div>
      </div>
      <div style={{height:"100px"}}></div>
    </div>
    </div>
  );
};
