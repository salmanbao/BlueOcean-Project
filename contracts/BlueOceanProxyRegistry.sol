/*

  << Project BlueOcean Proxy Registry >>

*/

pragma solidity 0.4.23;

import "./registry/ProxyRegistry.sol";
import "./registry/AuthenticatedProxy.sol";

/**
 * @title BlueOceanProxyRegistry
 * @author Project BlueOcean Developers
 */
contract BlueOceanProxyRegistry is ProxyRegistry {

    string public constant name = "Project BlueOcean Proxy Registry";

    /* Whether the initial auth address has been set. */
    bool public initialAddressSet = false;

    constructor ()
        public
    {
        delegateProxyImplementation = new AuthenticatedProxy();
    }

    /** 
     * Grant authentication to the initial Exchange protocol contract
     *
     * @dev No delay, can only be called once - after that the standard registry process with a delay must be used
     * @param authAddress Address of the contract to grant authentication
     */
    function grantInitialAuthentication (address authAddress)
        onlyOwner
        public
    {
        require(!initialAddressSet);
        initialAddressSet = true;
        contracts[authAddress] = true;
    }

}
