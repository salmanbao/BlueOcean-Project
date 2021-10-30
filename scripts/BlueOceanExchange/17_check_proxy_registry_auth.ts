import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";

async function main() {
    const signers: Signer[] = await ethers.getSigners()
    let exchangeInstance: Contract;
    let proxyRegistryInstance: Contract;

    // hre.tracer.nameTags[await signers[0].getAddress()] = "ADMIN";
    // hre.tracer.nameTags[await signers[1].getAddress()] = "USER1";
    // hre.tracer.nameTags[await signers[2].getAddress()] = "USER2";
    // hre.tracer.nameTags[await signers[3].getAddress()] = "USER3";
    // hre.tracer.nameTags[await signers[4].getAddress()] = "BUYER1";
    // hre.tracer.nameTags[await signers[5].getAddress()] = "SELLER1";
    // hre.tracer.nameTags[await signers[6].getAddress()] = "BUYER2";
    // hre.tracer.nameTags[await signers[7].getAddress()] = "SELLER2";
    // hre.tracer.nameTags[await signers[10].getAddress()] = "FEE_RECIPIENT";

    const Exchange = await ethers.getContractFactory("BlueOceanExchange", signers[0]);
    const ProxyRegistry = await ethers.getContractFactory("BlueOceanProxyRegistry", signers[0]);


    exchangeInstance = Exchange.attach("0x835011805Aac8f8deFd7f76c34D52F9b3e0a8Fd4");
    proxyRegistryInstance = ProxyRegistry.attach("0xd646791900B0EFEcB890F6ECc1C2f466e764E8f8");

    console.log(await proxyRegistryInstance.callStatic.contracts(exchangeInstance.address))
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })