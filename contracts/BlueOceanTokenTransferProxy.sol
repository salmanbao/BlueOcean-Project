/*

  << BlueOcean Token Transfer Proxy >.

*/

pragma solidity 0.4.23;

import "./registry/TokenTransferProxy.sol";

contract BlueOceanTokenTransferProxy is TokenTransferProxy {

    constructor (ProxyRegistry registryAddr)
        public
    {
        registry = registryAddr;
    }

}
