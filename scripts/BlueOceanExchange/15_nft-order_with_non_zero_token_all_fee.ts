import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { Identities, makeOrder, matchOrder } from "../../test/utils/utilities";


async function main() {
    const signers: Signer[] = await ethers.getSigners()
    const TestToken = await ethers.getContractFactory("TestToken", signers[0]);
    const BlueOceanNFT = await ethers.getContractFactory("BlueOceanNFT", signers[0]);
    const Exchange = await ethers.getContractFactory("BlueOceanExchange", signers[0]);
    const ProxyRegistry = await ethers.getContractFactory("BlueOceanProxyRegistry", signers[0]);

    let nftInstance: Contract = BlueOceanNFT.attach("0x4a3Ae88BE1F675EDa0E29690922eEFc44D967aF8");
    let exchangeInstance: Contract = Exchange.attach("0xb6104Ab14f23D5E9950b56Bf999655e851Eb91c1");
    let testTokenInstance: Contract = TestToken.attach("0x9B23972e96549e23D23e967CC3F15e5f6Ed77458");
    let proxyRegistryInstance: Contract = ProxyRegistry.attach("0x8A56411Dd68FB00b4EA8A93A966Cb5Ba2e537F3c");

    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());

    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[6].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[7].getAddress());

    // console.log(sellerProxy)
    /* call SetApprovalForAll for proxy address */
    // await nftInstance.connect(signers[7]).setApprovalForAll(sellerProxy,true);

    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.basePrice = 10003
    sell.basePrice = 10003
    sell.makerProtocolFee = 100
    buy.makerProtocolFee = 200
    sell.makerRelayerFee = 100
    buy.makerRelayerFee = 100
    sell.takerProtocolFee = 100
    buy.takerProtocolFee = 100
    sell.takerRelayerFee = 100
    buy.takerRelayerFee = 100
    
    buy.paymentToken = testTokenInstance.address
    sell.paymentToken = testTokenInstance.address

    buy.calldata = nftInstance.interface.encodeFunctionData("safeTransferFrom(address,address,uint256)", [
        "0x0000000000000000000000000000000000000000",
        await signers[6].getAddress(),
        1,
    ])

    sell.calldata = nftInstance.interface.encodeFunctionData("safeTransferFrom(address,address,uint256)", [
        await signers[7].getAddress(),
        "0x0000000000000000000000000000000000000000",
        1
    ])
    sell.target = nftInstance.address
    buy.target = nftInstance.address

     buy.replacementPattern = "0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    sell.replacementPattern = "0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000"



    const identities: Identities = {
        matcher: signers[6],
        buyer: signers[6],
        seller: signers[7],
    }
    await matchOrder(buy, sell, 0, identities, exchangeInstance)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })