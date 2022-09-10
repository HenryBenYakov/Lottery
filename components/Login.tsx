import { useMetamask } from "@thirdweb-dev/react";
import React from "react";

export function Login() {
  const connectWithMetamask = useMetamask();

  return (
    <div className="bg-[#091B18] min-h-screen flex flex-col items-center justify-center text-center">
      <div className="flex flex-col items-center mb-10">
        <img
          className="rounded-full h-56 w-56 mb-10"
          src="https://www.finsmes.com/wp-content/uploads/2022/08/Thirdweb-Logo-White-BG.png"
          alt=""
        />
        <h1 className="text-6xl text-white font-bold mb-6">The Lottery Draw</h1>
        <h2 className="text-white">
          Get Started By logging in with your MetaMask
        </h2>

        <button
          onClick={connectWithMetamask}
          className="bg-white px-8 py-5 mt-8 rounded-lg shadow-lg font-bold"
        >
          Login with MetaMask
        </button>
      </div>
    </div>
  );
}
