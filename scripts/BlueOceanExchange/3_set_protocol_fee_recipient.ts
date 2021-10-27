import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";

async function main() {
    const signers: Signer[] = await ethers.getSigners()
    const Exchange = await ethers.getContractFactory("BlueOceanExchange", signers[0]);
    let exchangeInstance: Contract = Exchange.attach("0xBD313085Cc36c935F1970b772933A3a9F1f0f503");

    await exchangeInstance.connect(signers[1]).changeProtocolFeeRecipient(await signers[10].getAddress())
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })