// SPDX-License-Identifier: MIT
pragma solidity  >= 0.8.23 < 0.9.0;

import { RedBalloon } from "./RedBalloon.sol";

contract TreasureHunt {
    address public winner = address(0x0);
    RedBalloon[] public balloons;

    constructor(RedBalloon[] memory _balloons) payable {
        balloons = _balloons;
    }

    function getBalloons() public view returns (RedBalloon[] memory) {
        return balloons;
    }

    error InsufficientBalloons(uint256 missingIndex);

    function claimWin(address candidate) public {
        for (uint256 i = 0; i < balloons.length; i++) {
            // Then, ensure the claim worked:
            if (balloons[i].holder() != candidate) {
                revert InsufficientBalloons(i);
            }
        }

        winner = candidate;
        transferWinningFunds();
    }

    function hasWon(address candidate) public view returns (bool) {
        return candidate == winner;
    }

    error FailedToFund(address recipient);

    function transferWinningFunds() private {
        if (address(this).balance > 0) {
            (bool sent,) = winner.call{ value: address(this).balance }(""); // Returns false on failure
            if (!sent) {
                revert FailedToFund(winner);
            }
        }
    }
}
