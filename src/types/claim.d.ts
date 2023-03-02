declare interface TableAddressItem {
    address: string;
    privateKey: string;
    term: number | null;
    maturityTs: number | null;
    rank: number | null;
    amplifier: number | null;
    eaaRate: number | null;
}

declare type TaskStatus = 'INIT' | 'PROCESSING' | 'PAUSED' | 'FINISHED'

declare type ClaimStatus = 'INIT' | 'PROCESSING' | 'FINISHED' | 'FAILED'

declare type TransferStatus = ClaimStatus

declare interface ClaimTableAddressItem extends TableAddressItem {
    balanceLoading: boolean;
    balance: string | null;
    claimStatus: ClaimStatus;
    claimTransaction: string | null;
    transferStatus: TransferStatus;
    transferTransaction: string | null;
}
