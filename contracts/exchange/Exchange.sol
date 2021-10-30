/*
  
  Exchange contract. This is an outer contract with public or convenience functions and includes no state-modifying functions.
 
*/

pragma solidity 0.4.23;

import "./ExchangeCore.sol";

/**
 * @title Exchange
 * @author Project BlueOcean Developers
 */
contract Exchange is ExchangeCore {
    /**
     * @dev Call guardedArrayReplace - library function exposed for testing.
     */

    function guardedArrayReplace(
        bytes array,
        bytes desired,
        bytes mask
    ) public pure returns (bytes) {
        ArrayUtils.guardedArrayReplace(array, desired, mask);
        return array;
    }

    /**
     * Test copy byte array
     *
     * @param arrToCopy Array to copy
     * @return byte array
     */
    function testCopy(bytes arrToCopy) public pure returns (bytes) {
        bytes memory arr = new bytes(arrToCopy.length);
        uint256 index;
        assembly {
            index := add(arr, 0x20)
        }
        ArrayUtils.unsafeWriteBytes(index, arrToCopy);
        return arr;
    }

    /**
     * Test write address to bytes
     *
     * @param addr Address to write
     * @return byte array
     */
    function testCopyAddress(address addr) public pure returns (bytes) {
        bytes memory arr = new bytes(0x14);
        uint256 index;
        assembly {
            index := add(arr, 0x20)
        }
        ArrayUtils.unsafeWriteAddress(index, addr);
        return arr;
    }

    /// @notice This function will help to calculate final price of a trade between assets.
    /// @dev Call calculateFinalPrice - library function exposed for testing.
    /// @param side It tells about side (BUY/SELL)
    /// @param saleKind It tells about sale kind (FixedPrice / Dutch Auction)
    /// @param basePrice Order base price
    /// @param extra Order extra price data
    /// @param listingTime Order listing time in unix timestamp
    /// @param expirationTime Order expiration time. It will be zero for fixed price.
    /// @return price return the final price according to the parameters
    function calculateFinalPrice(
        SaleKindInterface.Side side,
        SaleKindInterface.SaleKind saleKind,
        uint256 basePrice,
        uint256 extra,
        uint256 listingTime,
        uint256 expirationTime
    ) public view returns (uint256) {
        return
            SaleKindInterface.calculateFinalPrice(
                side,
                saleKind,
                basePrice,
                extra,
                listingTime,
                expirationTime
            );
    }

    /**
     * @dev Call hashOrder - Solidity ABI encoding limitation workaround, hopefully temporary.
     * @param addrs addresses for making Order struct in a single array @see Order strcut
     * addrs[0] => exhange address
     * addrs[1] => maker address
     * addrs[2] => taker address
     * addrs[3] => feeRecipient address
     * addrs[4] => target address
     * addrs[5] => staticTarget address
     * addrs[6] => paymentToken address
     * @param uints all uints in a sigle array required for making Order struct @see Order strcut
     * uints[0] => makerRelayerFee
     * uints[1] => takerRelayerFee
     * uints[2] => makerProtocolFee
     * uints[3] => takerProtocolFee
     * uints[4] => basePrice
     * uints[5] => auction extra parameter
     * uints[6] => listingTime
     * uints[7] => expirationTime
     * uints[8] => salt
     * @param feeMethod Fee method (protocol token or split fee))
     * @param side It tells about side (BUY/SELL)
     * @param saleKind It tells about sale kind (FixedPrice / Dutch Auction)
     * @param howToCall HowToCall (CALL/DELEGATECALL)
     * @param calldata Calldata.
     * @param replacementPattern Calldata replacement pattern, or an empty byte array for no replacement.
     * @param staticExtradata Static call extra data.
     * @return hash of order
     */
    function hashOrder_(
        address[7] addrs,
        uint256[9] uints,
        FeeMethod feeMethod,
        SaleKindInterface.Side side,
        SaleKindInterface.SaleKind saleKind,
        AuthenticatedProxy.HowToCall howToCall,
        bytes calldata,
        bytes replacementPattern,
        bytes staticExtradata
    ) public pure returns (bytes32) {
        return
            hashOrder(
                Order(
                    addrs[0],
                    addrs[1],
                    addrs[2],
                    uints[0],
                    uints[1],
                    uints[2],
                    uints[3],
                    addrs[3],
                    feeMethod,
                    side,
                    saleKind,
                    addrs[4],
                    howToCall,
                    calldata,
                    replacementPattern,
                    addrs[5],
                    staticExtradata,
                    ERC20(addrs[6]),
                    uints[4],
                    uints[5],
                    uints[6],
                    uints[7],
                    uints[8]
                )
            );
    }

    /**
     * @dev Call hashToSign - Solidity ABI encoding limitation workaround, hopefully temporary.
     * @param addrs addresses for making Order struct in a single array @see Order strcut
     * addrs[0] => exhange address
     * addrs[1] => maker address
     * addrs[2] => taker address
     * addrs[3] => feeRecipient address
     * addrs[4] => target address
     * addrs[5] => staticTarget address
     * addrs[6] => paymentToken address
     * @param uints all uints in a sigle array required for making Order struct @see Order strcut
     * uints[0] => makerRelayerFee
     * uints[1] => takerRelayerFee
     * uints[2] => makerProtocolFee
     * uints[3] => takerProtocolFee
     * uints[4] => basePrice
     * uints[5] => auction extra parameter
     * uints[6] => listingTime
     * uints[7] => expirationTime
     * uints[8] => salt
     * @param feeMethod Fee method (protocol token or split fee))
     * @param side It tells about side (BUY/SELL)
     * @param saleKind It tells about sale kind (FixedPrice / Dutch Auction)
     * @param howToCall HowToCall (CALL/DELEGATECALL)
     * @param calldata Calldata.
     * @param replacementPattern Calldata replacement pattern, or an empty byte array for no replacement.
     * @param staticExtradata Static call extra data.
     * @return signed hash
     */
    function hashToSign_(
        address[7] addrs,
        uint256[9] uints,
        FeeMethod feeMethod,
        SaleKindInterface.Side side,
        SaleKindInterface.SaleKind saleKind,
        AuthenticatedProxy.HowToCall howToCall,
        bytes calldata,
        bytes replacementPattern,
        bytes staticExtradata
    ) public pure returns (bytes32) {
        return
            hashToSign(
                Order(
                    addrs[0],
                    addrs[1],
                    addrs[2],
                    uints[0],
                    uints[1],
                    uints[2],
                    uints[3],
                    addrs[3],
                    feeMethod,
                    side,
                    saleKind,
                    addrs[4],
                    howToCall,
                    calldata,
                    replacementPattern,
                    addrs[5],
                    staticExtradata,
                    ERC20(addrs[6]),
                    uints[4],
                    uints[5],
                    uints[6],
                    uints[7],
                    uints[8]
                )
            );
    }

    /**
     * @notice This function will help to validate order parameters.
     * @dev Call validateOrderParameters - Solidity ABI encoding limitation workaround, hopefully temporary.
     * @param addrs addresses for making Order struct in a single array @see Order strcut
     * addrs[0] => exhange address
     * addrs[1] => maker address
     * addrs[2] => taker address
     * addrs[3] => feeRecipient address
     * addrs[4] => target address
     * addrs[5] => staticTarget address
     * addrs[6] => paymentToken address
     * @param uints all uints in a sigle array required for making Order struct @see Order strcut
     * uints[0] => makerRelayerFee
     * uints[1] => takerRelayerFee
     * uints[2] => makerProtocolFee
     * uints[3] => takerProtocolFee
     * uints[4] => basePrice
     * uints[5] => auction extra parameter
     * uints[6] => listingTime
     * uints[7] => expirationTime
     * uints[8] => salt
     * @param feeMethod Fee method (protocol token or split fee))
     * @param side It tells about side (BUY/SELL)
     * @param saleKind It tells about sale kind (FixedPrice / Dutch Auction)
     * @param howToCall HowToCall (CALL/DELEGATECALL)
     * @param calldata Calldata.
     * @param replacementPattern Calldata replacement pattern, or an empty byte array for no replacement.
     * @param staticExtradata Static call extra data.
     * @return price return the boolean according to the parameters
     */
    function validateOrderParameters_(
        address[7] addrs,
        uint256[9] uints,
        FeeMethod feeMethod,
        SaleKindInterface.Side side,
        SaleKindInterface.SaleKind saleKind,
        AuthenticatedProxy.HowToCall howToCall,
        bytes calldata,
        bytes replacementPattern,
        bytes staticExtradata
    ) public view returns (bool) {
        Order memory order = Order(
            addrs[0],
            addrs[1],
            addrs[2],
            uints[0],
            uints[1],
            uints[2],
            uints[3],
            addrs[3],
            feeMethod,
            side,
            saleKind,
            addrs[4],
            howToCall,
            calldata,
            replacementPattern,
            addrs[5],
            staticExtradata,
            ERC20(addrs[6]),
            uints[4],
            uints[5],
            uints[6],
            uints[7],
            uints[8]
        );
        return validateOrderParameters(order);
    }

    /**
     * @dev Call validateOrder - Solidity ABI encoding limitation workaround, hopefully temporary.
     * @param addrs addresses for making Order struct in a single array @see Order strcut
     * addrs[0] => exhange address
     * addrs[1] => maker address
     * addrs[2] => taker address
     * addrs[3] => feeRecipient address
     * addrs[4] => target address
     * addrs[5] => staticTarget address
     * addrs[6] => paymentToken address
     * @param uints all uints in a sigle array required for making Order struct @see Order strcut
     * uints[0] => makerRelayerFee
     * uints[1] => takerRelayerFee
     * uints[2] => makerProtocolFee
     * uints[3] => takerProtocolFee
     * uints[4] => basePrice
     * uints[5] => auction extra parameter
     * uints[6] => listingTime
     * uints[7] => expirationTime
     * uints[8] => salt
     * @param feeMethod Fee method (protocol token or split fee))
     * @param side It tells about side (BUY/SELL)
     * @param saleKind It tells about sale kind (FixedPrice / Dutch Auction)
     * @param howToCall HowToCall (CALL/DELEGATECALL)
     * @param calldata Calldata.
     * @param replacementPattern Calldata replacement pattern, or an empty byte array for no replacement.
     * @param staticExtradata Calldata replacement pattern.
     * @param v signature parameter
     * @param r signature parameter.
     * @param s signature parameter.
     */
    function validateOrder_(
        address[7] addrs,
        uint256[9] uints,
        FeeMethod feeMethod,
        SaleKindInterface.Side side,
        SaleKindInterface.SaleKind saleKind,
        AuthenticatedProxy.HowToCall howToCall,
        bytes calldata,
        bytes replacementPattern,
        bytes staticExtradata,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view returns (bool) {
        Order memory order = Order(
            addrs[0],
            addrs[1],
            addrs[2],
            uints[0],
            uints[1],
            uints[2],
            uints[3],
            addrs[3],
            feeMethod,
            side,
            saleKind,
            addrs[4],
            howToCall,
            calldata,
            replacementPattern,
            addrs[5],
            staticExtradata,
            ERC20(addrs[6]),
            uints[4],
            uints[5],
            uints[6],
            uints[7],
            uints[8]
        );
        return validateOrder(hashToSign(order), order, Sig(v, r, s));
    }

    /**
     * @dev Call approveOrder - Solidity ABI encoding limitation workaround, hopefully temporary.
     * @param addrs addresses for making Order struct in a single array @see Order strcut
     * addrs[0] => exhange address
     * addrs[1] => maker address
     * addrs[2] => taker address
     * addrs[3] => feeRecipient address
     * addrs[4] => target address
     * addrs[5] => staticTarget address
     * addrs[6] => paymentToken address
     * @param uints all uints in a sigle array required for making Order struct @see Order strcut
     * uints[0] => makerRelayerFee
     * uints[1] => takerRelayerFee
     * uints[2] => makerProtocolFee
     * uints[3] => takerProtocolFee
     * uints[4] => basePrice
     * uints[5] => auction extra parameter
     * uints[6] => listingTime
     * uints[7] => expirationTime
     * uints[8] => salt
     * @param feeMethod Fee method (protocol token or split fee))
     * @param side It tells about side (BUY/SELL)
     * @param saleKind It tells about sale kind (FixedPrice / Dutch Auction)
     * @param howToCall HowToCall (CALL/DELEGATECALL)
     * @param calldata Calldata.
     * @param replacementPattern Calldata replacement pattern, or an empty byte array for no replacement.
     * @param staticExtradata Calldata replacement pattern.
     * @param orderbookInclusionDesired flag for event
     */
    function approveOrder_(
        address[7] addrs,
        uint256[9] uints,
        FeeMethod feeMethod,
        SaleKindInterface.Side side,
        SaleKindInterface.SaleKind saleKind,
        AuthenticatedProxy.HowToCall howToCall,
        bytes calldata,
        bytes replacementPattern,
        bytes staticExtradata,
        bool orderbookInclusionDesired
    ) public {
        Order memory order = Order(
            addrs[0],
            addrs[1],
            addrs[2],
            uints[0],
            uints[1],
            uints[2],
            uints[3],
            addrs[3],
            feeMethod,
            side,
            saleKind,
            addrs[4],
            howToCall,
            calldata,
            replacementPattern,
            addrs[5],
            staticExtradata,
            ERC20(addrs[6]),
            uints[4],
            uints[5],
            uints[6],
            uints[7],
            uints[8]
        );
        return approveOrder(order, orderbookInclusionDesired);
    }

    /**
     * @dev Call cancelOrder - Solidity ABI encoding limitation workaround, hopefully temporary.
     * @param addrs addresses for making Order struct in a single array @see Order strcut
     * addrs[0] => exhange address
     * addrs[1] => maker address
     * addrs[2] => taker address
     * addrs[3] => feeRecipient address
     * addrs[4] => target address
     * addrs[5] => staticTarget address
     * addrs[6] => paymentToken address
     * @param uints all uints in a sigle array required for making Order struct @see Order strcut
     * uints[0] => makerRelayerFee
     * uints[1] => takerRelayerFee
     * uints[2] => makerProtocolFee
     * uints[3] => takerProtocolFee
     * uints[4] => basePrice
     * uints[5] => auction extra parameter
     * uints[6] => listingTime
     * uints[7] => expirationTime
     * uints[8] => salt
     * @param feeMethod Fee method (protocol token or split fee))
     * @param side It tells about side (BUY/SELL)
     * @param saleKind It tells about sale kind (FixedPrice / Dutch Auction)
     * @param howToCall HowToCall (CALL/DELEGATECALL)
     * @param calldata Calldata.
     * @param replacementPattern Calldata replacement pattern, or an empty byte array for no replacement.
     * @param staticExtradata Calldata replacement pattern.
     * @param v signature parameter
     * @param r signature parameter.
     * @param s signature parameter.
     */
    function cancelOrder_(
        address[7] addrs,
        uint256[9] uints,
        FeeMethod feeMethod,
        SaleKindInterface.Side side,
        SaleKindInterface.SaleKind saleKind,
        AuthenticatedProxy.HowToCall howToCall,
        bytes calldata,
        bytes replacementPattern,
        bytes staticExtradata,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        return
            cancelOrder(
                Order(
                    addrs[0],
                    addrs[1],
                    addrs[2],
                    uints[0],
                    uints[1],
                    uints[2],
                    uints[3],
                    addrs[3],
                    feeMethod,
                    side,
                    saleKind,
                    addrs[4],
                    howToCall,
                    calldata,
                    replacementPattern,
                    addrs[5],
                    staticExtradata,
                    ERC20(addrs[6]),
                    uints[4],
                    uints[5],
                    uints[6],
                    uints[7],
                    uints[8]
                ),
                Sig(v, r, s)
            );
    }

    /**
     * @dev Call calculateCurrentPrice - Solidity ABI encoding limitation workaround, hopefully temporary.
     * @param addrs addresses for making Order struct in a single array @see Order strcut
     * addrs[0] => exhange address
     * addrs[1] => maker address
     * addrs[2] => taker address
     * addrs[3] => feeRecipient address
     * addrs[4] => target address
     * addrs[5] => staticTarget address
     * addrs[6] => paymentToken address
     * @param uints all uints in a sigle array required for making Order struct @see Order strcut
     * uints[0] => makerRelayerFee
     * uints[1] => takerRelayerFee
     * uints[2] => makerProtocolFee
     * uints[3] => takerProtocolFee
     * uints[4] => basePrice
     * uints[5] => auction extra parameter
     * uints[6] => listingTime
     * uints[7] => expirationTime
     * uints[8] => salt
     * @param feeMethod Fee method (protocol token or split fee))
     * @param side It tells about side (BUY/SELL)
     * @param saleKind It tells about sale kind (FixedPrice / Dutch Auction)
     * @param howToCall HowToCall (CALL/DELEGATECALL)
     * @param calldata Calldata.
     * @param replacementPattern Calldata replacement pattern, or an empty byte array for no replacement.
     * @param staticExtradata Calldata replacement pattern.
     */
    function calculateCurrentPrice_(
        address[7] addrs,
        uint256[9] uints,
        FeeMethod feeMethod,
        SaleKindInterface.Side side,
        SaleKindInterface.SaleKind saleKind,
        AuthenticatedProxy.HowToCall howToCall,
        bytes calldata,
        bytes replacementPattern,
        bytes staticExtradata
    ) public view returns (uint256) {
        return
            calculateCurrentPrice(
                Order(
                    addrs[0],
                    addrs[1],
                    addrs[2],
                    uints[0],
                    uints[1],
                    uints[2],
                    uints[3],
                    addrs[3],
                    feeMethod,
                    side,
                    saleKind,
                    addrs[4],
                    howToCall,
                    calldata,
                    replacementPattern,
                    addrs[5],
                    staticExtradata,
                    ERC20(addrs[6]),
                    uints[4],
                    uints[5],
                    uints[6],
                    uints[7],
                    uints[8]
                )
            );
    }

    /**
     * @dev Call ordersCanMatch - Solidity ABI encoding limitation workaround, hopefully temporary.
     * @param addrs addresses for making Order struct in a single array @see Order strcut
     * Buy Order Parameters
     * addrs[0] => exhange address
     * addrs[1] => maker address
     * addrs[2] => taker address
     * addrs[3] => feeRecipient address
     * addrs[4] => target address
     * addrs[5] => staticTarget address
     * addrs[6] => paymentToken address
     * Sell Order Parameters
     * addrs[7] => exchange address
     * addrs[8] => maker address
     * addrs[9] => taker address
     * addrs[10] => feeRecipient address
     * addrs[11] => target address
     * addrs[12] => staticTarget address
     * addrs[13] => paymentToken address
     * @param uints all uints in a sigle array required for making Order struct @see Order strcut
     * Buy Order Parameters
     * uints[0] => makerRelayerFee
     * uints[1] => takerRelayerFee
     * uints[2] => makerProtocolFee
     * uints[3] => takerProtocolFee
     * uints[4] => basePrice
     * uints[5] => auction extra parameter
     * uints[6] => listingTime
     * uints[7] => expirationTime
     * uints[8] => salt
     * Sell Order Parameters
     * uints[9] => makerRelayerFee
     * uints[10] => takerRelayerFee
     * uints[11] => makerProtocolFee
     * uints[12] => takerProtocolFee
     * uints[13] => basePrice
     * uints[14] => auction extra parameter
     * uints[15] => listingTime
     * uints[16] => expirationTime
     * uints[17] => salt
     * @param feeMethodsSidesKindsHowToCalls list of parameters for feeMethods, side, saleKinds and howToCalls
     * Buy Order Parameter
     * feeMethodsSidesKindsHowToCalls[0] => feeMethod
     * feeMethodsSidesKindsHowToCalls[1] => side
     * feeMethodsSidesKindsHowToCalls[2] => saleKind
     * feeMethodsSidesKindsHowToCalls[3] => howToCall
     * -- Sell Order Parameter
     * feeMethodsSidesKindsHowToCalls[4] => feeMethod
     * feeMethodsSidesKindsHowToCalls[5] => side
     * feeMethodsSidesKindsHowToCalls[6] => saleKind
     * feeMethodsSidesKindsHowToCalls[7] => howToCall
     * @param calldataBuy calldata for buy order
     * @param calldataSell calldata for sell order
     * @param replacementPatternBuy replacementPattern for buy order
     * @param replacementPatternSell replacementPattern for sell order
     * @param staticExtradataBuy   staticExtradata for buy order
     * @param staticExtradataSell staticExtradata for sell order
     * @return Whether the orders can be matched
     */
    function ordersCanMatch_(
        address[14] addrs,
        uint256[18] uints,
        uint8[8] feeMethodsSidesKindsHowToCalls,
        bytes calldataBuy,
        bytes calldataSell,
        bytes replacementPatternBuy,
        bytes replacementPatternSell,
        bytes staticExtradataBuy,
        bytes staticExtradataSell
    ) public view returns (bool) {
        Order memory buy = Order(
            addrs[0],
            addrs[1],
            addrs[2],
            uints[0],
            uints[1],
            uints[2],
            uints[3],
            addrs[3],
            FeeMethod(feeMethodsSidesKindsHowToCalls[0]),
            SaleKindInterface.Side(feeMethodsSidesKindsHowToCalls[1]),
            SaleKindInterface.SaleKind(feeMethodsSidesKindsHowToCalls[2]),
            addrs[4],
            AuthenticatedProxy.HowToCall(feeMethodsSidesKindsHowToCalls[3]),
            calldataBuy,
            replacementPatternBuy,
            addrs[5],
            staticExtradataBuy,
            ERC20(addrs[6]),
            uints[4],
            uints[5],
            uints[6],
            uints[7],
            uints[8]
        );
        Order memory sell = Order(
            addrs[7],
            addrs[8],
            addrs[9],
            uints[9],
            uints[10],
            uints[11],
            uints[12],
            addrs[10],
            FeeMethod(feeMethodsSidesKindsHowToCalls[4]),
            SaleKindInterface.Side(feeMethodsSidesKindsHowToCalls[5]),
            SaleKindInterface.SaleKind(feeMethodsSidesKindsHowToCalls[6]),
            addrs[11],
            AuthenticatedProxy.HowToCall(feeMethodsSidesKindsHowToCalls[7]),
            calldataSell,
            replacementPatternSell,
            addrs[12],
            staticExtradataSell,
            ERC20(addrs[13]),
            uints[13],
            uints[14],
            uints[15],
            uints[16],
            uints[17]
        );
        return ordersCanMatch(buy, sell);
    }

    /**
     * @dev Return whether or not two orders' calldata specifications can match
     * @param buyCalldata Buy-side order calldata
     * @param buyReplacementPattern Buy-side order calldata replacement mask
     * @param sellCalldata Sell-side order calldata
     * @param sellReplacementPattern Sell-side order calldata replacement mask
     * @return Whether the orders' calldata can be matched
     */
    function orderCalldataCanMatch(
        bytes buyCalldata,
        bytes buyReplacementPattern,
        bytes sellCalldata,
        bytes sellReplacementPattern
    ) public pure returns (bool) {
        if (buyReplacementPattern.length > 0) {
            ArrayUtils.guardedArrayReplace(
                buyCalldata,
                sellCalldata,
                buyReplacementPattern
            );
        }
        if (sellReplacementPattern.length > 0) {
            ArrayUtils.guardedArrayReplace(
                sellCalldata,
                buyCalldata,
                sellReplacementPattern
            );
        }
        return ArrayUtils.arrayEq(buyCalldata, sellCalldata);
    }

    /**
     * @dev Call calculateMatchPrice - Solidity ABI encoding limitation workaround, hopefully temporary.
     * @param addrs addresses for making Order struct in a single array @see Order strcut
     * Buy Order Parameters
     * addrs[0] => exhange address
     * addrs[1] => maker address
     * addrs[2] => taker address
     * addrs[3] => feeRecipient address
     * addrs[4] => target address
     * addrs[5] => staticTarget address
     * addrs[6] => paymentToken address
     * Sell Order Parameters
     * addrs[7] => exchange address
     * addrs[8] => maker address
     * addrs[9] => taker address
     * addrs[10] => feeRecipient address
     * addrs[11] => target address
     * addrs[12] => staticTarget address
     * addrs[13] => paymentToken address
     * @param uints all uints in a sigle array required for making Order struct @see Order strcut
     * Buy Order Parameters
     * uints[0] => makerRelayerFee
     * uints[1] => takerRelayerFee
     * uints[2] => makerProtocolFee
     * uints[3] => takerProtocolFee
     * uints[4] => basePrice
     * uints[5] => auction extra parameter
     * uints[6] => listingTime
     * uints[7] => expirationTime
     * uints[8] => salt
     * Sell Order Parameters
     * uints[9] => makerRelayerFee
     * uints[10] => takerRelayerFee
     * uints[11] => makerProtocolFee
     * uints[12] => takerProtocolFee
     * uints[13] => basePrice
     * uints[14] => auction extra parameter
     * uints[15] => listingTime
     * uints[16] => expirationTime
     * uints[17] => salt
     * @param feeMethodsSidesKindsHowToCalls list of parameters for feeMethods, side, saleKinds and howToCalls
     * Buy Order Parameter
     * feeMethodsSidesKindsHowToCalls[0] => feeMethod
     * feeMethodsSidesKindsHowToCalls[1] => side
     * feeMethodsSidesKindsHowToCalls[2] => saleKind
     * feeMethodsSidesKindsHowToCalls[3] => howToCall
     * Sell Order Parameter
     * feeMethodsSidesKindsHowToCalls[4] => feeMethod
     * feeMethodsSidesKindsHowToCalls[5] => side
     * feeMethodsSidesKindsHowToCalls[6] => saleKind
     * feeMethodsSidesKindsHowToCalls[7] => howToCall
     * @param calldataBuy calldata for buy order
     * @param calldataSell calldata for sell order
     * @param replacementPatternBuy replacementPattern for buy order
     * @param replacementPatternSell replacementPattern for sell order
     * @param staticExtradataBuy   staticExtradata for buy order
     * @param staticExtradataSell staticExtradata for sell order
     * @return match price for two orders
     */
    function calculateMatchPrice_(
        address[14] addrs,
        uint256[18] uints,
        uint8[8] feeMethodsSidesKindsHowToCalls,
        bytes calldataBuy,
        bytes calldataSell,
        bytes replacementPatternBuy,
        bytes replacementPatternSell,
        bytes staticExtradataBuy,
        bytes staticExtradataSell
    ) public view returns (uint256) {
        Order memory buy = Order(
            addrs[0],
            addrs[1],
            addrs[2],
            uints[0],
            uints[1],
            uints[2],
            uints[3],
            addrs[3],
            FeeMethod(feeMethodsSidesKindsHowToCalls[0]),
            SaleKindInterface.Side(feeMethodsSidesKindsHowToCalls[1]),
            SaleKindInterface.SaleKind(feeMethodsSidesKindsHowToCalls[2]),
            addrs[4],
            AuthenticatedProxy.HowToCall(feeMethodsSidesKindsHowToCalls[3]),
            calldataBuy,
            replacementPatternBuy,
            addrs[5],
            staticExtradataBuy,
            ERC20(addrs[6]),
            uints[4],
            uints[5],
            uints[6],
            uints[7],
            uints[8]
        );
        Order memory sell = Order(
            addrs[7],
            addrs[8],
            addrs[9],
            uints[9],
            uints[10],
            uints[11],
            uints[12],
            addrs[10],
            FeeMethod(feeMethodsSidesKindsHowToCalls[4]),
            SaleKindInterface.Side(feeMethodsSidesKindsHowToCalls[5]),
            SaleKindInterface.SaleKind(feeMethodsSidesKindsHowToCalls[6]),
            addrs[11],
            AuthenticatedProxy.HowToCall(feeMethodsSidesKindsHowToCalls[7]),
            calldataSell,
            replacementPatternSell,
            addrs[12],
            staticExtradataSell,
            ERC20(addrs[13]),
            uints[13],
            uints[14],
            uints[15],
            uints[16],
            uints[17]
        );
        return calculateMatchPrice(buy, sell);
    }

    /**
     * @notice Match order and perform atomic transaction to transfer asset and cost between seller and buyer.
     * @dev Call atomicMatch - Solidity ABI encoding limitation workaround, hopefully temporary.
     * @param addrs addresses for making Order struct in a single array @see Order strcut
     * Buy Order Parameters
     * addrs[0] => exhange address
     * addrs[1] => maker address
     * addrs[2] => taker address
     * addrs[3] => feeRecipient address
     * addrs[4] => target address
     * addrs[5] => staticTarget address
     * addrs[6] => paymentToken address
     * Sell Order Parameters
     * addrs[7] => exchange address
     * addrs[8] => maker address
     * addrs[9] => taker address
     * addrs[10] => feeRecipient address
     * addrs[11] => target address
     * addrs[12] => staticTarget address
     * addrs[13] => paymentToken address
     * @param uints all uints in a sigle array required for making Order struct @see Order strcut
     * Buy Order Parameters
     * uints[0] => makerRelayerFee
     * uints[1] => takerRelayerFee
     * uints[2] => makerProtocolFee
     * uints[3] => takerProtocolFee
     * uints[4] => basePrice
     * uints[5] => auction extra parameter
     * uints[6] => listingTime
     * uints[7] => expirationTime
     * uints[8] => salt
     * Sell Order Parameters
     * uints[9] => makerRelayerFee
     * uints[10] => takerRelayerFee
     * uints[11] => makerProtocolFee
     * uints[12] => takerProtocolFee
     * uints[13] => basePrice
     * uints[14] => auction extra parameter
     * uints[15] => listingTime
     * uints[16] => expirationTime
     * uints[17] => salt
     * @param feeMethodsSidesKindsHowToCalls list of parameters for feeMethods, side, saleKinds and howToCalls
     * Buy Order Parameter
     * feeMethodsSidesKindsHowToCalls[0] => feeMethod
     * feeMethodsSidesKindsHowToCalls[1] => side
     * feeMethodsSidesKindsHowToCalls[2] => saleKind
     * feeMethodsSidesKindsHowToCalls[3] => howToCall
     * Sell Order Parameter
     * feeMethodsSidesKindsHowToCalls[4] => feeMethod
     * feeMethodsSidesKindsHowToCalls[5] => side
     * feeMethodsSidesKindsHowToCalls[6] => saleKind
     * feeMethodsSidesKindsHowToCalls[7] => howToCall
     * @param calldataBuy calldata for buy order
     * @param calldataSell calldata for sell order
     * @param replacementPatternBuy replacementPattern for buy order
     * @param replacementPatternSell replacementPattern for sell order
     * @param staticExtradataBuy   staticExtradata for buy order
     * @param staticExtradataSell staticExtradata for sell order
     * @param vs v parameter of signature
     * vs[0] => buy side v signature parameter
     * vs[1] => sell side v signature parameter
     * @param rssMetadata signature parameter and asset metadata
     * Buy Order Parameters
     * rssMetadata[0] => r signature parameter
     * rssMetadata[1] => s signature parameter
     * Sell Order Parameters
     * rssMetadata[2] => r signature parameter
     * rssMetadata[3] => s signature parameter
     * rssMetadata[4] => asset metadat
     */
    function atomicMatch_(
        address[14] addrs,
        uint256[18] uints,
        uint8[8] feeMethodsSidesKindsHowToCalls,
        bytes calldataBuy,
        bytes calldataSell,
        bytes replacementPatternBuy,
        bytes replacementPatternSell,
        bytes staticExtradataBuy,
        bytes staticExtradataSell, 
        uint8[2] vs,
        bytes32[5] rssMetadata
    ) public payable {
        return
            atomicMatch(
                Order(
                    addrs[0],
                    addrs[1],
                    addrs[2],
                    uints[0],
                    uints[1],
                    uints[2],
                    uints[3],
                    addrs[3],
                    FeeMethod(feeMethodsSidesKindsHowToCalls[0]),
                    SaleKindInterface.Side(feeMethodsSidesKindsHowToCalls[1]),
                    SaleKindInterface.SaleKind(
                        feeMethodsSidesKindsHowToCalls[2]
                    ),
                    addrs[4],
                    AuthenticatedProxy.HowToCall(
                        feeMethodsSidesKindsHowToCalls[3]
                    ),
                    calldataBuy,
                    replacementPatternBuy,
                    addrs[5],
                    staticExtradataBuy,
                    ERC20(addrs[6]),
                    uints[4],
                    uints[5],
                    uints[6],
                    uints[7],
                    uints[8]
                ),
                Sig(vs[0], rssMetadata[0], rssMetadata[1]),
                Order(
                    addrs[7],
                    addrs[8],
                    addrs[9],
                    uints[9],
                    uints[10],
                    uints[11],
                    uints[12],
                    addrs[10],
                    FeeMethod(feeMethodsSidesKindsHowToCalls[4]),
                    SaleKindInterface.Side(feeMethodsSidesKindsHowToCalls[5]),
                    SaleKindInterface.SaleKind(
                        feeMethodsSidesKindsHowToCalls[6]
                    ),
                    addrs[11],
                    AuthenticatedProxy.HowToCall(
                        feeMethodsSidesKindsHowToCalls[7]
                    ),
                    calldataSell,
                    replacementPatternSell,
                    addrs[12],
                    staticExtradataSell,
                    ERC20(addrs[13]),
                    uints[13],
                    uints[14],
                    uints[15],
                    uints[16],
                    uints[17]
                ),
                Sig(vs[1], rssMetadata[2], rssMetadata[3]),
                rssMetadata[4]
            );
    }
}
