import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { Identities, makeOrder, matchOrder } from "../../test/utils/utilities";


async function main() {
    const signers: Signer[] = await ethers.getSigners()
    const TestToken = await ethers.getContractFactory("TestToken", signers[0]);
    const Exchange = await ethers.getContractFactory("BlueOceanExchange", signers[0]);
    const ProxyRegistry = await ethers.getContractFactory("BlueOceanProxyRegistry", signers[0]);

    let exchangeInstance: Contract = Exchange.attach("");
    let proxyRegistryInstance: Contract = ProxyRegistry.attach("");
    let testTokenInstance: Contract = TestToken.attach("");
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());

    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[1].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[2].getAddress());
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.basePrice = 10000
    sell.basePrice = 10000
    sell.takerRelayerFee = 100
    buy.takerRelayerFee = 100
    buy.paymentToken = testTokenInstance.address
    sell.paymentToken = testTokenInstance.address
    const identities: Identities = {
        matcher: signers[1],
        buyer: signers[1],
        seller: signers[2],
    }
    await matchOrder(buy, sell, 0, identities, exchangeInstance)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })