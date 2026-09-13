import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { keccak256, encodeAbiParameters, parseAbiParameters, concat } from 'viem';

/**
 * OpenZeppelin-compatible Client-Side Merkle Tree utility.
 * Used by:
 * 1. Steward dashboard (to build tree & compute root entirely offline in the browser).
 * 2. Member verification (to verify proof client-side before sending on-chain transaction).
 */
export const ChaupalMerkle = {
  /**
   * Calculates the exact OpenZeppelin standard double-hashed leaf for [groupId, memberAddress].
   * Formula: keccak256(bytes.concat(keccak256(abi.encode(groupId, member))))
   */
  computeLeaf(groupId: `0x${string}`, memberAddress: `0x${string}`): `0x${string}` {
    const encoded = encodeAbiParameters(
      parseAbiParameters('bytes32, address'),
      [groupId, memberAddress]
    );
    const firstHash = keccak256(encoded);
    return keccak256(concat([firstHash]));
  },

  /**
   * Builds an OpenZeppelin StandardMerkleTree from a list of member addresses for a groupId.
   */
  buildTree(groupId: `0x${string}`, memberAddresses: string[]) {
    // Validate & normalize addresses
    const cleanMembers = Array.from(
      new Set(
        memberAddresses
          .map(a => a.trim().toLowerCase())
          .filter(a => /^0x[a-f0-9]{40}$/i.test(a))
      )
    ) as `0x${string}`[];

    if (cleanMembers.length === 0) {
      throw new Error('No valid Ethereum addresses provided.');
    }

    const values: [string, string][] = cleanMembers.map(addr => [groupId, addr]);
    const tree = StandardMerkleTree.of(values, ['bytes32', 'address']);

    return {
      tree,
      root: tree.root as `0x${string}`,
      count: cleanMembers.length,
      members: cleanMembers
    };
  },

  /**
   * Verifies proof against a given root.
   */
  verify(root: `0x${string}`, leaf: `0x${string}`, proof: `0x${string}`[]): boolean {
    return StandardMerkleTree.verify(
      root,
      ['bytes32', 'address'],
      [leaf], // StandardMerkleTree verify accepts value
      proof
    );
  }
};
