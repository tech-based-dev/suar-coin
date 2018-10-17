pragma solidity ^0.4.23;

import './SuarCoin.sol';

contract SuarCoinSale {
	address admin;
	SuarCoin public tokenContract;
	uint256 public tokenPrice;

	constructor (SuarCoin _tokenContract, uint256 _tokenPrice) public {
		admin = msg.sender;	
		tokenContract = _tokenContract;
		tokenPrice = _tokenPrice;
	}
}