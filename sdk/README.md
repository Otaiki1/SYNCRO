# Syncro Backend SDK

Subscription CRUD, gift cards, and **on-chain event listener** for Soroban contracts.

## On-Chain Event Listener

The SDK provides `listenToEvents()` to subscribe to Soroban contract events in real time.

### Features

- **Real-time event delivery** via RPC polling
- **Auto-reconnect** on disconnect with exponential backoff
- **Multiple contract subscriptions** supported
- **Parsed events**: `renewalAttempt`, `approvalGranted`, `renewalFailed`

### Usage

```ts
import { createSyncroSDK } from '@syncro/sdk';

const sdk = createSyncroSDK({ baseUrl: 'https://api.example.com' });

// Listen to on-chain events
const stop = sdk.listenToEvents({
  rpcUrl: 'https://soroban-testnet.stellar.org',
  contractIds: 'CONTRACT_ADDRESS', // or ['addr1', 'addr2']
  pollIntervalMs: 5000,
  // Optional: persist cursor to resume across restarts
  getLastLedger: async () => 0,
  setLastLedger: async (ledger) => { /* persist */ },
});

// Handle events
sdk.on('renewalAttempt', (data) => {
  console.log('Renewal attempt:', data.subId, data.success);
});
sdk.on('approvalGranted', (data) => {
  console.log('Approval granted:', data.subId, data.approvalId);
});
sdk.on('renewalFailed', (data) => {
  console.log('Renewal failed:', data.subId, data.failureCount);
});
sdk.on('eventError', (err) => {
  console.error('Event listener error:', err);
});

// Stop listening when done
stop();
```

### Event Types

| Event | Source (contract) | Data |
|-------|-------------------|------|
| `renewalAttempt` | RenewalSuccess, RenewalFailed | subId, success, ledger, txHash, etc. |
| `approvalGranted` | ApprovalCreated | subId, approvalId, maxSpend, expiresAt, etc. |
| `renewalFailed` | RenewalFailed | subId, failureCount, ledger, txHash, etc. |
