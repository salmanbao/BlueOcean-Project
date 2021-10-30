import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";

async function main() {
    const signers: Signer[] = await ethers.getSigners()
    const ProxyRegistry = await ethers.getContractFactory("BlueOceanProxyRegistry", signers[0]);
    let proxyRegistryInstance: Contract = ProxyRegistry.attach("0xd646791900B0EFEcB890F6ECc1C2f466e764E8f8");
    await proxyRegistryInstance.connect(signers[0]).registerProxy(); // contract admin
    await proxyRegistryInstance.connect(signers[1]).registerProxy() // Buyer
    await proxyRegistryInstance.connect(signers[2]).registerProxy() // Seller
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })