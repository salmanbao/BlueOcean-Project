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


    let exchangeInstance: Contract = Exchange.attach("0x835011805Aac8f8deFd7f76c34D52F9b3e0a8Fd4");
    let testTokenInstance: Contract = TestToken.attach("0x28Cb006De3c242698A883fe0CFA692C7f35bd1bc");
    let proxyRegistryInstance: Contract = ProxyRegistry.attach("0xd646791900B0EFEcB890F6ECc1C2f466e764E8f8");
    let tokenTransferProxyInstance: Contract = TokenTransferProxy.attach("0xA8f8B372d6Ea18f97e53e57Aa7735CbF32Da342D")
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());

    await testTokenInstance.connect(signers[0]).transfer("0xA5Ee676887E090C37C1Dd1df9B0dB1C0bb188695", ethers.utils.parseEther("1000"))
    await testTokenInstance.connect(signers[0]).transfer(await signers[2].getAddress(), ethers.utils.parseEther("1000"))

    await testTokenInstance.connect(signers[1]).approve(tokenTransferProxyInstance.address, ethers.utils.parseEther("1000"))
    await testTokenInstance.connect(signers[2]).approve(tokenTransferProxyInstance.address, ethers.utils.parseEther("1000"))


    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[1].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[2].getAddress());
    
    // sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.basePrice = 10000
    sell.basePrice = 10000
    buy.salt = 10
    sell.salt = 10
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