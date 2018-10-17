pragma solidity ^0.4.23;

contract SuarCoin {
	string 	public name = 'SuarCoin';
	string 	public symbol = 'SRC';
	string 	public standard = 'SuarCoin v1.0.0';
	uint256 public totalSupply;

	event Transfer(
		address indexed _from,
		address indexed _to,
		uint256 _value
	);

	mapping(address => uint256) public balanceOf;

	constructor (uint256 _initialSupply) public {
		balanceOf[msg.sender] = _initialSupply;

		totalSupply = _initialSupply;
	}

	function transfer (address _to, uint256 _value) public returns (bool success) {
		require(balanceOf[msg.sender] >= _value);

		balanceOf[msg.sender] -= _value;
		balanceOf[_to] += _value;

		Transfer(msg.sender, _to, _value);

		return true;
	}

	function approve (address _spender, uint256 _value) public returns (bool success) {
		
	}
}