import { expect } from "chai";
import { Contract, BigNumber, Signer } from "ethers";
import hre, { ethers } from "hardhat";
import { getTime, hashOrder, hashToSign, Identities, makeOrder, matchOrder } from "../utils/utilities";

describe("BlueOceanTokenTransferProxy", function () {

    let signers: Signer[];

    let exchangeInstance: Contract;
    let testTokenInstance: Contract;
    let testStaticInstance: Contract;
    let proxyRegistryInstance: Contract;
    let tokenTransferProxyInstance: Contract;


    before(async () => {
        signers = await ethers.getSigners();
        hre.tracer.nameTags[await signers[0].getAddress()] = "ADMIN";
        hre.tracer.nameTags[await signers[1].getAddress()] = "USER1";
        hre.tracer.nameTags[await signers[10].getAddress()] = "FEE_RECIPIENT";

        const TestToken = await ethers.getContractFactory("TestToken", signers[0]);
        const TestStatic = await ethers.getContractFactory("TestStatic", signers[0]);
        const Exchange = await ethers.getContractFactory("BlueOceanExchange", signers[0]);
        const ProxyRegistry = await ethers.getContractFactory("BlueOceanProxyRegistry", signers[0]);
        const TokenTransferProxy = await ethers.getContractFactory("BlueOceanTokenTransferProxy", signers[0]);

        testTokenInstance = await TestToken.deploy();
        testStaticInstance = await TestStatic.deploy();
        proxyRegistryInstance = await ProxyRegistry.deploy();
        tokenTransferProxyInstance = await TokenTransferProxy.deploy(proxyRegistryInstance.address);
        exchangeInstance = await Exchange.deploy(proxyRegistryInstance.address, tokenTransferProxyInstance.address, testTokenInstance.address, await signers[10].getAddress())

        await proxyRegistryInstance.connect(signers[0]).grantInitialAuthentication(exchangeInstance.address)

        hre.tracer.nameTags[testTokenInstance.address] = "TEST-TOKEN";
        hre.tracer.nameTags[testStaticInstance.address] = "TEST-STATIC";
        hre.tracer.nameTags[exchangeInstance.address] = "EXCHANGE";
        hre.tracer.nameTags[proxyRegistryInstance.address] = "PROXY-REGISTRY";
        hre.tracer.nameTags[tokenTransferProxyInstance.address] = "TOKEN-TRANSFER";

    });

    it("should not allow transfer from unauthenticated contract", async function () {
        await  expect(tokenTransferProxyInstance.connect(signers[0]).
            transferFrom(
                testStaticInstance.address,
                await signers[0].getAddress(),
                await signers[1].getAddress(),
                0
            )).to.be.reverted;
    })
})