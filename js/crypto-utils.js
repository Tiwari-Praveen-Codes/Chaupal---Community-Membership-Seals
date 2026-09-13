/**
 * Chaupal Cryptographic Utilities
 * Zero-Knowledge Merkle Proof Engine & Client-Side Hasher
 */

const ChaupalCrypto = {
  // Compute SHA-256 hex string using browser native Web Crypto API
  async sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Poseidon-T3 hash emulator (deterministic client-side cryptographic simulation)
  async poseidonHash(inputs) {
    const combined = Array.isArray(inputs) ? inputs.join(':') : String(inputs);
    const base = await this.sha256('poseidon_bn254_' + combined);
    // Return formatted 256-bit hex
    return base;
  },

  // Generate leaf hash from member record (identifier, secret salt)
  async generateMemberLeaf(memberId, salt = 'chaupal_seed_v1') {
    return await this.poseidonHash([memberId.trim().toLowerCase(), salt]);
  },

  // Build Merkle Tree from an array of leaves
  async buildMerkleTree(leafHashes) {
    if (!leafHashes || leafHashes.length === 0) {
      const emptyRoot = await this.sha256('empty_chaupal_tree');
      return { root: emptyRoot, layers: [[emptyRoot]] };
    }

    // Ensure power of 2 or handle uneven pairs by duplicating last node
    let currentLayer = [...leafHashes];
    const layers = [currentLayer];

    while (currentLayer.length > 1) {
      const nextLayer = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        const right = i + 1 < currentLayer.length ? currentLayer[i + 1] : left;
        const combinedHash = await this.sha256(left + right.replace('0x', ''));
        nextLayer.push(combinedHash);
      }
      layers.push(nextLayer);
      currentLayer = nextLayer;
    }

    return {
      root: currentLayer[0],
      layers: layers,
      leafCount: leafHashes.length,
      height: layers.length
    };
  },

  // Generate Merkle inclusion proof for a leaf at given index
  generateProof(layers, leafIndex) {
    const proof = [];
    let idx = leafIndex;

    for (let l = 0; l < layers.length - 1; l++) {
      const layer = layers[l];
      const isRightNode = idx % 2 === 1;
      const siblingIdx = isRightNode ? idx - 1 : (idx + 1 < layer.length ? idx + 1 : idx);
      
      proof.push({
        position: isRightNode ? 'left' : 'right',
        hash: layer[siblingIdx] || layer[idx]
      });

      idx = Math.floor(idx / 2);
    }

    return proof;
  },

  // Verify Merkle Proof against expected Root
  async verifyProof(leafHash, proof, expectedRoot) {
    let currentHash = leafHash;
    for (const step of proof) {
      let combined;
      if (step.position === 'left') {
        combined = step.hash + currentHash.replace('0x', '');
      } else {
        combined = currentHash + step.hash.replace('0x', '');
      }
      currentHash = await this.sha256(combined);
    }
    return currentHash.toLowerCase() === expectedRoot.toLowerCase();
  }
};

window.ChaupalCrypto = ChaupalCrypto;
