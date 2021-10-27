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

    const TestToken = await ethers.getContractFactory("TestToken", signers[1]);
    const TestStatic = await ethers.getContractFactory("TestStatic", signers[1]);
    const Exchange = await ethers.getContractFactory("BlueOceanExchange", signers[1]);
    const ProxyRegistry = await ethers.getContractFactory("BlueOceanProxyRegistry", signers[1]);
    const TokenTransferProxy = await ethers.getContractFactory("BlueOceanTokenTransferProxy", signers[1]);


    exchangeInstance = Exchange.attach("0xBD313085Cc36c935F1970b772933A3a9F1f0f503");
    testTokenInstance = TestToken.attach("0x0B1201b813Bf6CE2125d76aC74475accfF943C0E");
    testStaticInstance = TestStatic.attach("0x86157fa3f01180C5E7E9921D3fd56492F9baf7F5");
    proxyRegistryInstance = ProxyRegistry.attach("0x53d29D539f31e45526bBBEEEB7830C421F12b701");
    tokenTransferProxyInstance = TokenTransferProxy.attach("0x8977CE6289CBE89dCe50ab49d826519500641b6D");

    await proxyRegistryInstance.connect(signers[1]).grantInitialAuthentication(exchangeInstance.address)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })