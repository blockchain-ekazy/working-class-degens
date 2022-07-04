import React, { useEffect, useState } from "react";
import abi from "./abi.json";
import abi_STRANGE_TIMES from "./abi_STRANGE_TIMES.json";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import os from "../Imgs/os.svg";
import "./Home.css";

export default function Home() {
  const REACT_APP_CONTRACT_ADDRESS =
    "0xcBEeDa7756b52bca7E5fcb796eE5f64548266687";
  const REACT_APP_CONTRACT_ADDRESS_STRANGE_TIMES =
    "0x6CC0343327f9Ac73647fF768e29eeb6e853AaCB1";
  const SELECTEDNETWORK = "4";
  const SELECTEDNETWORKNAME = "Ethereum";

  const [quantity, setQuantity] = useState(1);
  const [maxallowed, setMaxallowed] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [presale, setPresale] = useState(true);

  let ct, web3;

  const loadweb3 = async () => {
    window.web3 = new Web3(window.ethereum);
    web3 = window.web3;

    let metamaskAddress = await web3.eth.getAccounts();
    metamaskAddress = metamaskAddress[0];

    ct = new web3.eth.Contract(abi, REACT_APP_CONTRACT_ADDRESS);

    let m = await ct.methods.numberMinted(metamaskAddress).call();

    if (m + quantity > maxallowed) {
      toast.error("Exceeds Max Allowed Mints!!");
      return;
    }

    if (presale) {
      await toast.promise(
        ct.methods.presaleMint(quantity).send({ from: metamaskAddress }),
        {
          pending: "Mint in Progress!!",
          success: "Mint Success!!",
          error: "Mint Failed!!",
        }
      );
      return;
    } else {
      await toast.promise(
        ct.methods.mint(quantity).send({ from: metamaskAddress }),
        {
          pending: "Mint in Progress!!",
          success: "Mint Success!!",
          error: "Mint Failed!!",
        }
      );
      return;
    }
  };

  async function checkNetwork() {
    if ((await web3.eth.net.getId()) == SELECTEDNETWORK) return true;
    toast.error('Enable "' + SELECTEDNETWORKNAME + '" network!');
    return false;
  }

  useEffect(() => {
    initializeWeb3();
  }, []);

  const initializeWeb3 = async () => {
    if (await detectEthereumProvider()) {
      window.web3 = new Web3(window.ethereum);
      web3 = window.web3;

      if (!checkNetwork()) return false;

      ct = new web3.eth.Contract(abi, REACT_APP_CONTRACT_ADDRESS);

      let p = await ct.methods.presale().call();
      setMaxallowed(p ? 1 : 2);
      setPresale(p);

      return true;
    } else {
      toast.error(
        "Non-Ethereum browser detected. Please use a crypto wallet such as MetaMask!"
      );
      return false;
    }
  };

  const connectWallet = async () => {
    if (!initializeWeb3()) return false;
    await window.ethereum.enable();
    let m = await web3.eth.getAccounts();
    m = m[0];

    let ct_STRANGE_TIMES = new web3.eth.Contract(
      abi_STRANGE_TIMES,
      REACT_APP_CONTRACT_ADDRESS_STRANGE_TIMES
    );

    if (
      ((await ct_STRANGE_TIMES.methods.balanceOf(m).call()) != 0 && presale) ||
      !presale
    )
      setWalletConnected(true);
    else toast.error("Not Whitelisted!!");
  };

  return (
    <div className="AAA">
      <div className="container-fluid  ">
        <div className="row sev1">
          <div className="col-md-12 text-center p-0">
            <h1 className="sev">
              WORKING CLASS <br />
              DEGENS
            </h1>
          </div>
        </div>

        <div className="row hy pt-5 px-2 justify-content-center">
          <div className="col-12 opt">
            <h3 className="text-white py-4">
              <small>
                {presale ? "PRE SALE ACTIVE" : "PUBLIC SALE ACTIVE"}
              </small>
              <br />
              <small>Price: FREE + GAS</small>
              <br />
              <small>Max per Address: {maxallowed}</small>
            </h3>

            <div className="quantityselector d-flex justify-content-center align-items-center pb-2">
              <button
                className="count btn mx-4 "
                onClick={() => setQuantity(quantity - 1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="quantity ">{quantity}</span>
              <button
                className="count btn mx-3 "
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= maxallowed}
              >
                +
              </button>
            </div>

            <br />
            <br />

            {walletConnected ? (
              <button onClick={loadweb3} id="gooey-button">
                MINT
              </button>
            ) : (
              <button onClick={connectWallet} id="gooey-button">
                CONNECT
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="container uty">
        <div className="row ">
          <div className="col-md-4"></div>
          <div className="col-md-4 text-center">
            <a href="https://twitter.com/NFTStrangeTimes" target="_blank">
              <i className="btc px-2 fa-brands fa-twitter"></i>
            </a>
            <a href="https://t.co/XtxgBThUjG" target="_blank">
              <i className="btc px-2 fa-brands fa-discord"></i>
            </a>
            <a
              href="https://opensea.io/collection/strange-times-ahal-magi"
              target="_blank"
              style={{ fontSize: "45px" }}
            >
              <img src={os} style={{ height: "35px" }} className="px-2" />
            </a>
          </div>
          <div className="col-md-4"></div>
        </div>
      </div>
    </div>
  );
}
