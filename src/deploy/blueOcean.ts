import { Contract } from '@ethersproject/contracts'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { contractNames } from '../ts/deploy';

interface IDeployedContracts {
  [P: string]: Contract;
}

const deployPowerFanContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  const {
    TestDAO, TestToken,
    TestStatic, BlueOceanDAO,
    BlueOceanToken, BlueOceanDAOProxy,
    BlueOceanExchange, BlueOceanAtomicizer,
    BlueOceanProxyRegistry, BlueOceanTokenTransferProxy } = contractNames;

  let contracts: IDeployedContracts = {};
  const signers = await hre.ethers.getSigners();


  const testToken = await hre.ethers.getContractFactory(TestToken, signers[0])
  contracts.TestToken = await testToken.deploy()

  const testDAO = await hre.ethers.getContractFactory(TestDAO)
  contracts.TestDAO = await testDAO.deploy(contracts.TestToken.address)

  const testStatic = await hre.ethers.getContractFactory(TestStatic)
  contracts.TestStatic = await testStatic.deploy()

  const blueOceanDAOProxy = await hre.ethers.getContractFactory(BlueOceanDAOProxy)
  contracts.BlueOceanDAOProxy = await blueOceanDAOProxy.deploy()

  const blueOceanAtomicizer = await hre.ethers.getContractFactory(BlueOceanAtomicizer)
  contracts.BlueOceanAtomicizer = await blueOceanAtomicizer.deploy()

  const blueOceanProxyRegistry = await hre.ethers.getContractFactory(BlueOceanProxyRegistry)
  contracts.BlueOceanProxyRegistry = await blueOceanProxyRegistry.deploy()

  const blueOceanTokenTransferProxy = await hre.ethers.getContractFactory(BlueOceanTokenTransferProxy)
  contracts.BlueOceanTokenTransferProxy = await blueOceanTokenTransferProxy.deploy(contracts.BlueOceanProxyRegistry.address)

  const blueOceanExchange = await hre.ethers.getContractFactory(BlueOceanExchange)
  contracts.BlueOceanExchange = await blueOceanExchange.deploy(contracts.BlueOceanProxyRegistry.address, contracts.BlueOceanTokenTransferProxy.address, contracts.TestToken.address,await signers[10].getAddress())
  
  contracts.BlueOceanProxyRegistry.connect(signers[0]).grantInitialAuthentication(contracts.BlueOceanExchange.address)
  
  try {
    await hre.run('verify', {
      address: contracts.TestToken.address,
      constructorArgsParams: [],
    })
  } catch (error) {
    console.log(`Smart contract at address ${contracts.TestToken.address} is already verified`)
  }

  try {
    await hre.run('verify', {
      address: contracts.TestDAO.address,
      constructorArgsParams: [contracts.TestToken.address],
    })
  } catch (error) {
    console.log(`Smart contract at address ${contracts.TestDAO.address} is already verified`)
  }

  try {
    await hre.run('verify', {
      address: contracts.TestStatic.address,
      constructorArgsParams: [],
    })
  } catch (error) {
    console.log(`Smart contract at address ${contracts.TestStatic.address} is already verified`)
  }

  try {
    await hre.run('verify', {
      address: contracts.BlueOceanDAOProxy.address,
      constructorArgsParams: [],
    })
  } catch (error) {
    console.log(`Smart contract at address ${contracts.BlueOceanDAOProxy.address} is already verified`)
  }

  try {
    await hre.run('verify', {
      address: contracts.BlueOceanAtomicizer.address,
      constructorArgsParams: [],
    })
  } catch (error) {
    console.log(`Smart contract at address ${contracts.BlueOceanAtomicizer.address} is already verified`)
  }

  try {
    await hre.run('verify', {
      address: contracts.BlueOceanProxyRegistry.address,
      constructorArgsParams: [],
    })
  } catch (error) {
    console.log(`Smart contract at address ${contracts.BlueOceanProxyRegistry.address} is already verified`)
  }

  try {
    await hre.run('verify', {
      address: contracts.BlueOceanTokenTransferProxy.address,
      constructorArgsParams: [contracts.BlueOceanProxyRegistry.address],
    })
  } catch (error) {
    console.log(`Smart contract at address ${contracts.BlueOceanTokenTransferProxy.address} is already verified`)
  }

  try {
    await hre.run('verify', {
      address: contracts.BlueOceanExchange.address,
      constructorArgsParams: [contracts.BlueOceanProxyRegistry.address, contracts.BlueOceanTokenTransferProxy.address, contracts.TestToken.address],
    })
  } catch (error) {
    console.log(`Smart contract at address ${contracts.BlueOceanExchange.address} is already verified`)
  }

}

export default deployPowerFanContract
