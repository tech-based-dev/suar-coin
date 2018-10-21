App = {
	web3Provider: null,
	contracts: {},
	account: '0x0',
	loading: false,
	tokenPrice: 490000000000000,
	tokensSold: 0,
	tokensAvailable: 400000000,

	init: function () {
		return App.initWeb3();
	},
	initWeb3: function () {
		if (typeof web3 !== 'undefined') {
			App.web3Provider = web3.currentProvider;
		  	web3 = new Web3(web3.currentProvider);
		} else {
			App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545");
		  	web3 = new Web3(App.web3Provider);
		}

		return App.initContracts();
	},
	initContracts: function () {
		$.getJSON('SuarCoinSale.json', function (suarCoinSale) {
			App.contracts.SuarCoinSale = TruffleContract(suarCoinSale);
			App.contracts.SuarCoinSale.setProvider(App.web3Provider);
			App.contracts.SuarCoinSale
				.deployed()
				.then(function (suarCoinSale) {
					console.log('suarCoinSale address', suarCoinSale.address)
				});
			})
			.done(function () {
				$.getJSON('SuarCoin.json', function (suarCoin) {
					App.contracts.SuarCoin = TruffleContract(suarCoin);
					App.contracts.SuarCoin.setProvider(App.web3Provider);
					App.contracts.SuarCoin.deployed()
						.then(function (suarCoin) {
							console.log('suarCoin address', suarCoin.address)
						})
				});

				App.listenForEvents();

				return App.render();
			});
	},

	listenForEvents: function () {
		App.contracts.SuarCoinSale.deployed()
			.then(function (instance) {
				instance.Sell({}, {
					fromBlock: 0, 
					toBlock: 'latest'
				})
				.watch(function (error, event) {
					App.render();
				})
			})
	},

	render: function () {
		if (App.loading) {
			return;
		}

		App.loading = true;

		var loader = $('#loader');
		var content = $('#content');

		loader.show();
		content.hide();

		web3.eth.getCoinbase(function (err, account) {
			if (err === null) {
				App.account = account;
				$('#accountAddress').html('Your account: ' + account);
			}
		});

		App.contracts.SuarCoinSale.deployed()
			.then(function (instance) {
				suarCoinSaleInstance = instance;

				return suarCoinSaleInstance.tokenPrice();
			})
			.then(function (price) {
				App.tokenPrice = price;

				$('.token-price').html(web3.fromWei(App.tokenPrice, 'ether').toNumber());

				return suarCoinSaleInstance.tokensSold();
			})
			.then(function (sold) {
				App.tokensSold = sold.toNumber();

				$('.tokens-sold').html(App.tokensSold);
				$('.tokens-available').html(App.tokensAvailable);

				var progressPercent = (App.tokensSold / App.tokensAvailable) * 100;
				$('#progress').css('width', progressPercent + '%');

				App.contracts.SuarCoin.deployed()
					.then(function (instance) {
						suarCoinInstance = instance;

						return suarCoinInstance.balanceOf(App.account);
					})
					.then(function (balance) {

						$('#suarcoin-balance').html(balance.toNumber());

						App.loading = false;
						loader.hide();
						content.show();
					})
			})

		App.loading = false;
		loader.hide();
		content.show();
	},
	buyTokens: function () {
		$('#content').hide();
		$('#loader').show();

		var numberOfTokens = $('#numberOfTokens').val();

		App.contracts.SuarCoinSale.deployed()
			.then(function (instance) {
				return instance.buyTokens(numberOfTokens, {
					from: App.account,
					value: numberOfTokens * App.tokenPrice,
					gasLimit: 10000000
				});
			})
			then(function (result) {
				console.log('Tokens bought ... ' + numberOfTokens);
				$('form').trigger('reset');
				// $('#loader').hide();
				// $('#content').show();
				// wait for selle vent
			})
	}
}

$(document).ready(function() {
	App.init();
})