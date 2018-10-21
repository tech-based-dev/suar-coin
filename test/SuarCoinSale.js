var SuarCoin = artifacts.require('./SuarCoin.sol');
var SuarCoinSale = artifacts.require('./SuarCoinSale.sol');

contract('SuarCoinSale', function (accounts) {
	var numberOfTokens;
	var tokenInstance;
	var tokenSaleInstance;
	var admin = accounts[0];
	var buyer = accounts[1];
	var tokensAvailable = 400000000;
	var tokenPrice = 490000000000000;

	it('Initializes the contract with correct values', function () {
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

	it('Facilitates token buying', function () {
		return SuarCoin.deployed()
			.then(function(instance) {
				tokenInstance = instance; 
				return SuarCoinSale.deployed();
			})
			.then(function(instance) {
				tokenSaleInstance = instance;

				return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin });
			})
			.then(function(receipt) {
				numberOfTokens = 10;

				return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice });
			})
			.then(function(receipt) {
				assert.equal(receipt.logs.length, 1, 'Triggers one event');
				assert.equal(receipt.logs[0].event, 'Sell', 'Should be the "Sell" event');
				assert.equal(receipt.logs[0].args._buyer, buyer, 'Logs the account who buys the token');
				assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'Logs the number of tokens bought');

				return tokenSaleInstance.tokensSold();
			})
			.then(function(tokens) {
				assert.equal(tokens, numberOfTokens, 'Number of tokens the same token sold');

				return tokenInstance.balanceOf(buyer);
			})
			.then(function(balance) {
				assert.equal(balance.toNumber(), numberOfTokens, 'Increments the number of token sold');

				return tokenInstance.balanceOf(tokenSaleInstance.address);
			})
			.then(function(balance) {
				assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);

				return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
			})
			.then(assert.fail).catch(function (error) {
				assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');

				return tokenSaleInstance.buyTokens(400000001, { from: buyer, value: numberOfTokens * tokenPrice });
			})
			.then(assert.fail).catch(function (error) {
				assert(error.message.indexOf('revert') >= 0, 'msg.value must not exceed to the amount of available tokens');
			});
		});

	it('Ends token sale', function () {
		return SuarCoin.deployed()
			.then(function(instance) {
				tokenInstance = instance; 
				
				return SuarCoinSale.deployed();
			})
			.then(function(instance) {
				tokenSaleInstance = instance;
				return tokenSaleInstance.endSale({ from: buyer });
			})
			.then(assert.fail).catch(function (error) {
				assert(error.message.indexOf('revert') >= 0, 'Must be admin to end sale');

				return tokenSaleInstance.endSale({ from: admin });
			})
			.then(function(receipt) {
				return tokenInstance.balanceOf(admin);
			})
			.then(function(balance) {
				assert.equal(balance.toNumber(), 999999990, 'returns all unsold suarcoin to admin');

				return tokenInstance.balanceOf(tokenSaleInstance.address);
			})
			.then(function(balance) {
				assert.equal(balance.toNumber(), 0);
			});
			
		});
});