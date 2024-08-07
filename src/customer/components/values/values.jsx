import purity from '../../Pages/pure-water (1).png'
import heritage from '../../Pages/images-removebg-preview (1).png'
import recycle from "../../Pages/recycle.png";
import well from "../../Pages/heartbeat.png";
export const Values = () => {
  return (
    <div className="px-4  mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
      <div className="max-w-xl  md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
        {/* <div>
          <p className="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider text-teal-900 uppercase rounded-full bg-teal-accent-400">
            Brand new
          </p>
        </div> */}
        <h2 className="  mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 sm:text-4xl md:mx-auto">
          <span className="relative inline-block">
            {/* <svg
              viewBox="0 0 52 24"
              fill="white"
              className="absolute top-0 left-0 z-0 hidden w-32 -mt-8 -ml-20 text-blue-gray-100 lg:w-32 lg:-ml-28 lg:-mt-10 sm:block"
            >
              <defs>
                <pattern
                  id="ea469ae8-e6ec-4aca-8875-fc402da4d16e"
                  x="0"
                  y="0"
                  width=".135"
                  height=".30"
                >
                  <circle cx="1" cy="1" r=".7" />
                </pattern>
              </defs>
              <rect
                fill="url(#ea469ae8-e6ec-4aca-8875-fc402da4d16e)"
                width="52"
                height="24"
              />
            </svg> */}
          </span>
          Our Values
        </h2>
        {/* <p className="text-base text-gray-700 md:text-lg">
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium doloremque rem aperiam, eaque ipsa quae.
        </p> */}
      </div>
      <div className="grid gap-8 row-gap-10 lg:grid-cols-4">
        <div className="max-w-md sm:mx-auto sm:text-center">
          <div
            className="flex items-center justify-center w-16 h-16 mb-4 rounded-full sm:mx-auto sm:w-24 sm:h-24 "
            style={{ padding: "15px" }}
          >
            <img
              src={purity}
              alt=""
              style={{ objectFit: "cover", height: "100%", width: "100%" }}
            />
          </div>
          <h6 className="mb-3 text-xl font-bold ">PURITY</h6>

          <p className="mb-3 text-lg text-gray-900 ">
            Sourcing from natural ingredicents and crafted with precision
          </p>
        </div>
        <div className="max-w-md sm:mx-auto sm:text-center">
          <div
            className="flex items-center justify-center w-16 h-16 mb-4 rounded-full sm:mx-auto sm:w-24 sm:h-24 "
            style={{ padding: "15px" }}
          >
            <img
              src={heritage}
              alt=""
              style={{ objectFit: "cover", height: "100%", width: "100%" }}
            />
          </div>
          <h6 className="mb-3 text-xl font-bold "> HERITAGE</h6>

          <p className="mb-3 text-lg text-gray-900 ">
            Preserving traditional techniques and flavours to celebrate cultural
            richness
          </p>
        </div>
        <div className="max-w-md sm:mx-auto sm:text-center">
          <div
            className="flex items-center justify-center w-16 h-16 mb-4 rounded-full sm:mx-auto sm:w-24 sm:h-24 "
            style={{ padding: "15px" }}
          >
            <img
              src={recycle}
              alt=""
              style={{ objectFit: "cover", height: "100%", width: "100%" }}
            />
          </div>
          <h6 className="mb-3 text-xl font-bold ">SUSTAINABILITY</h6>

          <p className="mb-3 text-lg text-gray-900 ">
            Supporting farmers through fair trade practices
          </p>
        </div>
        <div className="max-w-md sm:mx-auto sm:text-center">
          <div
            className="flex items-center justify-center w-16 h-16 mb-4 rounded-full  sm:mx-auto sm:w-24 sm:h-24 "
            style={{ padding: "15px" }}
          >
            <img
              src={well}
              alt=""
              style={{ objectFit: "cover", height: "100%", width: "100%" }}
            />
          </div>
          <h6 className="mb-3 text-xl font-bold ">WELLNESS</h6>

          <p className="mb-3 text-lg text-gray-900 ">
            Enhancing consumer well-being through healthier lifestyle
          </p>
        </div>
      </div>
    </div>
  );
};
