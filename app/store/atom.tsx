import { atom } from "jotai";

export const walletAtom = atom<string | null>(null);
export const solbalanceAtom = atom<number | null>(null);
export const splbalanceAtom = atom<number | null>(null);
export const mintAddrAtom = atom<string | null>(
  "3kynzYkvaTNoUa94F3f4V3EsA21DZvgK3LW6ZvnhvQPQ"
);

export const transactionResultAtom = atom<{
  signature: string;
  success: boolean;
} | null>(null);
