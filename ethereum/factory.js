import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json" assert { type: "json" };

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  "0xe7111dE58a7645b7F31aed6d6a6CA7715Ddf047d"
);

export default instance;
