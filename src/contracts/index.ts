import { ethers, Wallet } from 'ethers'
import type { Provider, TransactionResponse } from '@ethersproject/abstract-provider'
import XENCryptoABI from '@/contracts/abi/XENCryptoABI'

const chainRPCURL: Record<SupportedChain, string> = {
    eth: 'https://rpc.ankr.com/eth',
    goerli: 'https://rpc.ankr.com/eth_goerli'
}

const XENContractAddress: Record<SupportedChain, string> = {
    eth: '0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8',
    goerli: '0x59D53AbF8a34F35Bcd06AdB269B0a9f9927c627F'
}

export const getRPCProvider = (chain: SupportedChain = 'eth'): Provider => {
    return new ethers.providers.JsonRpcProvider(chainRPCURL[chain])
}

export const getWallet = (chain: SupportedChain = 'eth', privateKey: string, provider: Provider) => {
    return new ethers.Wallet(privateKey, provider || getRPCProvider(chain))
}

export const getXENContract = (chain: SupportedChain = 'eth', privateKey: string, provider: Provider, wallet?: Wallet) => {
    return new ethers.Contract(
        XENContractAddress[chain],
        XENCryptoABI,
        wallet || getWallet(chain, privateKey, provider)
    )
}

export const confirmTxWait = async (tx: TransactionResponse) => {
    try {
        const receipt = await tx.wait(1)
        if (receipt && receipt.status === 1) {
            return receipt
        } else {
            throw new Error('Failed to transaction')
        }
    } catch (e: any) {
        // Speed up or cancelled will trigger this
        if (e.code === 'TRANSACTION_REPLACED') {
            if (e.cancelled) {
                // The user cancelled the transaction
                throw new Error('The transaction was cancelled')
            } else {
                // The user used "speed up" or something similar
                // in their client, but we now have the updated info
                return e.receipt
            }
        } else {
            throw new Error('Failed to transaction')
        }
    }
}
