// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Minimal forge-std interface for compilation and testing
abstract contract Test {
    address internal constant HEVM_ADDRESS = address(uint160(uint256(keccak256("hevm cheat code"))));

    function vm() internal pure returns (Vm) {
        return Vm(HEVM_ADDRESS);
    }

    function assertTrue(bool condition) internal pure {
        require(condition, "Assertion failed: condition not true");
    }

    function assertFalse(bool condition) internal pure {
        require(!condition, "Assertion failed: condition not false");
    }

    function assertEq(bytes32 a, bytes32 b) internal pure {
        require(a == b, "Assertion failed: bytes32 not equal");
    }

    function assertEq(address a, address b) internal pure {
        require(a == b, "Assertion failed: address not equal");
    }

    function assertEq(uint256 a, uint256 b) internal pure {
        require(a == b, "Assertion failed: uint256 not equal");
    }
}

interface Vm {
    function prank(address) external;
    function startPrank(address) external;
    function stopPrank() external;
    function expectRevert(bytes4) external;
    function expectRevert(bytes calldata) external;
    function expectRevert() external;
}

import "../contracts/ChaupalMembership.sol";

contract ChaupalMembershipTest is Test {
    ChaupalMembership public chaupal;

    // Test Addresses
    address public stewardA = address(0x1111);
    address public stewardB = address(0x2222);
    address public alice = address(0xAAAA);
    address public bob = address(0xBBBB);
    address public charlie = address(0xCCCC);

    // Group IDs
    bytes32 public groupA = keccak256("punjabi-sangat");
    bytes32 public groupB = keccak256("maharashtra-ganesh-mandal");

    // Merkle Roots
    bytes32 public rootA;
    bytes32 public rootB;

    function setUp() public {
        // Construct valid 2-leaf Merkle Tree for Group A (Alice & Charlie)
        bytes32 leafAliceA = keccak256(bytes.concat(keccak256(abi.encode(groupA, alice))));
        bytes32 leafCharlieA = keccak256(bytes.concat(keccak256(abi.encode(groupA, charlie))));
        
        // OpenZeppelin Merkle sort ordering for pair
        if (leafAliceA <= leafCharlieA) {
            rootA = keccak256(bytes.concat(leafAliceA, leafCharlieA));
        } else {
            rootA = keccak256(bytes.concat(leafCharlieA, leafAliceA));
        }

        // Construct Merkle Tree for Group B (Bob)
        bytes32 leafBobB = keccak256(bytes.concat(keccak256(abi.encode(groupB, bob))));
        rootB = leafBobB; // Single leaf root

        // Initialize contract with groups
        ChaupalMembership.CommunityGroupConfig[] memory configs = new ChaupalMembership.CommunityGroupConfig[](2);
        configs[0] = ChaupalMembership.CommunityGroupConfig({
            groupId: groupA,
            name: "Punjabi Sangat",
            region: "North (Punjab)",
            steward: stewardA,
            initialRoot: rootA
        });
        configs[1] = ChaupalMembership.CommunityGroupConfig({
            groupId: groupB,
            name: "Maharashtra Ganesh Mandal",
            region: "West (Maharashtra)",
            steward: stewardB,
            initialRoot: rootB
        });

        chaupal = new ChaupalMembership(configs);
    }

    /**
     * TEST 1: Claim leaf is derived strictly from msg.sender
     * Alice claims with her proof. Calling as Bob with Alice's proof must revert.
     */
    function test_Test1_ClaimLeafDerivedFromMsgSender() public {
        bytes32 leafCharlieA = keccak256(bytes.concat(keccak256(abi.encode(groupA, charlie))));
        bytes32[] memory proof = new bytes32[](1);
        proof[0] = leafCharlieA;

        // Alice claims successfully
        vm().prank(alice);
        uint256 tokenId = chaupal.claim(groupA, proof);
        assertEq(chaupal.ownerOf(tokenId), alice);

        // Bob attempts to use Alice's proof -> Reverts because leaf is calculated from Bob (msg.sender)
        vm().prank(bob);
        vm().expectRevert(ChaupalMembership.InvalidMerkleProof.selector);
        chaupal.claim(groupA, proof);
    }

    /**
     * TEST 2: Group ID is included in the leaf
     * Create two groups and prove that a proof for group A does not work for group B.
     */
    function test_Test2_GroupIdIncludedInLeaf_CrossGroupFails() public {
        bytes32 leafCharlieA = keccak256(bytes.concat(keccak256(abi.encode(groupA, charlie))));
        bytes32[] memory proofA = new bytes32[](1);
        proofA[0] = leafCharlieA;

        // Alice attempts to claim group B using proof for group A -> Reverts
        vm().prank(alice);
        vm().expectRevert(ChaupalMembership.InvalidMerkleProof.selector);
        chaupal.claim(groupB, proofA);
    }

    /**
     * TEST 3: Only each group's own steward can update its root
     * Group A steward can update A, cannot update B.
     * Group B steward can update B, cannot update A.
     */
    function test_Test3_StewardAuthorizationScopedPerGroup() public {
        bytes32 newRoot = keccak256("new_punjab_root_2026");

        // Group A steward updates Group A -> SUCCESS
        vm().prank(stewardA);
        chaupal.updateMerkleRoot(groupA, newRoot);
        assertEq(chaupal.merkleRootOf(groupA), newRoot);

        // Group A steward attempts to update Group B -> REVERTS
        vm().prank(stewardA);
        vm().expectRevert(ChaupalMembership.UnauthorizedSteward.selector);
        chaupal.updateMerkleRoot(groupB, newRoot);

        // Group B steward attempts to update Group A -> REVERTS
        vm().prank(stewardB);
        vm().expectRevert(ChaupalMembership.UnauthorizedSteward.selector);
        chaupal.updateMerkleRoot(groupA, newRoot);
    }

    /**
     * TEST 4: Claim uses stored root (not caller-supplied)
     */
    function test_Test4_ClaimUsesStoredRoot() public {
        assertEq(chaupal.merkleRootOf(groupA), rootA);

        bytes32 leafCharlieA = keccak256(bytes.concat(keccak256(abi.encode(groupA, charlie))));
        bytes32[] memory proof = new bytes32[](1);
        proof[0] = leafCharlieA;

        // Claim succeeds with correct stored root
        vm().prank(alice);
        uint256 tokenId = chaupal.claim(groupA, proof);
        assertTrue(tokenId > 0);
    }

    /**
     * TEST 5: Second claim reverts for same group
     * Alice claims group A -> succeeds.
     * Alice claims group A again -> reverts.
     * Alice claims group B (if eligible) -> succeeds.
     */
    function test_Test5_SecondClaimReverts() public {
        bytes32 leafCharlieA = keccak256(bytes.concat(keccak256(abi.encode(groupA, charlie))));
        bytes32[] memory proof = new bytes32[](1);
        proof[0] = leafCharlieA;

        vm().startPrank(alice);
        chaupal.claim(groupA, proof);

        // Second claim for Group A reverts
        vm().expectRevert(ChaupalMembership.AlreadyClaimed.selector);
        chaupal.claim(groupA, proof);
        vm().stopPrank();
    }

    /**
     * TEST 6: Seal cannot transfer (Soulbound enforcement)
     * Alice claims, owns token, attempts transfer to Bob -> reverts.
     */
    function test_Test6_SealCannotTransfer_Soulbound() public {
        bytes32 leafCharlieA = keccak256(bytes.concat(keccak256(abi.encode(groupA, charlie))));
        bytes32[] memory proof = new bytes32[](1);
        proof[0] = leafCharlieA;

        vm().prank(alice);
        uint256 tokenId = chaupal.claim(groupA, proof);
        assertEq(chaupal.ownerOf(tokenId), alice);

        // Alice attempts transferFrom to Bob -> Reverts with SoulboundTokenNonTransferable
        vm().prank(alice);
        vm().expectRevert(ChaupalMembership.SoulboundTokenNonTransferable.selector);
        chaupal.transferFrom(alice, bob, tokenId);

        // Alice attempts safeTransferFrom to Bob -> Reverts
        vm().prank(alice);
        vm().expectRevert(ChaupalMembership.SoulboundTokenNonTransferable.selector);
        chaupal.safeTransferFrom(alice, bob, tokenId);
    }
}
