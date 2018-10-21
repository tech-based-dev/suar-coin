var SuarCoin = artifacts.require('./SuarCoin.sol');

contract('SuarCoin', function (accounts) {
	var tokenInstance;

	it ('Initializes the contract with correct values', function() {
		return SuarCoin.deployed()
			.then(function(instance) {
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

	it ('Transfers token ownership', () => {
		return SuarCoin.deployed()
			.then ((instance) => {
				tokenInstance = instance;

				return tokenInstance.transfer.call(accounts[1], 9999999999999999999);
			})
			.then (assert.fail)
			.catch (function (error) {
				assert (error.message.indexOf('revert') >= 0, 'error message must contain revert');

				return tokenInstance.transfer.call(accounts[1], 100000000, { from: accounts[0] })
			})
			.then ((success) => {
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
				assert.equal(success, true, 'Transfer returns true');
				
				return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
			})
			.then (function (receipt) {
				assert.equal(receipt.logs.length, 1, 'Triggers one event');
				assert.equal(receipt.logs[0].event, 'Approval', 'Should be the "Transfer" event');
				assert.equal(receipt.logs[0].args._owner, accounts[0], 'Logs the account the tokens are transferred from');
				assert.equal(receipt.logs[0].args._spender, accounts[1], 'Logs the account the tokens are transferred to');
				assert.equal(receipt.logs[0].args._value, 100, 'Logs the transfer amount');

				return tokenInstance.allowance(accounts[0], accounts[1]);
			})
			.then (function(allowance) {
				assert.equal(allowance.toNumber(), 100, 'Stores the allowance for delegated transfer');
			})
	})

	it ('Handles delegated token transfers', function () {
		return SuarCoin.deployed()
			.then (function(instance) {
				tokenInstance = instance;
				fromAccount = accounts[2];
				toAccount = accounts[3];
				spenderAccount = accounts[4];

				// Transfer 100 tokens TO fromAccount
				return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
			})
			.then(function (receipt) {
				return tokenInstance.approve(spenderAccount, 10, { from: fromAccount });
			})
			.then(function (receipt) {
				return tokenInstance.transferFrom(fromAccount, toAccount, 101, { from: spenderAccount });
			})
			.then(assert.fail).catch(function (error) {
				assert(error.message.indexOf('revert') >= 0, 'Cannot transfer value larger than balance');
				return tokenInstance.transferFrom(fromAccount, toAccount, 11, { from: spenderAccount });
			})
			.then(assert.fail).catch(function (error) {
				assert(error.message.indexOf('revert') >= 0, 'Cannot transfer value larger than the approved amount');
				return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spenderAccount });
			})
			.then(function (success) {
				assert.equal(success, true, 'Delegated transfer success');

				return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spenderAccount });
			})
			.then(function (receipt) {
				assert.equal(receipt.logs.length, 1, 'Triggers one event');
				assert.equal(receipt.logs[0].event, 'Transfer', 'Should be the "Transfer" event');
				assert.equal(receipt.logs[0].args._from, fromAccount, 'Logs the account the tokens are transferred from');
				assert.equal(receipt.logs[0].args._to, toAccount, 'Logs the account the tokens are transferred to');
				assert.equal(receipt.logs[0].args._value, 10, 'Logs the transfer amount');

				return tokenInstance.balanceOf(fromAccount);
			})
			.then(function (balance) {
				assert.equal(balance.toNumber(), 90, 'Deducts the amount from the sending account');

				return tokenInstance.balanceOf(toAccount);
			})
			.then(function (balance) {
				assert.equal(balance.toNumber(), 10, 'Transfered amount to the receiver');

				return tokenInstance.allowance(fromAccount, spenderAccount);
			})
			.then(function (allowance) {
				assert.equal(allowance.toNumber(), 0, 'Remaining allowance');
			})
	})
});