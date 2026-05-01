// ═══════════════════════════════════════════════════════════════════════════════
// NVMe Drive Compatibility Tool — BaseConfig
// Standalone vanilla JS app for Cisco UCS NVMe drive planning
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Data Model ──────────────────────────────────────────────────────────────

const SERVER_MODELS = {
    'C240-M6': {
        name: 'Cisco UCS C240 M6',
        generation: 'M6',
        processor: 'Intel Xeon Scalable 3rd Gen (e.g. 8358P)',
        formFactors: ['2U Rack'],
        pids: {
            'UCSC-C240-M6SX': {
                label: '24 SFF SAS/SATA',
                driveType: 'SFF',
                totalBays: 24,
                nvmeFrontBays: [1, 2, 3, 4],
                nvmeRearBays: [101, 102, 103, 104],
                description: '24x 2.5-inch SFF SAS/SATA bays, front bays 1–4 support NVMe (bays 5–24 SAS/SATA only)',
            },
            'UCSC-C240-M6SN': {
                label: '24 NVMe',
                driveType: 'SFF',
                totalBays: 24,
                nvmeFrontBays: Array.from({ length: 24 }, (_, i) => i + 1),
                nvmeRearBays: [101, 102, 103, 104],
                description: '24x 2.5-inch NVMe drive bays, all front bays support NVMe',
            },
            'UCSC-C240-M6S': {
                label: '12 SAS/SATA + Optical',
                driveType: 'SFF',
                totalBays: 12,
                nvmeFrontBays: [1, 2, 3, 4],
                nvmeRearBays: [103, 104],
                description: '12x 2.5-inch SFF SAS/SATA bays with DVD option, front bays 1–4 support NVMe (bays 5–12 SAS/SATA only)',
            },
            'UCSC-C240-M6N': {
                label: '12 NVMe',
                driveType: 'SFF',
                totalBays: 12,
                nvmeFrontBays: Array.from({ length: 12 }, (_, i) => i + 1),
                nvmeRearBays: [103, 104],
                description: '12x 2.5-inch NVMe drive bays, all front bays support NVMe',
            },
            'UCSC-C240-M6L': {
                label: '12 LFF',
                driveType: 'LFF',
                totalBays: 12,
                nvmeFrontBays: [1, 2, 3, 4],
                nvmeRearBays: [],
                description: '12x 3.5-inch LFF bays, front bays 1\u20134 support NVMe via sled adapter (UCS-LFF-SFF-SLED2)',
                requiresAdapter: 'UCS-LFF-SFF-SLED2',
            },
        },
        requirements: [
            'Two CPUs must be installed for NVMe support',
            'Front NVMe bays 1–2 connect to CPU1; bays 3–4 connect to CPU2',
            'If ordering 3–4 NVMe drives, two CPUs are required',
            'BIOS hot-plug support must be enabled',
            'UEFI boot mode required (legacy boot not supported for NVMe)',
            'NVMe SSDs cannot be controlled by SAS RAID controller',
            'SED drives can be mixed with non-SED drives in same server',
        ],
        rearNvmeRisers: ['Riser 1A', 'Riser 3A'],
        controllerOptions: [
            { id: 'mraid-28', pid: 'UCSC-RAID-M6SD', label: 'Cisco 12G SAS RAID Controller (28 Drives)', description: 'Modular 12G SAS RAID with 4GB FBWC — supports up to 28 SAS/SATA drives' },
            { id: 'mraid-16', pid: 'UCSC-RAID-240M6', label: 'Cisco 12G SAS RAID Controller (16 Drives)', description: '12G SAS RAID with 4GB FBWC — supports up to 16 SAS/SATA drives' },
            { id: 'hba', pid: 'UCSC-SAS-240M6', label: 'Cisco 12G SAS HBA (16 Drives)', description: 'SAS HBA — drives presented directly to OS (JBOD)' },
            { id: 'none', pid: null, label: 'No Storage Controller (M.2 Boot Only)', description: 'No SAS/RAID controller installed — server boots from M.2, front bays available for NVMe' },
        ],
        biosSettings: {
            path: 'BIOS > Advanced > PCI Configuration',
            setting: 'NVMe Hot-Plug Support',
            value: 'Enabled',
        },
    },

    'C245-M6': {
        name: 'Cisco UCS C245 M6',
        generation: 'M6',
        processor: 'AMD EPYC 7003 Series (e.g. 7763)',
        formFactors: ['2U Rack'],
        pids: {
            'UCSC-C245-M6SX': {
                label: '24 SFF SAS/SATA',
                driveType: 'SFF',
                totalBays: 24,
                nvmeFrontBays: [1, 2, 3, 4],
                nvmeRearBays: [101, 102, 103, 104],
                description: '24x 2.5-inch SFF SAS/SATA bays, front bays 1\u20134 support NVMe (bays 5\u201324 SAS/SATA only)',
            },
        },
        requirements: [
            'Two CPUs must be installed for NVMe support',
            'Front NVMe bays 1–2 connect to CPU1; bays 3–4 connect to CPU2',
            'If ordering 3–4 NVMe drives, two CPUs are required',
            'BIOS hot-plug support must be enabled',
            'UEFI boot mode required (legacy boot not supported for NVMe)',
            'NVMe SSDs cannot be controlled by SAS RAID controller',
            'When mixing NVMe form factors, drives must be the same brand',
        ],
        rearNvmeRisers: ['Riser 1B (slots 2–3)', 'Riser 3B (slots 7–8)'],
        controllerOptions: [
            { id: 'mraid', pid: 'UCSC-RAID-M6SD', label: 'Cisco 12G Modular RAID Controller (28 Drives)', description: 'Modular 12G SAS RAID with 4GB FBWC — supports up to 28 SAS/SATA drives' },
            { id: 'dual-hba', pid: 'UCSC-SAS-240M6', label: 'Dual SAS HBAs (x2)', description: 'Two 12G SAS HBAs — JBOD/pass-through mode' },
            { id: 'none', pid: null, label: 'No Storage Controller (M.2 Boot Only)', description: 'No SAS/RAID controller installed — NVMe via direct PCIe' },
        ],
        biosSettings: {
            path: 'BIOS > Advanced > PCI Configuration',
            setting: 'NVMe Hot-Plug Support',
            value: 'Enabled',
        },
    },

    'C240-M7': {
        name: 'Cisco UCS C240 M7',
        generation: 'M7',
        processor: 'Intel Xeon Scalable 4th Gen (e.g. 6530)',
        formFactors: ['2U Rack'],
        pids: {
            'UCSC-C240-M7SX': {
                label: '24 SFF SAS/SATA',
                driveType: 'SFF',
                totalBays: 24,
                nvmeFrontBays: [1, 2, 3, 4],
                nvmeRearBays: [101, 102, 103, 104],
                description: '24x 2.5-inch SFF bays, front bays 1\u20134 support direct-attach NVMe (bays 5\u201324 SAS/SATA only, or U.3 with tri-mode RAID)',
            },
            'UCSC-C240-M7SN': {
                label: '24 NVMe',
                driveType: 'SFF',
                totalBays: 24,
                nvmeFrontBays: Array.from({ length: 24 }, (_, i) => i + 1),
                nvmeRearBays: [101, 102, 103, 104],
                description: '24x U.3 NVMe drive bays, all front bays support NVMe',
            },
        },
        requirements: [
            'Two CPUs must be installed for NVMe support',
            'Front NVMe bays 1–2 connect directly to CPU1; bays 3–4 connect to CPU2',
            'If ordering 3–4 direct-attach NVMe drives, two CPUs are required',
            'PCIe Riser 2 not available in single-CPU configurations',
            'BIOS hot-plug support must be enabled',
            'UEFI boot mode required (legacy boot not supported for NVMe)',
            'Only U.3 NVMe drives are allowed with 24G Tri-mode RAID controllers',
            'SED drives can be mixed with non-SED drives in same server',
        ],
        rearNvmeRisers: ['Riser 1B', 'Riser 3B'],
        controllerOptions: [
            { id: 'raid-hp', pid: 'UCSC-RAID-HP', label: 'Cisco 24G Tri-mode RAID (16 Drives)', description: '24G Tri-mode RAID with cache backup — SAS/SATA/NVMe' },
            { id: 'raid-mp1', pid: 'UCSC-RAID-MP1L32', label: 'Cisco 24G Tri-mode MP1 RAID (32 Drives)', description: '24G Tri-Mode MP1 RAID with 4GB FBWC — SAS/SATA/NVMe' },
            { id: 'raid-sd', pid: 'UCSC-RAID-SD-D', label: 'Cisco 12G Modular RAID Controller', description: '12G SAS modular RAID controller' },
            { id: 'hba-m1', pid: 'UCSC-HBA-M1L16', label: 'Cisco 24G Tri-mode HBA (16 Drives)', description: '24G Tri-mode M1 HBA — JBOD/pass-through for SAS/SATA/NVMe' },
            { id: 'hba-sas', pid: 'UCSC-SAS-T-D', label: 'Cisco 12G SAS HBA (Pass-through)', description: '12G SAS pass-through HBA' },
            { id: 'none', pid: null, label: 'No Storage Controller (M.2 Boot Only)', description: 'No SAS/RAID controller installed — NVMe via direct PCIe' },
        ],
        biosSettings: {
            path: 'BIOS > Advanced > PCI Configuration',
            setting: 'NVMe Hot-Plug Support',
            value: 'Enabled',
        },
    },

    'C220-M6': {
        name: 'Cisco UCS C220 M6',
        generation: 'M6',
        processor: 'Intel Xeon Scalable 3rd Gen (e.g. 8358P)',
        formFactors: ['1U Rack'],
        pids: {
            'UCSC-C220-M6S': {
                label: '10 SFF SAS/SATA',
                driveType: 'SFF',
                totalBays: 10,
                nvmeFrontBays: [1, 2],
                nvmeRearBays: [],
                description: '10x 2.5-inch SFF bays, front bays 1\u20132 support NVMe via PCIe riser 2 (bays 3\u201310 SAS/SATA only)',
            },
            'UCSC-C220-M6N': {
                label: '10 NVMe',
                driveType: 'SFF',
                totalBays: 10,
                nvmeFrontBays: Array.from({ length: 10 }, (_, i) => i + 1),
                nvmeRearBays: [],
                description: '10x 2.5-inch NVMe drive bays, bays 1\u20132 via PCIe riser 2, bays 3\u201310 via NVMe switch card',
            },
        },
        requirements: [
            'Two CPUs must be installed for NVMe support',
            'NVMe drives connect directly to CPU2 \u2014 not managed by SAS RAID controller',
            'PCIe riser 2 not available in single-CPU configurations',
            'NVMe-optimized (M6N) includes factory-installed NVMe switch card for bays 3\u201310',
            'BIOS hot-plug support must be enabled',
            'UEFI boot mode required (legacy boot not supported for NVMe)',
            'Hot-removal supported in all OS except VMware ESXi (surprise-remove not supported)',
        ],
        rearNvmeRisers: [],
        controllerOptions: [
            { id: 'mraid', pid: 'UCSC-RAID-M6SD', label: 'Cisco 12G Modular RAID Controller', description: '12G SAS modular RAID with 4GB FBWC \u2014 does not manage NVMe' },
            { id: 'hba', pid: 'UCSC-SAS-240M6', label: 'Cisco 12G SAS HBA', description: '12G SAS HBA \u2014 JBOD/pass-through for SAS/SATA' },
            { id: 'none', pid: null, label: 'No Storage Controller (M.2 Boot Only)', description: 'No SAS/RAID controller \u2014 NVMe via direct PCIe' },
        ],
        biosSettings: {
            path: 'BIOS > Advanced > PCI Subsystem Settings',
            setting: 'NVMe SSD Hot-Plug Support',
            value: 'Enabled',
        },
    },

    'C220-M7': {
        name: 'Cisco UCS C220 M7',
        generation: 'M7',
        processor: 'Intel Xeon Scalable 4th/5th Gen',
        formFactors: ['1U Rack'],
        pids: {
            'UCSC-C220-M7SX': {
                label: '10 SFF SAS/SATA',
                driveType: 'SFF',
                totalBays: 10,
                nvmeFrontBays: [1, 2],
                nvmeRearBays: [],
                description: '10x 2.5-inch SFF bays, front bays 1\u20132 support direct-attach NVMe (bays 3\u201310 SAS/SATA only)',
            },
            'UCSC-C220-M7SN': {
                label: '10 NVMe',
                driveType: 'SFF',
                totalBays: 10,
                nvmeFrontBays: Array.from({ length: 10 }, (_, i) => i + 1),
                nvmeRearBays: [],
                description: '10x 2.5-inch NVMe drive bays, all front bays support NVMe',
            },
        },
        requirements: [
            'Two CPUs recommended for NVMe support',
            'PCIe riser 2 not available in single-CPU config with 2 FHFL risers',
            'In single-CPU config with 3 HHHL risers, riser 1 and 2 are both on CPU1',
            'BIOS hot-plug support must be enabled',
            'UEFI boot mode required (legacy boot not supported for NVMe)',
            'NVMe SSDs cannot be controlled by SAS RAID controller',
            'Hot-removal supported in all OS except VMware ESXi (surprise-remove not supported)',
        ],
        rearNvmeRisers: [],
        controllerOptions: [
            { id: 'raid-hp', pid: 'UCSC-RAID-HP', label: 'Cisco 24G Tri-mode RAID', description: '24G Tri-mode RAID with cache backup \u2014 SAS/SATA/NVMe' },
            { id: 'hba-m1', pid: 'UCSC-HBA-M1L16', label: 'Cisco 24G Tri-mode HBA', description: '24G Tri-mode HBA \u2014 JBOD/pass-through' },
            { id: 'hba-sas', pid: 'UCSC-SAS-T-D', label: 'Cisco 12G SAS HBA', description: '12G SAS pass-through HBA' },
            { id: 'none', pid: null, label: 'No Storage Controller (M.2 Boot Only)', description: 'No SAS/RAID controller \u2014 NVMe via direct PCIe' },
        ],
        biosSettings: {
            path: 'BIOS > Advanced > PCI Subsystem Settings',
            setting: 'NVMe SSD Hot-Plug Support',
            value: 'Enabled',
        },
    },

    'X210c-M7': {
        name: 'Cisco UCS X210c M7',
        generation: 'M7',
        processor: 'Intel Xeon Scalable 4th/5th Gen',
        formFactors: ['X-Series Compute Node'],
        pids: {
            'UCSX-210C-M7': {
                label: '6 SFF (Front Mezzanine)',
                driveType: 'SFF',
                totalBays: 6,
                nvmeFrontBays: [1, 2, 3, 4, 5, 6],
                nvmeRearBays: [],
                description: '6x 2.5-inch hot-pluggable drives in front mezzanine module, all bays support NVMe',
            },
        },
        requirements: [
            'Requires Cisco UCS X9508 Server Chassis',
            'Managed exclusively via Cisco Intersight (minimum Essentials license)',
            'Drives require a RAID or passthrough controller in the front mezzanine module slot',
            'Optional front mezzanine GPU module supports 2 NVMe + 2 HHHL GPUs',
            'M.2 boot drives available (SATA with RAID or NVMe pass-through)',
            'Up to 8TB memory with 5th Gen Intel Xeon Scalable processors',
        ],
        rearNvmeRisers: [],
        controllerOptions: [
            { id: 'mraid', pid: 'UCSX-M7RAID1-E', label: 'Front Mezzanine RAID Controller', description: 'Tri-mode RAID in front mezzanine module' },
            { id: 'passthrough', pid: 'UCSX-M7PT1-PT', label: 'Front Mezzanine Passthrough', description: 'NVMe/SAS/SATA pass-through in mezzanine module' },
        ],
        biosSettings: {
            path: 'Cisco Intersight > Server Profile > BIOS Policy',
            setting: 'NVMe SSD Hot-Plug Support',
            value: 'Enabled',
        },
    },

    'X410c-M7': {
        name: 'Cisco UCS X410c M7',
        generation: 'M7',
        processor: 'Intel Xeon Scalable 4th Gen (4-socket)',
        formFactors: ['X-Series Compute Node'],
        pids: {
            'UCSX-410C-M7': {
                label: '6 SFF (Front Mezzanine)',
                driveType: 'SFF',
                totalBays: 6,
                nvmeFrontBays: [1, 2, 3, 4, 5, 6],
                nvmeRearBays: [],
                description: '6x 2.5-inch hot-pluggable drives in front mezzanine module, all bays support NVMe',
            },
        },
        requirements: [
            'Requires Cisco UCS X9508 Server Chassis (occupies 2 node slots)',
            'Managed exclusively via Cisco Intersight (minimum Essentials license)',
            'Drives require a RAID or passthrough controller in the front mezzanine module slot',
            '4-socket compute node \u2014 up to 4x Intel Xeon Scalable 4th Gen CPUs',
            'Up to 16TB memory with 64x 256GB DDR5-4800 DIMMs',
            'M.2 boot drives available (SATA with RAID or NVMe pass-through)',
        ],
        rearNvmeRisers: [],
        controllerOptions: [
            { id: 'mraid', pid: 'UCSX-M7RAID1-E', label: 'Front Mezzanine RAID Controller', description: 'Tri-mode RAID in front mezzanine module' },
            { id: 'passthrough', pid: 'UCSX-M7PT1-PT', label: 'Front Mezzanine Passthrough', description: 'NVMe/SAS/SATA pass-through in mezzanine module' },
        ],
        biosSettings: {
            path: 'Cisco Intersight > Server Profile > BIOS Policy',
            setting: 'NVMe SSD Hot-Plug Support',
            value: 'Enabled',
        },
    },
};

const CABLES = {
    // ── C240 M6 Cables (per c240m6-sff-specsheet.pdf) ──
    'CBL-FNVME-240M6': {
        pid: 'CBL-FNVME-240M6',
        sparePid: 'CBL-FNVME-240M6=',
        description: 'C240 M6 Front NVMe cable kit (two cables)',
        servers: ['C240-M6'],
        pids: ['UCSC-C240-M6SX', 'UCSC-C240-M6SN', 'UCSC-C240-M6S', 'UCSC-C240-M6N'],
        location: 'front',
        driveConnections: 'NVMe-C cable (MB NVMe-C \u2192 BP NVMe-C, drives 1\u20132) + NVMe-D cable (MB NVMe-D \u2192 BP NVMe-D, drives 3\u20134)',
        notes: 'Included when ordering front NVMe drives with or without RAID controller. Single cable set covers all 4 front NVMe bays.',
        subCables: [
            { partNumber: 'NVMe-C cable', drives: [1, 2], routing: 'MB NVMe-C \u2192 BP NVMe-C' },
            { partNumber: 'NVMe-D cable', drives: [3, 4], routing: 'MB NVMe-D \u2192 BP NVMe-D' },
        ],
    },
    'CBL-NVME-C240LFF': {
        pid: 'CBL-NVME-C240LFF',
        description: 'NVMe PCIe cable for C240 M6 LFF configuration',
        servers: ['C240-M6'],
        pids: ['UCSC-C240-M6L'],
        location: 'front',
        driveConnections: 'Connects LFF bays with SFF NVMe sled adapters',
        notes: 'Requires UCS-LFF-SFF-SLED2 adapter in each LFF bay',
    },

    // ── C245 M6 Cables (per c245m6-sff-specsheet.pdf) ──
    'CBL-SDFNVME-245M6': {
        pid: 'CBL-SDFNVME-245M6',
        sparePid: 'CBL-SDFNVME-245M6=',
        description: 'C245 M6 Front NVMe cable kit (two cables)',
        servers: ['C245-M6'],
        location: 'front',
        driveConnections: 'NVMe-C cable (MB NVMe-C \u2192 BP NVMe-C, drives 1\u20132) + NVMe-B cable (MB NVMe-B \u2192 BP NVMe-D, drives 3\u20134)',
        notes: 'Included when ordering NVMe drives with RAID controller (UCSC-RAID-M6SD) or without controller',
        subCables: [
            { partNumber: 'NVMe-C cable', drives: [1, 2], routing: 'MB NVMe-C \u2192 BP NVMe-C' },
            { partNumber: 'NVMe-B cable', drives: [3, 4], routing: 'MB NVMe-B \u2192 BP NVMe-D' },
        ],
    },
    'CBL-FNVME-C245M6': {
        pid: 'CBL-FNVME-C245M6',
        sparePid: 'CBL-FNVME-C245M6=',
        description: 'C245 M6 Front NVMe cable (single Y cable)',
        servers: ['C245-M6'],
        location: 'front',
        driveConnections: 'MB CPU2(NVMe-C) \u2192 BP NVMe-C & NVMe-D (drives 1\u20134)',
        notes: 'Included when ordering NVMe drives with dual SAS HBAs (UCSC-SAS-240M6 x2)',
    },

    // ── C240 M7 Cables (per c240m7-sff-specsheet.pdf, Table 15) ──
    'CBL-NVME-C240M7': {
        pid: 'CBL-NVME-C240M7',
        sparePid: 'CBL-NVME-C240M7=',
        description: 'C240 M7 NVMe cable \u2014 MB P-2 to HBPLN (NVMe 1\u20132)',
        servers: ['C240-M7'],
        location: 'front',
        driveConnections: 'Motherboard P-2 \u2192 half-backplane (NVMe drives 1\u20132)',
        notes: 'Required with tri-mode RAID controllers (UCSC-RAID-HP, UCSC-RAID-MP1L32, UCSC-RAID-SD-D) or tri-mode HBA (UCSC-HBA-M1L16) with 2 CPUs. Covers NVMe qty 1\u20134.',
    },
    'CBL-FNVME-C240M7': {
        pid: 'CBL-FNVME-C240M7',
        sparePid: 'CBL-FNVME-C240M7=',
        description: 'C240 M7 NVMe cable \u2014 MB P-4 to BP (NVMe 3\u20134)',
        servers: ['C240-M7'],
        location: 'front',
        driveConnections: 'Motherboard P-4 \u2192 backplane (NVMe drives 3\u20134)',
        notes: 'Required when front NVMe qty is 3 or 4. Always paired with either CBL-NVME-C240M7 or CBL-SAS24-C240M7.',
    },
    'CBL-SAS24-C240M7': {
        pid: 'CBL-SAS24-C240M7',
        sparePid: 'CBL-SAS24-C240M7=',
        description: 'C240 M7 SAS/NVMe Y-cable \u2014 MB CPU1 P-1 to PB/PR2 & HDD 1\u20132',
        servers: ['C240-M7'],
        location: 'front',
        driveConnections: 'Motherboard CPU1 P-1 \u2192 passback/PCIe riser 2 + front HDD bays 1\u20132',
        notes: 'Required with SAS HBA (UCSC-SAS-T-D), no controller, or tri-mode HBA (UCSC-HBA-M1L16) with 1 CPU. This is the Y-cable that splits to both riser and drive bays.',
    },

    // ── C220 M6 Cable (per c220m6-sff-specsheet.pdf) ──
    'CBL-FNVME-220M6': {
        pid: 'CBL-FNVME-220M6',
        sparePid: 'CBL-FNVME-220M6=',
        description: 'C220 M6 Front NVMe Y-cable (backplane to motherboard)',
        servers: ['C220-M6'],
        location: 'front',
        driveConnections: 'Backplane connectors B1 & B2 → Motherboard NVMe B connector',
        notes: 'Y-cable with 2 backplane connectors and 1 motherboard connector. Required for all C220 M6 NVMe configurations.',
        subCables: [
            { partNumber: 'B1 connector', drives: [1, 2, 3, 4, 5], routing: 'Backplane B1 → MB NVMe B' },
            { partNumber: 'B2 connector', drives: [6, 7, 8, 9, 10], routing: 'Backplane B2 → MB NVMe B' },
        ],
    },

    // ── C220 M7 Cable (per C220 M7 Install Guide) ──
    'CBL-FNVME-C220M7': {
        pid: 'CBL-FNVME-C220M7',
        sparePid: 'CBL-FNVME-C220M7=',
        description: 'C220 M7 Front NVMe PCIe cable (backplane to motherboard)',
        servers: ['C220-M7'],
        location: 'front',
        driveConnections: 'Front-panel drive backplane → Motherboard (PCIe signal cable)',
        notes: 'Carries PCIe signal from front-panel drive backplane to motherboard. Required for all NVMe configurations.',
    },
};

