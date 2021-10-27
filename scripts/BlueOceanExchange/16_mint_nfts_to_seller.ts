import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";

async function main() {
    const signers: Signer[] = await ethers.getSigners()
    const BlueOceanNFT = await ethers.getContractFactory("BlueOceanNFT", signers[1]);
    let nftInstance: Contract = BlueOceanNFT.attach("0xB57E0073887062fC1741B9D206346cc8E8F46f8F");
    
    await nftInstance.connect(signers[1]).mintTo(await signers[7].getAddress())
    await nftInstance.connect(signers[1]).mintTo(await signers[7].getAddress())
    await nftInstance.connect(signers[1]).mintTo(await signers[7].getAddress())
    await nftInstance.connect(signers[1]).mintTo(await signers[7].getAddress())
    await nftInstance.connect(signers[1]).mintTo(await signers[7].getAddress())
    await nftInstance.connect(signers[1]).mintTo(await signers[7].getAddress())
    await nftInstance.connect(signers[1]).mintTo(await signers[7].getAddress())
    await nftInstance.connect(signers[1]).mintTo(await signers[7].getAddress())
    await nftInstance.connect(signers[1]).mintTo(await signers[7].getAddress())
    await nftInstance.connect(signers[1]).mintTo(await signers[7].getAddress())
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })