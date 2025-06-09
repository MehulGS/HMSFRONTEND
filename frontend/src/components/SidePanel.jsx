import React from "react";
import logo from "../assets/images/logo.png";
import vector from "../assets/images/Vector.png"; // background image

const SidePanel = () => {
  return (
    <div
      className="w-full h-full relative flex justify-center items-center bg-cover bg-center"
      style={{
        backgroundImage: `url(${vector})`,
      }}
    >
      {/* Overlay Layer */}
      <div className="absolute inset-0 bg-black opacity-55 z-0" />

      {/* Banner Content */}
      <div className="text-center relative z-10 p-4">
        <img
          src={logo}
          alt="Banner"
          className="w-[500px] h-[400px] mx-auto bg-white"
        />
        <h2 className="text-4xl font-bold mt-4 text-white">
          Shanti Devi Health Care
        </h2>
        <p className="text-gray-200 mt-2 font-semibold">
          G.F Shop No.: 3, Sun South Trade, Opp. Bopal Police Station, Gala Gym Khana Road,
          <br />
          Bopal, Ahmedabad - 380058, India
        </p>
      </div>
    </div>
  );
};

export default SidePanel;
