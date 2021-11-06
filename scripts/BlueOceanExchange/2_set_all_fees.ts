import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";

async function main() {
    const signers: Signer[] = await ethers.getSigners()
    const Exchange = await ethers.getContractFactory("BlueOceanExchange", signers[0]);
    let exchangeInstance: Contract = Exchange.attach("0x835011805Aac8f8deFd7f76c34D52F9b3e0a8Fd4");

    await exchangeInstance.connect(signers[0]).changeMinimumTakerProtocolFee(1);
    await exchangeInstance.connect(signers[0]).changeMinimumMakerProtocolFee(1);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })