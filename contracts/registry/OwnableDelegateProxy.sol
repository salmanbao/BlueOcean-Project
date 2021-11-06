/*

  BlueOceanOwnableDelegateProxy

*/

pragma solidity 0.4.23;

import "./proxy/OwnedUpgradeabilityProxy.sol";

contract OwnableDelegateProxy is OwnedUpgradeabilityProxy {

    constructor(
        address owner,
        address initialImplementation, // AuthenticatedProxy instance
        bytes calldata
    ) public {
        setUpgradeabilityOwner(owner);
        _upgradeTo(initialImplementation);
        /*
         * This call will set this newly created contract address as a current context
         * and delegate call to AuthenticatedProxy smart contract 
         * OwnableDelegateProxy smart contract will be the storage contract
         * AuthenticatedProxy smart contract will be the logic/implementation contract
         */
        require(initialImplementation.delegatecall(calldata));
    }
}
