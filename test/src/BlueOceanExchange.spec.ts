import { expect } from "chai";
import { Contract, BigNumber, Signer } from "ethers";
import hre, { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { getTime, hashOrder, hashToSign, Identities, makeOrder, matchOrder } from "../utils/utilities";

describe("BlueOcean Exchange", function () {

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
    const OwnabledDelegateProxy = await ethers.getContractFactory("OwnableDelegateProxy", signers[0]);
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

  it("should allow simple array replacement", async function () {
    expect(await exchangeInstance.callStatic.guardedArrayReplace('0xff', '0x00', '0xff')).to.be.equal("0x00")
  })

  it("should disallow array replacement", async function () {
    expect(await exchangeInstance.callStatic.guardedArrayReplace('0xff', '0x00', '0x00')).to.be.equal("0xff")
  })

  it("should allow complex array replacment", async function () {
    expect(await exchangeInstance.callStatic.guardedArrayReplace('0x0000000000000000', '0xffffffffffffffff', '0x00ff00ff00ff00ff'))
      .to.be.equal("0x00ff00ff00ff00ff")
  })

  it("should allow trivial array replacement", async function () {
    expect(await exchangeInstance.callStatic.guardedArrayReplace('0x00', '0x11', '0xff'))
      .to.be.equal("0x11")
  })

  it("should allow trivial array replacement 2", async function () {
    expect(await exchangeInstance.callStatic.guardedArrayReplace('0xff', '0x00', '0xff'))
      .to.be.equal("0x00")
  })

  it("should allow basic array replacement A", async function () {
    expect(await exchangeInstance.callStatic.guardedArrayReplace(
      '0x23b872dd0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000065abe5f01cf94d37762780695cf19b151ed5809000000000000000000000000000000000000000000000000000000000000006f',
      '0x23b872dd000000000000000000000000431e44389a003f0ec6e83b3578db5075a44ac5230000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006f',
      '0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    ))
      .to.be.equal("0x23b872dd000000000000000000000000431e44389a003f0ec6e83b3578db5075a44ac523000000000000000000000000065abe5f01cf94d37762780695cf19b151ed5809000000000000000000000000000000000000000000000000000000000000006f")
  })

  it("should allow basic array replacement B", async function () {
    expect(await exchangeInstance.callStatic.guardedArrayReplace(
      '0x23b872dd000000000000000000000000431e44389a003f0ec6e83b3578db5075a44ac5230000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006f',
      '0x23b872dd0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000065abe5f01cf94d37762780695cf19b151ed5809000000000000000000000000000000000000000000000000000000000000006f',
      '0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000'
    ))
      .to.be.equal("0x23b872dd000000000000000000000000431e44389a003f0ec6e83b3578db5075a44ac523000000000000000000000000065abe5f01cf94d37762780695cf19b151ed5809000000000000000000000000000000000000000000000000000000000000006f")
  })

  it("should allow basic array replacement C", async function () {
    expect(await exchangeInstance.callStatic.guardedArrayReplace(
      '0xff23b872dd0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000065abe5f01cf94d37762780695cf19b151ed5809000000000000000000000000000000000000000000000000000000000000006fff',
      '0x0023b872dd000000000000000000000000431e44389a003f0ec6e83b3578db5075a44ac5230000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006f00',
      '0xff00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ff'
    ))
      .to.be.equal("0x0023b872dd000000000000000000000000431e44389a003f0ec6e83b3578db5075a44ac523000000000000000000000000065abe5f01cf94d37762780695cf19b151ed5809000000000000000000000000000000000000000000000000000000000000006f00")
  })

  it("should allow large complex array replacment", async function () {
    expect(await exchangeInstance.callStatic.guardedArrayReplace(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      '0x00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff'
    ))
      .to.be.equal("0x00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff")
  })

  it("should allow simple calldata match", async function () {
    expect(await exchangeInstance.callStatic.orderCalldataCanMatch(
      '0x00', '0xff', '0xff', '0x00'
    ))
      .to.be.equal(true)
  })

  it("should allow flexible calldata match", async function () {
    expect(await exchangeInstance.callStatic.orderCalldataCanMatch(
      '0x00', '0xff', '0xff', '0xff'
    ))
      .to.be.equal(true)
  })

  it("should allow complex calldata match", async function () {
    expect(await exchangeInstance.callStatic.orderCalldataCanMatch(
      '0x0000000000000000', '0x00ff00ff00ff00ff', '0x00ff00ff00ff00ff', '0x0000000000000000'
    ))
      .to.be.equal(true)
  })

  it("should allow complex large calldata match", async function () {
    expect(await exchangeInstance.callStatic.orderCalldataCanMatch(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff',
      '0x00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff',
      '0x0000000000000000000000000000000000000000000000000000000000000000'
    ))
      .to.be.equal(true)
  })

  it("should disallow false complex calldata match", async function () {
    expect(await exchangeInstance.callStatic.orderCalldataCanMatch(
      '0x0000000000000000',
      '0x0000000000000000',
      '0x00ff00ff00ff00ff',
      '0x0000000000000000'
    ))
      .to.be.equal(false)
  })

  it("should revert on different bytecode size", async function () {
    await expect(exchangeInstance.orderCalldataCanMatch(
      '0x0000000000000000',
      '0x0000000000000000',
      '0x00ff00ff00ff00',
      '0x0000000000000000'
    )).to.be.reverted;

  })

  it("should revert on insufficient replacementPattern size", async function () {
    await expect(exchangeInstance.orderCalldataCanMatch(
      '0x00000000000000000000000000000000',
      '0x00',
      '0x00ff00ff00ff00ff0000000000000000',
      '0x00'
    )).to.be.reverted;

  })

  it("should allow changing minimum maker protocol fee", async function () {
    await exchangeInstance.changeMinimumMakerProtocolFee(1)
    expect(await exchangeInstance.callStatic.minimumMakerProtocolFee()).to.equal(1)

  })

  it("should allow changing minimum taker protocol fee", async function () {
    await exchangeInstance.changeMinimumTakerProtocolFee(1)
    expect(await exchangeInstance.callStatic.minimumTakerProtocolFee()).to.equal(1)
  })

  it("should allow changing protocol fee recipient", async function () {
    await exchangeInstance.changeProtocolFeeRecipient(await signers[10].getAddress())
    expect(await exchangeInstance.callStatic.protocolFeeRecipient()).to.equal(await signers[10].getAddress())
  })

  it("should allow proxy creation", async function () {
    hre.tracer.nameTags[await proxyRegistryInstance.callStatic.delegateProxyImplementation()] = "AuthenticatedProxy"
    await proxyRegistryInstance.connect(signers[0]).registerProxy()
    hre.tracer.nameTags[await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress())] = "ADMIN-OwnableDelegateProxy"

    await proxyRegistryInstance.connect(signers[4]).registerProxy()
    hre.tracer.nameTags[await proxyRegistryInstance.callStatic.proxies(await signers[4].getAddress())] = "BUYER1-OwnableDelegateProxy"

    await proxyRegistryInstance.connect(signers[5]).registerProxy()
    hre.tracer.nameTags[await proxyRegistryInstance.callStatic.proxies(await signers[5].getAddress())] = "SELLER1-OwnableDelegateProxy"

    await proxyRegistryInstance.connect(signers[6]).registerProxy()
    hre.tracer.nameTags[await proxyRegistryInstance.callStatic.proxies(await signers[6].getAddress())] = "SELLER2-OwnableDelegateProxy"

    await proxyRegistryInstance.connect(signers[7]).registerProxy()
    hre.tracer.nameTags[await proxyRegistryInstance.callStatic.proxies(await signers[7].getAddress())] = "SELLER2-OwnableDelegateProxy"
  })

  it("should match order hash", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const order = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
    const hash = hashOrder(order)
    expect(await exchangeInstance.callStatic.hashOrder_(
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata
    )).to.be.equal(hash)
  })

  it("should match order hash to sign", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const order = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
    const hash = hashToSign(order)

    expect(await exchangeInstance.callStatic.hashToSign_(
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata
    )).to.be.equal(hash)
  })

  it("should validate order", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const order = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    order.saleKind = 0
    order.listingTime = 1
    order.expirationTime = 1000
    const hash = hashOrder(order)

    expect(await exchangeInstance.callStatic.validateOrderParameters_(
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata
    )).to.be.equal(true)

    expect(await exchangeInstance.callStatic.calculateCurrentPrice_(
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata
    )).to.be.equal(BigNumber.from(0))
  })

  it("should not validate order with invalid saleKind / expiration", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const order = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    order.saleKind = 0
    const hash = hashOrder(order)
    let signature = await signers[0].signMessage(hash)
    signature = signature.substr(2)
    const r = '0x' + signature.slice(0, 64)
    const s = '0x' + signature.slice(64, 128)
    const v = 27 + parseInt('0x' + signature.slice(128, 130), 16)

    expect(await exchangeInstance.callStatic.validateOrder_(
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata,
      v, r, s
    )).to.be.equal(false)
  })

  it("should not validate order with invalid exchange", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const order = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    order.exchange = await signers[0].getAddress();
    const hash = hashOrder(order)
    let signature = await signers[0].signMessage(hash)
    signature = signature.substr(2)
    const r = '0x' + signature.slice(0, 64)
    const s = '0x' + signature.slice(64, 128)
    const v = 27 + parseInt('0x' + signature.slice(128, 130), 16)

    expect(await exchangeInstance.callStatic.validateOrder_(
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata,
      v, r, s
    )).to.be.equal(false)
  })

  it("should not validate order with invalid maker protocol fees", async function () {
    await exchangeInstance.changeMinimumMakerProtocolFee(1)
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const order = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    order.feeMethod = 1
    order.salt = 213898123
    const hash = hashOrder(order)
    let signature = await signers[0].signMessage(hash)
    signature = signature.substr(2)
    const r = '0x' + signature.slice(0, 64)
    const s = '0x' + signature.slice(64, 128)
    const v = 27 + parseInt('0x' + signature.slice(128, 130), 16)

    expect(await exchangeInstance.callStatic.validateOrder_(
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata,
      v, r, s
    )).to.be.equal(false)

    await exchangeInstance.changeMinimumMakerProtocolFee(0)
  })

  it("should not validate order with invalid taker protocol fees", async function () {
    await exchangeInstance.changeMinimumMakerProtocolFee(1)
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const order = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    order.feeMethod = 1
    order.salt = 21389812323
    const hash = hashOrder(order)
    let signature = await signers[0].signMessage(hash)
    signature = signature.substr(2)
    const r = '0x' + signature.slice(0, 64)
    const s = '0x' + signature.slice(64, 128)
    const v = 27 + parseInt('0x' + signature.slice(128, 130), 16)

    expect(await exchangeInstance.callStatic.validateOrder_(
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata,
      v, r, s
    )).to.be.equal(false)
    await exchangeInstance.changeMinimumMakerProtocolFee(0)
  })

  it("should have correct prices for dutch auctions", async function () {
    const time = await getTime();
    expect(await exchangeInstance.callStatic.calculateFinalPrice(1, 1, 100, 100, time, time + 100))
      .to.be.equal(100);

    expect(await exchangeInstance.callStatic.calculateFinalPrice(1, 1, 100, 100, time - 100, time))
      .to.be.equal(0)

    expect(await exchangeInstance.callStatic.calculateFinalPrice(0, 1, 100, 100, time - 50, time + 50))
      .to.be.equal(150)

    expect(await exchangeInstance.callStatic.calculateFinalPrice(0, 1, 100, 200, time - 50, time + 50))
      .to.be.equal(200)

  })

  it("should not validate order from different address", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const order = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());

    expect(await exchangeInstance.connect(signers[1]).callStatic.validateOrder_(
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata,
      0,
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )).to.be.equal(false)
  })

  it("should not allow order approval from different address", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const order = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());

    await expect(exchangeInstance.connect(signers[4]).approveOrder_(
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata,
      true,
    )).to.be.reverted
  })

  it("should allow order approval, then cancellation", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const order = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());

    await exchangeInstance.connect(signers[4]).approveOrder_(
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata,
      true,
    )

    expect(await exchangeInstance.connect(signers[4]).callStatic.validateOrder_(
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata,
      0,
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )).to.be.equal(true);

    await exchangeInstance.connect(signers[4]).cancelOrder_(
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata,
      0,
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )

    expect(await exchangeInstance.connect(signers[4]).callStatic.validateOrder_(
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata,
      0,
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )).to.be.equal(false);


  })

  it("should have correct auth", async function () {
    expect(await proxyRegistryInstance.callStatic.contracts(exchangeInstance.address)).to.be.equal(true)
  })

  it("should allow approval", async function () {
    await testTokenInstance.approve(tokenTransferProxyInstance.address, 10000000000)
  })

  it("should allow simple order matching", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[6].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[7].getAddress());
    sell.side = 1
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[6],
      seller: signers[7],
    }
    expect(await matchOrder(buy, sell, 0, identities, exchangeInstance)).to.be.equal(true)
  })

  it("should not allow match with mismatched calldata", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
    sell.side = 1
    buy.calldata = '0x00ff00ff'
    buy.replacementPattern = '0x00000000'
    sell.calldata = '0xff00ff00'
    sell.replacementPattern = '0x00ff00ff'

    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await expect(matchOrder(buy, sell, 0, identities, exchangeInstance)).to.be.reverted

  })

  it("should not allow match with mismatched calldata, flipped sides", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
    sell.side = 1
    sell.calldata = '0x00ff00ff'
    sell.replacementPattern = '0x00000000'
    buy.calldata = '0xff00ff00'
    buy.replacementPattern = '0x00ff00ff'

    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await expect(matchOrder(buy, sell, 0, identities, exchangeInstance)).to.be.reverted
  })

  it("should allow simple order matching with special-case Ether", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    buy.paymentToken = '0x0000000000000000000000000000000000000000'
    buy.salt = 2
    sell.paymentToken = '0x0000000000000000000000000000000000000000'
    sell.salt = 2
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 0, identities, exchangeInstance)
  })

  it("should allow simple order matching with special-case Ether, nonzero price", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    buy.paymentToken = '0x0000000000000000000000000000000000000000'
    sell.paymentToken = '0x0000000000000000000000000000000000000000'
    buy.basePrice = 1
    sell.basePrice = 1
    buy.salt = 3
    sell.salt = 3
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 1, identities, exchangeInstance)
  })

  it("should allow simple order matching with special-case Ether, nonzero fees, new fee method", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, false, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, true, proxy, await signers[5].getAddress());
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.paymentToken = '0x0000000000000000000000000000000000000000'
    sell.paymentToken = '0x0000000000000000000000000000000000000000'
    buy.basePrice = 10
    sell.basePrice = 10
    sell.makerProtocolFee = 100
    sell.makerRelayerFee =
      buy.salt = 4
    sell.salt = 4
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await expect(matchOrder(buy, sell, 10, identities, exchangeInstance)).to.be.reverted
  })

  it("should allow simple order matching with special-case Ether, nonzero fees, new fee method, taker", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, false, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, true, proxy, await signers[5].getAddress());
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.paymentToken = '0x0000000000000000000000000000000000000000'
    sell.paymentToken = '0x0000000000000000000000000000000000000000'
    buy.basePrice = 10000
    sell.basePrice = 10000
    sell.takerProtocolFee = 100
    sell.takerRelayerFee = 100
    buy.takerProtocolFee = 100
    buy.takerRelayerFee = 100
    buy.salt = 5
    sell.salt = 5
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 10200, identities, exchangeInstance)
  })

  it("should allow simple order matching with special-case Ether, nonzero fees, new fee method, both maker / taker", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, false, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, true, proxy, await signers[5].getAddress());
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.paymentToken = '0x0000000000000000000000000000000000000000'
    sell.paymentToken = '0x0000000000000000000000000000000000000000'
    buy.basePrice = 10000
    sell.basePrice = 10000
    sell.makerProtocolFee = 100
    sell.makerRelayerFee = 100
    sell.takerProtocolFee = 100
    sell.takerRelayerFee = 100
    buy.takerProtocolFee = 100
    buy.takerRelayerFee = 100
    buy.salt = 6
    sell.salt = 6
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 10200, identities, exchangeInstance)
  })

  it("should allow simple order matching with special-case Ether, nonzero price, overpayment", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    buy.paymentToken = '0x0000000000000000000000000000000000000000'
    sell.paymentToken = '0x0000000000000000000000000000000000000000'
    buy.basePrice = 101
    sell.basePrice = 101
    buy.salt = 7
    sell.salt = 7
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 105, identities, exchangeInstance)
  })

  it("should not allow simple order matching with special-case Ether, nonzero price, wrong value", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    buy.paymentToken = '0x0000000000000000000000000000000000000000'
    sell.paymentToken = '0x0000000000000000000000000000000000000000'
    buy.basePrice = 100
    sell.basePrice = 100
    buy.salt = 8
    sell.salt = 8
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 10, identities, exchangeInstance)
  })

  it("should allow simple order matching, second fee method", async function () {
    await exchangeInstance.changeMinimumTakerProtocolFee(0)

    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.salt = 9
    sell.salt = 9
    buy.paymentToken = testTokenInstance.address
    sell.paymentToken = testTokenInstance.address
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 0, identities, exchangeInstance)
  })

  it("should allow simple order matching, second fee method, nonzero price", async function () {
    await testTokenInstance.connect(signers[0]).transfer(await signers[4].getAddress(), 100000)
    await testTokenInstance.connect(signers[0]).transfer(await signers[5].getAddress(), 100000)

    await testTokenInstance.connect(signers[4]).approve(tokenTransferProxyInstance.address, 100000)
    await testTokenInstance.connect(signers[5]).approve(tokenTransferProxyInstance.address, 100000)


    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.basePrice = 10000
    sell.basePrice = 10000
    buy.salt = 10
    sell.salt = 10
    buy.paymentToken = testTokenInstance.address
    sell.paymentToken = testTokenInstance.address
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 0, identities, exchangeInstance)
  })

  it("should allow simple order matching, second fee method, real taker relayer fees", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.basePrice = 10000
    sell.basePrice = 10000
    sell.takerRelayerFee = 100
    buy.takerRelayerFee = 100
    buy.paymentToken = testTokenInstance.address
    sell.paymentToken = testTokenInstance.address
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 0, identities, exchangeInstance)
  })

  it("should allow simple order matching, second fee method, real taker protocol fees", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.basePrice = 10
    sell.basePrice = 10
    sell.takerProtocolFee = 100
    buy.takerProtocolFee = 100
    buy.paymentToken = testTokenInstance.address
    sell.paymentToken = testTokenInstance.address
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 0, identities, exchangeInstance)
  })

  it("should allow simple order matching, second fee method, real maker protocol fees", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.basePrice = 10000
    sell.basePrice = 10000
    sell.makerProtocolFee = 100
    buy.makerProtocolFee = 100
    buy.paymentToken = testTokenInstance.address
    sell.paymentToken = testTokenInstance.address
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 0, identities, exchangeInstance)
  })

  it("should allow simple order matching, second fee method, all fees", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.basePrice = 10000
    sell.basePrice = 10000
    sell.makerProtocolFee = 100
    buy.makerProtocolFee = 200
    sell.makerRelayerFee = 100
    buy.makerRelayerFee = 100
    sell.takerProtocolFee = 100
    buy.takerProtocolFee = 100
    sell.takerRelayerFee = 100
    buy.takerRelayerFee = 100
    buy.paymentToken = testTokenInstance.address
    sell.paymentToken = testTokenInstance.address
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 0, identities, exchangeInstance)
  })

  it("should allow simple order matching, second fee method, all fees, swapped maker/taker", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, false, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, true, proxy, await signers[5].getAddress());
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.basePrice = 10000
    sell.basePrice = 10000
    sell.makerProtocolFee = 100
    buy.makerProtocolFee = 100
    sell.makerRelayerFee = 100
    buy.makerRelayerFee = 100
    sell.takerProtocolFee = 100
    buy.takerProtocolFee = 100
    sell.takerRelayerFee = 100
    buy.takerRelayerFee = 100
    buy.paymentToken = testTokenInstance.address
    sell.paymentToken = testTokenInstance.address
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 0, identities, exchangeInstance)
  })

  it("should not allow order matching twice", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await expect(matchOrder(buy, sell, 0, identities, exchangeInstance)).to.be.reverted
  })

  it("should not allow order match if proxy changes", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    buy.salt = 123981
    sell.salt = 12381980
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    const ownableDelegateProxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress())
    const OwnabledDelegateProxy = await ethers.getContractFactory("OwnableDelegateProxy", signers[0]);
    ownabledDelegateProxyInstance = OwnabledDelegateProxy.attach(ownableDelegateProxy)
    ownabledDelegateProxyInstance.connect(signers[0]).upgradeTo(proxyRegistryInstance.address)
    await expect(matchOrder(buy, sell, 0, identities, exchangeInstance)).to.be.reverted;
    const implementation = await proxyRegistryInstance.callStatic.delegateProxyImplementation()
    await ownabledDelegateProxyInstance.connect(signers[0]).upgradeTo(implementation)
  })

  it('should not allow proxy reentrancy', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    sell.salt = 1223
    buy.salt = 113
    sell.target = exchangeInstance.address
    buy.target = exchangeInstance.address
    console.log(exchangeInstance.interface.getFunction("atomicMatch_"))
    const calldata = exchangeInstance.interface.encodeFunctionData("atomicMatch_", [
      [buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken],
      [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
      [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall],
      buy.calldata,
      sell.calldata,
      buy.replacementPattern,
      sell.replacementPattern,
      buy.staticExtradata,
      sell.staticExtradata,
      [0, 0],
      ['0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000']
    ]
    )
    sell.calldata = calldata
    buy.calldata = calldata

    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await expect(matchOrder(buy, sell, 0, identities, exchangeInstance)).to.be.reverted;

  })

  it('should fail with same side', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await expect(matchOrder(buy, sell, 0, identities, exchangeInstance)).to.be.reverted;
  })

  it('should fail with different payment token', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    sell.salt = 43332
    buy.salt = 5343
    buy.paymentToken = await signers[0].getAddress()
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await expect(matchOrder(buy, sell, 0, identities, exchangeInstance)).to.be.reverted;
  })

  it('should fail with wrong maker/taker', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    sell.salt = 1234
    buy.salt = 4321
    buy.taker = await signers[10].getAddress()
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await expect(matchOrder(buy, sell, 0, identities, exchangeInstance)).to.be.reverted;
  })

  it('should succeed with zero-address taker', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    sell.salt = 1214
    buy.salt = 4311
    buy.taker = '0x0000000000000000000000000000000000000000'
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 0, identities, exchangeInstance)
  })

  it('should fail with different target', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    sell.salt = 1114
    buy.salt = 4221
    buy.target = await signers[10].getAddress()
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await expect(matchOrder(buy, sell, 0, identities, exchangeInstance)).to.be.reverted;
  })

  it('should fail with different howToCall', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    buy.howToCall = 1
    sell.salt = 11334
    buy.salt = 4111
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await expect(matchOrder(buy, sell, 0, identities, exchangeInstance)).to.be.reverted;
  })

  it('should fail with listing time past now', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    buy.howToCall = 1
    sell.salt = 134
    buy.salt = 11
    buy.listingTime = Math.pow(10, 10)
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await expect(matchOrder(buy, sell, 0, identities, exchangeInstance)).to.be.reverted;
  })

  it('should fail with expiration time prior to now', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    buy.howToCall = 1
    sell.salt = 134
    buy.salt = 11
    buy.expirationTime = Math.pow(10, 1)
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await expect(matchOrder(buy, sell, 0, identities, exchangeInstance)).to.be.reverted;
  })

  it('should succeed with real token transfer', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    sell.salt = 44422
    buy.salt = 54429
    buy.paymentToken = testTokenInstance.address
    sell.paymentToken = testTokenInstance.address
    buy.basePrice = 10
    sell.basePrice = 10
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 0, identities, exchangeInstance)
  })

  it('should succeed with real fee', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    sell.salt = 42122
    buy.salt = 53233
    buy.makerRelayerFee = 10
    buy.takerRelayerFee = 10
    sell.makerRelayerFee = 10
    sell.takerRelayerFee = 10
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 0, identities, exchangeInstance)
  })

  it('should succeed with real fee, opposite maker-taker', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, false, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, true, proxy, await signers[5].getAddress());
    sell.side = 1
    sell.salt = 42
    buy.salt = 233
    buy.makerRelayerFee = 10
    buy.takerRelayerFee = 10
    sell.makerRelayerFee = 10
    sell.takerRelayerFee = 10
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 0, identities, exchangeInstance)
  })

  it('should fail with real fee but insufficient amount', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    sell.salt = 421
    buy.salt = 2331
    buy.makerRelayerFee = Math.pow(10, 18)
    buy.takerRelayerFee = Math.pow(10, 18)
    sell.makerRelayerFee = Math.pow(10, 18)
    sell.takerRelayerFee = Math.pow(10, 18)
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await expect(matchOrder(buy, sell, 0, identities, exchangeInstance)).to.be.reverted;
  })

  it('should fail with real fee but unmatching fees', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    sell.salt = 91
    buy.salt = 21
    buy.makerRelayerFee = 10
    buy.takerRelayerFee = 10
    sell.makerRelayerFee = 0
    sell.takerRelayerFee = 0
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await expect(matchOrder(buy, sell, 0, identities, exchangeInstance)).to.be.reverted;
  })

  it('should fail with real fee but unmatching fees, opposite maker/taker', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, false, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, true, proxy, await signers[5].getAddress());
    sell.side = 1
    sell.salt = 92
    buy.salt = 22
    buy.makerRelayerFee = 0
    buy.takerRelayerFee = 0
    sell.makerRelayerFee = 10
    sell.takerRelayerFee = 10
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await expect(matchOrder(buy, sell, 0, identities, exchangeInstance)).to.be.reverted;
  })

  it('should succeed with successful static call', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    sell.salt = 93
    buy.salt = 23
    buy.staticTarget = testStaticInstance.address

    buy.staticExtradata = testStaticInstance.interface.encodeFunctionData("alwaysSucceed")
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 0, identities, exchangeInstance)
  })

  it('should succeed with successful static call sell-side', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    sell.salt = 94
    buy.salt = 25
    sell.staticTarget = testStaticInstance.address
    sell.staticExtradata = testStaticInstance.interface.encodeFunctionData("alwaysSucceed")
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 0, identities, exchangeInstance)
  })

  it('should succeed with successful static call both-side', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    sell.salt = 95
    buy.salt = 26
    buy.staticTarget = testStaticInstance.address
    sell.staticTarget = testStaticInstance.address
    buy.staticExtradata = testStaticInstance.interface.encodeFunctionData("alwaysSucceed")
    sell.staticExtradata = testStaticInstance.interface.encodeFunctionData("alwaysSucceed")
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 0, identities, exchangeInstance)
  })

  it('should fail with unsuccessful static call', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    sell.salt = 96
    buy.salt = 27
    buy.staticTarget = testStaticInstance.address
    buy.staticExtradata = testStaticInstance.interface.encodeFunctionData("alwaysFail")
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await expect(matchOrder(buy, sell, 0, identities, exchangeInstance)).to.be.reverted;
  })

  it('should fail with unsuccessful static call sell-side', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    sell.salt = 97
    buy.salt = 28
    sell.staticTarget = testStaticInstance.address
    sell.staticExtradata = testStaticInstance.interface.encodeFunctionData("alwaysFail")
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await expect(matchOrder(buy, sell, 0, identities, exchangeInstance)).to.be.reverted;
  })

  it('should fail after proxy revocation', async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const AuthenticatedProxy = await ethers.getContractFactory("AuthenticatedProxy", signers[0])
    const authenticatedProxyInstance = AuthenticatedProxy.attach(proxy);
    await authenticatedProxyInstance.connect(signers[0]).setRevoke(true);

    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[4].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[5].getAddress());
    sell.side = 1
    sell.salt = 99
    buy.salt = 29
    const identities: Identities = {
      matcher: signers[11],
      buyer: signers[4],
      seller: signers[5]
    }
    await matchOrder(buy, sell, 0, identities, exchangeInstance)
    await authenticatedProxyInstance.connect(signers[0]).setRevoke(false);
    await authenticatedProxyInstance.connect(signers[0]).revoked();
    expect(await authenticatedProxyInstance.callStatic.revoked()).to.be.equal(false)
  })


});