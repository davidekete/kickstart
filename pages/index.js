import React, { Component } from "react";
import factory from "../ethereum/factory";

class CampaignIndex extends Component {
  async componentDidMount() {
    const campaigns = await factory.methods.getDeployedCampaigns().call();
  }

  render() {
    return <div>I'll keep your number saved cause I hope</div>;
  }
}

export default CampaignIndex;
