// Sources flattened with hardhat v2.6.5 https://hardhat.org

// File contracts/TestStatic.sol

/*

  << Test Static Calls >>

*/

pragma solidity 0.4.23;

/**
  * @title TestStatic
  * @author Project BlueOcean Developers
  */
contract TestStatic {

    /**
      * @dev Initialize contract
      */
    constructor () public {
    }

    function alwaysSucceed()
        public
        pure
    {
        require(true);
    }

    function alwaysFail()
        public
        pure
    {
        require(false);
    }

    function requireMinimumLength(bytes calldata)
        public
        pure
    {
        require(calldata.length > 2);
    }

}
