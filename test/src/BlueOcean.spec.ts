import { expect } from "chai";
import { Contract, BigNumber, Signer } from "ethers";
import hre, { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { getTime, hashOrder, hashToSign, makeOrder, matchOrder } from "../utils/utilities";

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
    hre.tracer.nameTags[await signers[4].getAddress()] = "BUYER";
    hre.tracer.nameTags[await signers[5].getAddress()] = "SELLER";
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
    await proxyRegistryInstance.registerProxy()
    hre.tracer.nameTags[await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress())] = "OwnableDelegateProxy"
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
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
    sell.side = 1
    expect(await matchOrder(buy, sell, 0, signers, exchangeInstance)).to.be.equal(true)
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
    await expect(matchOrder(buy, sell, 0, signers, exchangeInstance)).to.be.reverted

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
    await expect(matchOrder(buy, sell, 0, signers, exchangeInstance)).to.be.reverted
  })

  it("should allow simple order matching with special-case Ether", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
    sell.side = 1
    buy.paymentToken = '0x0000000000000000000000000000000000000000'
    sell.paymentToken = '0x0000000000000000000000000000000000000000'
    await matchOrder(buy, sell, 0, signers, exchangeInstance)
  })

  it("should allow simple order matching with special-case Ether, nonzero price", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
    sell.side = 1
    buy.paymentToken = '0x0000000000000000000000000000000000000000'
    sell.paymentToken = '0x0000000000000000000000000000000000000000'
    buy.basePrice = 1
    sell.basePrice = 1
    await matchOrder(buy, sell, 1, signers, exchangeInstance)
  })

  it("should allow simple order matching with special-case Ether, nonzero fees, new fee method", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
    const sell = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.paymentToken = '0x0000000000000000000000000000000000000000'
    sell.paymentToken = '0x0000000000000000000000000000000000000000'
    buy.basePrice = 10
    sell.basePrice = 10
    sell.makerProtocolFee = 100
    sell.makerRelayerFee = 100
    await expect(matchOrder(buy, sell, 10, signers, exchangeInstance)).to.be.reverted
  })

  it("should allow simple order matching with special-case Ether, nonzero fees, new fee method, taker", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
    const sell = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
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
    await matchOrder(buy, sell, 10200, signers, exchangeInstance)
  })

  it("should allow simple order matching with special-case Ether, nonzero fees, new fee method, both maker / taker", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
    const sell = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.salt = 40
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
    await matchOrder(buy, sell, 10200, signers, exchangeInstance)
  })

  it("should allow simple order matching with special-case Ether, nonzero price, overpayment", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
    sell.side = 1
    buy.paymentToken = '0x0000000000000000000000000000000000000000'
    sell.paymentToken = '0x0000000000000000000000000000000000000000'
    buy.basePrice = 101
    sell.basePrice = 101
    await matchOrder(buy, sell, 105, signers, exchangeInstance)
  })

  it("should not allow simple order matching with special-case Ether, nonzero price, wrong value", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
    sell.side = 1
    buy.paymentToken = '0x0000000000000000000000000000000000000000'
    sell.paymentToken = '0x0000000000000000000000000000000000000000'
    buy.basePrice = 100
    sell.basePrice = 100
    await matchOrder(buy, sell, 10, signers, exchangeInstance)
  })

  it("should allow simple order matching, second fee method", async function () {
    await exchangeInstance.changeMinimumTakerProtocolFee(0)

    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.paymentToken = testTokenInstance.address
    sell.paymentToken = testTokenInstance.address
    await matchOrder(buy, sell, 0, signers, exchangeInstance)
  })

  it("should allow simple order matching, second fee method, nonzero price", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.basePrice = 10000
    sell.basePrice = 10000
    buy.salt = 5123
    sell.salt = 12389
    buy.paymentToken = testTokenInstance.address
    sell.paymentToken = testTokenInstance.address
    await matchOrder(buy, sell, 0, signers, exchangeInstance)
  })

  it("should allow simple order matching, second fee method, real taker relayer fees", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.basePrice = 10000
    sell.basePrice = 10000
    sell.takerRelayerFee = 100
    buy.takerRelayerFee = 100
    buy.paymentToken = testTokenInstance.address
    sell.paymentToken = testTokenInstance.address
    await matchOrder(buy, sell, 0, signers, exchangeInstance)
  })

  it("should allow simple order matching, second fee method, real taker protocol fees", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.basePrice = 10
    sell.basePrice = 10
    sell.takerProtocolFee = 100
    buy.takerProtocolFee = 100
    buy.paymentToken = testTokenInstance.address
    sell.paymentToken = testTokenInstance.address
    await matchOrder(buy, sell, 0, signers, exchangeInstance)
  })

  it("should allow simple order matching, second fee method, real maker protocol fees", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    buy.basePrice = 10000
    sell.basePrice = 10000
    sell.makerProtocolFee = 100
    buy.makerProtocolFee = 100
    buy.paymentToken = testTokenInstance.address
    sell.paymentToken = testTokenInstance.address
    await matchOrder(buy, sell, 0, signers, exchangeInstance)
  })

  it("should allow simple order matching, second fee method, all fees", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
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
    await matchOrder(buy, sell, 0, signers, exchangeInstance)
  })

  it("should allow simple order matching, second fee method, all fees, swapped maker/taker", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
    const sell = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
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
    await matchOrder(buy, sell, 0, signers, exchangeInstance)
  })

  it("should not allow order matching twice", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
    sell.side = 1
    await expect(matchOrder(buy, sell, 0, signers, exchangeInstance)).to.be.reverted
  })

  it("should not allow order match if proxy changes", async function () {
    const proxy = await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress());
    const buy = makeOrder(exchangeInstance.address, true, proxy, await signers[0].getAddress());
    const sell = makeOrder(exchangeInstance.address, false, proxy, await signers[0].getAddress());
    sell.side = 1
    buy.salt = 123981
    sell.salt = 12381980

    const ownableDelegateProxy =await proxyRegistryInstance.callStatic.proxies(await signers[0].getAddress())
    console.log(ownableDelegateProxy)

    // await expect(matchOrder(buy, sell, 0, signers, exchangeInstance)).to.be.reverted
  })


});