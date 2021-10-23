import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";

async function main() {
    const signers: Signer[] = await ethers.getSigners()
    let exchangeInstance: Contract;
    let testTokenInstance: Contract;
    let testStaticInstance: Contract;
    let proxyRegistryInstance: Contract;
    let tokenTransferProxyInstance: Contract;
    let ownabledDelegateProxyInstance: Contract;

    // hre.tracer.nameTags[await signers[0].getAddress()] = "ADMIN";
    // hre.tracer.nameTags[await signers[1].getAddress()] = "USER1";
    // hre.tracer.nameTags[await signers[2].getAddress()] = "USER2";
    // hre.tracer.nameTags[await signers[3].getAddress()] = "USER3";
    // hre.tracer.nameTags[await signers[4].getAddress()] = "BUYER1";
    // hre.tracer.nameTags[await signers[5].getAddress()] = "SELLER1";
    // hre.tracer.nameTags[await signers[6].getAddress()] = "BUYER2";
    // hre.tracer.nameTags[await signers[7].getAddress()] = "SELLER2";
    // hre.tracer.nameTags[await signers[10].getAddress()] = "FEE_RECIPIENT";

    const TestToken = await ethers.getContractFactory("TestToken", signers[0]);
    const TestStatic = await ethers.getContractFactory("TestStatic", signers[0]);
    const Exchange = await ethers.getContractFactory("BlueOceanExchange", signers[0]);
    const ProxyRegistry = await ethers.getContractFactory("BlueOceanProxyRegistry", signers[0]);
    const OwnabledDelegateProxy = await ethers.getContractFactory("OwnableDelegateProxy", signers[0]);
    const TokenTransferProxy = await ethers.getContractFactory("BlueOceanTokenTransferProxy", signers[0]);


    exchangeInstance = Exchange.attach("");
    testTokenInstance = TestToken.attach("");
    testStaticInstance = TestStatic.attach("");
    proxyRegistryInstance = ProxyRegistry.attach("");
    tokenTransferProxyInstance = TokenTransferProxy.attach("");

    await proxyRegistryInstance.connect(signers[0]).grantInitialAuthentication(exchangeInstance.address)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })