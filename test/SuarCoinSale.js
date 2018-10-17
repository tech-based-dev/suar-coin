var SuarCoinSale = artifacts.require('./SuarCoinSale.sol');

contract('SuarCoinSale', function (accounts) {
	var tokenSaleInstance;
	var tokenPrice = 490000000000000;

	it ('Initializes the contract with correct values', function() {
		return SuarCoinSale.deployed()
			.then(function(instance) {
				tokenSaleInstance = instance;

				return tokenSaleInstance.address;
			})
			.then(function(address) {
				assert.notEqual(address, 0x0, 'Has contract address');

				return tokenSaleInstance.tokenContract();
			})
			.then(function(contract) {
				assert.notEqual(contract, 0x0, 'Has token contract address');

				return tokenSaleInstance.tokenPrice();
			})
			.then(function(price) {
				assert.equal(price, tokenPrice, 'Token price is correct');
			})
	});
});