// ── C240 M7 Cable Selection Matrix (per spec sheet Table 15) ──
// Maps controller PID → cable requirements by NVMe drive quantity
const M7_CABLE_MATRIX = {
    // Tri-mode RAID controllers
    'UCSC-RAID-HP':     { qty1_2: ['CBL-NVME-C240M7'], qty3_4: ['CBL-NVME-C240M7', 'CBL-FNVME-C240M7'] },
    'UCSC-RAID-MP1L32': { qty1_2: ['CBL-NVME-C240M7'], qty3_4: ['CBL-NVME-C240M7', 'CBL-FNVME-C240M7'] },
    'UCSC-RAID-SD-D':   { qty1_2: ['CBL-NVME-C240M7'], qty3_4: ['CBL-NVME-C240M7', 'CBL-FNVME-C240M7'] },
    // SAS HBA (pass-through) or No Controller
    'UCSC-SAS-T-D':     { qty1_2: ['CBL-SAS24-C240M7'], qty3_4: ['CBL-SAS24-C240M7', 'CBL-FNVME-C240M7'] },
    'none':             { qty1_2: ['CBL-SAS24-C240M7'], qty3_4: ['CBL-SAS24-C240M7', 'CBL-FNVME-C240M7'] },
    // Tri-mode HBA (depends on CPU count)
    'UCSC-HBA-M1L16-1cpu': { qty1_2: ['CBL-SAS24-C240M7'], qty3_4: null },  // N/A for 3-4 with 1 CPU
    'UCSC-HBA-M1L16-2cpu': { qty1_2: ['CBL-NVME-C240M7'], qty3_4: ['CBL-NVME-C240M7', 'CBL-FNVME-C240M7'] },
};

