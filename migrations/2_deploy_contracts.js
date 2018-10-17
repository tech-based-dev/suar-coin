var SuarCoin = artifacts.require("./SuarCoin.sol");

module.exports = function(deployer) {
  deployer.deploy(SuarCoin, 1000000000); // Set the initial supply
};
