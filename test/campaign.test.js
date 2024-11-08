const assert = require("assert");
const ganache = require("ganache");
const { Web3 } = require("web3");

const web3 = new Web3(ganache.provider());

const compiledFactory = require("../ethereum/build/CampaignFactory.json");
const compiledCampaign = require("../ethereum/build/Campaign.json");
const { beforeEach, describe } = require("mocha");

let accounts, factory, campaignAddress, campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({
      data: compiledFactory.bytecode,
    })
    .send({
      from: accounts[0],
      gas: "1000000",
    });

  await factory.methods.createCampaign("100").send({
    from: accounts[0],
    gas: "1000000",
  });

  const deployedCampaigns = await factory.methods.getDeployedCampaigns().call();
  campaignAddress = deployedCampaigns[0];

  campaign = new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress
  );
});

describe("Campaigns", () => {
  it("deploys a factory and a campaign", () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it("marks caller as the campaign manager", async () => {
    const manager = await campaign.methods.manager().call();

    assert.equal(accounts[0], manager);
  });

  it("allows people to contribute money and mark them as contributors", async () => {
    await campaign.methods.contribute().send({
      value: "200",
      from: accounts[1],
    });

    const isApprover = await campaign.methods.approvers(accounts[1]).call();

    assert.ok(isApprover);
  });

  it("requires a minimum contribution", async () => {
    try {
      await campaign.methods.contribute().send({
        value: "50",
        from: accounts[1],
      });

      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("allows a manager to create a payment request", async () => {
    await campaign.methods.createRequest("Buy Tesla", "100", accounts[1]).send({
      from: accounts[0],
      gas: "1000000",
    });

    const request = await campaign.methods.requests(0).call();

    assert.equal("Buy Tesla", request.description);
  });

  it("Processes requests", async () => {
    await campaign.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei("10", "ether"),
    });

    await campaign.methods
      .createRequest("Buy Tesla", web3.utils.toWei("5", "ether"), accounts[1])
      .send({
        from: accounts[0],
        gas: "1000000",
      });

    await campaign.methods.approveRequest(0, true).send({
      from: accounts[0],
      gas: "1000000",
    });

    let initialBalance = await web3.eth.getBalance(accounts[1]);
    initialBalance = web3.utils.fromWei(initialBalance, "ether");
    initialBalance = parseFloat(initialBalance);

    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: "1000000",
    });

    let curBalance = await web3.eth.getBalance(accounts[1]);

    curBalance = web3.utils.fromWei(curBalance, "ether");
    curBalance = parseFloat(curBalance);

    assert(curBalance - initialBalance > 4);
  });
});
