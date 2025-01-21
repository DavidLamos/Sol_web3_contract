"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAtom } from "jotai";
import {
  mintAddrAtom,
  solbalanceAtom,
  splbalanceAtom,
  walletAtom,
  transactionResultAtom
} from "./store/atom";
import React, { useState, useEffect } from "react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  clusterApiUrl
} from "@solana/web3.js"; // Import the necessary Solana SDK components
import { Program, AnchorProvider, Idl, web3 } from "@project-serum/anchor";
import * as spl from "@solana/spl-token";
import { BN } from "bn.js"; // Import BN class as a value
// import IDLJson from "@/idl/spl_transfer.json";
import IDLJson from "@/idl/token_transfer.json";
import TransactionResult from "./component/TransactionResult";
import Loader from "./component/Loader";
// const PROGRAM_ID = "E993A9BwXL5xpdJtjiiqusRvd2Ndzdh1NixeTPzY4PFi";
const PROGRAM_ID = "2gtTL6umefWYBUqAppXFBrax7DP5Rwp25ihYEV4R8FA2";

export default function Home() {
  const [solBalance] = useAtom(solbalanceAtom);
  const [splbalance] = useAtom(splbalanceAtom);
  const [mintAddr, setMintAddr] = useAtom(mintAddrAtom);
  const [walletAddress] = useAtom(walletAtom);
  const [, setTransactionResult] = useAtom(transactionResultAtom);
  const [loading, setLoading] = useState(false);

  const [recipientAddress, setRecipientAddress] = useState(""); // State for recipient address input
  const [amount, setAmount] = useState(0);
  const DEVNET_ENDPOINT = "https://api.devnet.solana.com";

  const handleTransfer = async () => {
    setLoading(true);
    try {
      const payer = new PublicKey(String(walletAddress));
      const mint = new PublicKey(String(mintAddr));
      const recipient = new PublicKey(recipientAddress);

      const connection = new Connection(DEVNET_ENDPOINT);
      const provider = new AnchorProvider(
        connection,
        solana,
        AnchorProvider.defaultOptions()
      );

      const senderATA = spl.getAssociatedTokenAddressSync(
        mint,
        payer,
        true,
        spl.TOKEN_2022_PROGRAM_ID
      );

      const recipientATA = spl.getAssociatedTokenAddressSync(
        mint,
        recipient,
        true,
        spl.TOKEN_2022_PROGRAM_ID
      );

      console.log("here :", senderATA.toBase58(), recipientATA.toBase58());

      const toAtaInfo = await connection.getAccountInfo(recipientATA);
      let transaction = new web3.Transaction();
      if (!toAtaInfo) {
        const createAtaIx = spl.createAssociatedTokenAccountInstruction(
          payer, // payer
          recipientATA, // ata
          recipient, // owner
          mint, // mint
          spl.TOKEN_2022_PROGRAM_ID // programId
        );
        transaction.add(createAtaIx);
      }
      const program = new Program(
        (IDLJson as unknown) as Idl,
        PROGRAM_ID,
        provider
      );
      console.log("here-->1");

      const transferIx = await program.methods
        .transferToken2022(new BN(Number(amount)))
        .accounts({
          from: payer,
          fromAta: senderATA,
          toAta: recipientATA,
          mint: mint,
          tokenProgram: spl.TOKEN_2022_PROGRAM_ID
        })
        .transaction();
      console.log("here-->");

      transaction.add(transferIx);

      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = payer;
      const simRes = await connection.simulateTransaction(transaction);
      if (simRes.value.err) {
        console.log(simRes);
        return;
      }
      const signature = await solana.signAndSendTransaction(transaction);
      await connection.confirmTransaction(signature.signature);
      console.log("Okay", signature);
      setTransactionResult({
        signature: signature.signature,
        success: true
      });
      setLoading(false);
    } catch (error) {
      setTransactionResult({
        signature: "",
        success: false
      });
      setLoading(false);
      console.error("fail:", error);
    }
  };
  return (
    <div className="flex flex-col justify-center items-center p-2 h-screen gap-2">
      <header className="absolute top-0 right-0 p-2">
        <div className="border hover:border-slate-900 rounded">
          <WalletMultiButton style={{}} />
        </div>
      </header>
      <main className="border border-1 rounded-md p-2 w-1/2 max-w-[500px]">
        <div className="text-3xl text-blue-700 text-center mb-2">
          SPL Token Transfer
        </div>

        <div className="flex flex-col gap-2 p-2">
          <div className="flex flex-row border border-1 p-2 justify-between">
            <div>
              SOL Balance: {solBalance}
            </div>
            <div>
              SPL Token Balance: {splbalance}
            </div>
          </div>
          <div className="border rounded-md border-gray-300 p-2">
            Token Address: {mintAddr}
          </div>
          <div className="border rounded-md border-gray-300 p-2">
            <input
              id="recipient"
              type="text"
              placeholder="Recipient address"
              className="w-full p-2 rounded border-gray-300 "
              value={recipientAddress}
              onChange={e => setRecipientAddress(e.target.value)}
            />
          </div>
          <div className="border rounded-md border-gray-300 p-2">
            <input
              id="recipient"
              type="text"
              placeholder="Send Amount"
              className="w-full p-2 rounded border-gray-300 "
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="flex justify-center">
          <button
            className="bg-green-500 rounded-xl p-2 px-4 text-xl min-w-40 "
            onClick={handleTransfer}
          >
            {loading ? <Loader /> : "Transfer"}
          </button>
        </div>
        <div className="flex justify-center">
          {!loading && <TransactionResult />}
        </div>
      </main>
    </div>
  );
}
