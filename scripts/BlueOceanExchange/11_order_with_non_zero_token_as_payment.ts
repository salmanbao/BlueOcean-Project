import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { Identities, makeOrder, matchOrder } from "../../test/utils/utilities";


async function main() {
    const signers: Signer[] = await ethers.getSigners()
    const TestToken = await ethers.getContractFactory("TestToken", signers[0]);
    const Exchange = await ethers.getContractFactory("BlueOceanExchange", signers[0]);
    const ProxyRegistry = await ethers.getContractFactory("BlueOceanProxyRegistry", signers[0]);
    const TokenTransferProxy = await ethers.getContractFactory("BlueOceanTokenTransferProxy", signers[0]);


    let exchangeInstance: Contract = Exchange.attach("0xb6104Ab14f23D5E9950b56Bf999655e851Eb91c1");
    let testTokenInstance: Contract = TestToken.attach("0x9B23972e96549e23D23e967CC3F15e5f6Ed77458");
    let proxyRegistryInstance: Contract = ProxyRegistry.attach("0x8A56411Dd68FB00b4EA8A93A966Cb5Ba2e537F3c");
    let tokenTransferProxyInstance: Contract = TokenTransferProxy.attach("0x659d81Fd7113C461805131ceA48323c14d9cD5cF")
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());

    await testTokenInstance.connect(signers[0]).transfer(await signers[6].getAddress(), 100000)
    await testTokenInstance.connect(signers[0]).transfer(await signers[7].getAddress(), 100000)

    await testTokenInstance.connect(signers[6]).approve(tokenTransferProxyInstance.address, 100000)
    await testTokenInstance.connect(signers[7]).approve(tokenTransferProxyInstance.address, 100000)


    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[6].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[7].getAddress());
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.basePrice = 10000
    sell.basePrice = 10000
    buy.salt = 10
    sell.salt = 10
    buy.paymentToken = testTokenInstance.address
    sell.paymentToken = testTokenInstance.address
    const identities: Identities = {
        matcher: signers[11],
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