import { keccak256, toHex, stringToBytes } from 'viem';

export interface Community {
  id: string;
  groupId: `0x${string}`;
  name: string;
  hindiName: string;
  region: string;
  regionKey: 'north' | 'south' | 'east' | 'west' | 'central';
  description: string;
  steward: `0x${string}`;
  stewardName: string;
  initialRoot: `0x${string}`;
  membersCount: number;
  quorum: string;
  sealColor: 'terracotta' | 'forest' | 'saffron';
  tags: string[];
  eligibility: string;
}

export function computeGroupId(slug: string): `0x${string}` {
  return keccak256(stringToBytes(slug));
}

export const COMMUNITIES: Community[] = [
  {
    id: 'punjabi-sangat',
    groupId: computeGroupId('punjabi-sangat'),
    name: 'Punjabi Sangat',
    hindiName: 'पंजाबी संगत',
    region: 'North (Punjab)',
    regionKey: 'north',
    description: 'Preserving diaspora heritage, community langar initiatives, and regional literature circles.',
    steward: '0x38B744C190283475610293847561029384756102',
    stewardName: 'Sardar Baldev Singh',
    initialRoot: '0x9f8be4a16723cd8192a5431802bb01c8fa627192d774a123f81902a65b819201',
    membersCount: 1428,
    quorum: '98.4%',
    sealColor: 'terracotta',
    tags: ['Langar', 'Literature', 'Diaspora'],
    eligibility: 'Participation in certified Sangat assemblies or recommendation from 2 community elders.'
  },
  {
    id: 'maharashtra-ganesh-mandal',
    groupId: computeGroupId('maharashtra-ganesh-mandal'),
    name: 'Maharashtra Ganesh Mandal',
    hindiName: 'महाराष्ट्र गणेश मंडल',
    region: 'West (Maharashtra)',
    regionKey: 'west',
    description: 'Civic Dhol-Tasha troupes, Modi script archives, and community festival governance councils.',
    steward: '0x55E90283746510293847561029384756102933B2',
    stewardName: 'Adv. Mangesh Deshmukh',
    initialRoot: '0x34bc890123456789abcdef0123456789abcdef0123456789abcdef0123456789',
    membersCount: 2140,
    quorum: '97.5%',
    sealColor: 'forest',
    tags: ['Dhol-Tasha', 'Modi Script', 'Natak'],
    eligibility: 'Registered trust voting member or certified Mandal volunteer.'
  },
  {
    id: 'nagaland-weavers-collective',
    groupId: computeGroupId('nagaland-weavers-collective'),
    name: 'Nagaland Weavers Collective',
    hindiName: 'नागालैंड बुनकर समूह',
    region: 'East (Nagaland)',
    regionKey: 'east',
    description: 'Preserving tribal loin loom motifs, natural dye botanical knowledge, and indigenous pattern copyright.',
    steward: '0x44D10293847561029384756102938475610211A9',
    stewardName: 'Arenla Jamir',
    initialRoot: '0xbcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789a',
    membersCount: 680,
    quorum: '99.0%',
    sealColor: 'saffron',
    tags: ['Loin Loom', 'Tribal Motifs', 'Natural Dyes'],
    eligibility: 'Clan artisan verification or certified apprentice roster entry.'
  },
  {
    id: 'bengal-cultural-circle',
    groupId: computeGroupId('bengal-cultural-circle'),
    name: 'Bengal Cultural Circle',
    hindiName: 'बंगाल सांस्कृतिक सर्कल',
    region: 'East (West Bengal)',
    regionKey: 'east',
    description: 'Handloom Jamdani weavers, Kumartuli clay sculptors, and traditional Baul sangeet custodians.',
    steward: '0x22C10293847561029384756102938475610298A1',
    stewardName: 'Debabrata Mukherjee',
    initialRoot: '0x88e71029cba45109f029348127364501928374651234890abcde890123456789',
    membersCount: 890,
    quorum: '94.2%',
    sealColor: 'saffron',
    tags: ['Jamdani', 'Kumartuli', 'Baul Sangeet'],
    eligibility: 'Master artisan verification or certified apprentice guild record.'
  },
  {
    id: 'kerala-arts-sabha',
    groupId: computeGroupId('kerala-arts-sabha'),
    name: 'Kerala Arts Sabha',
    hindiName: 'केरल कला सभा',
    region: 'South (Kerala)',
    regionKey: 'south',
    description: 'Gulf diaspora mutual aid, cultural preservation of Kathakali & temple arts, and repatriation welfare.',
    steward: '0x71A10293847561029384756102938475610244C1',
    stewardName: 'K. Unnikrishnan Nair',
    initialRoot: '0x4c810de456819213efba9012a647bc5190234e628172901fabcd9018451920c8',
    membersCount: 3840,
    quorum: '99.1%',
    sealColor: 'forest',
    tags: ['Kathakali', 'Diaspora Welfare', 'Kalaripayattu'],
    eligibility: 'Pravasi council registration or valid Non-Resident Keralite verified commitment.'
  },
  {
    id: 'rajasthan-craft-guild',
    groupId: computeGroupId('rajasthan-craft-guild'),
    name: 'Rajasthan Craft Guild',
    hindiName: 'राजस्थान शिल्प गिल्ड',
    region: 'North (Rajasthan)',
    regionKey: 'north',
    description: 'Preserving orally transmitted Thar desert musical traditions, Kamaicha instrument makers, and block printers.',
    steward: '0x33A10293847561029384756102938475610288C2',
    stewardName: 'Ustad Anwar Khan Manganiyar',
    initialRoot: '0xdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde',
    membersCount: 720,
    quorum: '96.4%',
    sealColor: 'terracotta',
    tags: ['Manganiyar', 'Kamaicha', 'Bagru Print'],
    eligibility: 'Hereditary master artist lineage attestation or guild apprentice entry.'
  },
  {
    id: 'assam-community-sabha',
    groupId: computeGroupId('assam-community-sabha'),
    name: 'Assam Community Sabha',
    hindiName: 'असम सामुदायिक सभा',
    region: 'East (Assam)',
    regionKey: 'east',
    description: 'Protection of golden Muga silk provenance, Sualkuchi heritage loom registry, and Bihu folk conservation.',
    steward: '0x88A10293847561029384756102938475610277D3',
    stewardName: 'Bhaskar Jyoti Barua',
    initialRoot: '0x77890abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234',
    membersCount: 940,
    quorum: '98.0%',
    sealColor: 'saffron',
    tags: ['Muga Silk', 'Sualkuchi', 'Bihu'],
    eligibility: 'Sualkuchi master weaver loom certification & provenance proof.'
  },
  {
    id: 'tamil-heritage-circle',
    groupId: computeGroupId('tamil-heritage-circle'),
    name: 'Tamil Heritage Circle',
    hindiName: 'तमिल विरासत सर्कल',
    region: 'South (Tamil Nadu)',
    regionKey: 'south',
    description: 'Classical Sangam literature archives, Thirukkural recitation circles, and diaspora cultural festivals.',
    steward: '0x99D10293847561029384756102938475610211E0',
    stewardName: 'Dr. R. Subramanian',
    initialRoot: '0x12a9bc45de891047fa67b901283c4d5e71829014ab56cd78ef901234567890ab',
    membersCount: 2950,
    quorum: '96.8%',
    sealColor: 'terracotta',
    tags: ['Classical Tamil', 'Thirukkural', 'Sangam'],
    eligibility: 'Mandram literature circle registry proof or validated elder sponsorship.'
  },
  {
    id: 'gujarat-garba-mandal',
    groupId: computeGroupId('gujarat-garba-mandal'),
    name: 'Gujarat Garba Mandal',
    hindiName: 'गुजरात गरबा मंडल',
    region: 'West (Gujarat)',
    regionKey: 'west',
    description: 'Traditional mercantile trust networks, cooperative grain syndicates, and folk Navratri traditions.',
    steward: '0x14B10293847561029384756102938475610299C8',
    stewardName: 'Pratapsinh Vaghela',
    initialRoot: '0xfa01928374651234890abcdef0123456789abcdef0123456789abcdef0123456',
    membersCount: 4620,
    quorum: '99.7%',
    sealColor: 'terracotta',
    tags: ['Mahajan Trust', 'Navratri', 'Grain Syndicate'],
    eligibility: 'Mahajan cooperative ledger endorsement with dual-steward co-sign.'
  },
  {
    id: 'odisha-handloom-collective',
    groupId: computeGroupId('odisha-handloom-collective'),
    name: 'Odisha Handloom Collective',
    hindiName: 'ओडिशा हथकरघा समूह',
    region: 'East (Odisha)',
    regionKey: 'east',
    description: 'Raghurajpur Pattachitra painters, Gotipua dance conservators, and Sambalpuri Ikat weaver trusts.',
    steward: '0x66B10293847561029384756102938475610222D4',
    stewardName: 'Baidyanath Mohapatra',
    initialRoot: '0xef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
    membersCount: 1150,
    quorum: '98.9%',
    sealColor: 'saffron',
    tags: ['Pattachitra', 'Sambalpuri Ikat', 'Gotipua'],
    eligibility: 'Craft village council or temple guild ledger membership.'
  },
  {
    id: 'kashmir-artisan-circle',
    groupId: computeGroupId('kashmir-artisan-circle'),
    name: 'Kashmir Artisan Circle',
    hindiName: 'कश्मीर कारीगर सर्कल',
    region: 'North (Jammu & Kashmir)',
    regionKey: 'north',
    description: 'GI-tagged Handspun Pashmina weavers, Papier-mâché artisans, and walnut wood carving custodians.',
    steward: '0x99A10293847561029384756102938475610255E1',
    stewardName: 'Ghulam Hassan Mir',
    initialRoot: '0xf0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01',
    membersCount: 960,
    quorum: '97.9%',
    sealColor: 'terracotta',
    tags: ['Pashmina', 'Papier-mâché', 'Walnut Carving'],
    eligibility: 'Pashmina artisan verification board certificate.'
  },
  {
    id: 'goa-cultural-association',
    groupId: computeGroupId('goa-cultural-association'),
    name: 'Goa Cultural Association',
    hindiName: 'गोवा सांस्कृतिक संघ',
    region: 'West (Goa)',
    regionKey: 'west',
    description: 'Preserving Konkani tiatr heritage, communidade village land trusts, and indigenous brass band traditions.',
    steward: '0x77F10293847561029384756102938475610244A3',
    stewardName: 'Francisco D\'Souza',
    initialRoot: '0xcde0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd',
    membersCount: 1200,
    quorum: '97.0%',
    sealColor: 'forest',
    tags: ['Tiatr', 'Communidade', 'Konkani'],
    eligibility: 'Communidade gaunkar registry or certified tiatr academy membership.'
  }
];
