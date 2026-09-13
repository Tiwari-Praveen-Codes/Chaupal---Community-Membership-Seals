import fs from 'fs';
import path from 'path';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { COMMUNITIES, computeGroupId } from '../lib/communities';

/**
 * Generates an inclusion proof for a member in a specific group.
 * Usage: npx tsx scripts/generate-proof.ts <group-slug> <member-address>
 */
export function generateProof(groupSlug: string, memberAddress: string) {
  const normAddress = memberAddress.toLowerCase();
  const treePath = path.join(process.cwd(), 'generated', groupSlug, 'tree.json');

  if (!fs.existsSync(treePath)) {
    throw new Error(`Merkle tree for '${groupSlug}' not found. Please run 'npm run merkle:build' first.`);
  }

  const rawTree = JSON.parse(fs.readFileSync(treePath, 'utf-8'));
  const tree = StandardMerkleTree.load(rawTree);

  let targetIndex = -1;
  let targetValue: any = null;

  for (const [i, v] of Array.from(tree.entries())) {
    if ((v[1] as string).toLowerCase() === normAddress) {
      targetIndex = i;
      targetValue = v;
      break;
    }
  }

  if (targetIndex === -1) {
    return {
      found: false,
      message: `Address ${memberAddress} is not registered in ${groupSlug} private roster.`,
      groupSlug,
      member: memberAddress
    };
  }

  const proof = tree.getProof(targetIndex);
  const leaf = tree.leafHash(targetValue);

  const proofResult = {
    found: true,
    groupSlug,
    groupId: targetValue[0],
    member: memberAddress,
    leafIndex: targetIndex,
    leafHash: leaf,
    proof: proof,
    root: tree.root
  };

  return proofResult;
}

// CLI Execution
if (require.main === module || process.argv[1]?.includes('generate-proof')) {
  const groupArg = process.argv[2] || 'punjabi-sangat';
  const memberArg = process.argv[3] || '0x71C8349219b258E2958045F207D67BaAc68C49b2';

  try {
    const result = generateProof(groupArg, memberArg);
    console.log(JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error('Error generating proof:', err.message);
  }
}
