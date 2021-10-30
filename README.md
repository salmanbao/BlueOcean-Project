# BlueOcean Project

BlueOcean is a NFT marketplace built upon opensea smart contracts.

The project comes with a variety of other tools, preconfigured to work with the project code.

Try running some of the following tasks:

```shell
npm run build
npm run test
npm run test:logs
npm run watch
npm run deploy:network pulsechain
```

# BlueOcean Smart Contract Addresses on Pulsechain

```
TestToken                   => 0xd842e7C127DB4CE5F9A37769Fd898CF3bFF61BF9
BlueOceanNFT                => 0xCee8508cb2435Fcc06cD0764B2695e7175ccED5d
BlueOceanProxyRegistry      => 0xDcFc29105aD75EffCA6Ba65507aB027eaA1A7110
BlueOceanTokenTransferProxy => 0x6212CD51674bd7456e229238886051e627F1ff3D
BlueOceanExchange           => 0x49F740d2A098056f0F965faa527a92B04f69f7dB

```

# Run scripts
```
npx hardhat run ./scripts/BlueOceanExchange/<file-name> --network <network-name>
```


# Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten node URL (eg from Alchemy), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

```shell
hardhat run --network ropsten scripts/sample-script.ts
```