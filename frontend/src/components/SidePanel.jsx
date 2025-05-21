import React from "react";
import logoBanner from "../assets/images/loginBanner.png";
import logo from "../assets/images/logo.png";
import vector1 from "../assets/images/Vector1.png";
import vector2 from "../assets/images/Vector2.png";
import vector3 from "../assets/images/Vector3.png";
import vector from "../assets/images/Vector.png";

const SidePanel = () => {
  return (
    <div className="w-full bg-gray-100 relative flex justify-center items-center">
      {/* Vectors */}
      <img
        src={vector1}
        alt="Vector Top Left"
        className="absolute top-0 left-0 w-50 h-60"
      />
      <img
        src={vector2}
        alt="Vector Bottom Right"
        className="absolute bottom-0 right-0 w-50 h-60"
      />
      <img
        src={vector}
        alt="Vector Bottom Right"
        className="absolute top-0 right-0 w-40 h-30"
      />

      {/* Banner Content */}
      <div className="text-center relative">
        <img
          src={vector3}
          alt="Vector Bottom Right"
          className="absolute top-20 right-0 w-30 h-30"
        />
        <img
          src={logo}
          alt="Banner"
          className="w-[500px] h-[400px] mx-auto"
        />
        <h2 className="text-4xl font-bold mt-4">Shanti Devi Health Care Hospital</h2>
        <p className="text-gray-600 mt-2 font-semibold">
         G.F Shop No.: 3, Sun South Trade, Opp. Bopal Police Station, Gala Gym Khana Road, <br /> Bopal, Ahmedabad - 380058, India
        </p>
      </div>
    </div>
  );
};

export default SidePanel;
