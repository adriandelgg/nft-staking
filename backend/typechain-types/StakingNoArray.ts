/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export interface StakingNoArrayInterface extends utils.Interface {
  functions: {
    "erc20Token()": FunctionFragment;
    "getStakeContractBalance()": FunctionFragment;
    "nftToken()": FunctionFragment;
    "onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)": FunctionFragment;
    "onERC1155Received(address,address,uint256,uint256,bytes)": FunctionFragment;
    "owner()": FunctionFragment;
    "receipt(uint256)": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "stakeMultipleNFTs(address,uint256[])": FunctionFragment;
    "stakeNFT(address,uint256)": FunctionFragment;
    "supportsInterface(bytes4)": FunctionFragment;
    "tokensPerBlock()": FunctionFragment;
    "totalNFTsStaked()": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "unstakeMultipleNFTs(uint256[])": FunctionFragment;
    "unstakeNFT(uint256)": FunctionFragment;
    "updateStakingReward(uint256)": FunctionFragment;
    "withdrawRewards(uint256[])": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "erc20Token",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getStakeContractBalance",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "nftToken", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "onERC1155BatchReceived",
    values: [string, string, BigNumberish[], BigNumberish[], BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "onERC1155Received",
    values: [string, string, BigNumberish, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "receipt",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "stakeMultipleNFTs",
    values: [string, BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "stakeNFT",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "tokensPerBlock",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "totalNFTsStaked",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "unstakeMultipleNFTs",
    values: [BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "unstakeNFT",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "updateStakingReward",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawRewards",
    values: [BigNumberish[]]
  ): string;

  decodeFunctionResult(functionFragment: "erc20Token", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getStakeContractBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "nftToken", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "onERC1155BatchReceived",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "onERC1155Received",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "receipt", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "stakeMultipleNFTs",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "stakeNFT", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "tokensPerBlock",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "totalNFTsStaked",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "unstakeMultipleNFTs",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "unstakeNFT", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "updateStakingReward",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "withdrawRewards",
    data: BytesLike
  ): Result;

  events: {
    "NFTStaked(address,uint256,uint256)": EventFragment;
    "NFTUnStaked(address,uint256,uint256)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
    "StakePayout(address,uint256,uint256,uint256,uint256)": EventFragment;
    "StakeRewardUpdated(uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "NFTStaked"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "NFTUnStaked"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "StakePayout"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "StakeRewardUpdated"): EventFragment;
}

export type NFTStakedEvent = TypedEvent<
  [string, BigNumber, BigNumber],
  { staker: string; tokenId: BigNumber; blockNumber: BigNumber }
>;

export type NFTStakedEventFilter = TypedEventFilter<NFTStakedEvent>;

export type NFTUnStakedEvent = TypedEvent<
  [string, BigNumber, BigNumber],
  { staker: string; tokenId: BigNumber; blockNumber: BigNumber }
>;

export type NFTUnStakedEventFilter = TypedEventFilter<NFTUnStakedEvent>;

export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  { previousOwner: string; newOwner: string }
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export type StakePayoutEvent = TypedEvent<
  [string, BigNumber, BigNumber, BigNumber, BigNumber],
  {
    staker: string;
    tokenId: BigNumber;
    stakeAmount: BigNumber;
    fromBlock: BigNumber;
    toBlock: BigNumber;
  }
>;

export type StakePayoutEventFilter = TypedEventFilter<StakePayoutEvent>;

export type StakeRewardUpdatedEvent = TypedEvent<
  [BigNumber],
  { rewardPerBlock: BigNumber }
>;

export type StakeRewardUpdatedEventFilter =
  TypedEventFilter<StakeRewardUpdatedEvent>;

export interface StakingNoArray extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: StakingNoArrayInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    erc20Token(overrides?: CallOverrides): Promise<[string]>;

    getStakeContractBalance(overrides?: CallOverrides): Promise<[BigNumber]>;

    nftToken(overrides?: CallOverrides): Promise<[string]>;

    onERC1155BatchReceived(
      arg0: string,
      arg1: string,
      arg2: BigNumberish[],
      arg3: BigNumberish[],
      arg4: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    onERC1155Received(
      arg0: string,
      arg1: string,
      arg2: BigNumberish,
      arg3: BigNumberish,
      arg4: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    receipt(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber] & { owner: string; stakedFromBlock: BigNumber }
    >;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    stakeMultipleNFTs(
      from: string,
      tokenIds: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    stakeNFT(
      from: string,
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    tokensPerBlock(overrides?: CallOverrides): Promise<[BigNumber]>;

    totalNFTsStaked(overrides?: CallOverrides): Promise<[BigNumber]>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    unstakeMultipleNFTs(
      tokenIds: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    unstakeNFT(
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    updateStakingReward(
      _tokensPerBlock: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    withdrawRewards(
      tokenIds: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  erc20Token(overrides?: CallOverrides): Promise<string>;

  getStakeContractBalance(overrides?: CallOverrides): Promise<BigNumber>;

  nftToken(overrides?: CallOverrides): Promise<string>;

  onERC1155BatchReceived(
    arg0: string,
    arg1: string,
    arg2: BigNumberish[],
    arg3: BigNumberish[],
    arg4: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  onERC1155Received(
    arg0: string,
    arg1: string,
    arg2: BigNumberish,
    arg3: BigNumberish,
    arg4: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  owner(overrides?: CallOverrides): Promise<string>;

  receipt(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [string, BigNumber] & { owner: string; stakedFromBlock: BigNumber }
  >;

  renounceOwnership(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  stakeMultipleNFTs(
    from: string,
    tokenIds: BigNumberish[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  stakeNFT(
    from: string,
    tokenId: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  supportsInterface(
    interfaceId: BytesLike,
    overrides?: CallOverrides
  ): Promise<boolean>;

  tokensPerBlock(overrides?: CallOverrides): Promise<BigNumber>;

  totalNFTsStaked(overrides?: CallOverrides): Promise<BigNumber>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  unstakeMultipleNFTs(
    tokenIds: BigNumberish[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  unstakeNFT(
    tokenId: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  updateStakingReward(
    _tokensPerBlock: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  withdrawRewards(
    tokenIds: BigNumberish[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    erc20Token(overrides?: CallOverrides): Promise<string>;

    getStakeContractBalance(overrides?: CallOverrides): Promise<BigNumber>;

    nftToken(overrides?: CallOverrides): Promise<string>;

    onERC1155BatchReceived(
      arg0: string,
      arg1: string,
      arg2: BigNumberish[],
      arg3: BigNumberish[],
      arg4: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    onERC1155Received(
      arg0: string,
      arg1: string,
      arg2: BigNumberish,
      arg3: BigNumberish,
      arg4: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    owner(overrides?: CallOverrides): Promise<string>;

    receipt(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber] & { owner: string; stakedFromBlock: BigNumber }
    >;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    stakeMultipleNFTs(
      from: string,
      tokenIds: BigNumberish[],
      overrides?: CallOverrides
    ): Promise<void>;

    stakeNFT(
      from: string,
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<boolean>;

    tokensPerBlock(overrides?: CallOverrides): Promise<BigNumber>;

    totalNFTsStaked(overrides?: CallOverrides): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    unstakeMultipleNFTs(
      tokenIds: BigNumberish[],
      overrides?: CallOverrides
    ): Promise<void>;

    unstakeNFT(tokenId: BigNumberish, overrides?: CallOverrides): Promise<void>;

    updateStakingReward(
      _tokensPerBlock: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawRewards(
      tokenIds: BigNumberish[],
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "NFTStaked(address,uint256,uint256)"(
      staker?: string | null,
      tokenId?: null,
      blockNumber?: null
    ): NFTStakedEventFilter;
    NFTStaked(
      staker?: string | null,
      tokenId?: null,
      blockNumber?: null
    ): NFTStakedEventFilter;

    "NFTUnStaked(address,uint256,uint256)"(
      staker?: string | null,
      tokenId?: null,
      blockNumber?: null
    ): NFTUnStakedEventFilter;
    NFTUnStaked(
      staker?: string | null,
      tokenId?: null,
      blockNumber?: null
    ): NFTUnStakedEventFilter;

    "OwnershipTransferred(address,address)"(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;

    "StakePayout(address,uint256,uint256,uint256,uint256)"(
      staker?: string | null,
      tokenId?: null,
      stakeAmount?: null,
      fromBlock?: null,
      toBlock?: null
    ): StakePayoutEventFilter;
    StakePayout(
      staker?: string | null,
      tokenId?: null,
      stakeAmount?: null,
      fromBlock?: null,
      toBlock?: null
    ): StakePayoutEventFilter;

    "StakeRewardUpdated(uint256)"(
      rewardPerBlock?: null
    ): StakeRewardUpdatedEventFilter;
    StakeRewardUpdated(rewardPerBlock?: null): StakeRewardUpdatedEventFilter;
  };

  estimateGas: {
    erc20Token(overrides?: CallOverrides): Promise<BigNumber>;

    getStakeContractBalance(overrides?: CallOverrides): Promise<BigNumber>;

    nftToken(overrides?: CallOverrides): Promise<BigNumber>;

    onERC1155BatchReceived(
      arg0: string,
      arg1: string,
      arg2: BigNumberish[],
      arg3: BigNumberish[],
      arg4: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    onERC1155Received(
      arg0: string,
      arg1: string,
      arg2: BigNumberish,
      arg3: BigNumberish,
      arg4: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    receipt(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    stakeMultipleNFTs(
      from: string,
      tokenIds: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    stakeNFT(
      from: string,
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    tokensPerBlock(overrides?: CallOverrides): Promise<BigNumber>;

    totalNFTsStaked(overrides?: CallOverrides): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    unstakeMultipleNFTs(
      tokenIds: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    unstakeNFT(
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    updateStakingReward(
      _tokensPerBlock: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    withdrawRewards(
      tokenIds: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    erc20Token(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getStakeContractBalance(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    nftToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    onERC1155BatchReceived(
      arg0: string,
      arg1: string,
      arg2: BigNumberish[],
      arg3: BigNumberish[],
      arg4: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    onERC1155Received(
      arg0: string,
      arg1: string,
      arg2: BigNumberish,
      arg3: BigNumberish,
      arg4: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    receipt(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    stakeMultipleNFTs(
      from: string,
      tokenIds: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    stakeNFT(
      from: string,
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    tokensPerBlock(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    totalNFTsStaked(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    unstakeMultipleNFTs(
      tokenIds: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    unstakeNFT(
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    updateStakingReward(
      _tokensPerBlock: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    withdrawRewards(
      tokenIds: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}