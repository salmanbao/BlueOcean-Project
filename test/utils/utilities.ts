import { rejects } from "assert";
import { expect } from "chai";
import { sign } from "crypto";
import { ethers, BigNumber, Signer, Contract } from "ethers";
import hre from "hardhat";


interface IOrder {
    exchange: string;
    maker: string;
    taker: string;
    makerRelayerFee: number;
    takerRelayerFee: number;
    takerProtocolFee: number;
    makerProtocolFee: number;
    feeRecipient: string;
    feeMethod: number;
    side: number;
    saleKind: number;
    target: string;
    howToCall: number;
    calldata: string;
    replacementPattern: string;
    staticTarget: string;
    staticExtradata: string;
    paymentToken: string;
    basePrice: number
    extra: number;
    listingTime: number;
    expirationTime: number;
    salt: number

}

export const getTime = async (): Promise<number> => {
    return (await hre.ethers.provider.getBlock("latest")).timestamp
}

export const hashOrder = (order: IOrder) => {
    return ethers.utils.solidityKeccak256(
        ['address', 'address', 'address',
            'uint', 'uint', 'uint', 'uint', 'address',
            'uint8', 'uint8', 'uint8', 'address',
            'uint8', 'bytes', 'bytes',
            'address', 'bytes', 'address', 'uint',
            'uint', 'uint', 'uint', 'uint'
        ],
        [order.exchange, order.maker, order.taker,
        order.makerRelayerFee,
        order.takerRelayerFee,
        order.takerProtocolFee,
        order.takerProtocolFee,
        order.feeRecipient, order.feeMethod,
        order.side, order.saleKind, order.target,
        order.howToCall, order.calldata,
        order.replacementPattern, order.staticTarget,
        order.staticExtradata, order.paymentToken,
        order.basePrice,
        order.extra,
        order.listingTime,
        order.expirationTime,
        order.salt]
    )

}

export const hashToSign = (order: IOrder) => {
    const packed = ethers.utils.solidityKeccak256(
        ['address', 'address', 'address',
            'uint', 'uint', 'uint', 'uint', 'address',
            'uint8', 'uint8', 'uint8', 'address',
            'uint8', 'bytes', 'bytes',
            'address', 'bytes', 'address', 'uint',
            'uint', 'uint', 'uint', 'uint'
        ],
        [order.exchange, order.maker, order.taker,
        BigNumber.from(order.makerRelayerFee),
        BigNumber.from(order.takerRelayerFee),
        BigNumber.from(order.takerProtocolFee),
        BigNumber.from(order.takerProtocolFee),
        order.feeRecipient, order.feeMethod,
        order.side, order.saleKind, order.target,
        order.howToCall, order.calldata,
        order.replacementPattern, order.staticTarget,
        order.staticExtradata, order.paymentToken,
        BigNumber.from(order.basePrice),
        BigNumber.from(order.extra),
        BigNumber.from(order.listingTime),
        BigNumber.from(order.expirationTime),
        order.salt]
    );
    return ethers.utils.solidityKeccak256(
        ['string', 'bytes32'],
        ['\x19Ethereum Signed Message:\n32', packed]
    );
}

export const makeOrder = (exchange: string, isMaker: boolean, proxy: string, signer: string): IOrder => ({
    exchange: exchange,
    maker: signer,
    taker: signer,
    makerRelayerFee: 0,
    takerRelayerFee: 0,
    makerProtocolFee: 0, // go the platform
    takerProtocolFee: 0, // go to the platform
    feeRecipient: isMaker ? signer : '0x0000000000000000000000000000000000000000',
    feeMethod: 0,
    side: 0,
    saleKind: 0,
    target: proxy,
    howToCall: 0,
    calldata: '0x',
    replacementPattern: '0x',
    staticTarget: '0x0000000000000000000000000000000000000000',
    staticExtradata: '0x',
    paymentToken: signer,
    basePrice: 0,
    extra: 0,
    listingTime: 0,
    expirationTime: 0,
    salt: 0,
})

export const matchOrder = async (buy: IOrder, sell: IOrder, value: number, signers: Signer[], exchangeInstance: Contract) => {
    return new Promise(async (resolve, reject) => {
        try {
            const buyHash = hashOrder(buy)
            const sellHash = hashOrder(sell)

            let buySignature = await signers[0].signMessage(buyHash)
            buySignature = buySignature.substr(2)
            const br = '0x' + buySignature.slice(0, 64)
            const bs = '0x' + buySignature.slice(64, 128)
            const bv = 27 + parseInt('0x' + buySignature.slice(128, 130), 16)

            let sellSignature = await signers[0].signMessage(sellHash)
            sellSignature = sellSignature.substr(2)
            const sr = '0x' + sellSignature.slice(0, 64)
            const ss = '0x' + sellSignature.slice(64, 128)
            const sv = 27 + parseInt('0x' + sellSignature.slice(128, 130), 16)

            expect(await exchangeInstance.callStatic.ordersCanMatch_(
                [buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken],
                [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
                [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall],
                buy.calldata,
                sell.calldata,
                buy.replacementPattern,
                sell.replacementPattern,
                buy.staticExtradata,
                sell.staticExtradata
            )).to.be.equal(true)

            expect(await exchangeInstance.callStatic.calculateMatchPrice_(
                [buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken],
                [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
                [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall],
                buy.calldata,
                sell.calldata,
                buy.replacementPattern,
                sell.replacementPattern,
                buy.staticExtradata,
                sell.staticExtradata
            )).to.be.equal(buy.basePrice)

            await exchangeInstance.connect(signers[0]).approveOrder_(
                [buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken],
                [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt],
                buy.feeMethod,
                buy.side,
                buy.saleKind,
                buy.howToCall,
                buy.calldata,
                buy.replacementPattern,
                buy.staticExtradata,
                true
            )

            await exchangeInstance.connect(signers[0]).approveOrder_(
                [sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken],
                [sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
                sell.feeMethod,
                sell.side,
                sell.saleKind,
                sell.howToCall,
                sell.calldata,
                sell.replacementPattern,
                sell.staticExtradata,
                true
            )
            await exchangeInstance.connect(signers[0]).atomicMatch_(
                [buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken],
                [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
                [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall],
                buy.calldata,
                sell.calldata,
                buy.replacementPattern,
                sell.replacementPattern,
                buy.staticExtradata,
                sell.staticExtradata,
                [bv, sv],
                [br, bs, sr, ss, '0x0000000000000000000000000000000000000000000000000000000000000000'],
                { value: ethers.utils.parseEther(value.toString()) || 0 }
            )
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })



}