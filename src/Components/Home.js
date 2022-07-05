import React, { useEffect, useState } from "react";
import abi from "./abi.json";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { white } from "./whitelist.js";

import os from "../Imgs/os.svg";
import preview from "../Imgs/preview.gif";

import "./Home.css";

export default function Home() {
  const REACT_APP_CONTRACT_ADDRESS =
    "0x8B5bFACb4D1c744a627F1CB106a3De410070f7D4";
  const SELECTEDNETWORK = "1";
  const SELECTEDNETWORKNAME = "Ethereum";

  const [quantity, setQuantity] = useState(1);
  const [maxallowed, setMaxallowed] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [status, setStatus] = useState(true);

  const leaf = white.map((addr) => keccak256(addr));
  const merkleTree = new MerkleTree(leaf, keccak256, { sortPairs: true });

  let ct, web3;

  function checkWhitelist(a) {
    const check = keccak256(a);
    const proof = merkleTree.getHexProof(check);
    const root = merkleTree.getRoot();

    return merkleTree.verify(proof, check, root);
  }

  function getProof(a) {
    const check = keccak256(a);
    return merkleTree.getHexProof(check);
  }

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

    if (status == 1) {
      await toast.promise(
        ct.methods
          .presaleMint(quantity, getProof(metamaskAddress))
          .send({ from: metamaskAddress }),
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

      let p = await ct.methods.status().call();
      console.log(p);
      setMaxallowed(p == 1 ? 1 : 2);
      setStatus(p);

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
    if (status == 0) {
      toast.error("Sale not Active!!");
    } else if ((checkWhitelist(m) && status == 1) || status == 2)
      setWalletConnected(true);
    else toast.error("Not Whitelisted!!");
  };

  return (
    <div className="AAA">
      <div className="container text-center text-lg-left d-flex align-items-center sev1">
        <div className="row opt align-items-center m-1">
          <div className="col-lg-6 p-2">
            <img src={preview} className="w-100 rounded preview shadow" />
          </div>
          <div className="col-lg-6 px-lg-5 ">
            <h1 className="sev">WORKING CLASS DEGENS</h1>

            <h3 className="text-white py-4">
              <small>
                {status == 1
                  ? "PRE SALE ACTIVE"
                  : status == 2
                  ? "PUBLIC SALE ACTIVE"
                  : "SALE NOT ACTIVE"}
              </small>
              <br />
              <small>Price: FREE + GAS</small>
              <br />
              <small>Max per Address: {maxallowed}</small>
            </h3>

            <div className="quantityselector d-flex justify-content-center justify-content-lg-start align-items-center pb-2">
              <button
                className="count btn mr-4 ml-0"
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

            {walletConnected ? (
              <button onClick={loadweb3} id="gooey-button">
                MINT
              </button>
            ) : (
              <button onClick={connectWallet} id="gooey-button">
                CONNECT
              </button>
            )}
            <br />
            <a
              // href="https://twitter.com/NFTStrangeTimes"
              target="_blank"
              className="mx-2"
            >
              <i className="btc fa-brands fa-twitter"></i>
            </a>
            <a
              href="https://opensea.io/collection/working-class-degens"
              target="_blank"
              style={{ fontSize: "45px" }}
              className="mx-2"
            >
              <img src={os} style={{ height: "35px" }} className="os" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
