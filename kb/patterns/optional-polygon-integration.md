# Pattern: Optional Polygon 2.0 Integration

## Problem

Integrating blockchain functionality into SaaS applications introduces significant complexity, technical debt, and potential performance issues if not carefully designed. Traditional approaches often lead to tightly coupled systems where blockchain dependencies become mandatory, limiting flexibility and increasing development overhead.

## Solution

Create a modular, pluggable architecture that allows Polygon 2.0 (or any blockchain) integration to be completely optional while maintaining full application functionality when blockchain features are disabled. This pattern emphasizes clear abstraction layers, feature flagging, and dual persistence to ensure a seamless user experience.

## Implementation

### 1. Core Architecture

```typescript
// lib/blockchain/config.ts
export interface BlockchainConfig {
  enabled: boolean;
  network: 'mainnet' | 'testnet' | 'local';
  provider: {
    url: string;
    chainId: number;
  };
  contracts: Record<string, ContractConfig>;
}

export interface ContractConfig {
  address: string;
  abi: any[];
}

// Default configuration with blockchain disabled
export const defaultBlockchainConfig: BlockchainConfig = {
  enabled: false,
  network: 'testnet',
  provider: {
    url: process.env.POLYGON_PROVIDER_URL || '',
    chainId: parseInt(process.env.POLYGON_CHAIN_ID || '80001'), // Mumbai testnet
  },
  contracts: {},
};

// Load configuration from environment or database
export async function loadBlockchainConfig(): Promise<BlockchainConfig> {
  // Implementation to load from configuration source
  return {
    ...defaultBlockchainConfig,
    enabled: process.env.ENABLE_BLOCKCHAIN === 'true',
    // Additional configuration...
  };
}
```

### 2. Feature Flagging System

```typescript
// lib/features.ts
import { loadBlockchainConfig } from './blockchain/config';

export interface FeatureFlags {
  enableNFTs: boolean;
  enableTokens: boolean;
  enableSmartContracts: boolean;
  enableWalletConnection: boolean;
}

// Default all blockchain features to false
const defaultFeatureFlags: FeatureFlags = {
  enableNFTs: false,
  enableTokens: false,
  enableSmartContracts: false,
  enableWalletConnection: false,
};

// Load feature flags based on configuration
export async function getFeatureFlags(): Promise<FeatureFlags> {
  const blockchainConfig = await loadBlockchainConfig();
  
  if (!blockchainConfig.enabled) {
    return defaultFeatureFlags;
  }
  
  return {
    enableNFTs: process.env.ENABLE_NFTS === 'true',
    enableTokens: process.env.ENABLE_TOKENS === 'true',
    enableSmartContracts: process.env.ENABLE_SMART_CONTRACTS === 'true',
    enableWalletConnection: true, // Required if any blockchain feature is enabled
  };
}

// Check if a specific feature is enabled
export async function isFeatureEnabled(featureName: keyof FeatureFlags): Promise<boolean> {
  const flags = await getFeatureFlags();
  return flags[featureName];
}
```

### 3. Blockchain Service Abstraction

```typescript
// lib/blockchain/service.ts
import { ethers } from 'ethers';
import { loadBlockchainConfig } from './config';
import { isFeatureEnabled } from '../features';

export class BlockchainService {
  private provider: ethers.providers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contracts: Record<string, ethers.Contract> = {};
  private initialized: boolean = false;
  
  // Singleton pattern
  private static instance: BlockchainService;
  
  public static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }
  
  private constructor() {}
  
  public async init(): Promise<boolean> {
    // Check if blockchain is enabled
    const blockchainEnabled = await isFeatureEnabled('enableWalletConnection');
    
    if (!blockchainEnabled) {
      console.log('Blockchain features are disabled');
      return false;
    }
    
    try {
      const config = await loadBlockchainConfig();
      
      // Set up provider
      this.provider = new ethers.providers.JsonRpcProvider(
        config.provider.url,
        config.provider.chainId
      );
      
      // Initialize contracts
      for (const [name, contractConfig] of Object.entries(config.contracts)) {
        this.contracts[name] = new ethers.Contract(
          contractConfig.address,
          contractConfig.abi,
          this.provider
        );
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      return false;
    }
  }
  
  public async connectWallet(): Promise<boolean> {
    if (!this.initialized) {
      await this.init();
    }
    
    if (!this.initialized) {
      return false;
    }
    
    try {
      // Request wallet connection using ethers
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        this.signer = provider.getSigner();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  }
  
  public async executeContractMethod(
    contractName: string,
    methodName: string,
    args: any[]
  ): Promise<any> {
    if (!this.initialized) {
      throw new Error('Blockchain service not initialized');
    }
    
    const contract = this.contracts[contractName];
    if (!contract) {
      throw new Error(`Contract ${contractName} not found`);
    }
    
    // Connect contract to signer if available
    const connectedContract = this.signer ? contract.connect(this.signer) : contract;
    
    // Execute method
    return connectedContract[methodName](...args);
  }
  
  // Additional methods for specific use cases...
}
```

