import fs from 'fs';
import path from 'path';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { COMMUNITIES, computeGroupId } from '../lib/communities';

/**
 * Builds OpenZeppelin StandardMerkleTree for a given community member list.
 * Leaf encoding: ['bytes32', 'address'] -> [groupId, memberAddress]
 * Ensures leaf calculation matches Solidity keccak256(bytes.concat(keccak256(abi.encode(groupId, member))))
 */
export function buildTreeForGroup(groupId: `0x${string}`, groupSlug: string, memberAddresses: `0x${string}`[]) {
  // Validate and deduplicate addresses
  const cleanMembers = Array.from(new Set(memberAddresses.map(a => a.toLowerCase() as `0x${string}`)));

  if (cleanMembers.length === 0) {
    throw new Error(`Cannot build Merkle tree for ${groupSlug}: member list is empty.`);
  }

  // Create leaf entries: [groupId, memberAddress]
  const values: [string, string][] = cleanMembers.map(addr => [groupId, addr]);

  // Build tree using OpenZeppelin StandardMerkleTree
  const tree = StandardMerkleTree.of(values, ['bytes32', 'address']);

  // Ensure output directory exists
  const outDir = path.join(process.cwd(), 'generated', groupSlug);
  const proofsDir = path.join(outDir, 'proofs');
  fs.mkdirSync(proofsDir, { recursive: true });

  // 1. Output Root JSON
  const rootData = {
    groupSlug,
    groupId,
    merkleRoot: tree.root,
    memberCount: cleanMembers.length,
    generatedAt: new Date().toISOString()
  };
  fs.writeFileSync(path.join(outDir, 'root.json'), JSON.stringify(rootData, null, 2));

  // 2. Output Full Tree Dump (steward only)
  fs.writeFileSync(path.join(outDir, 'tree.json'), JSON.stringify(tree.dump(), null, 2));

  // 3. Generate individual proofs for members
  for (const [i, v] of Array.from(tree.entries())) {
    const memberAddr = v[1] as string;
    const proof = tree.getProof(i);
    const proofData = {
      groupSlug,
      groupId,
      member: memberAddr,
      proof: proof,
      leaf: tree.leafHash(v),
      root: tree.root
    };
    fs.writeFileSync(path.join(proofsDir, `${memberAddr.toLowerCase()}.json`), JSON.stringify(proofData, null, 2));
  }

  console.log(`✔ [${groupSlug}] Tree built! Root: ${tree.root} (${cleanMembers.length} members, ${cleanMembers.length} proofs generated)`);
  return rootData;
}

export function buildAllTrees() {
  console.log('--- Building Chaupal Merkle Trees for all communities ---');
  const membersDir = path.join(process.cwd(), 'members');
  fs.mkdirSync(membersDir, { recursive: true });

  // Default demo addresses if files don't exist yet
  const defaultDemoMembers: Record<string, `0x${string}`[]> = {
    'punjabi-sangat': [
      '0x71C8349219b258E2958045F207D67BaAc68C49b2',
      '0x88F932810C1A957209384B2958045F207D67BAAC',
      '0x38B744C190283475610293847561029384756102',
      '0x1111111111111111111111111111111111111111',
      '0x2222222222222222222222222222222222222222'
    ],
    'maharashtra-ganesh-mandal': [
      '0x71C8349219b258E2958045F207D67BaAc68C49b2',
      '0x55E90283746510293847561029384756102933B2',
      '0x3333333333333333333333333333333333333333'
    ],
    'bengal-cultural-circle': [
      '0x71C8349219b258E2958045F207D67BaAc68C49b2',
      '0x22C10293847561029384756102938475610298A1',
      '0x4444444444444444444444444444444444444444'
    ],
    'kerala-arts-sabha': [
      '0x71C8349219b258E2958045F207D67BaAc68C49b2',
      '0x71A10293847561029384756102938475610244C1',
      '0x5555555555555555555555555555555555555555'
    ]
  };

  const results: Record<string, any> = {};

  for (const comm of COMMUNITIES) {
    const memberFilePath = path.join(membersDir, `${comm.id}.json`);
    let memberList: `0x${string}`[] = [];

    if (fs.existsSync(memberFilePath)) {
      const content = JSON.parse(fs.readFileSync(memberFilePath, 'utf-8'));
      memberList = Array.isArray(content) ? content : (content.members || []);
    } else {
      // Seed initial demo list
      memberList = defaultDemoMembers[comm.id] || [
        '0x71C8349219b258E2958045F207D67BaAc68C49b2',
        comm.steward,
        '0x9999999999999999999999999999999999999999'
      ];
      fs.writeFileSync(memberFilePath, JSON.stringify({ group: comm.id, members: memberList }, null, 2));
    }

    const res = buildTreeForGroup(comm.groupId, comm.id, memberList);
    results[comm.id] = res;
  }

  // Summary file
  fs.writeFileSync(path.join(process.cwd(), 'generated', 'summary.json'), JSON.stringify(results, null, 2));
  console.log('✔ All community trees and proofs built successfully!');
}

// Execute if run directly via tsx/node
if (require.main === module || process.argv[1]?.includes('build-tree')) {
  buildAllTrees();
}
