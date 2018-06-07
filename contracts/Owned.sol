pragma solidity ^0.4.24;

// ----------------------------------------------------------------------------
// Owned contract
// ----------------------------------------------------------------------------
contract Owned {
  address public owner;
  address public newOwner;

  event OwnershipTransferred(address indexed _from, address indexed _to);

  constructor() public {
    owner = msg.sender;
  }

  modifier onlyOwner {
    require(msg.sender == owner);
    _;
  }

  modifier onlyNewOwner {
    require(msg.sender == newOwner);
    _;
  }

  function transferOwnership(address _newOwner) public onlyOwner {
    newOwner = _newOwner;
  }

  function acceptOwnership() public onlyNewOwner {
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
    newOwner = address(0);
  }

  function disown() public onlyOwner {
    owner = address(0);
    newOwner = msg.sender;
    emit OwnershipTransferred(msg.sender, address(0));
  }

  function rejectOwnership() public onlyNewOwner {
    newOwner = address(0);
  }
}