### 4. Dual Persistence System

```typescript
// lib/data/dual-persistence.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BlockchainService } from '../blockchain/service';
import { isFeatureEnabled } from '../features';

export interface PersistenceOptions {
  useBlockchain: boolean;
  syncStrategy: 'blockchain-primary' | 'database-primary' | 'both-required';
}

export class DualPersistenceManager<T extends { id: string }> {
  private supabase = createClientComponentClient();
  private blockchainService = BlockchainService.getInstance();
  private tableName: string;
  private contractName: string;
  
  constructor(tableName: string, contractName: string) {
    this.tableName = tableName;
    this.contractName = contractName;
  }
  
  async save(data: T, options?: Partial<PersistenceOptions>): Promise<T> {
    // Default options
    const opts: PersistenceOptions = {
      useBlockchain: false,
      syncStrategy: 'database-primary',
      ...options,
    };
    
    // Check if blockchain is enabled
    const blockchainEnabled = await isFeatureEnabled('enableSmartContracts');
    opts.useBlockchain = opts.useBlockchain && blockchainEnabled;
    
    // Save to database
    const { data: dbData, error: dbError } = await this.supabase
      .from(this.tableName)
      .upsert(data)
      .select()
      .single();
    
    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }
    
    // If blockchain is not enabled or not requested, return database result
    if (!opts.useBlockchain) {
      return dbData as T;
    }
    
    try {
      // Save to blockchain
      const txResult = await this.blockchainService.executeContractMethod(
        this.contractName,
        'store',
        [data.id, JSON.stringify(data)]
      );
      
      // Wait for transaction confirmation
      await txResult.wait();
      
      // Return data with blockchain transaction info
      return {
        ...dbData,
        _blockchain: {
          txHash: txResult.hash,
          blockNumber: txResult.blockNumber,
        },
      } as any;
    } catch (error) {
      // Handle blockchain errors based on sync strategy
      if (opts.syncStrategy === 'both-required') {
        // Revert database change
        await this.supabase
          .from(this.tableName)
          .delete()
          .eq('id', data.id);
        
        throw new Error(`Blockchain error: ${error.message}`);
      }
      
      // Log error but return database result
      console.error('Blockchain storage failed:', error);
      return dbData as T;
    }
  }
  
  async get(id: string): Promise<T | null> {
    // Get from database
    const { data: dbData, error: dbError } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single();
    
    if (dbError) {
      if (dbError.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Database error: ${dbError.message}`);
    }
    
    // Check if blockchain is enabled
    const blockchainEnabled = await isFeatureEnabled('enableSmartContracts');
    
    if (!blockchainEnabled) {
      return dbData as T;
    }
    
    try {
      // Get from blockchain for verification
      const blockchainData = await this.blockchainService.executeContractMethod(
        this.contractName,
        'retrieve',
        [id]
      );
      
      // Verify data integrity if blockchain data exists
      if (blockchainData && blockchainData !== '') {
        const parsedBlockchainData = JSON.parse(blockchainData);
        
        // Add blockchain verification status
        return {
          ...dbData,
          _blockchain: {
            verified: this.verifyDataIntegrity(dbData, parsedBlockchainData),
            blockchainId: id,
          },
        } as any;
      }
      
      return dbData as T;
    } catch (error) {
      // Log error but return database result
      console.error('Blockchain retrieval failed:', error);
      return dbData as T;
    }
  }
  
  private verifyDataIntegrity(dbData: any, blockchainData: any): boolean {
    // Implement verification logic
    // This could be a simple comparison or a more complex verification
    // depending on your requirements
    const dbJson = JSON.stringify(this.sanitizeForComparison(dbData));
    const blockchainJson = JSON.stringify(this.sanitizeForComparison(blockchainData));
    return dbJson === blockchainJson;
  }
  
  private sanitizeForComparison(data: any): any {
    // Remove fields that shouldn't be compared
    const result = { ...data };
    delete result.updated_at;
    delete result._blockchain;
    return result;
  }
}
```

### 5. Smart Contract Templates

```solidity
// contracts/DataStorage.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract DataStorage {
    address public owner;
    mapping(string => string) private dataStore;
    mapping(string => address) private dataOwners;
    
    event DataStored(string indexed id, address owner);
    event DataUpdated(string indexed id, address owner);
    event DataDeleted(string indexed id, address owner);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyDataOwnerOrContractOwner(string memory id) {
        require(
            msg.sender == dataOwners[id] || msg.sender == owner,
            "Only data owner or contract owner can modify this data"
        );
        _;
    }
    
    function store(string memory id, string memory data) public returns (bool) {
        bool isUpdate = bytes(dataStore[id]).length > 0;
        
        dataStore[id] = data;
        
        if (!isUpdate) {
            dataOwners[id] = msg.sender;
            emit DataStored(id, msg.sender);
        } else {
            emit DataUpdated(id, msg.sender);
        }
        
        return true;
    }
    
    function retrieve(string memory id) public view returns (string memory) {
        return dataStore[id];
    }
    
    function remove(string memory id) public onlyDataOwnerOrContractOwner(id) returns (bool) {
        delete dataStore[id];
        emit DataDeleted(id, msg.sender);
        return true;
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }
}
```

### 6. Wallet Connection Component

```tsx
// components/blockchain/WalletConnect.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BlockchainService } from '@/lib/blockchain/service';
import { isFeatureEnabled } from '@/lib/features';

