import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { Identities, makeOrder, matchOrder } from "../../test/utils/utilities";


async function main() {
    const signers: Signer[] = await ethers.getSigners()
    const TestToken = await ethers.getContractFactory("TestToken", signers[1]);
    const BlueOceanNFT = await ethers.getContractFactory("BlueOceanNFT", signers[1]);
    const Exchange = await ethers.getContractFactory("BlueOceanExchange", signers[1]);
    const ProxyRegistry = await ethers.getContractFactory("BlueOceanProxyRegistry", signers[1]);
    const TokenTransferProxy = await ethers.getContractFactory("BlueOceanTokenTransferProxy", signers[1]);

    let nftInstance: Contract = BlueOceanNFT.attach("0xB57E0073887062fC1741B9D206346cc8E8F46f8F");
    let exchangeInstance: Contract = Exchange.attach("0xBD313085Cc36c935F1970b772933A3a9F1f0f503");
    let testTokenInstance: Contract = TestToken.attach("0x0B1201b813Bf6CE2125d76aC74475accfF943C0E");
    let proxyRegistryInstance: Contract = ProxyRegistry.attach("0x53d29D539f31e45526bBBEEEB7830C421F12b701");
    let tokenTransferProxyInstance: Contract = TokenTransferProxy.attach("0x8977CE6289CBE89dCe50ab49d826519500641b6D");

    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[1].getAddress());

    await testTokenInstance.connect(signers[1]).transfer(await signers[6].getAddress(), "1000000000000000000000")
    await testTokenInstance.connect(signers[1]).transfer(await signers[7].getAddress(), "1000000000000000000000")

    await testTokenInstance.connect(signers[6]).approve(tokenTransferProxyInstance.address, "1000000000000000000000")
    await testTokenInstance.connect(signers[7]).approve(tokenTransferProxyInstance.address, "1000000000000000000000")

    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[6].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[7].getAddress());

    // /* call SetApprovalForAll for proxy address */
    await nftInstance.connect(signers[7]).setApprovalForAll(proxy,true);

    sell.side = 1

    buy.basePrice = 10e9
    sell.basePrice = 10e9
    buy.makerRelayerFee = 1000
    sell.makerRelayerFee = 1000

    buy.paymentToken = '0x0000000000000000000000000000000000000000'
    sell.paymentToken = '0x0000000000000000000000000000000000000000'


    buy.calldata = nftInstance.interface.encodeFunctionData("safeTransferFrom(address,address,uint256)", [
        "0x0000000000000000000000000000000000000000",
        await signers[6].getAddress(),
        2,
    ])

    sell.calldata = nftInstance.interface.encodeFunctionData("safeTransferFrom(address,address,uint256)", [
        await signers[7].getAddress(),
        "0x0000000000000000000000000000000000000000",
        2
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
    await matchOrder(buy, sell, 0.000001, identities, exchangeInstance)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })