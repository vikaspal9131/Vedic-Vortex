// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SkillFiToken is ERC20 {
    constructor() ERC20("SkillFi", "SFT") {
        _mint(msg.sender, 1000000 * 10 ** decimals()); // 1M tokens
    }

    function rewardUser(address recipient, uint256 amount) public {
        _transfer(msg.sender, recipient, amount);
    }
}