export function WalletConnect() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Check if wallet connection is enabled
    const checkFeature = async () => {
      const enabled = await isFeatureEnabled('enableWalletConnection');
      setIsEnabled(enabled);
    };
    
    checkFeature();
  }, []);
  
  const connectWallet = async () => {
    if (!isEnabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const blockchainService = BlockchainService.getInstance();
      const success = await blockchainService.connectWallet();
      
      if (success) {
        setIsConnected(true);
        // Get address from connected wallet
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletAddress = await signer.getAddress();
        setAddress(walletAddress);
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
    } catch (error) {
      setError('Error connecting wallet: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // If feature is disabled, render nothing or a placeholder
  if (!isEnabled) {
    return null;
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Wallet Connection</CardTitle>
        <CardDescription>
          Connect your blockchain wallet to enable advanced features
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="p-4 border rounded-md bg-green-50">
            <p className="font-medium text-green-800">Wallet Connected</p>
            <p className="text-sm text-green-600 truncate">
              {address}
            </p>
          </div>
        ) : (
          <div className="p-4 border rounded-md bg-gray-50">
            <p className="text-sm text-gray-600">
              Connect your wallet to access blockchain features including NFTs and tokens.
            </p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!isConnected ? (
          <Button 
            onClick={connectWallet} 
            disabled={loading || isConnected}
            className="w-full"
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full"
            disabled
          >
            Connected
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
```

### 7. Feature Flag Component

```tsx
// components/blockchain/FeatureToggle.tsx
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { isFeatureEnabled } from '@/lib/features';

interface FeatureToggleProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureToggle({ feature, children, fallback = null }: FeatureToggleProps) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkFeature = async () => {
      try {
        const isEnabled = await isFeatureEnabled(feature as any);
        setEnabled(isEnabled);
      } catch (error) {
        console.error(`Error checking feature ${feature}:`, error);
        setEnabled(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkFeature();
  }, [feature]);
  
  if (loading) {
    return null; // Or a loading indicator
  }
  
  return enabled ? <>{children}</> : <>{fallback}</>;
}
```

## Usage

### 1. Optional Feature Integration

```tsx
// app/profile/page.tsx
import { FeatureToggle } from '@/components/blockchain/FeatureToggle';
import { WalletConnect } from '@/components/blockchain/WalletConnect';
import { UserProfile } from '@/components/UserProfile';

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      {/* Core functionality always works */}
      <UserProfile />
      
      {/* Only rendered if blockchain features are enabled */}
      <FeatureToggle feature="enableWalletConnection">
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Blockchain Features</h2>
          <WalletConnect />
        </div>
      </FeatureToggle>
    </div>
  );
}
```

### 2. Dual Persistence Implementation

```tsx
// pages/api/items/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { DualPersistenceManager } from '@/lib/data/dual-persistence';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  // Create persistence manager for items
  const itemManager = new DualPersistenceManager<any>(
    'items',
    'ItemStorage'
  );
  
  if (req.method === 'GET') {
    try {
      const item = await itemManager.get(id as string);
      
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      return res.status(200).json(item);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const item = req.body;
      
      // Optional blockchain persistence based on request flag
      const useBlockchain = Boolean(req.headers['x-use-blockchain']);
      
      const savedItem = await itemManager.save(item, {
        useBlockchain,
        syncStrategy: 'database-primary'
      });
      
      return res.status(200).json(savedItem);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
```

### 3. Environment Configuration

```
# .env.local - Blockchain disabled by default
ENABLE_BLOCKCHAIN=false
ENABLE_NFTS=false
ENABLE_TOKENS=false
ENABLE_SMART_CONTRACTS=false

# Polygon Configuration
POLYGON_PROVIDER_URL=https://rpc-mumbai.maticvigil.com
POLYGON_CHAIN_ID=80001
```

## Benefits

1. **Truly Optional**: Core application functionality works perfectly without blockchain integration, avoiding dependency lock-in.

2. **Progressive Enhancement**: Blockchain features can be enabled incrementally as your user base becomes ready for them.

3. **Reduced Technical Debt**: Clean abstraction and modular design prevents blockchain-specific code from contaminating business logic.

4. **Future-Proofing**: Infrastructure is ready for Polygon 2.0 or other blockchain technologies when they mature.

5. **Dual Persistence**: Data integrity is maintained with a hybrid storage approach that combines traditional database reliability with blockchain verification.

6. **Selective Application**: Apply blockchain features only to aspects of the application where they add value, avoiding unnecessary overhead.

7. **Feature Flagging**: Granular control over which blockchain features are enabled, facilitating testing and staged rollouts.

## Implementation Considerations

1. **Performance Impact**: Always benchmark your application with and without blockchain features to understand performance implications.

2. **User Experience**: Consider the extra steps required for wallet connection and transaction approval when designing blockchain-enabled features.

3. **Error Handling**: Implement graceful fallbacks for blockchain failures to ensure application stability.

4. **Gas Costs**: Monitor and optimize gas usage, especially for frequent operations that could quickly accumulate costs.

5. **Security**: Implement thorough security reviews for smart contracts and wallet interactions to prevent vulnerabilities.

6. **Regulatory Compliance**: Consult legal experts regarding regulatory requirements for blockchain features in your jurisdiction.

7. **Testing Strategy**: Use blockchain testnets for development and testing to avoid mainnet costs during implementation.

## Related Patterns

- **Feature Flag Pattern**: Controls visibility and availability of blockchain features.
- **Adapter Pattern**: Abstracts blockchain service interactions behind a consistent interface.
- **Repository Pattern**: Provides a consistent data access layer that can work with or without blockchain.
- **Command Pattern**: Handles the execution of blockchain transactions with appropriate retry and failure handling.
- **Observer Pattern**: Monitors blockchain events and updates application state accordingly.

---

*This pattern is part of the SS4-B1 framework, designed to facilitate the optional integration of Polygon 2.0 or other blockchain technologies while maintaining application functionality and developer productivity.* 