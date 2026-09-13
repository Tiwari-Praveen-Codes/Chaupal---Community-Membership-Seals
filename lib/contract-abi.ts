export const CHAUPAL_MEMBERSHIP_ABI = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "initialGroups",
        "type": "tuple[]",
        "internalType": "struct ChaupalMembership.CommunityGroupConfig[]",
        "components": [
          { "name": "groupId", "type": "bytes32", "internalType": "bytes32" },
          { "name": "name", "type": "string", "internalType": "string" },
          { "name": "region", "type": "string", "internalType": "string" },
          { "name": "steward", "type": "address", "internalType": "address" },
          { "name": "initialRoot", "type": "bytes32", "internalType": "bytes32" }
        ]
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claim",
    "inputs": [
      { "name": "groupId", "type": "bytes32", "internalType": "bytes32" },
      { "name": "proof", "type": "bytes32[]", "internalType": "bytes32[]" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updateMerkleRoot",
    "inputs": [
      { "name": "groupId", "type": "bytes32", "internalType": "bytes32" },
      { "name": "newRoot", "type": "bytes32", "internalType": "bytes32" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferStewardship",
    "inputs": [
      { "name": "groupId", "type": "bytes32", "internalType": "bytes32" },
      { "name": "newSteward", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "stewardOf",
    "inputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "merkleRootOf",
    "inputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
    "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "claimed",
    "inputs": [
      { "name": "", "type": "bytes32", "internalType": "bytes32" },
      { "name": "", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ownerOf",
    "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAllGroupIds",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bytes32[]", "internalType": "bytes32[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isTransferable",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "pure"
  },
  {
    "type": "event",
    "name": "MembershipSealClaimed",
    "inputs": [
      { "name": "groupId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "member", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" },
      { "name": "merkleRoot", "type": "bytes32", "indexed": false, "internalType": "bytes32" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MerkleRootUpdated",
    "inputs": [
      { "name": "groupId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "oldRoot", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "newRoot", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "steward", "type": "address", "indexed": true, "internalType": "address" }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "UnauthorizedSteward",
    "inputs": []
  },
  {
    "type": "error",
    "name": "GroupNotFound",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MerkleRootNotSet",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidMerkleProof",
    "inputs": []
  },
  {
    "type": "error",
    "name": "AlreadyClaimed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "SoulboundTokenNonTransferable",
    "inputs": []
  }
] as const;
