/*

  << Project BlueOcean Exchange >>

  Note: Before deploying this smart contract we need to deploy ProxyRegistry , TokenTransferProxy and ERC20 smart contracts.
  This smart contract will be the entry point for exchange.

*/

pragma solidity 0.4.23;

import "./exchange/Exchange.sol";

/**
 * @title BlueOceanExchange
 * @author Project BlueOcean Developers
 */
contract BlueOceanExchange is Exchange {
    string public constant name = "Project BlueOcean Exchange";

    string public constant version = "1.0";

    string public constant codename = "Lambton Worm";

    /**
     * @dev Initialize a BlueOceanExchange instance
     * @param registryAddress Address of the ProxyRegistry instance which this Exchange instance will use
     * @param tokenTransferProxyAddress Address of the TokenTransferProxy instance
     * @param tokenAddress Address of the token used in exchange
     * @param protocolFeeAddress Address of the account to which protocol fee will go
     */
    constructor(
        ProxyRegistry registryAddress,
        TokenTransferProxy tokenTransferProxyAddress,
        ERC20 tokenAddress,
        address protocolFeeAddress
    ) public {
        registry = registryAddress;
        tokenTransferProxy = tokenTransferProxyAddress;
        exchangeToken = tokenAddress;
        protocolFeeRecipient = protocolFeeAddress;
        owner = msg.sender;
    }
}
