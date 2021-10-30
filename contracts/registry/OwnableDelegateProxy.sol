/*

  BlueOceanOwnableDelegateProxy

*/

pragma solidity 0.4.23;

import "./proxy/OwnedUpgradeabilityProxy.sol";

contract OwnableDelegateProxy is OwnedUpgradeabilityProxy {

    constructor(
        address owner,
        address initialImplementation,
        bytes calldata
    ) public {
        setUpgradeabilityOwner(owner);
        _upgradeTo(initialImplementation);
        /*
         * This call will set this newly created contract address as a current context
         * and delegate call to AuthenticatedProxy smart contract
         */
        require(initialImplementation.delegatecall(calldata));
    }
}
