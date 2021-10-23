import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";

async function main() {
    const signers: Signer[] = await ethers.getSigners()
    const ProxyRegistry = await ethers.getContractFactory("BlueOceanProxyRegistry", signers[0]);
    let proxyRegistryInstance: Contract = ProxyRegistry.attach("0x8A56411Dd68FB00b4EA8A93A966Cb5Ba2e537F3c");
    // await proxyRegistryInstance.connect(signers[0]).registerProxy();
    // await proxyRegistryInstance.connect(signers[1]).registerProxy()
    // await proxyRegistryInstance.connect(signers[2]).registerProxy()
    // await proxyRegistryInstance.connect(signers[3]).registerProxy()
    // await proxyRegistryInstance.connect(signers[4]).registerProxy()
    // await proxyRegistryInstance.connect(signers[5]).registerProxy()
    await proxyRegistryInstance.connect(signers[6]).registerProxy() // registered
    await proxyRegistryInstance.connect(signers[7]).registerProxy() // registered
    // await proxyRegistryInstance.connect(signers[8]).registerProxy()
    // await proxyRegistryInstance.connect(signers[9]).registerProxy()
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })