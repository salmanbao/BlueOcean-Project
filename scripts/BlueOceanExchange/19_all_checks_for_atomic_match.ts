import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";

async function main() {
    const signers: Signer[] = await ethers.getSigners()
    let nftInstance: Contract;
    let exchangeInstance: Contract;
    let testTokenInstance: Contract;
    let proxyRegistryInstance: Contract;
    let tokenTransferProxyInstance: Contract;


    const TestToken = await ethers.getContractFactory("TestToken", signers[0]);
    const BlueOceanNFT = await ethers.getContractFactory("BlueOceanNFT", signers[0]);
    const Exchange = await ethers.getContractFactory("BlueOceanExchange", signers[0]);
    const ProxyRegistry = await ethers.getContractFactory("BlueOceanProxyRegistry", signers[0]);
    const TokenTransferProxy = await ethers.getContractFactory("BlueOceanTokenTransferProxy", signers[0]);

    exchangeInstance = Exchange.attach("0x835011805Aac8f8deFd7f76c34D52F9b3e0a8Fd4");
    testTokenInstance = TestToken.attach("0x28Cb006De3c242698A883fe0CFA692C7f35bd1bc");
    nftInstance = BlueOceanNFT.attach("0x6fFE0F8cf249b6EEe7E7A2A341A4843c8E08A7AD");
    proxyRegistryInstance = ProxyRegistry.attach("0xd646791900B0EFEcB890F6ECc1C2f466e764E8f8");
    tokenTransferProxyInstance = TokenTransferProxy.attach("0xA8f8B372d6Ea18f97e53e57Aa7735CbF32Da342D");

    console.log(await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress()))
    console.log(await exchangeInstance.callStatic.minimumTakerProtocolFee())
    console.log(await exchangeInstance.callStatic.minimumMakerProtocolFee())
    console.log(await exchangeInstance.callStatic.protocolFeeRecipient())
    console.log(await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress()))
    console.log(await proxyRegistryInstance.callStatic.contracts(exchangeInstance.address))

    console.log(await testTokenInstance.callStatic.allowance(await signers[1].getAddress(), tokenTransferProxyInstance.address))
    console.log(await testTokenInstance.callStatic.allowance(await signers[2].getAddress(), tokenTransferProxyInstance.address))

    console.log(await testTokenInstance.callStatic.balanceOf(await signers[1].getAddress()))
    console.log(await testTokenInstance.callStatic.balanceOf(await signers[2].getAddress()))

    console.log(await nftInstance.callStatic.isApprovedForAll(
        await signers[1].getAddress(),
        await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress()))
    )

    console.log(await nftInstance.callStatic.isApprovedForAll(
        await signers[2].getAddress(),
        await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress()))
    )
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })
