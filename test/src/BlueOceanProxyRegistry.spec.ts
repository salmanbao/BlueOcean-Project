import { expect } from "chai";
import { Contract, BigNumber, Signer } from "ethers";
import hre, { ethers } from "hardhat";
import { increaseTime } from "../utils/utilities";

describe("BlueOceanProxyRegistry", function () {

    let signers: Signer[];

    let exchangeInstance: Contract;
    let testTokenInstance: Contract;
    let testStaticInstance: Contract;
    let proxyRegistryInstance: Contract;
    let tokenTransferProxyInstance: Contract;
    let ownabledDelegateProxyInstance: Contract;


    before(async () => {
        signers = await ethers.getSigners();
        hre.tracer.nameTags[await signers[0].getAddress()] = "ADMIN";
        hre.tracer.nameTags[await signers[1].getAddress()] = "USER1";
        hre.tracer.nameTags[await signers[2].getAddress()] = "USER2";
        hre.tracer.nameTags[await signers[3].getAddress()] = "USER3";
        hre.tracer.nameTags[await signers[4].getAddress()] = "BUYER1";
        hre.tracer.nameTags[await signers[5].getAddress()] = "SELLER1";
        hre.tracer.nameTags[await signers[6].getAddress()] = "BUYER2";
        hre.tracer.nameTags[await signers[7].getAddress()] = "SELLER2";
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

    it("should not allow initial authentication twice", async function () {
        const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
        await expect(proxyRegistryInstance.connect(signers[0]).grantInitialAuthentication(await signers[0].getAddress())).to.be.reverted
    })

    it("should have a delegateproxyimpl", async function () {
        expect(await proxyRegistryInstance.callStatic.delegateProxyImplementation()).lengthOf(42)
    })

    it("should allow proxy creation", async function () {
        await proxyRegistryInstance.connect(signers[0]).registerProxy();
        expect(await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress())).lengthOf(42)
    })

    it("should allow proxy update", async function () {
        const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
        const OwnabledDelegateProxy = await ethers.getContractFactory("OwnableDelegateProxy", signers[0]);
        ownabledDelegateProxyInstance = OwnabledDelegateProxy.attach(proxy)
        await ownabledDelegateProxyInstance.connect(signers[0]).upgradeTo(proxyRegistryInstance.address)
        const implementation = await proxyRegistryInstance.callStatic.delegateProxyImplementation()
        await ownabledDelegateProxyInstance.connect(signers[0]).upgradeTo(implementation)
    })

    it("should not allow proxy upgrade to same implementation", async function () {
        const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
        const implementation = await proxyRegistryInstance.callStatic.delegateProxyImplementation()
        const OwnabledDelegateProxy = await ethers.getContractFactory("OwnableDelegateProxy", signers[0]);
        ownabledDelegateProxyInstance = OwnabledDelegateProxy.attach(proxy)
        await expect(ownabledDelegateProxyInstance.connect(signers[0]).upgradeTo(implementation)).to.be.reverted
    })

    it("should allow upgradeAndCall", async function () {
        const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
        const OwnabledDelegateProxy = await ethers.getContractFactory("OwnableDelegateProxy", signers[0]);
        const AuthenticatedProxy = await ethers.getContractFactory("AuthenticatedProxy", signers[0])
        ownabledDelegateProxyInstance = OwnabledDelegateProxy.attach(proxy)
        await ownabledDelegateProxyInstance.connect(signers[0]).upgradeTo(proxyRegistryInstance.address)
        const implementation = await proxyRegistryInstance.callStatic.delegateProxyImplementation()
        const authenticatedProxyInstance = AuthenticatedProxy.attach(proxy);
        const bytecode = authenticatedProxyInstance.interface.encodeFunctionData("setRevoke", [true])
        await ownabledDelegateProxyInstance.connect(signers[0]).upgradeToAndCall(implementation, bytecode)
        expect(await authenticatedProxyInstance.callStatic.revoked()).to.be.equal(true)
        await authenticatedProxyInstance.connect(signers[0]).setRevoke(false)
        expect(await authenticatedProxyInstance.callStatic.revoked()).to.be.equal(false)
    })

    it("should return proxy type", async function () {
        const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
        const OwnabledDelegateProxy = await ethers.getContractFactory("OwnableDelegateProxy", signers[0]);
        ownabledDelegateProxyInstance = OwnabledDelegateProxy.attach(proxy)
        expect(await ownabledDelegateProxyInstance.callStatic.proxyType()).to.be.equal(2)
    })

    it("should allow ownership transfer", async function () {
        const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
        const OwnabledDelegateProxy = await ethers.getContractFactory("OwnableDelegateProxy", signers[0]);
        ownabledDelegateProxyInstance = OwnabledDelegateProxy.attach(proxy)
        await ownabledDelegateProxyInstance.connect(signers[0]).transferProxyOwnership(await signers[1].getAddress())
        expect(await ownabledDelegateProxyInstance.callStatic.proxyOwner()).to.be.equal(await signers[1].getAddress())
        await ownabledDelegateProxyInstance.connect(signers[1]).transferProxyOwnership(await signers[0].getAddress())
        await expect(ownabledDelegateProxyInstance.connect(signers[1]).transferProxyOwnership(await signers[1].getAddress())).to.be.reverted
    })

    it("should not allow proxy update from another account", async function () {
        const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
        const OwnabledDelegateProxy = await ethers.getContractFactory("OwnableDelegateProxy", signers[0]);
        ownabledDelegateProxyInstance = OwnabledDelegateProxy.attach(proxy)
        await expect(ownabledDelegateProxyInstance.connect(signers[1]).upgradeTo(proxyRegistryInstance.address)).to.be.reverted
    })

    it("should not allow proxy transfer to a nonexistent account", async function () {
        const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
        const OwnabledDelegateProxy = await ethers.getContractFactory("OwnableDelegateProxy", signers[0]);
        ownabledDelegateProxyInstance = OwnabledDelegateProxy.attach(proxy)
        await expect(ownabledDelegateProxyInstance.connect(signers[0]).
            transferProxyOwnership('0x0000000000000000000000000000000000000000')).to.be.reverted
    })

    it("should not allow reinitialization", async function () {
        const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
        const AuthenticatedProxy = await ethers.getContractFactory("AuthenticatedProxy", signers[0]);
        const authenticatedProxyInstance = AuthenticatedProxy.attach(proxy)

        await expect(authenticatedProxyInstance.connect(signers[0]).
            initialize(
                await signers[1].getAddress(),
                proxyRegistryInstance.address
            )).to.be.reverted
    })

    it("should allow start but not end of authentication process", async function () {
        const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
        await proxyRegistryInstance.connect(signers[0]).startGrantAuthentication(await signers[0].getAddress())
        expect(await proxyRegistryInstance.callStatic.pending(await signers[0].getAddress())).gt(0)
        await expect(proxyRegistryInstance.connect(signers[0]).endGrantAuthentication(await signers[0].getAddress())).to.be.reverted
    })

    it("should not allow start twice", async function () {
        const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
        await expect(proxyRegistryInstance.connect(signers[0]).startGrantAuthentication(await signers[0].getAddress())).to.be.reverted
    })

    it("should not allow end without start", async function () {
        const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
        await expect(proxyRegistryInstance.connect(signers[0]).endGrantAuthentication(await signers[1].getAddress())).to.be.reverted
    })

    it("should allow end after time has passed", async function () {
        await increaseTime(86400 * 7 * 3)
        await proxyRegistryInstance.connect(signers[0]).endGrantAuthentication(await signers[0].getAddress())
        expect(await proxyRegistryInstance.callStatic.contracts(await signers[0].getAddress())).to.be.true
        await proxyRegistryInstance.connect(signers[0]).revokeAuthentication(await signers[0].getAddress())
        expect(await proxyRegistryInstance.callStatic.contracts(await signers[0].getAddress())).to.be.false
    })

    it("should not allow duplicate proxy creation", async function () {
        await expect(proxyRegistryInstance.connect(signers[0]).registerProxy()).to.be.reverted
    })

    it("should allow sending tokens through proxy", async function () {
        const amount = Math.pow(10, 6) * 2
        const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
        await testTokenInstance.connect(signers[0]).transfer(proxy, amount)
        const abi = testTokenInstance.interface.encodeFunctionData("transfer", [
            await signers[0].getAddress(),
            amount
        ])
        const AuthenticatedProxy = await ethers.getContractFactory("AuthenticatedProxy", signers[0]);
        const authenticatedProxyInstance = AuthenticatedProxy.attach(proxy)
        expect(async () => { await authenticatedProxyInstance.connect(signers[0]).proxyAssert(testTokenInstance.address, 0, abi) }).changeTokenBalance(testTokenInstance, signers[0], amount)

    })

    it("should allow delegatecall", async function () {
        const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
        const AuthenticatedProxy = await ethers.getContractFactory("AuthenticatedProxy", signers[0]);
        const authenticatedProxyInstance = AuthenticatedProxy.attach(proxy)
        const encoded = authenticatedProxyInstance.interface.encodeFunctionData("proxyAssert", [
            await signers[0].getAddress(), 0, '0x'
        ])
        await authenticatedProxyInstance.connect(signers[0]).proxyAssert(proxy, 1, encoded)
    })

    it("should allow revoke", async function () {
        const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
        const AuthenticatedProxy = await ethers.getContractFactory("AuthenticatedProxy", signers[0]);
        const authenticatedProxyInstance = AuthenticatedProxy.attach(proxy)
        await authenticatedProxyInstance.connect(signers[0]).setRevoke(true)
        expect(await authenticatedProxyInstance.callStatic.revoked()).to.be.true;
        await authenticatedProxyInstance.connect(signers[0]).setRevoke(false)
        expect(await authenticatedProxyInstance.callStatic.revoked()).to.be.false;
    })

    it("should not allow revoke from another account", async function () {
        const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
        const AuthenticatedProxy = await ethers.getContractFactory("AuthenticatedProxy", signers[0]);
        const authenticatedProxyInstance = AuthenticatedProxy.attach(proxy)
        await expect(authenticatedProxyInstance.connect(signers[1]).setRevoke(true)).to.be.reverted
    })

})