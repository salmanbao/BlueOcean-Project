import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";

async function main() {
    const signers: Signer[] = await ethers.getSigners()
    const BlueOceanNFT = await ethers.getContractFactory("BlueOceanNFT", signers[0]);
    let nftInstance: Contract = BlueOceanNFT.attach("0xCee8508cb2435Fcc06cD0764B2695e7175ccED5d");

    console.log(await nftInstance.callStatic.tokenOfOwnerByIndex(await signers[2].getAddress(),2))
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })