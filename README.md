# Chaupal • A Seal of Belonging for Every Chaupal

> **Sovereign Zero-Knowledge Civic Membership Platform connecting 12 autonomous Indian communities.**

---

## 1. What Chaupal Is

**Chaupal** (चौपाल) is a sovereign, privacy-first civic membership and credentialing platform designed for independent Indian community assemblies, sangats, artisan guilds, and cultural collectives.

Traditional on-chain membership systems force communities to publish their raw member rosters (names, addresses, phone numbers, family records) on public ledgers. This exposes citizens to targeted surveillance, commercial profiling, and harassment.

**Chaupal solves this permanently:**
- Each community maintains its own **private, offline membership list**.
- The private member list is **NEVER stored on-chain**.
- Each community publishes only a 32-byte **Merkle root** representing its current member roster.
- Members connect their wallet, prove membership using a **client-side Merkle proof**, and claim a non-transferable (**Soulbound ERC-721 / EIP-5484**) membership seal.
- There is **no global administrator** controlling all communities. Each community has its own independent **Steward** who can modify *only* their own community's Merkle root.

---

## 2. Architecture Overview & ASCII Diagram

```
+-----------------------------------------------------------------------------------+
|                              OFF-CHAIN STEWARD REALM                              |
|                                                                                   |
|  [ Private Member Roster ]                                                       |
|  (Local CSV / Keystore)                                                           |
|          │                                                                        |
|          ▼                                                                        |
|  [ Leaf Generation: keccak256(bytes.concat(keccak256(abi.encode(groupId, member)))) ]
|          │                                                                        |
|          ▼                                                                        |
|  [ OpenZeppelin StandardMerkleTree Builder (scripts/build-tree.ts) ]              |
|          │                                                                        |
|          ├─────────────────────────────────────────┐                              |
|          ▼                                         ▼                              |
|    (New Merkle Root)                      (Member Inclusion Proofs)               |
+──────────┬─────────────────────────────────────────┬──────────────────────────────+
           │ Steward signs                           │ Member obtains
           │ updateMerkleRoot(groupId, newRoot)      │ proof off-chain
           ▼                                         ▼
+───────────────────────────────────────────────────────────────────────────────────+
|                           ON-CHAIN (Polygon PoS Contract)                         |
|                                                                                   |
|   ChaupalMembership.sol                                                           |
|   ├── mapping(bytes32 => address) stewardOf;          <-- Per-group steward       |
|   ├── mapping(bytes32 => bytes32) merkleRootOf;       <-- 32-byte Root Storage    |
|   ├── mapping(bytes32 => mapping(address => bool)) claimed;                       |
|   └── ERC721 _update() override                       <-- Non-Transferable Seal   |
|                                                                                   |
|   Function: claim(bytes32 groupId, bytes32[] proof)                               |
|   ├── 1. member = msg.sender                          (Derived from caller)       |
|   ├── 2. root = merkleRootOf[groupId]                 (Read from storage)         |
|   ├── 3. leaf = keccak256(keccak256(groupId, member)) (Identical Preimage)        |
|   ├── 4. MerkleProof.verify(proof, root, leaf)        (ZK-Verification)           |
|   └── 5. _safeMint(msg.sender, tokenId)               (Soulbound Mint)            |
+───────────────────────────────────────────────────────────────────────────────────+
```

---

## 3. The 12 Autonomous Communities

Chaupal seeds 12 independent, decentralized Indian community groups:

1. **Punjabi Sangat** (`punjabi-sangat`) - Langar sevaks, diaspora heritage, literature circles.
2. **Maharashtra Ganesh Mandal** (`maharashtra-ganesh-mandal`) - Dhol-Tasha troupes, Modi script archival.
3. **Nagaland Weavers Collective** (`nagaland-weavers-collective`) - Tribal loin loom motifs, natural dye preservation.
4. **Bengal Cultural Circle** (`bengal-cultural-circle`) - Jamdani handloom weavers, Kumartuli sculptors.
5. **Kerala Arts Sabha** (`kerala-arts-sabha`) - Gulf diaspora mutual aid, Kathakali and temple arts.
6. **Rajasthan Craft Guild** (`rajasthan-craft-guild`) - Manganiyar Thar desert oral traditions, Kamaicha makers.
7. **Assam Community Sabha** (`assam-community-sabha`) - Golden Muga silk provenance, Sualkuchi looms.
8. **Tamil Heritage Circle** (`tamil-heritage-circle`) - Sangam literature archives, Thirukkural circles.
9. **Gujarat Garba Mandal** (`gujarat-garba-mandal`) - Mercantile trust networks, grain syndicates.
10. **Odisha Handloom Collective** (`odisha-handloom-collective`) - Raghurajpur Pattachitra, Sambalpuri Ikat.
11. **Kashmir Artisan Circle** (`kashmir-artisan-circle`) - GI-tagged Pashmina weavers, walnut woodcraft.
12. **Goa Cultural Association** (`goa-cultural-association`) - Konkani tiatr heritage, communidade land trusts.

---

## 4. Non-Negotiable Security Invariants

### 1. Membership Leaf is Derived Solely from `msg.sender`
Inside the smart contract's `claim` function:
```solidity
address member = msg.sender;
```
The caller's address is NEVER accepted as a calldata parameter. An attacker cannot claim on behalf of another address or reuse a third-party proof.

### 2. Group ID is Part of the Leaf Preimage
The leaf preimage combines both `groupId` (bytes32) and `member` (address):
```solidity
bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(groupId, msg.sender))));
```
This guarantees that a valid proof for *Punjabi Sangat* CANNOT be replayed or claimed in *Kerala Arts Sabha*.

### 3. Steward Authorization Scoped Per Group
Root updates are strictly guarded per community:
```solidity
if (msg.sender != stewardOf[groupId]) revert UnauthorizedSteward();
```
There is no super-admin or global owner. Steward A cannot touch Community B.

### 4. Claim Must Verify Against the Stored Root
The root used for cryptographic verification is loaded strictly from contract storage:
```solidity
bytes32 root = merkleRootOf[groupId];
```
The caller provides the proof path, but never the root.

### 5. Duplicate Claims Revert
```solidity
if (claimed[groupId][msg.sender]) revert AlreadyClaimed();
claimed[groupId][msg.sender] = true;
```
A citizen can only claim one seal per community. They can still claim membership in other distinct communities.

### 6. Soulbound Non-Transferable Credential
Overriding OpenZeppelin ERC-721 `_update`:
```solidity
function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
    address from = _ownerOf(tokenId);
    if (from != address(0) && to != address(0)) {
        revert SoulboundTokenNonTransferable();
    }
    return super._update(to, tokenId, auth);
}
```
Direct transfers, `transferFrom`, and `safeTransferFrom` strictly revert.

---

## 5. Day-to-Day Steward Operations

### 🌅 DAY SOMEONE JOINS
When a new citizen is approved for membership:
1. **Update Roster**: The steward adds the citizen's Ethereum address to their local private list (`members/<group-id>.json`).
2. **Rebuild Tree**: The steward runs the Merkle builder script or uses the web console (`/steward`):
   ```bash
   npm run merkle:build
   ```
3. **Obtain New Root**: The OpenZeppelin tool computes the new 32-byte Merkle root.
4. **Publish Root**: The steward signs and sends an on-chain transaction calling `updateMerkleRoot(groupId, newRoot)`.
5. **Issue Proof**: The member receives their individual inclusion proof package (`generated/<group-id>/proofs/<member-address>.json`).
6. **Claim Seal**: The member connects their wallet at `/member/claim` and submits their proof to mint their Soulbound seal.

---

### 🌇 DAY SOMEONE LEAVES
When a citizen leaves or is removed from the community:
1. **Remove from Roster**: The steward removes the citizen's address from their local private list.
2. **Rebuild Tree**: The steward regenerates the Merkle tree:
   ```bash
   npm run merkle:build
   ```
3. **Publish Root**: The steward submits the new Merkle root to the smart contract via `updateMerkleRoot(groupId, newRoot)`.

