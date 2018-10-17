var SuarCoinSale = artifacts.require('./SuarCoinSale.sol');

contract('SuarCoinSale', function (accounts) {
	var tokenSaleInstance;
	var buyer = accounts[1];
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

	it ('Facilitates token buying', function() {
		return SuarCoinSale.deployed()
			.then(function(instance) {
				tokenSaleInstance = instance; 
				var numberOfTokens = 10;
				var value = numberOfTokens * tokenPrice;

				return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: value });
			})
			.then(function(receipt) {
				return tokenSaleInstance.tokenSold();
			})
			.then(function(amount) {
				assert.equal(amount.toNumber(), numberOfTokens, 'Increments the number of token sold');
			})
		});
});