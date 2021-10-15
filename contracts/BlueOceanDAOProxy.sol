/*

  << Project BlueOcean DAO Proxy >>

*/

pragma solidity 0.4.23;

import "./dao/DelegateProxy.sol";

/**
 * @title BlueOceanDAOProxy
 * @author Project BlueOcean Developers
 */
contract BlueOceanDAOProxy is DelegateProxy {

    constructor ()
        public
    {
        owner = msg.sender;
    }

}