> ⚠️ **Important Distinction Regarding Revocation**:
> - **Current Membership Root**: Future verification queries and claims check against the latest active root. The removed member can no longer claim new credentials.
> - **Previously Issued Seals**: An already minted Soulbound ERC-721 token remains in the holder's wallet as an immutable historical record unless an explicit burn or on-chain revocation registry is invoked.

---

## 6. Project Structure

```
chaupal/
├── app/                           # Next.js App Router (TypeScript)
│   ├── layout.tsx                 # Root layout with Wallet Provider
│   ├── page.tsx                   # Landing page (/)
│   ├── communities/page.tsx       # 12 Community Directory (/communities)
│   ├── member/page.tsx            # Member Dashboard (/member)
│   ├── member/verify/page.tsx     # Client-side Verifier (/member/verify)
│   ├── member/claim/page.tsx      # Claim Seal Flow (/member/claim)
│   ├── seals/page.tsx             # My Soulbound Seals (/seals)
│   ├── steward/page.tsx           # Steward Dashboard (/steward)
│   ├── steward/roots/page.tsx     # Merkle Root History (/steward/roots)
│   └── globals.css                # Tailwind & Design System tokens
├── components/                    # Reusable React components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── WalletModal.tsx
│   ├── SealCard.tsx
│   ├── ProofInspectorModal.tsx
│   └── CertificateModal.tsx
├── contracts/                     # Solidity Smart Contracts
│   └── ChaupalMembership.sol      # ERC-721 Soulbound + Merkle Verification
├── script/                        # Foundry deployment scripts
│   └── Deploy.s.sol
├── scripts/                       # Off-chain TypeScript Merkle tooling
│   ├── build-tree.ts              # OpenZeppelin tree builder
│   └── generate-proof.ts          # Single/batch proof generator
├── test/                          # Automated test suites
│   ├── ChaupalMembership.t.sol    # Foundry Solidity test suite
│   └── ChaupalMembership.test.ts  # TypeScript automated test suite
├── lib/                           # Shared utilities
│   ├── communities.ts             # 12 Communities metadata & group IDs
│   ├── merkle.ts                  # Client-side OpenZeppelin Merkle engine
│   ├── contract-abi.ts            # Typed ABI
│   └── wallet.tsx                 # React Wallet Context
├── members/                       # Private demo rosters (git-ignored in prod)
├── generated/                     # Generated roots, trees, and proofs
├── .env.example                   # Environment configuration template
├── .gitignore                     # Git ignore rules
├── foundry.toml                   # Foundry configuration
├── package.json
└── README.md
```

---

## 7. Setup & Execution Guide

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- (Optional) Foundry (`forge`) for smart contract compilation

### Installation
```bash
# Clone and install dependencies
npm install
```

### Environment Configuration
Copy the template and set your RPC details:
```bash
cp .env.example .env
```

### Running Tests
Run the comprehensive test suite validating all 8 security requirements:
```bash
npm run test
```

If Foundry is installed:
```bash
forge test -vvv
```

### Building Merkle Trees & Proofs
Regenerate all community trees and proof artifacts from local rosters:
```bash
npm run merkle:build
```

Generate a proof for a specific citizen:
```bash
npx tsx scripts/generate-proof.ts punjabi-sangat 0x71C8349219b258E2958045F207D67BaAc68C49b2
```

### Running the Next.js Frontend
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 8. Verification Checklist

- [x] **TEST 1**: Claim leaf derived strictly from `msg.sender` (caller cannot forge member address).
- [x] **TEST 2**: `groupId` enforced in leaf preimage (cross-group replay impossible).
- [x] **TEST 3**: Steward authorization scoped per group (no global admin).
- [x] **TEST 4**: Claim verifies strictly against stored on-chain root.
- [x] **TEST 5**: Duplicate claims for same group strictly revert.
- [x] **TEST 6**: Membership seals are strictly Soulbound (transfers revert).
- [x] **TEST 7**: Off-chain Merkle tree builder and proof generator run successfully.
- [x] **TEST 8**: Credential hygiene verified (0 credentials or private keys in tracked files).
- [x] **Next.js App Router**: All 8 screens fully functional and responsive.
- [x] **Production Quality**: Complete documentation and type safety.

---
*Built with reverence for the commons by the Chaupal Collective.*
