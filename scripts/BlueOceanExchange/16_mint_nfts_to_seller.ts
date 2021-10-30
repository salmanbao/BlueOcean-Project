import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";

async function main() {
    const signers: Signer[] = await ethers.getSigners()
    const BlueOceanNFT = await ethers.getContractFactory("BlueOceanNFT", signers[0]);
    let nftInstance: Contract = BlueOceanNFT.attach("0x6fFE0F8cf249b6EEe7E7A2A341A4843c8E08A7AD");
    
    await nftInstance.connect(signers[0]).mintTo(await signers[2].getAddress()) 
    await nftInstance.connect(signers[0]).mintTo(await signers[2].getAddress())
    await nftInstance.connect(signers[0]).mintTo(await signers[2].getAddress())
    await nftInstance.connect(signers[0]).mintTo(await signers[2].getAddress())
    await nftInstance.connect(signers[0]).mintTo(await signers[2].getAddress())
    await nftInstance.connect(signers[0]).mintTo(await signers[2].getAddress())
    await nftInstance.connect(signers[0]).mintTo(await signers[2].getAddress())
    await nftInstance.connect(signers[0]).mintTo(await signers[2].getAddress())
    await nftInstance.connect(signers[0]).mintTo(await signers[2].getAddress())
    await nftInstance.connect(signers[0]).mintTo(await signers[2].getAddress())
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })