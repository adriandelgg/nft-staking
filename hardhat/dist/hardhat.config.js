"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config_1 = require("hardhat/config");
require("dotenv/config");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-solhint");
require("@typechain/hardhat");
require("@typechain/ethers-v5");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("solidity-coverage");
require("@openzeppelin/hardhat-upgrades");
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
(0, config_1.task)("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();
    for (const account of accounts) {
        console.log(account.address);
    }
});
const INFURA_KEY = process.env.INFURA_API_KEY;
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
module.exports = {
    defaultNetwork: "localhost",
    gasReporter: {
        currency: "USD",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY ? true : false,
        maxMethodDiff: 10,
        enabled: process.env.REPORT_GAS ? true : false,
        excludeContracts: [],
        src: "./contracts"
    },
    // contractSizer: {
    // 	alphaSort: true,
    // 	runOnCompile: true,
    // 	disambiguatePaths: false
    // },
    networks: {
        // 	// hardhat: {
        // 	// 	forking: {
        // 	// 		url: process.env.INFURA_KEY
        // 	// 	}
        // 	// },
        // 	// mainnet: {
        // 	// 	url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
        // 	// 	accounts: [process.env.PRIVATE_KEY]
        // 	// },
        rinkeby: {
            url: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
            accounts: [process.env.PRIVATE_KEY]
        },
        kovan: {
            url: `https://kovan.infura.io/v3/${INFURA_KEY}`,
            accounts: [process.env.PRIVATE_KEY]
        },
        ropsten: {
            url: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
            accounts: [process.env.PRIVATE_KEY]
        },
        goerli: {
            url: `https://goerli.infura.io/v3/${INFURA_KEY}`
        },
        polygon_mainnet: {
            url: `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
            accounts: [process.env.PRIVATE_KEY]
        },
        mumbai: {
            url: `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`,
            accounts: [process.env.PRIVATE_KEY]
        },
        arbitrum_mainnet: {
            url: `https://arbitrum-mainnet.infura.io/v3/${INFURA_KEY}`,
            accounts: [process.env.PRIVATE_KEY]
        },
        arbitrum_rinkeby: {
            url: `https://arbitrum-rinkeby.infura.io/v3/${INFURA_KEY}`,
            accounts: [process.env.PRIVATE_KEY]
        },
        optimism_mainnet: {
            url: `https://optimism-mainnet.infura.io/v3/${INFURA_KEY}`,
            accounts: [process.env.PRIVATE_KEY]
        },
        optimism_kovan: {
            url: `https://optimism-kovan.infura.io/v3/${INFURA_KEY}`,
            accounts: [process.env.PRIVATE_KEY]
        }
    },
    solidity: {
        compilers: [
            {
                version: "0.8.10",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }
        ]
    }
};
