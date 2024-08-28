import AliceCarousel from "react-alice-carousel";
import ProductCarouselCard from "./ProductCarouselCard";
import { Button } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { findProducts } from "../../State/Product/Action";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useRef } from "react";
const ProductCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef();
  const slideNext = () => {
    carouselRef.current?.slideNext();
  };

  const slidePrev = () => {
    carouselRef.current?.slidePrev();
  };
  const syncActiveIndex = ({ item }) => setActiveIndex(item);

  const responsive = {
    0: {
      items: 1.2,
      itemsFit: "contain",
    },
    568: {
      items: 2,
      itemsFit: "contain",
    },
    1024: {
      items: 5.5,
      itemsFit: "contain",
    },
  };
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const { customersProduct } = useSelector((store) => store);
  const availability = searchParams.get("availability");

  useEffect(() => {
    const data = {
      category: "",
      colors: [],
      sizes: [],
      minPrice: 0,
      maxPrice: 100000,
      minDiscount: 0,
      sort: "price_low",
      pageNumber: 1,
      pageSize: 50,
      stock: availability,
    };
    dispatch(findProducts(data));
  }, []);
  const items = customersProduct?.products?.content?.map((item) => (
    <div className="" style={{ height: "100%" }}>
      {" "}
      <div></div>
      <ProductCarouselCard product={item} style={{ height: "100%" }} />
     
    </div>
  ));
  

  // const slideInFromRight = (t) => {
  //   return `translateX(${100 - t * 100}%)`;
  // };

  return (
    <div className="relative px-4 sm:px-6 lg:px-8 ">
      <h1 className="text-4xl font-bold text-center">Our Products</h1>

      <div className="relative  p-5">
        <AliceCarousel
          disableButtonsControls
          ref={carouselRef}
          disableDotsControls
          mouseTracking
          items={items}
          activeIndex={activeIndex}
          responsive={responsive}
          onSlideChanged={syncActiveIndex}
          animationType="slide"
          animationDuration={500}
        />
        
          <Button
            onClick={slideNext}
            variant="rounded"
            className="z-50 bg-green"
            sx={{
              position: "absolute",
              top: "50%",
              right: "0rem",
              transform: "translateX(50%) rotate(90deg)",
            }}
            aria-label="next"
            style={{
              backgroundColor: "transparent",
              color: "black",
              border: "none",
              shadow: "none",
            }}
          >
            <ArrowForwardIosIcon
              className=""
              sx={{ transform: "rotate(-90deg)" }}
            />
          </Button>
        

        
          <Button
            onClick={slidePrev}
            className="z-50 bg-green"
            sx={{
              position: "absolute",
              top: "50%",
              left: "0rem",
              transform: "translateX(-50%)  rotate(90deg)",
            }}
            aria-label="next"
          >
            <ArrowForwardIosIcon
              className="bg-green"
              style={{ color: "black" }}
              sx={{ transform: " rotate(90deg)" }}
            />
          </Button>
      
      </div>
    </div>
  );
};

export default ProductCarousel;