const NVME_DRIVES = {
    // ── C240 M6 / C245 M6 — Solidigm P5520 (U.2, Medium Endurance 1X DWPD) ──
    'UCS-NVB1T9O1VM6':  { pid: 'UCS-NVB1T9O1VM6',  capacity: '1.9 TB',  capacityBytes: 1.9e12,   formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance (1 DWPD)', model: 'Solidigm P5520', servers: ['C240-M6','C245-M6','C220-M6'], vendor: 'Solidigm' },
    'UCS-NVB3T8O1VM6':  { pid: 'UCS-NVB3T8O1VM6',  capacity: '3.8 TB',  capacityBytes: 3.8e12,   formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance (1 DWPD)', model: 'Solidigm P5520', servers: ['C240-M6','C245-M6','C220-M6'], vendor: 'Solidigm' },
    'UCS-NVB7T6O1VM6':  { pid: 'UCS-NVB7T6O1VM6',  capacity: '7.6 TB',  capacityBytes: 7.6e12,   formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance (1 DWPD)', model: 'Solidigm P5520', servers: ['C240-M6','C245-M6','C220-M6'], vendor: 'Solidigm' },
    'UCS-NVB15TO1VM6':  { pid: 'UCS-NVB15TO1VM6',  capacity: '15.3 TB', capacityBytes: 15.3e12,  formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance (1 DWPD)', model: 'Solidigm P5520', servers: ['C240-M6','C245-M6','C220-M6'], vendor: 'Solidigm' },
    // ── C240 M6 / C245 M6 — Solidigm P5620 (U.2, High Endurance 3X DWPD) ──
    'UCS-NVB1T6O1PM6':  { pid: 'UCS-NVB1T6O1PM6',  capacity: '1.6 TB',  capacityBytes: 1.6e12,   formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'High Endurance (3 DWPD)', model: 'Solidigm P5620', servers: ['C240-M6','C245-M6','C220-M6'], vendor: 'Solidigm' },
    'UCS-NVB3T2O1PM6':  { pid: 'UCS-NVB3T2O1PM6',  capacity: '3.2 TB',  capacityBytes: 3.2e12,   formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'High Endurance (3 DWPD)', model: 'Solidigm P5620', servers: ['C240-M6','C245-M6','C220-M6'], vendor: 'Solidigm' },
    'UCS-NVB6T4O1PM6':  { pid: 'UCS-NVB6T4O1PM6',  capacity: '6.4 TB',  capacityBytes: 6.4e12,   formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'High Endurance (3 DWPD)', model: 'Solidigm P5620', servers: ['C240-M6','C245-M6','C220-M6'], vendor: 'Solidigm' },
    // ── C240 M6 / C245 M6 — Solidigm P5316 (U.2, Low Endurance <0.5 DWPD) ──
    'UCS-NVB15T3O1LM6': { pid: 'UCS-NVB15T3O1LM6', capacity: '15.3 TB', capacityBytes: 15.3e12,  formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'Low Endurance (<0.5 DWPD)', model: 'Solidigm P5316', servers: ['C240-M6','C245-M6','C220-M6'], vendor: 'Solidigm' },
    // ── C240 M6 / C245 M6 — Micron P7450 (U.3, Medium Endurance) ──
    'UCS-NVMEG4-M960':  { pid: 'UCS-NVMEG4-M960',  capacity: '960 GB',  capacityBytes: 960e9,    formFactor: 'U.3', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance', model: 'Micron P7450', servers: ['C240-M6','C245-M6','C220-M6'], vendor: 'Micron' },
    'UCS-NVMEG4-M1920': { pid: 'UCS-NVMEG4-M1920', capacity: '1.9 TB',  capacityBytes: 1.9e12,   formFactor: 'U.3', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance', model: 'Micron P7450', servers: ['C240-M6','C245-M6','C220-M6'], vendor: 'Micron' },
    'UCS-NVMEG4-M3840': { pid: 'UCS-NVMEG4-M3840', capacity: '3.8 TB',  capacityBytes: 3.8e12,   formFactor: 'U.3', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance', model: 'Micron P7450', servers: ['C240-M6','C245-M6','C220-M6'], vendor: 'Micron' },
    'UCS-NVMEG4-M7680': { pid: 'UCS-NVMEG4-M7680', capacity: '7.6 TB',  capacityBytes: 7.6e12,   formFactor: 'U.3', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance', model: 'Micron P7450', servers: ['C240-M6','C245-M6','C220-M6'], vendor: 'Micron' },
    'UCS-NVMEG4-M1536': { pid: 'UCS-NVMEG4-M1536', capacity: '15.3 TB', capacityBytes: 15.3e12,  formFactor: 'U.3', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance', model: 'Micron P7450', servers: ['C240-M6','C245-M6','C220-M6'], vendor: 'Micron' },
    // ── C240 M6 / C245 M6 — Micron P7450 (U.3, High Endurance) ──
    'UCS-NVMEG4-M1600': { pid: 'UCS-NVMEG4-M1600', capacity: '1.6 TB',  capacityBytes: 1.6e12,   formFactor: 'U.3', interface: 'NVMe PCIe Gen4', endurance: 'High Endurance', model: 'Micron P7450', servers: ['C240-M6','C245-M6','C220-M6'], vendor: 'Micron' },
    'UCS-NVMEG4-M3200': { pid: 'UCS-NVMEG4-M3200', capacity: '3.2 TB',  capacityBytes: 3.2e12,   formFactor: 'U.3', interface: 'NVMe PCIe Gen4', endurance: 'High Endurance', model: 'Micron P7450', servers: ['C240-M6','C245-M6','C220-M6'], vendor: 'Micron' },
    'UCS-NVMEG4-M6400': { pid: 'UCS-NVMEG4-M6400', capacity: '6.4 TB',  capacityBytes: 6.4e12,   formFactor: 'U.3', interface: 'NVMe PCIe Gen4', endurance: 'High Endurance', model: 'Micron P7450', servers: ['C240-M6','C245-M6','C220-M6'], vendor: 'Micron' },
    // ── C240 M6 / C245 M6 — Intel Optane P5800X (U.2, Extreme Performance) ──
    'UCS-NVMEXP-I400':  { pid: 'UCS-NVMEXP-I400',  capacity: '400 GB',  capacityBytes: 400e9,    formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'Extreme Perf (30\u2013100 DWPD)', model: 'Intel Optane P5800X', servers: ['C240-M6','C245-M6','C220-M6'], vendor: 'Intel' },
    'UCS-NVMEXP-I800':  { pid: 'UCS-NVMEXP-I800',  capacity: '800 GB',  capacityBytes: 800e9,    formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'Extreme Perf (30\u2013100 DWPD)', model: 'Intel Optane P5800X', servers: ['C240-M6','C245-M6','C220-M6'], vendor: 'Intel' },

    // ── C240 M7 — Solidigm P5520 (U.2, Medium Endurance 1X DWPD) ──
    'UCS-NVB1T9O1V':    { pid: 'UCS-NVB1T9O1V',    capacity: '1.9 TB',  capacityBytes: 1.9e12,   formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance (1 DWPD)', model: 'Solidigm P5520', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Solidigm' },
    'UCS-NVB3T8O1V':    { pid: 'UCS-NVB3T8O1V',    capacity: '3.8 TB',  capacityBytes: 3.8e12,   formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance (1 DWPD)', model: 'Solidigm P5520', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Solidigm' },
    'UCS-NVB7T6O1V':    { pid: 'UCS-NVB7T6O1V',    capacity: '7.6 TB',  capacityBytes: 7.6e12,   formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance (1 DWPD)', model: 'Solidigm P5520', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Solidigm' },
    'UCS-NVB15TO1V':    { pid: 'UCS-NVB15TO1V',    capacity: '15.3 TB', capacityBytes: 15.3e12,  formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance (1 DWPD)', model: 'Solidigm P5520', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Solidigm' },
    // ── C240 M7 — Solidigm P5620 (U.2, High Endurance 3X DWPD) ──
    'UCS-NVB1T6O1P':    { pid: 'UCS-NVB1T6O1P',    capacity: '1.6 TB',  capacityBytes: 1.6e12,   formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'High Endurance (3 DWPD)', model: 'Solidigm P5620', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Solidigm' },
    'UCS-NVB3T2O1P':    { pid: 'UCS-NVB3T2O1P',    capacity: '3.2 TB',  capacityBytes: 3.2e12,   formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'High Endurance (3 DWPD)', model: 'Solidigm P5620', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Solidigm' },
    'UCS-NVB6T4O1P':    { pid: 'UCS-NVB6T4O1P',    capacity: '6.4 TB',  capacityBytes: 6.4e12,   formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'High Endurance (3 DWPD)', model: 'Solidigm P5620', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Solidigm' },
    'UCS-NVB12T8O1P':   { pid: 'UCS-NVB12T8O1P',   capacity: '12.8 TB', capacityBytes: 12.8e12,  formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'High Endurance (3 DWPD)', model: 'Solidigm P5620', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Solidigm' },
    // ── C240 M7 — Solidigm P5316 (U.2, Low Endurance <0.5 DWPD) ──
    'UCS-NVB15T3O1L':   { pid: 'UCS-NVB15T3O1L',   capacity: '15.3 TB', capacityBytes: 15.3e12,  formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'Low Endurance (<0.5 DWPD)', model: 'Solidigm P5316', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Solidigm' },
    // ── C240 M7 — Micron P7450 (U.3, Medium Endurance) ──
    'UCS-NVMEG4-M960-D':  { pid: 'UCS-NVMEG4-M960-D',  capacity: '960 GB',  capacityBytes: 960e9,   formFactor: 'U.3', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance', model: 'Micron P7450', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Micron' },
    'UCS-NVMEG4-M1920D':  { pid: 'UCS-NVMEG4-M1920D',  capacity: '1.9 TB',  capacityBytes: 1.9e12,  formFactor: 'U.3', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance', model: 'Micron P7450', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Micron' },
    'UCS-NVMEG4-M3840D':  { pid: 'UCS-NVMEG4-M3840D',  capacity: '3.8 TB',  capacityBytes: 3.8e12,  formFactor: 'U.3', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance', model: 'Micron P7450', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Micron' },
    'UCS-NVMEG4-M7680D':  { pid: 'UCS-NVMEG4-M7680D',  capacity: '7.6 TB',  capacityBytes: 7.6e12,  formFactor: 'U.3', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance', model: 'Micron P7450', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Micron' },
    'UCS-NVMEG4-M1536D':  { pid: 'UCS-NVMEG4-M1536D',  capacity: '15.3 TB', capacityBytes: 15.3e12, formFactor: 'U.3', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance', model: 'Micron P7450', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Micron' },
    // ── C240 M7 — Micron P7450 (U.3, High Endurance) ──
    'UCS-NVMEG4-M1600D':  { pid: 'UCS-NVMEG4-M1600D',  capacity: '1.6 TB',  capacityBytes: 1.6e12,  formFactor: 'U.3', interface: 'NVMe PCIe Gen4', endurance: 'High Endurance', model: 'Micron P7450', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Micron' },
    'UCS-NVMEG4-M3200D':  { pid: 'UCS-NVMEG4-M3200D',  capacity: '3.2 TB',  capacityBytes: 3.2e12,  formFactor: 'U.3', interface: 'NVMe PCIe Gen4', endurance: 'High Endurance', model: 'Micron P7450', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Micron' },
    'UCS-NVMEG4-M6400D':  { pid: 'UCS-NVMEG4-M6400D',  capacity: '6.4 TB',  capacityBytes: 6.4e12,  formFactor: 'U.3', interface: 'NVMe PCIe Gen4', endurance: 'High Endurance', model: 'Micron P7450', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Micron' },
    // ── C240 M7 — Micron 7500 (U.3, Medium Endurance 1X DWPD) ──
    'UCS-NVB960M2V':    { pid: 'UCS-NVB960M2V',    capacity: '960 GB',  capacityBytes: 960e9,    formFactor: 'U.3', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance (1 DWPD)', model: 'Micron 7500', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Micron' },
    'UCS-NVB1T9M2V':    { pid: 'UCS-NVB1T9M2V',    capacity: '1.9 TB',  capacityBytes: 1.9e12,   formFactor: 'U.3', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance (1 DWPD)', model: 'Micron 7500', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Micron' },
    'UCS-NVB3T8M2V':    { pid: 'UCS-NVB3T8M2V',    capacity: '3.8 TB',  capacityBytes: 3.8e12,   formFactor: 'U.3', interface: 'NVMe PCIe Gen4', endurance: 'Med Endurance (1 DWPD)', model: 'Micron 7500', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Micron' },
    // ── C240 M7 — Micron 7500 (U.3, High Endurance 3X DWPD) ──
    'UCS-NVB3T2M2P':    { pid: 'UCS-NVB3T2M2P',    capacity: '3.2 TB',  capacityBytes: 3.2e12,   formFactor: 'U.3', interface: 'NVMe PCIe Gen4', endurance: 'High Endurance (3 DWPD)', model: 'Micron 7500', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Micron' },
    // ── C240 M7 — Intel Optane P5800X (U.2, Extreme Performance) ──
    'UCS-NVMEXP-I400-D': { pid: 'UCS-NVMEXP-I400-D', capacity: '400 GB',  capacityBytes: 400e9,   formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'Extreme Perf (30\u2013100 DWPD)', model: 'Intel Optane P5800X', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Intel' },
    'UCS-NVMEXP-I800-D': { pid: 'UCS-NVMEXP-I800-D', capacity: '800 GB',  capacityBytes: 800e9,   formFactor: 'U.2', interface: 'NVMe PCIe Gen4', endurance: 'Extreme Perf (30\u2013100 DWPD)', model: 'Intel Optane P5800X', servers: ['C240-M7','C220-M7','X210c-M7','X410c-M7'], vendor: 'Intel' },
};

const DOCUMENTATION = {
    'C240-M6': {
        installGuide: 'https://www.cisco.com/c/en/us/td/docs/unified_computing/ucs/c/hw/c240m6/install/b-c240-m6-install-guide/m-maintaining-the-server.html',
        specSheet: 'https://www.cisco.com/c/dam/en/us/products/collateral/servers-unified-computing/ucs-c-series-rack-servers/c240m6-sff-specsheet.pdf',
        hcl: 'https://ucshcltool.cloudapps.cisco.com/public/',
    },
    'C245-M6': {
        installGuide: 'https://www.cisco.com/c/en/us/td/docs/unified_computing/ucs/c/hw/C245m6/install/c245m6/m_maintaining-the-server.html',
        specSheet: 'https://www.cisco.com/c/dam/en/us/products/collateral/servers-unified-computing/ucs-c-series-rack-servers/c245m6-sff-specsheet.pdf',
        hcl: 'https://ucshcltool.cloudapps.cisco.com/public/',
    },
    'C240-M7': {
        installGuide: 'https://www.cisco.com/c/en/us/td/docs/unified_computing/ucs/c/hw/C240M7/install/b-cisco-c240-m7-install/m-maintaining.html',
        specSheet: 'https://www.cisco.com/c/dam/en/us/products/collateral/servers-unified-computing/ucs-c-series-rack-servers/c240m7-sff-specsheet.pdf',
        hcl: 'https://ucshcltool.cloudapps.cisco.com/public/',
    },
    'C220-M6': {
        installGuide: 'https://www.cisco.com/c/en/us/td/docs/unified_computing/ucs/c/hw/c220m6/install/c220m6/m_maintaining_the_server.html',
        specSheet: 'https://www.cisco.com/c/dam/en/us/products/collateral/servers-unified-computing/ucs-c-series-rack-servers/c220m6-sff-specsheet.pdf',
        hcl: 'https://ucshcltool.cloudapps.cisco.com/public/',
    },
    'C220-M7': {
        installGuide: 'https://www.cisco.com/c/en/us/td/docs/unified_computing/ucs/c/hw/C220M7/install/b-c220-m7-installation-guide/m-servicing.html',
        specSheet: 'https://www.cisco.com/c/dam/en/us/products/collateral/servers-unified-computing/ucs-c-series-rack-servers/c220m7-sff-specsheet.pdf',
        hcl: 'https://ucshcltool.cloudapps.cisco.com/public/',
    },
    'X210c-M7': {
        installGuide: 'https://www.cisco.com/c/en/us/td/docs/unified_computing/ucs/x/hw/x210c-m7/install/b-cisco-ucs-x210c-m7-install-guide/m-servicing-the-compute-node.html',
        specSheet: 'https://www.cisco.com/c/dam/en/us/products/collateral/servers-unified-computing/ucs-x-series-modular-system/x210cm7-specsheet.pdf',
        hcl: 'https://ucshcltool.cloudapps.cisco.com/public/',
    },
    'X410c-M7': {
        installGuide: 'https://www.cisco.com/c/en/us/td/docs/unified_computing/ucs/x/hw/x410c-m7/install/b-cisco-ucs-x410c-m7-install-guide/m-overview.html',
        specSheet: 'https://www.cisco.com/c/dam/en/us/products/collateral/servers-unified-computing/ucs-x-series-modular-system/x410cm7-specsheet.pdf',
        hcl: 'https://ucshcltool.cloudapps.cisco.com/public/',
    },
};

// ─── Firmware / Driver Compatibility Notes ───────────────────────────────────

const FIRMWARE_COMPAT = {
    'C240-M6': {
        management: 'Cisco IMC / UCS Manager',
        notes: [
            'NVMe hot-plug enabled via BIOS > PCI Configuration',
            'Intel Optane P5800X end-of-life — check HCL for replacement options',
            'U.3 drives (Micron P7450) require tri-mode RAID controller for RAID support',
        ],
    },
    'C245-M6': {
        management: 'Cisco IMC / UCS Manager',
        notes: [
            'AMD EPYC platform — verify HCL for OS driver support',
            'NVMe cable selection depends on storage controller installed',
            'U.3 drives (Micron P7450) require tri-mode RAID controller for RAID support',
        ],
    },
    'C240-M7': {
        management: 'Cisco IMC / UCS Manager',
        notes: [
            'Tri-mode RAID controllers support SAS/SATA/NVMe on the same controller',
            '5th Gen Xeon support requires updated firmware — check release notes',
            'Cable selection varies by controller type — see cable matrix above',
        ],
    },
    'C220-M6': {
        management: 'Cisco IMC / UCS Manager',
        notes: [
            'NVMe switch card (M6N) firmware updated via Host Upgrade Utility (HUU)',
            'All NVMe drives connect to CPU2 — ensure CPU2 is populated',
            '1RU form factor — no rear NVMe bay support',
        ],
    },
    'C220-M7': {
        management: 'Cisco IMC / UCS Manager',
        notes: [
            '5th Gen Xeon Scalable support requires updated firmware',
            'Single-CPU NVMe support depends on riser configuration (3 HHHL vs 2 FHFL)',
            '1RU form factor — no rear NVMe bay support',
        ],
    },
    'X210c-M7': {
        management: 'Cisco Intersight (IMM only)',
        notes: [
            'No standalone CIMC management — Intersight Managed Mode required',
            'Drives managed via front mezzanine module RAID/passthrough controller',
            'Firmware updates delivered through Intersight HCL-validated bundles',
            'GPU mezzanine module option reduces available NVMe bays to 2',
        ],
    },
    'X410c-M7': {
        management: 'Cisco Intersight (IMM only)',
        notes: [
            'No standalone CIMC management — Intersight Managed Mode required',
            '4-socket node occupies 2 node slots in X9508 chassis',
            'Firmware updates delivered through Intersight HCL-validated bundles',
            'Drives managed via front mezzanine module RAID/passthrough controller',
        ],
    },
};

// ─── State ───────────────────────────────────────────────────────────────────

const state = {
    step: 0,           // 0=server, 1=pid, 2=configure
    serverKey: null,
    pid: null,
    selectedController: null,  // controller id (e.g. 'mraid', 'dual-hba', 'hba', 'none')
    selectedBays: [],
    selectedDrive: null,
    expandedVendor: null,
    driveFilterFF: null,       // form factor filter: 'U.2', 'U.3', or null (all)
    driveFilterEnd: null,      // endurance filter: 'low', 'med', 'high', 'extreme', or null (all)
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCompatibleDrives(serverKey) {
    return Object.values(NVME_DRIVES).filter(d => d.servers.includes(serverKey));
}

function getEnduranceTier(endurance) {
    const e = endurance.toLowerCase();
    if (e.includes('extreme')) return 'extreme';
    if (e.includes('high')) return 'high';
    if (e.includes('low')) return 'low';
    return 'med';
}

function getFilteredDrives(serverKey) {
    return getCompatibleDrives(serverKey).filter(d => {
        if (state.driveFilterFF && d.formFactor !== state.driveFilterFF) return false;
        if (state.driveFilterEnd && getEnduranceTier(d.endurance) !== state.driveFilterEnd) return false;
        return true;
    });
}

function getCpuForBay(serverKey, bay) {
    if (bay >= 100) {
        // Rear: riser 1B → CPU1, riser 3B → CPU2
        return bay <= 102 ? 'CPU1' : 'CPU2';
    }
    // C220 M6: All NVMe drives connect to CPU2
    if (serverKey === 'C220-M6') return 'CPU2';
    // X-Series: drives route through mezzanine controller (CPU affinity depends on controller config)
    if (serverKey === 'X210c-M7' || serverKey === 'X410c-M7') return 'Mezz';
    // C-Series default: bays 1-2 → CPU1, bays 3+ → CPU2
    return bay <= 2 ? 'CPU1' : 'CPU2';
}

function cablesDependOnController(serverKey) {
    return serverKey === 'C245-M6' || serverKey === 'C240-M7';
}

function getRequiredCables(serverKey, location) {
    const server = SERVER_MODELS[serverKey];
    const frontNvmeCount = state.selectedBays.filter(b => b < 100).length;

    return Object.values(CABLES).filter(c => {
        if (!c.servers.includes(serverKey)) return false;
        if (c.location !== location) return false;

        // ── C240 M7: Use spec-sheet cable matrix (Table 15) ──
        if (serverKey === 'C240-M7' && location === 'front') {
            if (frontNvmeCount === 0) return false;
            if (!state.selectedController) return false;

            const ctrlOpt = server.controllerOptions?.find(o => o.id === state.selectedController);
            let matrixKey;
            if (!ctrlOpt || !ctrlOpt.pid) {
                matrixKey = 'none';
            } else if (ctrlOpt.pid === 'UCSC-HBA-M1L16') {
                // NVMe requires 2 CPUs per spec sheet, so always use 2cpu variant
                matrixKey = 'UCSC-HBA-M1L16-2cpu';
            } else {
                matrixKey = ctrlOpt.pid;
            }

            const entry = M7_CABLE_MATRIX[matrixKey];
            if (!entry) return false;

            const requiredCables = frontNvmeCount <= 2 ? entry.qty1_2 : entry.qty3_4;
            if (!requiredCables) return false; // N/A case (e.g. HBA 1-CPU + qty 3-4)
            return requiredCables.includes(c.pid);
        }

        // ── C245 M6: Controller-dependent cable selection ──
        if (serverKey === 'C245-M6' && location === 'front') {
            if (frontNvmeCount === 0) return false;
            if (!state.selectedController) return false;

            if (state.selectedController === 'dual-hba') {
                return c.pid === 'CBL-FNVME-C245M6';
            }
            // RAID or no controller → CBL-SDFNVME-245M6
            return c.pid === 'CBL-SDFNVME-245M6';
        }

        // ── C240 M6: CBL-FNVME-240M6 always applies (no controller dependency) ──
        if (serverKey === 'C240-M6' && location === 'front') {
            if (frontNvmeCount === 0) return false;
            // Cable restricted to specific PIDs (e.g. LFF-only cable)
            if (c.pids && !c.pids.includes(state.pid)) return false;
            return true;
        }

        // Default: show front cables only when NVMe bays are selected
        if (location === 'front' && frontNvmeCount === 0) return false;
        return true;
    });
}

function getServerConfig() {
    if (!state.serverKey || !state.pid) return null;
    const server = SERVER_MODELS[state.serverKey];
    const config = server.pids[state.pid];
    return { server, config };
}

function validateSlot(bay) {
    const info = getServerConfig();
    if (!info) return { valid: false, reason: 'Unknown configuration' };
    const isFront = bay < 100;
    const allowed = isFront ? info.config.nvmeFrontBays : info.config.nvmeRearBays;
    if (!allowed.includes(bay)) return { valid: false, reason: `Slot ${bay} does not support NVMe on ${state.pid}` };
    return { valid: true };
}

function hasRearDrives() {
    return state.selectedBays.some(b => b >= 100);
}

function generateBOMItems() {
    const items = [];
    const info = getServerConfig();
    if (!info || !state.selectedDrive || state.selectedBays.length === 0) return items;

    // Drive
    const drive = NVME_DRIVES[state.selectedDrive];
    if (drive) {
        items.push({ pid: drive.pid, description: `${drive.capacity} ${drive.formFactor} NVMe SSD (${drive.model})`, qty: state.selectedBays.length });
    }

    // Front cables
    getRequiredCables(state.serverKey, 'front').forEach(c => {
        items.push({ pid: c.pid, description: c.description, qty: 1 });
    });

    // Rear cables
    if (hasRearDrives()) {
        getRequiredCables(state.serverKey, 'rear').forEach(c => {
            items.push({ pid: c.pid, description: c.description, qty: 1 });
        });
    }

    // Adapter
    if (info.config.requiresAdapter) {
        items.push({ pid: info.config.requiresAdapter, description: 'LFF to SFF NVMe Sled Adapter', qty: state.selectedBays.length });
    }

    return items;
}

// ─── Notification ────────────────────────────────────────────────────────────

let notifyTimer = null;

function showNotification(message, type = 'info') {
    clearTimeout(notifyTimer);
    const el = document.getElementById('notification');
    if (!el) return;
    const colors = {
        success: 'bg-green-900/50 border-green-700 text-green-300',
        error: 'bg-red-900/50 border-red-700 text-red-300',
        info: 'bg-blue-900/50 border-blue-700 text-blue-300',
    };
    const icons = { success: 'check-circle', error: 'alert-triangle', info: 'info' };
    el.className = `notification p-3 rounded-lg flex items-center gap-2 text-sm border mb-6 ${colors[type] || colors.info}`;
    el.innerHTML = `<i data-lucide="${icons[type] || 'info'}" class="w-4 h-4"></i> ${message}`;
    el.style.display = 'flex';
    lucide.createIcons({ attrs: { class: 'w-4 h-4' } });
    notifyTimer = setTimeout(() => { el.style.display = 'none'; }, 3500);
}

// ─── Render ──────────────────────────────────────────────────────────────────

function render() {
    const app = document.getElementById('app');
    const headerActions = document.getElementById('headerActions');

    // Header actions
    const docs = state.serverKey ? DOCUMENTATION[state.serverKey] : null;
    let actionsHtml = '';
    if (docs) {
        actionsHtml += `<a href="${docs.hcl}" target="_blank" rel="noopener" class="flex items-center gap-1 px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-gray-300"><i data-lucide="external-link" class="w-3 h-3"></i> Cisco HCL</a>`;
        actionsHtml += `<a href="${docs.installGuide}" target="_blank" rel="noopener" class="flex items-center gap-1 px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-gray-300"><i data-lucide="external-link" class="w-3 h-3"></i> Install Guide</a>`;
    }
    if (state.step === 2) {
        actionsHtml += `<button onclick="shareConfig()" class="flex items-center gap-1 px-3 py-2 text-xs bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-800/50 rounded-lg transition-colors text-cyan-400"><i data-lucide="link" class="w-3 h-3"></i> Share</button>`;
    }
    if (state.step > 0) {
        actionsHtml += `<button onclick="resetTool()" class="flex items-center gap-1 px-3 py-2 text-xs bg-red-900/30 hover:bg-red-900/50 border border-red-800/50 rounded-lg transition-colors text-red-400"><i data-lucide="x" class="w-3 h-3"></i> Reset</button>`;
    }
    headerActions.innerHTML = actionsHtml;

    // Main content
    let html = '<div id="notification" style="display:none"></div>';
    html += renderStepIndicator();

    if (state.step === 0) html += renderServerSelection();
    else if (state.step === 1) html += renderPidSelection();
    else if (state.step === 2) html += renderConfigure();

    app.innerHTML = html;
    lucide.createIcons();
    updateHash();
}

function renderStepIndicator() {
    const steps = ['Server', 'PID', 'Configure'];
    return `<div class="flex items-center gap-2 mb-8">${steps.map((s, i) => {
        const cls = i === state.step ? 'step-active' : i < state.step ? 'step-done' : 'step-pending';
        const num = i < state.step ? '&#10003;' : i + 1;
        const chevron = i < steps.length - 1 ? `<i data-lucide="chevron-right" class="w-4 h-4 ${i < state.step ? 'text-green-500' : 'text-slate-600'}"></i>` : '';
        return `<div class="flex items-center gap-2"><span class="${cls} px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2"><span class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">${num}</span>${s}</span>${chevron}</div>`;
    }).join('')}</div>`;
}

// ─── Step 0: Server Selection ────────────────────────────────────────────────

function renderServerSelection() {
    let html = `<div class="animate-fade-in space-y-6">
        <div><h2 class="text-xl font-bold mb-2">Select Server Model</h2>
        <p class="text-gray-400 text-sm">Choose the Cisco UCS server you want to add NVMe drives to.</p></div>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">`;

    Object.entries(SERVER_MODELS).forEach(([key, server]) => {
        const pidCount = Object.keys(server.pids).length;
        const isXSeries = key.startsWith('X');
        const iconName = isXSeries ? 'layout-grid' : 'server';
        const accentColor = isXSeries ? 'purple' : 'cyan';
        html += `<button onclick="selectServer('${key}')" class="card card-hover rounded-xl p-6 text-left group">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-${accentColor}-500/20 flex items-center justify-center group-hover:bg-${accentColor}-500/30 transition-colors">
                    <i data-lucide="${iconName}" class="w-5 h-5 text-${accentColor}-400"></i>
                </div>
                <div>
                    <h3 class="font-bold text-white">${server.name}</h3>
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-mono text-${accentColor}-400">${server.generation}</span>
                        <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-gray-400">${server.formFactors[0]}</span>
                    </div>
                </div>
            </div>
            <p class="text-sm text-gray-400 mb-3">${server.processor}</p>
            <div class="text-xs text-gray-500">${pidCount} configuration${pidCount > 1 ? 's' : ''} available</div>
            <i data-lucide="chevron-right" class="w-4 h-4 text-${accentColor}-500 mt-3 opacity-0 group-hover:opacity-100 transition-opacity"></i>
        </button>`;
    });

    html += '</div></div>';
    return html;
}

// ─── Step 1: PID Selection ───────────────────────────────────────────────────

function renderPidSelection() {
    const server = SERVER_MODELS[state.serverKey];
    let html = `<div class="animate-fade-in space-y-6">
        <div class="flex items-center gap-3">
            <button onclick="goBack(0)" class="text-gray-400 hover:text-white transition-colors text-sm">&larr; Back</button>
            <div><h2 class="text-xl font-bold">${server.name} &mdash; Select PID</h2>
            <p class="text-gray-400 text-sm">Choose your server's product ID to determine NVMe bay support.</p></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">`;

    Object.entries(server.pids).forEach(([pid, config]) => {
        html += `<button onclick="selectPid('${pid}')" class="card card-hover rounded-xl p-5 text-left group">
            <div class="flex items-center justify-between mb-2">
                <span class="font-mono text-cyan-400 text-sm font-bold">${pid}</span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-slate-600 text-gray-300">${config.driveType}</span>
            </div>
            <h3 class="font-semibold text-white mb-2">${config.label}</h3>
            <p class="text-sm text-gray-400 mb-3">${config.description}</p>
            <div class="flex items-center gap-4 text-xs text-gray-500">
                <span class="flex items-center gap-1"><i data-lucide="hard-drive" class="w-3 h-3"></i> ${config.nvmeFrontBays.length} front NVMe</span>
                ${config.nvmeRearBays.length > 0 ? `<span class="flex items-center gap-1"><i data-lucide="circuit-board" class="w-3 h-3"></i> ${config.nvmeRearBays.length} rear NVMe</span>` : ''}
            </div>
        </button>`;
    });

    html += '</div></div>';
    return html;
}

// ─── Step 2: Configure ──────────────────────────────────────────────────────

function renderConfigure() {
    const { server, config } = getServerConfig();
    const bomItems = generateBOMItems();

    let html = `<div class="animate-fade-in space-y-6">`;

    // Breadcrumb
    html += `<div class="flex items-center gap-2 text-sm">
        <button onclick="resetTool()" class="text-gray-400 hover:text-white transition-colors">Servers</button>
        <i data-lucide="chevron-right" class="w-3 h-3 text-gray-600"></i>
        <button onclick="goBack(1)" class="text-gray-400 hover:text-white transition-colors">${server.name}</button>
        <i data-lucide="chevron-right" class="w-3 h-3 text-gray-600"></i>
        <span class="font-mono text-cyan-400">${state.pid}</span>
    </div>`;

    // Config summary banner
    html += `<div class="card rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
            <i data-lucide="server" class="w-5 h-5 text-cyan-400"></i>
            <div>
                <span class="font-bold text-white">${server.name}</span>
                <span class="mx-2 text-gray-600">|</span>
                <span class="font-mono text-cyan-400 text-sm">${state.pid}</span>
                <span class="mx-2 text-gray-600">|</span>
                <span class="text-gray-400 text-sm">${config.label}</span>
            </div>
        </div>
        <div class="flex items-center gap-3 text-sm">
            <span class="flex items-center gap-1 text-cyan-400">
                <i data-lucide="hard-drive" class="w-4 h-4"></i>
                ${state.selectedBays.length} bay${state.selectedBays.length !== 1 ? 's' : ''} selected
            </span>
            ${state.selectedController ? (() => {
                const ctrlOpt = server.controllerOptions?.find(o => o.id === state.selectedController);
                return ctrlOpt ? `<span class="flex items-center gap-1 text-purple-400"><i data-lucide="cpu" class="w-4 h-4"></i> ${ctrlOpt.label}</span>` : '';
            })() : ''}
            ${state.selectedDrive ? `<span class="flex items-center gap-1 text-green-400"><i data-lucide="check-circle" class="w-4 h-4"></i> ${NVME_DRIVES[state.selectedDrive].capacity} ${NVME_DRIVES[state.selectedDrive].model}</span>` : ''}
        </div>
    </div>`;

    // Controller selection (if applicable)
    html += renderControllerPicker();

    // 2-column layout
    html += '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">';

    // LEFT COLUMN (2/3)
    html += '<div class="lg:col-span-2 space-y-6">';
    html += renderBayMap(config);
    html += renderDriveSelector();
    html += renderCableSummary();
    html += '</div>';

    // RIGHT COLUMN (1/3)
    html += '<div class="space-y-6">';
    html += renderRequirements();
    if (bomItems.length > 0) html += renderBOM(bomItems);
    if (state.selectedBays.length > 0 && state.selectedDrive) html += renderValidation();
    html += '</div>';

    html += '</div></div>';
    return html;
}

// ─── Controller Picker ───────────────────────────────────────────────────────

function renderControllerPicker() {
    const server = SERVER_MODELS[state.serverKey];
    if (!server || !server.controllerOptions || server.controllerOptions.length === 0) return '';

    const controllerAffectsCables = cablesDependOnController(state.serverKey);

    let html = `<div class="card rounded-xl p-5 space-y-4">
        <h4 class="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <i data-lucide="cpu" class="w-4 h-4 text-purple-400"></i> Storage Controller
            ${controllerAffectsCables ? '<span class="text-xs font-normal text-amber-400 ml-2">* Determines which NVMe cable is required</span>' : ''}
        </h4>
        <p class="text-xs text-gray-500">What storage controller is installed in this server?</p>
        <div class="grid grid-cols-1 md:grid-cols-${Math.min(server.controllerOptions.length, 3)} gap-3">`;

    server.controllerOptions.forEach(opt => {
        const isSelected = state.selectedController === opt.id;
        html += `<button onclick="selectController('${opt.id}')"
            class="p-4 rounded-lg border text-left transition-all ${
                isSelected
                    ? 'bg-purple-500/15 border-purple-500 shadow-lg shadow-purple-500/10'
                    : 'bg-slate-800/50 border-slate-600 hover:border-purple-500/50'
            }">
            <div class="flex items-center justify-between mb-1">
                <span class="font-semibold text-sm ${isSelected ? 'text-purple-300' : 'text-white'}">${opt.label}</span>
                ${isSelected ? '<i data-lucide="check-circle" class="w-4 h-4 text-purple-400"></i>' : ''}
            </div>
            ${opt.pid ? `<span class="font-mono text-xs ${isSelected ? 'text-purple-400' : 'text-cyan-400'}">${opt.pid}</span>` : ''}
            <p class="text-xs text-gray-500 mt-1">${opt.description}</p>
        </button>`;
    });

    html += '</div>';

    if (!state.selectedController && controllerAffectsCables) {
        html += `<div class="flex items-center gap-2 text-xs text-amber-400/80 mt-2">
            <i data-lucide="alert-triangle" class="w-3 h-3"></i>
            Select a controller to see the correct cable recommendation
        </div>`;
    }

    html += '</div>';
    return html;
}

// ─── Bay Map ─────────────────────────────────────────────────────────────────

function renderBayMap(config) {
    const frontBays = Array.from({ length: config.totalBays }, (_, i) => i + 1);
    const rearBays = config.nvmeRearBays || [];

    let html = `<div class="card rounded-xl p-5 space-y-6">
        <h4 class="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <i data-lucide="hard-drive" class="w-4 h-4 text-cyan-400"></i> Front Drive Bays
        </h4>
        <div class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">`;

    frontBays.forEach(bay => {
        const isNvme = config.nvmeFrontBays.includes(bay);
        const isSelected = state.selectedBays.includes(bay);
        let cls = 'bay-disabled';
        if (isSelected) cls = 'bay-selected';
        else if (isNvme) cls = 'bay-available';
        const cpu = isNvme ? getCpuForBay(state.serverKey, bay) : null;

        html += `<button onclick="${isNvme ? `toggleBay(${bay})` : ''}" ${!isNvme ? 'disabled' : ''}
            class="bay-btn relative h-12 rounded-lg border text-xs font-mono flex flex-col items-center justify-center ${cls}"
            title="${isNvme ? `Bay ${bay} \u2014 NVMe supported (${cpu})` : `Bay ${bay} \u2014 SAS/SATA only`}">
            <span class="font-bold">${bay}</span>
            ${isNvme ? `<span class="text-[9px] opacity-60">${cpu}</span>` : ''}
            ${isSelected ? '<div class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-500"></div>' : ''}
        </button>`;
    });

    html += `</div>
        <div class="flex items-center gap-4 text-xs text-gray-500">
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bay-selected inline-block border"></span> NVMe selected</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bay-available inline-block border"></span> NVMe available</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bay-disabled inline-block border"></span> SAS/SATA only</span>
        </div>`;

    if (rearBays.length > 0) {
        html += `<h4 class="text-sm font-semibold text-gray-300 flex items-center gap-2 pt-4 border-t border-slate-600/50">
            <i data-lucide="circuit-board" class="w-4 h-4 text-purple-400"></i> Rear Drive Bays
        </h4>
        <div class="flex gap-2">`;
        rearBays.forEach(bay => {
            const isSelected = state.selectedBays.includes(bay);
            html += `<button onclick="toggleBay(${bay})"
                class="bay-btn h-12 w-16 rounded-lg border text-xs font-mono flex flex-col items-center justify-center ${isSelected ? 'bay-rear-selected' : 'bay-available'}">
                <span class="font-bold">${bay}</span>
                <span class="text-[9px] opacity-60">Rear</span>
            </button>`;
        });
        html += '</div>';
    }

    html += '</div>';
    return html;
}

// ─── Drive Selector ──────────────────────────────────────────────────────────

function renderDriveSelector() {
    const allDrives = getCompatibleDrives(state.serverKey);
    const filteredDrives = getFilteredDrives(state.serverKey);

    // Compute available filter options from all compatible drives
    const formFactors = [...new Set(allDrives.map(d => d.formFactor))].sort();
    const enduranceTiers = [...new Set(allDrives.map(d => getEnduranceTier(d.endurance)))];
    const tierOrder = ['low', 'med', 'high', 'extreme'];
    enduranceTiers.sort((a, b) => tierOrder.indexOf(a) - tierOrder.indexOf(b));
    const tierLabels = { low: 'Low', med: 'Medium', high: 'High', extreme: 'Extreme' };
    const tierColors = { low: 'text-gray-400 bg-gray-700/50', med: 'text-blue-400 bg-blue-900/30', high: 'text-amber-400 bg-amber-900/30', extreme: 'text-red-400 bg-red-900/30' };

    // Group filtered drives by model (e.g. "Solidigm P5520")
    const grouped = {};
    filteredDrives.forEach(d => {
        const key = d.model;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(d);
    });
    // Sort each group by capacity
    Object.values(grouped).forEach(arr => arr.sort((a, b) => a.capacityBytes - b.capacityBytes));

    let html = `<div class="card rounded-xl p-5 space-y-3">
        <div class="flex items-center justify-between">
            <h4 class="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <i data-lucide="hard-drive" class="w-4 h-4 text-cyan-400"></i> Compatible NVMe Drives
            </h4>
            <span class="text-xs text-gray-500">${filteredDrives.length} of ${allDrives.length} drives</span>
        </div>
        <div class="text-xs text-amber-400/80 flex items-center gap-1 mb-2">
            <i data-lucide="alert-triangle" class="w-3 h-3"></i>
            Always verify latest compatibility on <a href="https://ucshcltool.cloudapps.cisco.com/public/" target="_blank" rel="noopener" class="underline hover:text-amber-300 ml-1">Cisco HCL Tool</a>
        </div>`;

    // Filter bar
    html += '<div class="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-600/30">';
    html += '<span class="text-xs text-gray-500 mr-1">Form:</span>';
    html += `<button onclick="setDriveFilterFF(null)" class="px-2 py-0.5 text-xs rounded ${!state.driveFilterFF ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-gray-400 hover:bg-slate-600'}">All</button>`;
    formFactors.forEach(ff => {
        html += `<button onclick="setDriveFilterFF('${ff}')" class="px-2 py-0.5 text-xs rounded ${state.driveFilterFF === ff ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-gray-400 hover:bg-slate-600'}">${ff}</button>`;
    });
    html += '<span class="text-xs text-gray-500 ml-3 mr-1">Endurance:</span>';
    html += `<button onclick="setDriveFilterEnd(null)" class="px-2 py-0.5 text-xs rounded ${!state.driveFilterEnd ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-gray-400 hover:bg-slate-600'}">All</button>`;
    enduranceTiers.forEach(tier => {
        html += `<button onclick="setDriveFilterEnd('${tier}')" class="px-2 py-0.5 text-xs rounded ${state.driveFilterEnd === tier ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-gray-400 hover:bg-slate-600'}">${tierLabels[tier]}</button>`;
    });
    html += '</div>';

    if (Object.keys(grouped).length === 0) {
        html += '<div class="text-center text-gray-500 text-sm py-4">No drives match the selected filters</div>';
    }

    Object.entries(grouped).forEach(([modelName, modelDrives]) => {
        const isExpanded = state.expandedVendor === modelName;
        const sample = modelDrives[0];
        const tier = getEnduranceTier(sample.endurance);
        html += `<div class="card rounded-lg overflow-hidden">
            <button onclick="toggleVendor('${modelName}')" class="vendor-header w-full flex items-center justify-between px-4 py-3">
                <div class="flex items-center gap-2">
                    <span class="font-medium text-sm">${modelName}</span>
                    <span class="px-1.5 py-0.5 text-[10px] rounded ${tierColors[tier]}">${sample.endurance}</span>
                    <span class="px-1.5 py-0.5 text-[10px] rounded bg-slate-700 text-gray-300">${sample.formFactor}</span>
                </div>
                <div class="flex items-center gap-2 text-xs text-gray-400">
                    <span>${modelDrives.length} cap${modelDrives.length > 1 ? 's' : ''}</span>
                    <i data-lucide="${isExpanded ? 'chevron-up' : 'chevron-down'}" class="w-4 h-4"></i>
                </div>
            </button>`;

        if (isExpanded) {
            html += '<div class="border-t border-slate-600/50">';
            modelDrives.forEach(drive => {
                const isSelected = state.selectedDrive === drive.pid;
                html += `<button onclick="selectDrive('${drive.pid}')"
                    class="drive-row ${isSelected ? 'drive-row-selected' : ''} w-full flex items-center justify-between px-4 py-3 text-sm">
                    <div class="flex items-center gap-3">
                        <i data-lucide="hard-drive" class="w-4 h-4 text-gray-500"></i>
                        <div class="text-left">
                            <span class="font-mono text-cyan-400 text-xs">${drive.pid}</span>
                            <div class="text-gray-400 text-xs mt-0.5">${drive.formFactor} &bull; ${drive.interface}</div>
                        </div>
                    </div>
                    <span class="font-bold text-white">${drive.capacity}</span>
                </button>`;
            });
            html += '</div>';
        }
        html += '</div>';
    });

    html += '</div>';
    return html;
}

// ─── Cable Summary ───────────────────────────────────────────────────────────

function renderCableSummary() {
    const server = SERVER_MODELS[state.serverKey];
    const controllerAffectsCables = cablesDependOnController(state.serverKey);
    const needsControllerFirst = controllerAffectsCables && !state.selectedController;

    const frontCables = getRequiredCables(state.serverKey, 'front');
    const rearCables = hasRearDrives() ? getRequiredCables(state.serverKey, 'rear') : [];
    const allCables = [...frontCables, ...rearCables];

    let html = '<div class="card rounded-xl p-5 space-y-3">';

    if (needsControllerFirst) {
        html += `<h4 class="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <i data-lucide="cable" class="w-4 h-4 text-amber-400"></i> Required Cables
        </h4>
        <div class="flex items-center gap-3 text-sm text-amber-400/80 p-3 rounded-lg bg-amber-900/10 border border-amber-800/30">
            <i data-lucide="alert-triangle" class="w-4 h-4 flex-shrink-0"></i>
            Select a storage controller above to determine which NVMe cable is needed for this server.
        </div>`;
    } else if (allCables.length === 0) {
        html += `<div class="flex items-center gap-3 text-sm text-gray-400">
            <i data-lucide="info" class="w-4 h-4 text-blue-400"></i>
            No special cables required for this configuration &mdash; drives connect via ${state.serverKey?.startsWith('X') ? 'front mezzanine module' : 'backplane'}.
        </div>`;
    } else {
        html += `<h4 class="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <i data-lucide="cable" class="w-4 h-4 text-amber-400"></i> Required Cables
        </h4>`;

        allCables.forEach(cable => {
            html += `<div class="card rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-mono text-amber-400 text-sm font-bold">${cable.pid}</span>
                    <span class="text-xs px-2 py-0.5 rounded-full bg-slate-600 text-gray-300 capitalize">${cable.location}</span>
                </div>
                <p class="text-sm text-gray-300 mb-1">${cable.description}</p>
                <p class="text-xs text-gray-500">${cable.driveConnections}</p>`;

            if (cable.notes) {
                html += `<p class="text-xs text-gray-500 mt-1 flex items-center gap-1"><i data-lucide="info" class="w-3 h-3"></i> ${cable.notes}</p>`;
            }

            if (cable.subCables) {
                html += '<div class="mt-2 pl-3 border-l-2 border-slate-600 space-y-1">';
                cable.subCables.forEach(sc => {
                    html += `<div class="text-xs text-gray-400"><span class="font-mono text-gray-300">${sc.partNumber}</span> &rarr; Drives ${sc.drives.join(', ')}</div>`;
                });
                html += '</div>';
            }
            html += '</div>';
        });
    }

    html += '</div>';
    return html;
}

// ─── Requirements Panel ──────────────────────────────────────────────────────

function renderRequirements() {
    const server = SERVER_MODELS[state.serverKey];

    let html = `<div class="card rounded-lg p-5 space-y-4">
        <h4 class="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-400"></i> Requirements &amp; Restrictions
        </h4>
        <ul class="space-y-2">`;

    server.requirements.forEach(req => {
        html += `<li class="flex items-start gap-2 text-sm text-gray-400">
            <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>${req}
        </li>`;
    });

    html += `</ul>
        <div class="border-t border-slate-600/50 pt-4">
            <h5 class="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1">
                <i data-lucide="settings" class="w-3 h-3"></i> BIOS Configuration
            </h5>
            <div class="bg-slate-900/50 rounded-lg p-3 font-mono text-xs space-y-1">
                <div><span class="text-gray-500">Path:</span> <span class="text-cyan-400">${server.biosSettings.path}</span></div>
                <div><span class="text-gray-500">Setting:</span> <span class="text-white">${server.biosSettings.setting}</span></div>
                <div><span class="text-gray-500">Value:</span> <span class="text-green-400">${server.biosSettings.value}</span></div>
            </div>
        </div>`;

    if (server.rearNvmeRisers && server.rearNvmeRisers.length > 0) {
        html += `<div class="border-t border-slate-600/50 pt-4">
            <h5 class="text-xs font-semibold text-gray-400 mb-2">Rear NVMe Riser Support</h5>
            <div class="flex flex-wrap gap-2">`;
        server.rearNvmeRisers.forEach(r => {
            html += `<span class="text-xs px-2 py-1 rounded bg-slate-700 text-gray-300 font-mono">${r}</span>`;
        });
        html += '</div></div>';
    }

    // Firmware / Driver Compatibility
    const fw = FIRMWARE_COMPAT[state.serverKey];
    if (fw) {
        html += `<div class="border-t border-slate-600/50 pt-4">
            <h5 class="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1">
                <i data-lucide="shield-check" class="w-3 h-3"></i> Firmware &amp; Driver Notes
            </h5>
            <div class="text-xs text-gray-500 mb-2">Management: <span class="text-cyan-400">${fw.management}</span></div>
            <ul class="space-y-1">`;
        fw.notes.forEach(note => {
            html += `<li class="flex items-start gap-2 text-xs text-gray-400">
                <span class="mt-1 w-1 h-1 rounded-full bg-blue-500 flex-shrink-0"></span>${note}
            </li>`;
        });
        html += '</ul></div>';
    }

    html += '</div>';
    return html;
}

// ─── BOM ─────────────────────────────────────────────────────────────────────

function renderBOM(items) {
    let html = `<div class="card rounded-lg p-5 space-y-4">
        <div class="flex items-center justify-between">
            <h4 class="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <i data-lucide="file-text" class="w-4 h-4 text-green-400"></i> Generated BOM
            </h4>
            <div class="flex gap-2">
                <button onclick="copyBOM()" class="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                    <i data-lucide="copy" class="w-3 h-3"></i> Copy
                </button>
                <button onclick="downloadBOM()" class="flex items-center gap-1 px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors">
                    <i data-lucide="download" class="w-3 h-3"></i> CSV
                </button>
            </div>
        </div>
        <table class="w-full text-sm">
            <thead><tr class="text-left text-xs text-gray-500 border-b border-slate-600/50">
                <th class="pb-2 pr-4">PID</th><th class="pb-2 pr-4">Description</th><th class="pb-2 text-right">Qty</th>
            </tr></thead><tbody>`;

    items.forEach(item => {
        html += `<tr class="border-b border-slate-700/30">
            <td class="py-2 pr-4 font-mono text-cyan-400 text-xs">${item.pid}</td>
            <td class="py-2 pr-4 text-gray-300">${item.description}</td>
            <td class="py-2 text-right font-bold">${item.qty}</td>
        </tr>`;
    });

    html += '</tbody></table></div>';
    return html;
}

// ─── Validation ──────────────────────────────────────────────────────────────

function renderValidation() {
    let html = `<div class="card rounded-lg p-4 space-y-2">
        <h4 class="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <i data-lucide="check-circle" class="w-4 h-4 text-green-400"></i> Validation
        </h4>`;

    state.selectedBays.forEach(bay => {
        const result = validateSlot(bay);
        html += `<div class="flex items-center gap-2 text-xs ${result.valid ? 'text-green-400' : 'text-red-400'}">
            <i data-lucide="${result.valid ? 'check-circle' : 'alert-triangle'}" class="w-3 h-3"></i>
            Bay ${bay}: ${result.valid ? 'Compatible' : result.reason}
        </div>`;
    });

    html += '</div>';
    return html;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

function setDriveFilterFF(val) {
    state.driveFilterFF = val;
    render();
}

function setDriveFilterEnd(val) {
    state.driveFilterEnd = val;
    render();
}

function selectServer(key) {
    state.serverKey = key;
    state.pid = null;
    state.selectedController = null;
    state.selectedBays = [];
    state.selectedDrive = null;
    state.expandedVendor = null;
    state.driveFilterFF = null;
    state.driveFilterEnd = null;
    // Auto-select if only one PID
    const pids = Object.keys(SERVER_MODELS[key].pids);
    if (pids.length === 1) {
        state.pid = pids[0];
        state.step = 2;
    } else {
        state.step = 1;
    }
    render();
}

function selectPid(pid) {
    state.pid = pid;
    state.selectedController = null;
    state.selectedBays = [];
    state.selectedDrive = null;
    state.expandedVendor = null;
    state.driveFilterFF = null;
    state.driveFilterEnd = null;
    state.step = 2;
    render();
}

function selectController(id) {
    state.selectedController = state.selectedController === id ? null : id;
    render();
}

function toggleBay(bay) {
    const idx = state.selectedBays.indexOf(bay);
    if (idx >= 0) state.selectedBays.splice(idx, 1);
    else state.selectedBays.push(bay);
    render();
}

function toggleVendor(vendor) {
    state.expandedVendor = state.expandedVendor === vendor ? null : vendor;
    render();
}

function selectDrive(pid) {
    state.selectedDrive = state.selectedDrive === pid ? null : pid;
    render();
}

function goBack(step) {
    state.step = step;
    if (step === 0) { state.serverKey = null; state.pid = null; state.selectedController = null; }
    if (step <= 1) { state.pid = null; state.selectedController = null; state.selectedBays = []; state.selectedDrive = null; }
    render();
}

function resetTool() {
    state.step = 0;
    state.serverKey = null;
    state.pid = null;
    state.selectedController = null;
    state.selectedBays = [];
    state.selectedDrive = null;
    state.expandedVendor = null;
    state.driveFilterFF = null;
    state.driveFilterEnd = null;
    render();
}

function copyBOM() {
    const items = generateBOMItems();
    const text = items.map(i => `${i.pid}\t${i.description}\t${i.qty}`).join('\n');
    navigator.clipboard.writeText(text).then(
        () => showNotification('BOM copied to clipboard', 'success'),
        () => showNotification('Failed to copy', 'error')
    );
}

function downloadBOM() {
    const items = generateBOMItems();
    const header = 'PID,Description,Qty';
    const rows = items.map(i => `"${i.pid}","${i.description}",${i.qty}`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nvme-bom-${state.pid || 'config'}.csv`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    showNotification('CSV downloaded', 'success');
}

// ─── Shareable Config Links ──────────────────────────────────────────────────

function encodeStateToHash() {
    if (!state.serverKey || !state.pid) return '';
    const data = {
        s: state.serverKey,
        p: state.pid,
        c: state.selectedController || '',
        b: state.selectedBays.join(','),
        d: state.selectedDrive || '',
    };
    return '#' + btoa(JSON.stringify(data));
}

function decodeHashToState(hash) {
    if (!hash || hash.length < 2) return false;
    try {
        const data = JSON.parse(atob(hash.slice(1)));
        if (!data.s || !data.p || !SERVER_MODELS[data.s]) return false;
        if (!SERVER_MODELS[data.s].pids[data.p]) return false;
        state.serverKey = data.s;
        state.pid = data.p;
        state.selectedController = data.c || null;
        state.selectedBays = (data.b && data.b.length > 0) ? data.b.split(',').map(Number).filter(n => !isNaN(n) && n > 0) : [];
        state.selectedDrive = data.d || null;
        state.step = 2;
        return true;
    } catch (e) {
        return false;
    }
}

function updateHash() {
    if (state.step === 2 && state.serverKey && state.pid) {
        const hash = encodeStateToHash();
        history.replaceState(null, '', hash);
    } else {
        history.replaceState(null, '', window.location.pathname);
    }
}

function shareConfig() {
    const hash = encodeStateToHash();
    const url = window.location.origin + window.location.pathname + hash;
    navigator.clipboard.writeText(url).then(
        () => showNotification('Shareable link copied to clipboard', 'success'),
        () => {
            prompt('Copy this link:', url);
        }
    );
}

// ─── Init ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Try to restore state from URL hash
    if (window.location.hash) {
        decodeHashToState(window.location.hash);
    }
    render();
});
