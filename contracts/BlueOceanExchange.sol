/*

  << Project BlueOcean Exchange >>

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
     * @param registryAddress Address of the registry instance which this Exchange instance will use
     * @param tokenAddress Address of the token used for protocol fees
     */
    constructor (ProxyRegistry registryAddress, TokenTransferProxy tokenTransferProxyAddress, ERC20 tokenAddress, address protocolFeeAddress) public {
        registry = registryAddress;
        tokenTransferProxy = tokenTransferProxyAddress;
        exchangeToken = tokenAddress;
        protocolFeeRecipient = protocolFeeAddress;
        owner = msg.sender;
    }

}
