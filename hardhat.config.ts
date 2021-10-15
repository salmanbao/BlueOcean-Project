import yargs from "yargs";
import { utils } from 'ethers';
import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import type { HttpNetworkUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import 'hardhat-contract-sizer';
import "hardhat-gas-reporter";
import 'hardhat-abi-exporter';
import "@typechain/hardhat";
import "solidity-coverage";
import 'hardhat-watcher';
import 'hardhat-tracer';
import 'hardhat-deploy';



dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const argv = yargs.option("network", {
  type: "string",
  default: "hardhat"
})
  .help(false)
  .version(false).argv;

const DEFAULT_MNEMONIC =
  "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

const sharedNetworkConfig: HttpNetworkUserConfig = {
  live: true,
  saveDeployments: true,
  timeout: 8000000,
  gasPrice: "auto",
};
if (process.env.PRIVATE_KEY) {
  sharedNetworkConfig.accounts = [process.env.PRIVATE_KEY];
} else {
  sharedNetworkConfig.accounts = {
    mnemonic: process.env.MNEMONIC || DEFAULT_MNEMONIC,
  };
}
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  namedAccounts: {
    deployer: 0
  },
  paths: {
    tests: "./test/src",
    cache: "./cache",
    deploy: "./src/deploy",
    sources: "./contracts",
    deployments: "./deployments",
    artifacts: "./artifacts",
  },
  solidity: {
    compilers: [
      {
        version: "0.4.23",
        settings: {
          optimizer: {
            runs: 200
          }
        }
      },
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            runs: 200
          }
        }
      }
    ],
    overrides: {
      "contracts/Foo.sol": {
        version: "0.5.5",
        settings: {}
      }
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      accounts: {
        accountsBalance: "100000000000000000000000000000000000000000",
      }
      
    },
    forknet: {
      url: "https://mainnet.infura.io/v3/${process.env.INFURA_KEY}",
    },
    mainnet: {
      ...sharedNetworkConfig,
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
    },
    rinkeby: {
      ...sharedNetworkConfig,
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`,
      chainId: 4,

    },
    ropsten: {
      ...sharedNetworkConfig,
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`,
    },
    kovan: {
      ...sharedNetworkConfig,
      url: `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`,
    },
    xdai: {
      ...sharedNetworkConfig,
      url: "https://xdai.1hive.org",
    },
    polygon: {
      ...sharedNetworkConfig,
      url: "https://rpc-mainnet.maticvigil.com/",
    },
    binancesmartchain: {
      ...sharedNetworkConfig,
      url: "https://bsc-dataseed1.binance.org/",
    },
    bsc: {
      ...sharedNetworkConfig,
      url: "https://data-seed-prebsc-1-s2.binance.org:8545/",
      chainId: 97,
    },
  },
  mocha: {
    timeout: 8000000,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: false,
    disambiguatePaths: false,
  },
  watcher: {
    compilation: {
      tasks: ["compile"],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 10
  },
  abiExporter: {
    path: './data/abi',
    clear: true,
    flat: true,
    only: [':BlueOcean$'],
    spacing: 2,
    pretty: true,
  }
};

export default config;
