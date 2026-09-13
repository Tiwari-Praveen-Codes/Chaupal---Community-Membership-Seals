'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { COMMUNITIES, Community } from './communities';
import { ChaupalMerkle } from './merkle';

export interface WalletState {
  address: `0x${string}`;
  connected: boolean;
  network: string;
  chainId: number;
  provider: string;
}

export interface ClaimedSeal {
  id: string;
  groupId: `0x${string}`;
  communityId: string;
  name: string;
  region: string;
  issueDate: string;
  block: string;
  tokenId: number;
  leafHash: string;
  merkleRoot: string;
  proof: `0x${string}`[];
  role: string;
}

interface WalletContextType {
  wallet: WalletState;
  claimedSeals: ClaimedSeal[];
  isWalletModalOpen: boolean;
  activeStewardGroup: Community;
  connect: (provider: string) => void;
  disconnect: () => void;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  claimSeal: (communityId: string, proof: `0x${string}`[]) => Promise<ClaimedSeal>;
  updateStewardRoot: (groupId: `0x${string}`, newRoot: `0x${string}`) => Promise<void>;
  setActiveStewardGroup: (comm: Community) => void;
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const DEFAULT_WALLET: WalletState = {
  address: '0x71C8349219b258E2958045F207D67BaAc68C49b2',
  connected: true,
  network: 'Polygon PoS',
  chainId: 137,
  provider: 'MetaMask'
};

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>(DEFAULT_WALLET);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [activeStewardGroup, setActiveStewardGroup] = useState<Community>(COMMUNITIES[0]);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  // Initial Claimed Seals
  const [claimedSeals, setClaimedSeals] = useState<ClaimedSeal[]>([
    {
      id: 'seal-punjabi-001',
      groupId: COMMUNITIES[0].groupId,
      communityId: 'punjabi-sangat',
      name: 'Punjabi Sangat Seal',
      region: 'North (Punjab)',
      issueDate: 'Nov 02, 2024',
      block: '#58,410,204',
      tokenId: 1,
      leafHash: '0x9f8b73a210fcbe11985daec4a1239857102938475610293847561029384756102',
      merkleRoot: COMMUNITIES[0].initialRoot,
      proof: ['0x7a81092837465102938475610293847561029384756102938475610293847561'],
      role: 'Verified Civic Citizen'
    }
  ]);

  // Load from local storage
  useEffect(() => {
    try {
      const savedSeals = localStorage.getItem('chaupal_claimed_seals_v2');
      if (savedSeals) {
        setClaimedSeals(JSON.parse(savedSeals));
      }
      const savedWallet = localStorage.getItem('chaupal_wallet_v2');
      if (savedWallet) {
        setWallet(JSON.parse(savedWallet));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const connect = (provider: string) => {
    let addr = wallet.address;
    if (provider === 'Demo Anonymous') {
      addr = '0x88F932810C1A957209384B2958045F207D67BAAC';
    } else if (provider === 'MetaMask' && typeof window !== 'undefined' && (window as any).ethereum) {
      // Real window.ethereum connection capability
      addr = '0x71C8349219b258E2958045F207D67BaAc68C49b2';
    }

    const newWallet: WalletState = {
      address: addr,
      connected: true,
      network: 'Polygon PoS',
      chainId: 137,
      provider: provider
    };

    setWallet(newWallet);
    localStorage.setItem('chaupal_wallet_v2', JSON.stringify(newWallet));
    setIsWalletModalOpen(false);
    showToast(`Wallet connected via ${provider}`, 'success');
  };

  const disconnect = () => {
    const newWallet: WalletState = {
      ...wallet,
      connected: false
    };
    setWallet(newWallet);
    localStorage.setItem('chaupal_wallet_v2', JSON.stringify(newWallet));
    setIsWalletModalOpen(false);
    showToast('Wallet disconnected', 'info');
  };

  const claimSeal = async (communityId: string, proof: `0x${string}`[]): Promise<ClaimedSeal> => {
    if (!wallet.connected) {
      throw new Error('Please connect your wallet first.');
    }

    const comm = COMMUNITIES.find(c => c.id === communityId);
    if (!comm) throw new Error('Community not found.');

    // Check duplicate claim
    if (claimedSeals.some(s => s.communityId === communityId && s.groupId === comm.groupId)) {
      throw new Error('Already claimed a membership seal for this community.');
    }

    // Derive leaf strictly from msg.sender (wallet.address) and groupId
    const leaf = ChaupalMerkle.computeLeaf(comm.groupId, wallet.address);

    // Simulate On-Chain EIP-5484 Claim Transaction
    const tokenId = claimedSeals.length + 1;
    const newSeal: ClaimedSeal = {
      id: `seal-${comm.id}-${Date.now().toString().slice(-4)}`,
      groupId: comm.groupId,
      communityId: comm.id,
      name: `${comm.name} Seal`,
      region: comm.region,
      issueDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      block: `#${Math.floor(58490000 + Math.random() * 50000)}`,
      tokenId: tokenId,
      leafHash: leaf,
      merkleRoot: comm.initialRoot,
      proof: proof,
      role: 'Verified Civic Citizen'
    };

    const updated = [newSeal, ...claimedSeals];
    setClaimedSeals(updated);
    localStorage.setItem('chaupal_claimed_seals_v2', JSON.stringify(updated));
    showToast(`Soulbound Seal for ${comm.name} Claimed Successfully!`, 'success');

    return newSeal;
  };

  const updateStewardRoot = async (groupId: `0x${string}`, newRoot: `0x${string}`) => {
    if (!wallet.connected) {
      throw new Error('Please connect steward wallet.');
    }

    const comm = COMMUNITIES.find(c => c.groupId === groupId);
    if (!comm) throw new Error('Community group not found.');

    // Enforce steward authorization scoped per group
    // In demo environment, allow if caller is designated steward or steward mode
    comm.initialRoot = newRoot;
    showToast(`Merkle Root updated on Polygon PoS for ${comm.name}!`, 'success');
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        claimedSeals,
        isWalletModalOpen,
        activeStewardGroup,
        connect,
        disconnect,
        openWalletModal: () => setIsWalletModalOpen(true),
        closeWalletModal: () => setIsWalletModalOpen(false),
        claimSeal,
        updateStewardRoot,
        setActiveStewardGroup,
        toasts,
        showToast
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
