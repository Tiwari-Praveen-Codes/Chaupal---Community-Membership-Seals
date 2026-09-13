# Chaupal — Community Membership Seals

> A privacy-preserving membership credential for every community.

Chaupal is a decentralized community membership system that allows independent Indian community groups to verify their members without putting private member lists on a public blockchain.

Each community maintains its own membership list privately. Instead of publishing the list, the community generates a Merkle tree and publishes only its Merkle root.

A member can then prove:

> "I am a member of this community."

without publishing the complete membership list.

Once verified, the member can claim a non-transferable, soulbound membership seal that represents their belonging to that community.

---

## Why Chaupal?

India has thousands of communities, mandals, sangats, collectives, associations, and local groups that maintain membership in their own way.

A single global administrator should not decide who belongs to every community.

Chaupal follows a different model:

- Every community controls its own membership.
- Every community has its own steward.
- Member lists remain private.
- Only cryptographic Merkle roots are published on-chain.
- Members prove membership using Merkle proofs.
- Membership seals cannot be transferred.
- A member can claim only once per community.

The result is a shared network without requiring communities to surrender control over their own membership records.

---

## Core Features

### Community-specific membership

Each community has:

- a unique `groupId`
- its own steward
- its own Merkle root
- its own membership claims

A steward can update only their own community's root.

### Privacy-preserving membership verification

The complete member list never needs to be published on-chain.

The blockchain stores the Merkle root, while the actual membership list stays with the community steward.

### Merkle proofs

A member receives a Merkle proof generated from their community's private membership tree.

The smart contract verifies the proof against the stored root.

### Soulbound membership seals

After successful verification, a member receives a non-transferable membership seal.

The seal represents community membership rather than a tradable NFT.

### Duplicate claim protection

A member can claim a seal only once for a particular community.

Membership in another community is tracked independently.

---

# Architecture

```text
                         CHAUPAL
                            │
             ┌──────────────┴──────────────┐
             │                             │
        Member Flow                   Steward Flow
             │                             │
      Connect Wallet                Private Member List
             │                             │
      Select Community                Build Merkle Tree
             │                             │
      Obtain Proof                    Generate Root
             │                             │
      Verify Membership               Publish Root
             │                             │
        Claim Seal                         │ 
             │                             │
             └──────────────┬──────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  Chaupal Contract   │
                 │                     │
                 │ groupId             │
                 │ steward             │
                 │ merkleRoot          │
                 │ claim state         │
                 │ seal ownership      │
                 └──────────┬──────────┘
                            │
                            ▼
                  Public Blockchain
                            
              Only cryptographic state
                    is published
