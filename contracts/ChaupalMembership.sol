// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title ChaupalMembership
 * @author Chaupal Civic Commons
 * @notice Sovereign Zero-Knowledge Civic Membership Platform & Soulbound Seals
 * @dev Connects 12 independent community groups with local off-chain rosters and on-chain Merkle roots.
 *
 * Security Guarantees:
 * 1. Leaf is derived solely from msg.sender inside claim() - no parameter tampering.
 * 2. Group ID is strictly part of the leaf preimage to prevent cross-group replay attacks.
 * 3. Each group's Merkle root is writable ONLY by its designated steward.
 * 4. Verification compares strictly against contract storage root.
 * 5. Duplicate claims for the same group are strictly rejected.
 * 6. Membership seals are strictly Soulbound (ERC-721 non-transferable).
 */
contract ChaupalMembership is ERC721 {
    // Custom Errors
    error UnauthorizedSteward();
    error GroupNotFound();
    error GroupAlreadyExists();
    error MerkleRootNotSet();
    error InvalidMerkleProof();
    error AlreadyClaimed();
    error SoulboundTokenNonTransferable();
    error InvalidAddress();
    error InvalidMerkleRoot();

    // Group Structure
    struct CommunityGroup {
        bytes32 groupId;
        string name;
        string region;
        address steward;
        bytes32 merkleRoot;
        uint256 createdAt;
        uint256 lastRootUpdate;
    }

    // Storage Mappings
    mapping(bytes32 => address) public stewardOf;
    mapping(bytes32 => bytes32) public merkleRootOf;
    mapping(bytes32 => mapping(address => bool)) public claimed;
    mapping(bytes32 => CommunityGroup) public groups;
    bytes32[] public groupIds;

    // Token ID Tracking
    uint256 private _nextTokenId;
    mapping(uint256 => bytes32) public tokenGroup;
    mapping(uint256 => uint256) public tokenIssuedAt;
    mapping(bytes32 => mapping(address => uint256)) public memberTokenOfGroup;

    // Events
    event CommunityRegistered(bytes32 indexed groupId, string name, string region, address indexed steward);
    event MerkleRootUpdated(bytes32 indexed groupId, bytes32 indexed oldRoot, bytes32 indexed newRoot, address indexed steward);
    event StewardshipTransferred(bytes32 indexed groupId, address indexed previousSteward, address indexed newSteward);
    event MembershipSealClaimed(bytes32 indexed groupId, address indexed member, uint256 indexed tokenId, bytes32 merkleRoot);

    /**
     * @notice Initializes Chaupal Membership Contract
     * @param initialGroups Array of initial community configurations
     */
    constructor(
        CommunityGroupConfig[] memory initialGroups
    ) ERC721("Chaupal Soulbound Civic Seal", "CHAUPAL") {
        _nextTokenId = 1;

        for (uint256 i = 0; i < initialGroups.length; i++) {
            _registerGroup(
                initialGroups[i].groupId,
                initialGroups[i].name,
                initialGroups[i].region,
                initialGroups[i].steward,
                initialGroups[i].initialRoot
            );
        }
    }

    struct CommunityGroupConfig {
        bytes32 groupId;
        string name;
        string region;
        address steward;
        bytes32 initialRoot;
    }

    /**
     * @notice Claim a Soulbound Membership Seal for a community group using a Merkle Proof
     * @dev Leaf is derived directly from msg.sender and groupId to guarantee authenticity and prevent replay
     * @param groupId The bytes32 identifier of the community group
     * @param proof The Merkle inclusion proof calculated off-chain by the member
     * @return tokenId The ID of the minted Soulbound Seal
     */
    function claim(bytes32 groupId, bytes32[] calldata proof) external returns (uint256) {
        // 1. Verify community group existence
        address steward = stewardOf[groupId];
        if (steward == address(0)) {
            revert GroupNotFound();
        }

        // 2. Fetch root from contract storage (never caller-supplied)
        bytes32 root = merkleRootOf[groupId];
        if (root == bytes32(0)) {
            revert MerkleRootNotSet();
        }

        // 3. Derive member identity strictly from msg.sender
        address member = msg.sender;

        // 4. Enforce duplicate claim prevention
        if (claimed[groupId][member]) {
            revert AlreadyClaimed();
        }

        // 5. Construct OpenZeppelin StandardMerkleTree compatible leaf:
        // keccak256(bytes.concat(keccak256(abi.encode(groupId, member))))
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(groupId, member))));

        // 6. Verify Merkle proof against storage root
        if (!MerkleProof.verify(proof, root, leaf)) {
            revert InvalidMerkleProof();
        }

        // 7. Record claim state BEFORE token minting
        claimed[groupId][member] = true;

        // 8. Mint Soulbound token
        uint256 tokenId = _nextTokenId++;
        tokenGroup[tokenId] = groupId;
        tokenIssuedAt[tokenId] = block.timestamp;
        memberTokenOfGroup[groupId][member] = tokenId;

        _safeMint(member, tokenId);

        emit MembershipSealClaimed(groupId, member, tokenId, root);

        return tokenId;
    }

    /**
     * @notice Updates the Merkle Root for a community group
     * @dev Only the designated steward for the specific groupId can update its root
     * @param groupId The bytes32 identifier of the community group
     * @param newRoot The new 32-byte Merkle root representing the updated roster
     */
    function updateMerkleRoot(bytes32 groupId, bytes32 newRoot) external {
        address steward = stewardOf[groupId];
        if (steward == address(0)) {
            revert GroupNotFound();
        }

        if (msg.sender != steward) {
            revert UnauthorizedSteward();
        }

        if (newRoot == bytes32(0)) {
            revert InvalidMerkleRoot();
        }

        bytes32 oldRoot = merkleRootOf[groupId];
        merkleRootOf[groupId] = newRoot;
        groups[groupId].merkleRoot = newRoot;
        groups[groupId].lastRootUpdate = block.timestamp;

        emit MerkleRootUpdated(groupId, oldRoot, newRoot, msg.sender);
    }

    /**
     * @notice Transfer stewardship of a group to a new address
     * @param groupId The community group ID
     * @param newSteward The new steward address
     */
    function transferStewardship(bytes32 groupId, address newSteward) external {
        if (stewardOf[groupId] == address(0)) {
            revert GroupNotFound();
        }

        if (msg.sender != stewardOf[groupId]) {
            revert UnauthorizedSteward();
        }

        if (newSteward == address(0)) {
            revert InvalidAddress();
        }

        address prev = stewardOf[groupId];
        stewardOf[groupId] = newSteward;
        groups[groupId].steward = newSteward;

        emit StewardshipTransferred(groupId, prev, newSteward);
    }

    /**
     * @notice Helper to register a new community group
     */
    function _registerGroup(
        bytes32 groupId,
        string memory name,
        string memory region,
        address steward,
        bytes32 initialRoot
    ) internal {
        if (stewardOf[groupId] != address(0)) {
            revert GroupAlreadyExists();
        }
        if (steward == address(0)) {
            revert InvalidAddress();
        }

        stewardOf[groupId] = steward;
        merkleRootOf[groupId] = initialRoot;
        groupIds.push(groupId);

        groups[groupId] = CommunityGroup({
            groupId: groupId,
            name: name,
            region: region,
            steward: steward,
            merkleRoot: initialRoot,
            createdAt: block.timestamp,
            lastRootUpdate: block.timestamp
        });

        emit CommunityRegistered(groupId, name, region, steward);
        if (initialRoot != bytes32(0)) {
            emit MerkleRootUpdated(groupId, bytes32(0), initialRoot, steward);
        }
    }

    /**
     * @notice Get all registered group IDs
     */
    function getAllGroupIds() external view returns (bytes32[] memory) {
        return groupIds;
    }

    /**
     * @notice Get total group count
     */
    function getGroupCount() external view returns (uint256) {
        return groupIds.length;
    }

    /**
     * @dev Override OpenZeppelin ERC721 _update to enforce Soulbound (non-transferable) property.
     * Minting (from == address(0)) is allowed.
     * Transfers (from != address(0) && to != address(0)) strictly revert.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);

        // Disallow transfers between active addresses
        if (from != address(0) && to != address(0)) {
            revert SoulboundTokenNonTransferable();
        }

        return super._update(to, tokenId, auth);
    }

    /**
     * @notice Check whether a token is transferable (always false for soulbound)
     */
    function isTransferable() external pure returns (bool) {
        return false;
    }
}
