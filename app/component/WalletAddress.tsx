import React from "react";
import { useAtom } from 'jotai';
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from '@solana/web3.js';
import { solbalanceAtom,splbalanceAtom,mintAddrAtom, walletAtom } from "../store/atom";
const DEVNET_ENDPOINT = 'https://api.devnet.solana.com';

const fetchBalance=async(public_key:string)=>{
    const [solBalance, setSolBalance] = useAtom(solbalanceAtom);
    const [splbalance, setSplBalance] = useAtom(splbalanceAtom);
    const [walletAddress, setWalletAddress] = useAtom(walletAtom);
    const [mintAddr]=useAtom(mintAddrAtom);
    setWalletAddress(public_key);
    const connection = new Connection('https://api.devnet.solana.com'); // Example connection to Solana Mainnet, adjust as needed
    console.log('Fetching balance for wallet:', public_key);
    const publicKey = new PublicKey(public_key);
    const balance = await connection.getBalance(publicKey);
    setSolBalance(Number(balance/10**9));

    //spl balance
    const mintAddress = new PublicKey(String(mintAddr));
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint: mintAddress }
    );

    // Fetch the token account info
    if (tokenAccounts.value.length > 0) {
        const balance =
            tokenAccounts.value[0].account.data.parsed.info.tokenAmount.amount;
        setSplBalance(Number(balance) / 1000000)
    } else {
        setSplBalance(0)
    }
}
const WalletAddress = () => {
    const { publicKey, connected } = useWallet();
  if (connected){
    const public_key:any=publicKey?.toBase58();
    try {
        fetchBalance(public_key);
        setWall
    } catch (error) {
        // console.error('Error fetching Sol balance:', error);
    }
  }
};

export default WalletAddress;
