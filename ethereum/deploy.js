import HDWalletProvider from "@truffle/hdwallet-provider";
import { Web3 } from "web3";
import CampaignFactory from "./build/CampaignFactory.json" assert { type: "json" };
import { config } from "dotenv";

config();

const provider = new HDWalletProvider(
  process.env.MNEMONIC,
  process.env.INFURA_URL
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log("Attempting to deploy from account", accounts[0]);

  const result = await new web3.eth.Contract(
    JSON.parse(CampaignFactory.interface)
  )
    .deploy({ data: CampaignFactory.bytecode })
    .send({ gas: "1000000", from: accounts[0] });

  console.log("Contract deployed to", result.options.address);
  provider.engine.stop();
};

deploy();
