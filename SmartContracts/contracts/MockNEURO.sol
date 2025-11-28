// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockNEURO
 * @dev Mock ERC20 token for testing Provena system on NeuroWeb testnet
 * 
 * This token mimics the actual NEURO token used on NeuroWeb parachain.
 * It allows minting for testing purposes only.
 * 
 * On mainnet, use the real NEURO token contract address.
 */
contract MockNEURO is ERC20, Ownable {
    // Track minting history for transparency
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor() ERC20("NeuroWeb Token", "NEURO") Ownable(msg.sender) {
        // Initial supply: 100M NEURO
        _mint(msg.sender, 100_000_000 * 10 ** decimals());
    }

    /**
     * @dev Mint new tokens (only owner - for testing)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (in wei)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Burn tokens from caller's account
     * @param amount Amount of tokens to burn (in wei)
     */
    function burn(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Burn tokens from a specific account (only owner)
     * @param account Account to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address account, uint256 amount) external onlyOwner {
        require(account != address(0), "Cannot burn from zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(account) >= amount, "Insufficient balance");
        
        _burn(account, amount);
        emit TokensBurned(account, amount);
    }

    /**
     * @dev Get token decimals
     * NEURO uses 18 decimals like Ethereum
     */
    function decimals() public view override pure returns (uint8) {
        return 18;
    }

    /**
     * @dev Get token symbol
     */
    function symbol() public view override pure returns (string memory) {
        return "NEURO";
    }

    /**
     * @dev Get token name
     */
    function name() public view override pure returns (string memory) {
        return "NeuroWeb Token";
    }
}
