import React from "react";
import { PropagateLoader } from "react-spinners";

export function Loading() {
  return (
    <div className="bg-[#091B18] h-screen flex flex-col items-center justify-center">
      <div className="flex items-center space-x-2 mb-10">
        <img
          className="rounded-full h-20 w-20"
          src="https://www.finsmes.com/wp-content/uploads/2022/08/Thirdweb-Logo-White-BG.png"
          alt=""
        />
        <h1 className="text-lg text-white font-bold">
          Loading the Lottery Draw
        </h1>
      </div>
      <PropagateLoader color="white" size={30} />
    </div>
  );
}
