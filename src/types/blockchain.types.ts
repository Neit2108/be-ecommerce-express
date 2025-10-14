export interface BlockchainConfig {
  rpcUrl: string;
  privateKey: string;
  tokenAddress?: string; // Địa chỉ token contract (nếu gửi token)
  gasLimit?: number;
}

export interface SendCashbackParams {
  toAddress: string;
  amount: number;
  network: string;
}

export interface TransactionResult {
  txHash: string;
  blockNumber: number;
  gasUsed: string;
  gasFee: number;
}