import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";

async function main() {
    const signers: Signer[] = await ethers.getSigners()
    const Exchange = await ethers.getContractFactory("BlueOceanExchange", signers[0]);
    let exchangeInstance: Contract = Exchange.attach("0xb6104Ab14f23D5E9950b56Bf999655e851Eb91c1");

    await exchangeInstance.connect(signers[0]).changeProtocolFeeRecipient(await signers[10].getAddress())
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })