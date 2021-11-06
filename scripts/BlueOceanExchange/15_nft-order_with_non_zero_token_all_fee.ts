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
    const TokenTransferProxy = await ethers.getContractFactory("BlueOceanTokenTransferProxy", signers[0]);

    let nftInstance: Contract = BlueOceanNFT.attach("0x6fFE0F8cf249b6EEe7E7A2A341A4843c8E08A7AD");
    let exchangeInstance: Contract = Exchange.attach("0x835011805Aac8f8deFd7f76c34D52F9b3e0a8Fd4");
    let testTokenInstance: Contract = TestToken.attach("0x28Cb006De3c242698A883fe0CFA692C7f35bd1bc");
    let proxyRegistryInstance: Contract = ProxyRegistry.attach("0xd646791900B0EFEcB890F6ECc1C2f466e764E8f8");
    let tokenTransferProxyInstance: Contract = TokenTransferProxy.attach("0xA8f8B372d6Ea18f97e53e57Aa7735CbF32Da342D");

    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());

    await testTokenInstance.connect(signers[0]).transfer(await signers[1].getAddress(), "1000000000000000000000")
    await testTokenInstance.connect(signers[0]).transfer(await signers[2].getAddress(), "1000000000000000000000")

    await testTokenInstance.connect(signers[1]).approve(tokenTransferProxyInstance.address, "1000000000000000000000")
    await testTokenInstance.connect(signers[2]).approve(tokenTransferProxyInstance.address, "1000000000000000000000")

    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[1].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[2].getAddress());

    // /* call SetApprovalForAll for proxy address */
    await nftInstance.connect(signers[2]).setApprovalForAll(proxy,true);

    sell.side = 1

    buy.basePrice = 100000000
    sell.basePrice = 100000000
    buy.makerRelayerFee = 1000
    sell.makerRelayerFee = 1000

    buy.paymentToken = '0x0000000000000000000000000000000000000000'
    sell.paymentToken = '0x0000000000000000000000000000000000000000'


    buy.calldata = nftInstance.interface.encodeFunctionData("safeTransferFrom(address,address,uint256)", [
        "0x0000000000000000000000000000000000000000",
        await signers[1].getAddress(),
        4,
    ])

    sell.calldata = nftInstance.interface.encodeFunctionData("safeTransferFrom(address,address,uint256)", [
        await signers[2].getAddress(),
        "0x0000000000000000000000000000000000000000",
        4
    ])

    sell.target = nftInstance.address
    buy.target = nftInstance.address

    buy.replacementPattern = "0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    sell.replacementPattern = "0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000"



    const identities: Identities = {
        matcher: signers[1],
        buyer: signers[1],
        seller: signers[2],
    }
    await matchOrder(buy, sell, 0.001, identities, exchangeInstance)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })