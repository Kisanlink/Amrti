import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BackHandOutlinedIcon from "@mui/icons-material/BackHandOutlined";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import { useParams } from "react-router-dom";
import Compare from "./Compare";
import Kombucha from "./Kombucha";

const API_URL = 'https://amrti-main-backend.vercel.app/api/v1/amrti/products';

export default function ProductDetail() {
  const { productId } = useParams();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [powderId, setPowderId] = useState(null);
  const [pouchId, setPouchId] = useState(null);
  const [currentProductId, setCurrentProductId] = useState(productId);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/getproduct/${productId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product data');
        }
        const data = await response.json();
        console.log(data);
        setProductData(data.data.data);
        console.log(productData)
        setPowderId(data.data.data._id);
        setPouchId(data.data.data.alternativeId);
        setActiveImage(data.data.data.imageUrl[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  const handleSetActiveImage = (image) => {
    setActiveImage(image);
  };

  const handleSubmit = async () => {
    try {
      const token = getCookie('jwtToken');
      const response = await fetch('https://amrti-main-backend.vercel.app/api/v1/amrti/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: currentProductId })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log(result);
      toast.success('Product added to cart successfully!');
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      toast.error('Failed to add product to cart.');
    }
  };

  const handleProductChange = async (targetId) => {
    try {
      const response = await fetch(`${API_URL}/getproduct/${targetId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      console.log(data);
      
      setProductData(data.data.data);
      
      setActiveImage(data.data.data.imageUrl[0]);
      setCurrentProductId(data.data.data._id);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!productData) return <div>No product data available.</div>;

  return (
    <div className="mt-10 bg-white">
      <ToastContainer />
      <div className="pt-6">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-10 px-4 pt-10">
          {/* Image gallery */}
          <div className="flex flex-col items-center ">
            <div className="overflow-hidden rounded-lg">
              <img
                src={activeImage?.url || productData.imageUrl[0].url}
                alt="product image"
                className="h-[550px] w-[600px] object-cover object-center"
              />
            </div>
            <div className="flex flex-wrap space-x-5 justify-center">
              {productData.imageUrl.map((image, index) => (
                image.url && (
                  <div
                    key={index}
                    onClick={() => handleSetActiveImage(image)}
                    className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg max-w-[5rem] max-h-[5rem] mt-4"
                  >
                    <img
                      src={image.url}
                      alt={`product image ${index + 1}`}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="lg:col-span-1 maxt-auto max-w-2xl px-4 pb-16 sm:px-6 lg:max-w-7xl lg:px-8 lg:pb-24">
            <div className="lg:col-span-2">
              <h1 className="text-lg lg:text-xl font-semibold text-gray-900" style={{ fontSize: "30px" }}>
                {productData.title}
              </h1>
              <h1 className="text-lg lg:text-xl text-gray-900 opacity-60 pt-1">
                {productData.brand}
              </h1>
            </div>

            <div className="mt-4 lg:row-span-3 lg:mt-0">
              <div className="flex space-x-5 items-center text-lg lg:text-xl text-gray-900 mt-6">
                <p className="opacity-50 line-through">
                  &#8377;{productData.price}
                </p>
                <p className="font-semibold">
                  &#8377;{productData.discountedPrice}
                </p>
                <p className="text-green-600 font-semibold">
                  {productData.discountPersent}% Off
                </p>
              </div>

              {/* Icons */}
              <div className="mt-10">
                <div className="grid grid-cols-4 row-gap-8">
                  <div className="text-center md:border-r">
                    <BackHandOutlinedIcon style={{ fontSize: "50px", border: "solid black 3px", borderRadius: "50px", padding: "5px", color: "black" }} />
                    <p className="text-md font-bold tracking-widest">Handpicked Leaves</p>
                  </div>
                  <div className="text-center md:border-r">
                    <ClearOutlinedIcon style={{ fontSize: "50px", border: "solid black 3px", borderRadius: "50px", padding: "5px", color: "black" }} />
                    <p className="text-md font-bold tracking-widest">No Added Chemicals</p>
                  </div>
                  <div className="text-center md:border-r">
                    <SpaOutlinedIcon style={{ fontSize: "50px", border: "solid black 3px", borderRadius: "50px", padding: "5px", color: "black" }} />
                    <p className="text-md font-bold tracking-widest">100% Natural</p>
                  </div>
                  <div className="text-center md:border-r">
                    <VolunteerActivismOutlinedIcon style={{ fontSize: "50px", border: "solid black 3px", borderRadius: "50px", padding: "5px", color: "black" }} />
                    <p className="text-md font-bold tracking-widest">Good for Heart</p>
                  </div>
                </div>
              </div>

              <form className="mt-10">
  {productData.alternativeId && (
    <>
      <Button
        onClick={() => handleProductChange(powderId)}
        variant="outlined"
        sx={{
          px: "1.5rem",
          py: "0.5rem",
          borderColor: "#9155fd",
          color: currentProductId === powderId ? "white" : "#9155fd",
          bgcolor: currentProductId === powderId ? "#9155fd" : "transparent",
          borderRadius: "50px",
          marginRight: "1rem",
          '&:hover': {
            bgcolor: currentProductId === powderId ? "#9155fd" : "rgba(145, 85, 253, 0.1)",
          },
        }}
      >
        100g
      </Button>
      <Button
        onClick={() => handleProductChange(pouchId)}
        variant="outlined"
        sx={{
          px: "1.5rem",
          py: "0.5rem",
          borderColor: "#9155fd",
          color: currentProductId === pouchId ? "white" : "#9155fd",
          bgcolor: currentProductId === pouchId ? "#9155fd" : "transparent",
          borderRadius: "50px",
          marginRight: "1rem",
          '&:hover': {
            bgcolor: currentProductId === pouchId ? "#9155fd" : "rgba(145, 85, 253, 0.1)",
          },
        }}
      >
        300g
      </Button>
    </>
  )}
  <Button
    onClick={handleSubmit}
    variant="contained"
    sx={{
      px: "2rem",
      py: "0.5rem",
      bgcolor: "#9155fd",
      borderRadius: "25px",
      marginTop: "1rem",
      display: "block",
    }}
  >
    Add To Cart
  </Button>
</form>
            </div>

            <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pb-16 lg:pr-8 lg:pt-6">
              <div>
                <h3 className="sr-only">Description</h3>
                <div className="space-y-6">
                  <p className="text-base text-gray-900">
                    {productData.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {productData.videoUrl && productData.videoUrl.length > 0 && (
      <div className="mt-16 flex flex-col items-center">
        {productData.videoUrl.map((video, index) => (
          <div key={index} className="mb-12 w-full max-w-4xl">
            <h2 className="text-4xl font-semibold text-gray-900 text-center mb-6 ">{video.heading}</h2>
            <div className="flex justify-center mt-16">
              <iframe
                width="1000"
                height="600"
                src={video.url}
                title={`Product Video ${index + 1}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="shadow-lg rounded-lg"
              ></iframe>
            </div>
          </div>
        ))}
      </div>
    )}


        {/* Highlights Section */}
        {productData.category?.name !== "350ml" && (
          <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
            <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
              <h2 className="mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 sm:text-4xl md:mx-auto">
                <p>Highlights</p>
              </h2>
            </div>
            <div className="grid gap-8 row-gap-10 lg:grid-cols-2">
              {productData.why?.map((item, index) => (
                <div key={index} className="max-w-md sm:mx-auto sm:text-center">
                  <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full sm:mx-auto sm:w-24 sm:h-24">
                    <img src={item.url} alt="" />
                  </div>
                  <h6 className="mb-3 text-xl font-bold leading-5">{item.heading}</h6>
                  <p className="mb-3 text-md text-gray-900">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ways to Enjoy Section */}
        {productData.category?.name !== "350ml" && productData.category?.name !== "500g" && (
          <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
            <h2 className="text-center mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 sm:text-4xl md:mx-auto">
              <p>Ways to Enjoy Our {productData.title}</p>
            </h2>
            <div className="grid gap-8 lg:grid-cols-3 sm:max-w-sm sm:mx-auto lg:max-w-full">
              {productData.enjoy?.map((item, index) => (
                <div key={index} className="overflow-hidden transition-shadow duration-300 bg-white rounded shadow-sm">
                  <img src={item.url} className="object-cover w-full h-72" alt="" />
                  <div className="p-5 border border-t-0 h-full">
                    <a href="/" className="inline-block mb-3 text-2xl font-bold leading-5 transition-colors duration-200 hover:text-deep-purple-accent-700">
                      {item.heading}
                    </a>
                    <p className="mb-2 text-gray-700">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Render Kombucha or Compare components based on category */}
        {productData.category?.name === "350ml" && <Kombucha />}
        {productData.category?.name !== "350ml" && productData.category?.name !== "500g" && <Compare />}
      </div>
    </div>
  );
}