var ChoweToken = artifacts.require("./ChoweToken.sol");

module.exports = function(deployer) {
  deployer.deploy(ChoweToken);
};
