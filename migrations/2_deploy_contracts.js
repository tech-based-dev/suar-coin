var SuarCoin = artifacts.require("./SuarCoin.sol");

module.exports = function(deployer) {
  deployer.deploy(SuarCoin);
};
