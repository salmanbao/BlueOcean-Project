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
TestToken                   => 0x0B1201b813Bf6CE2125d76aC74475accfF943C0E
TestStatic                  => 0x86157fa3f01180C5E7E9921D3fd56492F9baf7F5
BlueOceanNFT                => 0xB57E0073887062fC1741B9D206346cc8E8F46f8F
BlueOceanProxyRegistry      => 0x53d29D539f31e45526bBBEEEB7830C421F12b701
BlueOceanTokenTransferProxy => 0x8977CE6289CBE89dCe50ab49d826519500641b6D
BlueOceanExchange           => 0xBD313085Cc36c935F1970b772933A3a9F1f0f503

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