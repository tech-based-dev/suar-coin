var SuarCoin = artifacts.require("./SuarCoin.sol");
var SuarCoinSale = artifacts.require("./SuarCoinSale.sol");

module.exports = function(deployer) {
  deployer.deploy(SuarCoin, 1000000000)
  	.then(function() {
  		var tokenPrice = 490000000000000; // in WEI

  		return deployer.deploy(SuarCoinSale, SuarCoin.address, tokenPrice);
  	});
};
