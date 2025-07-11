// SPDX-License-Identifier: MIT
pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint minimum) public {
        address newCampaign = new Campaign(minimum, msg.sender);

        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) usedVotes;
    }

    Request[] public requests;
    address public manager;
    uint public minimumContribution;
    mapping(address => bool)  public approvers;
    uint approversCount;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    constructor(uint minimum, address creator) public {
        manager = creator;
        minimumContribution = minimum;
    }

    function contribute() public payable {
        require(msg.value > minimumContribution);

        approvers[msg.sender] = true;
        approversCount++;
    }

    function createRequest(string description, uint value, address recipient) 
    public restricted 
    { 
        Request memory newRequest = Request({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalCount: 0
        });

        requests.push(newRequest);
    }

    function approveRequest(uint index, bool decison) public {
        Request storage request = requests[index];


        require(approvers[msg.sender]); // has contributed
        require(!request.usedVotes[msg.sender]); //has not voted

        request.usedVotes[msg.sender] = decison;

        if (decison) {
           request.approvalCount++;
        }
    }

    function finalizeRequest(uint index) public restricted {
        Request storage request = requests[index];

        require(request.approvalCount > (approversCount/2));

        require(!request.complete);

        request.recipient.transfer(request.value);

        request.complete = true;    
    }
}