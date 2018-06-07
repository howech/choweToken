pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/ChoweToken.sol";

contract TestChowe {
  function testInitialBalanceUsingDeployedContract() public {
    ChoweToken chowe = ChoweToken(DeployedAddresses.ChoweToken());

    uint expected = 1;

    Assert.equal(chowe.totalSupply(), expected, "Owner should have 1 chowe initially");
  }

  function testInitialBalanceWithchowe() public {
    ChoweToken chowe = new ChoweToken();

    uint expected = 1;

    Assert.equal(chowe.totalSupply(), expected, "Owner should have 1 chowe initially");
  }
}