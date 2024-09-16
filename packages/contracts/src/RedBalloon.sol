// SPDX-License-Identifier: MIT
pragma solidity  >= 0.8.23 < 0.9.0;

import  "@openzeppelin/contracts/access/Ownable.sol";

contract RedBalloon is Ownable {
    // owner is a Gator
    // The special item itself is delegated only the right to call assignHolder.
    // This way even a private key QR code can grant this inexclusive right.
    address public holder;
    int8 public index;

    //TODO it would be good to consider doing an assertion of the initialOwner being a gator.
    constructor(address initialOwner, int8 i) Ownable(initialOwner) { 
        index = i;
    }

    function assignHolder(address newHolder) public onlyOwner {
        holder = newHolder;
    }
}
