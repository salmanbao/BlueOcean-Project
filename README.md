# BlueOcean Project

BlueOcean is a NFT marketplace built upon opensea smart contracts.

The project comes with a variety of other tools, preconfigured to work with the project code.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.ts
TS_NODE_FILES=true npx ts-node scripts/deploy.ts
npx eslint '**/*.{js,ts}'
npx eslint '**/*.{js,ts}' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

# BlueOcean Smart Contract Addresses on Rinkeby

```
TestToken                   => 0x9B23972e96549e23D23e967CC3F15e5f6Ed77458
TestStatic                  => 0x86157fa3f01180C5E7E9921D3fd56492F9baf7F5
BlueOceanProxyRegistry      => 0x8A56411Dd68FB00b4EA8A93A966Cb5Ba2e537F3c
BlueOceanTokenTransferProxy => 0x659d81Fd7113C461805131ceA48323c14d9cD5cF
BlueOceanExchange           => 0xb6104Ab14f23D5E9950b56Bf999655e851Eb91c1

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

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"
```