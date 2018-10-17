var SuarCoin = artifacts.require('./SuarCoin.sol');

contract('SuarCoin', function (accounts) {
	var tokenInstance;

	it ('Initializes the contract with correct values', function() {
		return SuarCoin.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.name();
		})
		.then(function(name) {
			assert.equal(name, 'SuarCoin', 'Has the correct name');
			return tokenInstance.symbol();
		})
		.then(function(symbol) {
			assert.equal(symbol, 'SRC', 'Has the correct symbol');
			return tokenInstance.standard();
		})
		.then(function(standard) {
			assert.equal(standard, 'SuarCoin v1.0.0', 'Has the correct standard');
		})
	});

	it ('Allocates the initial supply upon deployment', function () {
		return SuarCoin.deployed()
			.then(function (instance) {
				tokenInstance = instance;
				return tokenInstance.totalSupply();
			})
			.then(function (totalSupply) {
				assert.equal(totalSupply.toNumber(), 1000000000, 'sets the total supply to 1.000.000.000');
				return tokenInstance.balanceOf(accounts[0]);
			})
			.then(function (adminBalance) {
				assert.equal(adminBalance.toNumber(), 1000000000, 'It allocates the initial supply to the admin account');
			})
	});

	it ('Transfers token ownership', function () {
		return SuarCoin.deployed()
			.then (function(instance) {
				tokenInstance = instance;
				return tokenInstance.transfer.call(accounts[1], 9999999999999999999);
			})
			.then (assert.fail)
			.catch (function (error) {
				assert (error.message.indexOf('revert') >= 0, 'error message must contain revert');
				return tokenInstance.transfer.call(accounts[1], 100000000, { from: accounts[0] })
			})
			.then (function (success) {
				assert.equal(success, true, 'It returns true');
				return tokenInstance.transfer(accounts[1], 100000000, { from: accounts[0] });
			})
			.then (function (receipt) {
				assert.equal(receipt.logs.length, 1, 'Triggers one event');
				assert.equal(receipt.logs[0].event, 'Transfer', 'Should be the "Transfer" event');
				assert.equal(receipt.logs[0].args._from, accounts[0], 'Logs the account the tokens are transferred from');
				assert.equal(receipt.logs[0].args._to, accounts[1], 'Logs the account the tokens are transferred to');
				assert.equal(receipt.logs[0].args._value, 100000000, 'Logs the transfer amount');

				return tokenInstance.balanceOf(accounts[1])
			})
			.then (function (balance) {
				assert.equal(balance.toNumber(), 100000000, 'Adds the amount to the receiving account');
				return tokenInstance.balanceOf(accounts[0]);
			})
			.then (function (balance) {
				assert.equal(balance.toNumber(), 900000000, 'deducts the amount from the sending account')
			});
	});

	it ('Approves tokens for delegated transfers', function () {
		return SuarCoin.deployed()
			.then (function(instance) {
				tokenInstance = instance;
				return tokenInstance.approve.call(accounts[1], 100);
			})
			.then (function (success) {
				assert.equal(success, true, 'Transfer returns true')
			})
	})
});