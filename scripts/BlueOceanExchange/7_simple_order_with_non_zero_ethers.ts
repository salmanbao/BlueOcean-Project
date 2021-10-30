import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { Identities, makeOrder, matchOrder } from "../../test/utils/utilities";


async function main() {
    const signers: Signer[] = await ethers.getSigners()
    const Exchange = await ethers.getContractFactory("BlueOceanExchange", signers[0]);
    const ProxyRegistry = await ethers.getContractFactory("BlueOceanProxyRegistry", signers[0]);

    let exchangeInstance: Contract = Exchange.attach("0xb6104Ab14f23D5E9950b56Bf999655e851Eb91c1");
    let proxyRegistryInstance: Contract = ProxyRegistry.attach("0x8A56411Dd68FB00b4EA8A93A966Cb5Ba2e537F3c");
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());

    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[1].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[1].getAddress());
    sell.side = 1
    buy.paymentToken = '0x0000000000000000000000000000000000000000'
    sell.paymentToken = '0x0000000000000000000000000000000000000000'
    buy.basePrice = 10e9
    sell.basePrice = 10e9
    buy.salt = 3
    sell.salt = 3
    const identities: Identities = {
        matcher: signers[1],
        buyer: signers[1],
        seller: signers[2],
    }
    await matchOrder(buy, sell, 1, identities, exchangeInstance)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })