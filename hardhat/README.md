# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```

When interacting with the contract from the frontend, there is a specific order that must be called.

Staking:
Single NFT: When staking, you want to call the function `stakeNFT` directly from the NFT smart contract.
This function will call the `stakeNFT` function that's in the staking contract.
When it calls it it will calculate all the logic it needs to keep track of the staker,
rewards, etc.

Multiple NFTs: Same exact thing as when staking just 1 NFT except you will call the `stakeMultipleNFTs`
function in the NFT smart contract.

Unstaking:
Single NFT: To unstake 1 NFT, you directly call the function `unstakeNFT` in the staking contract and pass in the tokenID that you'd like to unstake.

Multiple NFTs: To unstake multiple NFTs, you directly call the function `unstakeMultipleNFTs` in the staking contract and pass in an array of the Token IDs you'd like to unstake.

Withdrawing Rewards:
To withdraw your rewards without unstaking your NFT, you call the function `withdrawRewards` and pass in an array of tokenIDs you'd like to collect rewards from.

There's also the alternative that does not require passing in an array of tokenIDs `withdrawRewardsNoArray` but passing in the array of token IDs is cheaper than calling this.
