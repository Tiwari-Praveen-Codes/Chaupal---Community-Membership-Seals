// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../contracts/ChaupalMembership.sol";

contract DeployChaupal {
    function run() external returns (ChaupalMembership) {
        // Seed 12 Autonomous Indian Communities
        ChaupalMembership.CommunityGroupConfig[] memory groups = new ChaupalMembership.CommunityGroupConfig[](12);

        groups[0] = ChaupalMembership.CommunityGroupConfig({
            groupId: keccak256("punjabi-sangat"),
            name: "Punjabi Sangat",
            region: "North (Punjab)",
            steward: 0x38B744C190283475610293847561029384756102,
            initialRoot: 0x9f8be4a16723cd8192a5431802bb01c8fa627192d774a123f81902a65b819201
        });

        groups[1] = ChaupalMembership.CommunityGroupConfig({
            groupId: keccak256("maharashtra-ganesh-mandal"),
            name: "Maharashtra Ganesh Mandal",
            region: "West (Maharashtra)",
            steward: 0x55E90283746510293847561029384756102933B2,
            initialRoot: 0x34bc890123456789abcdef0123456789abcdef0123456789abcdef0123456789
        });

        groups[2] = ChaupalMembership.CommunityGroupConfig({
            groupId: keccak256("nagaland-weavers-collective"),
            name: "Nagaland Weavers Collective",
            region: "East (Nagaland)",
            steward: 0x44D10293847561029384756102938475610211A9,
            initialRoot: 0xbcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789a
        });

        groups[3] = ChaupalMembership.CommunityGroupConfig({
            groupId: keccak256("bengal-cultural-circle"),
            name: "Bengal Cultural Circle",
            region: "East (West Bengal)",
            steward: 0x22C10293847561029384756102938475610298A1,
            initialRoot: 0x88e71029cba45109f029348127364501928374651234890abcde890123456789
        });

        groups[4] = ChaupalMembership.CommunityGroupConfig({
            groupId: keccak256("kerala-arts-sabha"),
            name: "Kerala Arts Sabha",
            region: "South (Kerala)",
            steward: 0x71A10293847561029384756102938475610244C1,
            initialRoot: 0x4c810de456819213efba9012a647bc5190234e628172901fabcd9018451920c8
        });

        groups[5] = ChaupalMembership.CommunityGroupConfig({
            groupId: keccak256("rajasthan-craft-guild"),
            name: "Rajasthan Craft Guild",
            region: "North (Rajasthan)",
            steward: 0x33A10293847561029384756102938475610288C2,
            initialRoot: 0xdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde
        });

        groups[6] = ChaupalMembership.CommunityGroupConfig({
            groupId: keccak256("assam-community-sabha"),
            name: "Assam Community Sabha",
            region: "East (Assam)",
            steward: 0x88A10293847561029384756102938475610277D3,
            initialRoot: 0x77890abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234
        });

        groups[7] = ChaupalMembership.CommunityGroupConfig({
            groupId: keccak256("tamil-heritage-circle"),
            name: "Tamil Heritage Circle",
            region: "South (Tamil Nadu)",
            steward: 0x99D10293847561029384756102938475610211E0,
            initialRoot: 0x12a9bc45de891047fa67b901283c4d5e71829014ab56cd78ef901234567890ab
        });

        groups[8] = ChaupalMembership.CommunityGroupConfig({
            groupId: keccak256("gujarat-garba-mandal"),
            name: "Gujarat Garba Mandal",
            region: "West (Gujarat)",
            steward: 0x14B10293847561029384756102938475610299C8,
            initialRoot: 0xfa01928374651234890abcdef0123456789abcdef0123456789abcdef0123456
        });

        groups[9] = ChaupalMembership.CommunityGroupConfig({
            groupId: keccak256("odisha-handloom-collective"),
            name: "Odisha Handloom Collective",
            region: "East (Odisha)",
            steward: 0x66B10293847561029384756102938475610222D4,
            initialRoot: 0xef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0
        });

        groups[10] = ChaupalMembership.CommunityGroupConfig({
            groupId: keccak256("kashmir-artisan-circle"),
            name: "Kashmir Artisan Circle",
            region: "North (Jammu & Kashmir)",
            steward: 0x99A10293847561029384756102938475610255E1,
            initialRoot: 0xf0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01
        });

        groups[11] = ChaupalMembership.CommunityGroupConfig({
            groupId: keccak256("goa-cultural-association"),
            name: "Goa Cultural Association",
            region: "West (Goa)",
            steward: 0x77F10293847561029384756102938475610244A3,
            initialRoot: 0xcde0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd
        });

        ChaupalMembership chaupal = new ChaupalMembership(groups);
        return chaupal;
    }
}
