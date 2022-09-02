import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import {
  useAddress,
  useContract,
  useContractCall,
  useContractData,
} from "@thirdweb-dev/react";
import toast from "react-hot-toast";
import Marquee from "react-fast-marquee";
import { ethers } from "ethers";
import { currency } from "../constans";
import { Header } from "../components/Header";
import { Login } from "../components/Login";
import { Loading } from "../components/Loading";
import { CountdownTimer } from "../components/CountdownTimer";
import { AdminControls } from "../components/AdminControls";

const Home: NextPage = () => {
  const address = useAddress();
  const [userTickets, setUserTickets] = useState(0);
  const [quantity, setQuantity] = useState<number>(1);

  const { contract, isLoading } = useContract(
    process.env.NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS
  );

  const { data: expiration } = useContractData(contract, "expiration");
  const { data: ticketPrice } = useContractData(contract, "ticketPrice");
  const { data: tickets } = useContractData(contract, "getTickets");
  const { data: lastWinner } = useContractData(contract, "lastWinner");
  const { data: lastWinnerAmount } = useContractData(
    contract,
    "lastWinnerAmount"
  );
  const { data: remainingTickets } = useContractData(
    contract,
    "RemainingTickets"
  );
  const { data: currentWinningReward } = useContractData(
    contract,
    "CurrentWinningReward"
  );
  const { data: ticketCommission } = useContractData(
    contract,
    "ticketCommission"
  );
  const { data: isLotteryOperator } = useContractData(
    contract,
    "lotteryOperator"
  );
  const { data: winning } = useContractData(
    contract,
    "getWinningsForAddress",
    address
  );
  const { mutateAsync: BuyTickets } = useContractCall(contract, "BuyTickets");
  const { mutateAsync: WithdrawWinnings } = useContractCall(
    contract,
    "WithdrawWinnings"
  );

  useEffect(() => {
    if (!tickets) return;

    const totalTickets: string[] = tickets;

    const noOfUsersTickets = totalTickets.reduce(
      (total, ticketAddress) => (ticketAddress === address ? total + 1 : total),
      0
    );

    setUserTickets(noOfUsersTickets);
  }, [tickets, address]);

  const handleClick = async () => {
    if (!ticketPrice) return;

    const notification = toast.loading("Buying your tickets...");
    try {
      const data = await BuyTickets([
        {
          value: ethers.utils.parseEther(
            (
              Number(ethers.utils.formatEther(ticketPrice)) * quantity
            ).toString()
          ),
        },
      ]);

      toast.success("Tickets purchased successfully!", {
        id: notification,
      });

      console.info("contract call success", data);
    } catch (err) {
      toast.error("Whoops, Something Went Wrong!", {
        id: notification,
      });

      console.log("Contract call failure", err);
    }
  };

  const onWithdrawWinnings = async () => {
    const notification = toast.loading("Withdrawing winnings...");

    try {
      await WithdrawWinnings([{}]);
      toast.success("Winnings withdrawn successfully!", {
        id: notification,
      });
    } catch (err) {
      toast.error("Whoops, Something Went Wrong!", {
        id: notification,
      });

      console.error("contract call failure", err);
    }
  };

  if (isLoading) return <Loading />;
  if (!address) return <Login />;

  return (
    <div className="bg-[#091B18] min-h-screen flex flex-col">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex-1">
        <Header />
        <Marquee className="bg-[#0A1F1C] p-5 mb-5" gradient={false} speed={100}>
          <div className="flex space-x-2 mx-10">
            <h4 className="text-white font-bold">
              Last Winner: {lastWinner?.toString()}
            </h4>
            <h4 className="text-white font-bold">
              Previous winnings:{" "}
              {lastWinnerAmount &&
                ethers.utils.formatEther(lastWinnerAmount?.toString())}{" "}
              {currency}
            </h4>
          </div>
        </Marquee>

        {isLotteryOperator === address && (
          <div className="flex justify-center">
            <AdminControls />
          </div>
        )}

        {winning > 0 && (
          <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto mt-5">
            <button
              onClick={onWithdrawWinnings}
              className="p-5 bg-gradient-to-b from-orange-500 to-emerald-600 animate-pulse text-center rounded-xl w-full"
            >
              <p className="font-bold">Winner Winner Chicken Dinner!</p>
              <p>
                Total Winnings: {ethers.utils.formatEther(winning.toString())}{" "}
                {currency}
              </p>
              <br />
              <p className="font-semibold">Click here to withdraw</p>
            </button>
          </div>
        )}

        {/* The Next Draw box */}
        <div className="space-y-5 md:space-y-0 m-5 md:flex md:flex-row items-start justify-center md:space-x-5">
          <div className="stats-container">
            <h1 className="text-5xl text-white font-semibold text-center">
              The Next Draw
            </h1>
            <div className="flex justify-between p-2 space-x-2">
              <div className="stats">
                <h2 className="text-sm">Total Pool</h2>
                <p className="text-xl">
                  {currentWinningReward &&
                    ethers.utils.formatEther(
                      currentWinningReward.toString()
                    )}{" "}
                  {currency}
                </p>
              </div>
              <div className="stats">
                <h2 className="text-sm">Tickets Remaining</h2>
                <p className="text-xl">{remainingTickets?.toNumber()}</p>
              </div>
            </div>

            {/* Countdown timer */}
            <div className="mt-5 mb-3">
              <CountdownTimer />
            </div>
          </div>

          <div className="stats-container space-y-2">
            <div className="stats-container">
              <div className="flex justify-between items-center text-white pb-2">
                <h2>Price per ticker</h2>
                <p>
                  {ticketPrice &&
                    ethers.utils.formatEther(ticketPrice.toString())}{" "}
                  {currency}
                </p>
              </div>

              <div className="flex text-white items-center space-x-2 bg-[#091B1B] border-[#004337] border p-4">
                <p>TICKETS</p>
                <input
                  className="flex w-full bg-transparent text-right outline-none"
                  type="number"
                  min={1}
                  max={10}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2 mt-5">
                <div className="flex items-center justify-between text-emerald-300 text-sm italic font-extrabold">
                  <p>Total cost of tickets</p>
                  <p>
                    {ticketPrice &&
                      Number(ethers.utils.formatEther(ticketPrice.toString())) *
                        quantity}{" "}
                    {currency}
                  </p>
                </div>

                <div className="flex items-center justify-between text-emerald-300 text-xs italic">
                  <p>Service fees</p>
                  <p>
                    {ticketCommission &&
                      ethers.utils.formatEther(
                        ticketCommission?.toString()
                      )}{" "}
                    {currency}
                  </p>
                </div>

                <div className="flex items-center justify-between text-emerald-300 text-xs italic">
                  <p>+ Network Fees</p>
                  <p>TBC</p>
                </div>
              </div>

              <button
                disabled={
                  expiration?.toString() < Date.now().toString() ||
                  remainingTickets?.toNumber() === 0
                }
                onClick={handleClick}
                className="mt-5 w-full bg-gradient-to-br from-orange-500 to-emerald-600 px-10 py-5 rounded-md font-semibold text-white shadow-xl disabled:from-gray-600 disabled:text-gray-100 disabled:to-gray-600 disabled:cursor-not-allowed"
              >
                Buy {quantity} tickets for{" "}
                {ticketPrice &&
                  Number(ethers.utils.formatEther(ticketPrice.toString())) *
                    quantity}{" "}
                {currency}
              </button>
            </div>

            {userTickets > 0 && (
              <div className="stats">
                <p className="text-lg mb-2">
                  you have {userTickets} Tickets in this draw
                </p>

                <div className="flex max-w-sm flex-wrap gap-x-2 gap-y-2">
                  {Array(userTickets)
                    .fill("")
                    .map((_, index) => (
                      <p
                        className="text-emerald-300 h-20 w-12 bg-emerald-500/30 rounded-lg flex flex-shrink-0 items-center justify-center text-xs italic"
                        key={index}
                      >
                        {index + 1}
                      </p>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="border-t border-emerald-500/20 flex items-center text-white justify-between p-5">
        <img
          className="h-10 w-10 filter hue-rotate-90 opacity-20 rounded-full"
          src="https://i.imgur.com/4h7mAu7.png"
          alt=""
        />

        <p className="text-xs text-emerald-900 pl-5">
          DISCLAIMER: This DEMO is made for informational and educational
          purposes only. The content of this website is not intended to be a
          lure to gambling. Instead, the information presented is meant for
          nothing more than learning and entertainment purposes. I'm not liable
          for any losses that are incurred or problems that arise at online
          casinos or elsewhere after the reading and consideration of this DEMO
          Website content. If you are gambling online utilizing information from
          this DEMO, you are doing so completely and totally at your own risk.
        </p>
      </footer>
    </div>
  );
};

export default Home;
