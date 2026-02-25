// Initialize Lucide icons
lucide.createIcons();

// Global state
let calculationResults = {};
let wizardStep = 1;
let selectedNetworkSpeed = '25g';
let selectedRackLayout = 'single';
let comparisonMode = false;
let comparisonWorkload = null;
let savedConfigurations = JSON.parse(localStorage.getItem('infraPlannerConfigs') || '[]');
let currentVisualizationView = 'rack';
let existingInfrastructure = null;

// Constants for calculations
const CABLE_COST_PER_METER_DAC = 15;  // DAC cable cost per meter
const CABLE_COST_PER_METER_AOC = 25;  // AOC cable cost per meter
const DAC_MAX_LENGTH = 5;  // DAC max length in meters
const AVG_RACK_TO_TOR_LENGTH = 3;  // Average cable length within rack
const AVG_TOR_TO_SPINE_LENGTH = 15; // Average cable length to spine

// Workload presets with typical configurations
const workloadPresets = {
    high_compute: {
        name: 'High Compute',
        serverPower: 1224,
        serverCost: 93718.61,
        serverHeight: 1,
        storagePerServer: 5,
        networkSpeed: '25g',
        nicPorts: 2,
        description: 'High-performance compute workloads',
        specs: {
            chassis: 'Cisco UCS C225 M8 (1U)',
            cpu: '1x AMD EPYC 9655P (96C/192T, 2.6GHz, 400W)',
            ram: '1.5TB DDR5-6400 (12x 128GB RDIMMs)',
            boot: '2x 960GB M.2 SATA SSD (RAID1)',
            storage: '2x 15.3TB NVMe U.3 (P7450)',
            nic: '2x 25G SFP28 (Mellanox CX6-Lx OCP)',
            raid: '24G Tri-Mode RAID w/4GB FBWC',
            psu: '2x 1600W Platinum'
        },
        bom: [
            { partNumber: 'UCSC-C225-M8S', description: 'UCS C225 M8 Rack 1U Chassis', qty: 1 },
            { partNumber: 'UCS-CPU-A9655P', description: 'AMD EPYC 9655P 96C 2.6GHz 400W', qty: 1 },
            { partNumber: 'UCS-MR128G2RG5', description: '128GB DDR5-6400 RDIMM', qty: 12 },
            { partNumber: 'UCS-M2-960G-D', description: '960GB M.2 SATA SSD', qty: 2 },
            { partNumber: 'UCS-NVMEG4-M1536D', description: '15.3TB NVMe U.3 P7450', qty: 2 },
            { partNumber: 'UCSC-O-N6CD25GFD', description: 'Mellanox CX6-Lx 2x25G OCP NIC', qty: 1 },
            { partNumber: 'UCSC-RAID-M1L16', description: '24G Tri-Mode RAID Controller', qty: 1 },
            { partNumber: 'UCSC-PSU1-1600W-D', description: '1600W AC PSU Platinum', qty: 2 }
        ]
    },
    hadoop_data_node: {
        name: 'Hadoop Data Node',
        serverPower: 762,
        serverCost: 93748.91,
        serverHeight: 2,
        storagePerServer: 100,
        networkSpeed: '25g',
        nicPorts: 2,
        description: 'Hadoop distributed storage and compute nodes',
        specs: {
            chassis: 'Cisco UCS C240 M8L (2U LFF)',
            cpu: '1x Intel Xeon 6520P (24C, 210W)',
            ram: '1TB DDR5-6400 (16x 64GB RDIMMs)',
            boot: '2x 960GB M.2 SATA SSD (RAID1)',
            storage: '12x 24TB SAS 7.2K + 2x 15.3TB NVMe',
            nic: '2x 25G SFP28 (Mellanox CX6-Lx OCP)',
            raid: '24G Tri-Mode RAID w/8GB FBWC 32Drv',
            psu: '2x 1200W Titanium'
        },
        bom: [
            { partNumber: 'UCSC-C240-M8L', description: 'UCS C240 M8 Rack 2U LFF Chassis', qty: 1 },
            { partNumber: 'UCS-CPU-I6520P', description: 'Intel Xeon 6520P 24C 210W', qty: 1 },
            { partNumber: 'UCS-MRX64G2RE5', description: '64GB DDR5-6400 RDIMM', qty: 16 },
            { partNumber: 'UCS-M2-960G-D', description: '960GB M.2 SATA SSD', qty: 2 },
            { partNumber: 'UCS-HDM24TW1S74K', description: '24TB SAS 7.2K RPM 4K HDD', qty: 12 },
            { partNumber: 'UCS-NVMEG4-M1536D', description: '15.3TB NVMe U.3 P7450', qty: 2 },
            { partNumber: 'UCSC-O-N6CD25GFO', description: 'Mellanox CX6-Lx 2x25G OCP NIC', qty: 1 },
            { partNumber: 'UCSC-RAIDMP1LL32', description: '24G Tri-Mode RAID w/8GB FBWC 32Drv', qty: 1 },
            { partNumber: 'UCSC-PSU1-1200W-D', description: '1200W AC Titanium PSU', qty: 2 }
        ]
    },
    datawarehouse_amd: {
        name: 'DataWarehouse - AMD',
        serverPower: 993,
        serverCost: 77524.56,
        serverHeight: 2,
        storagePerServer: 50,
        networkSpeed: '25g',
        nicPorts: 2,
        description: 'AMD-based data warehouse servers',
        specs: {
            chassis: 'Cisco UCS C245 M8SX (2U SFF)',
            cpu: '2x AMD EPYC 9255 (24C, 200W)',
            ram: '1.5TB DDR5-6400 (24x 64GB RDIMMs)',
            boot: '2x 240GB M.2 SATA SSD (RAID1)',
            storage: '6x 960GB SATA SSD + 2x 24G RAID',
            nic: '2x 25G SFP28 (Mellanox CX6-Lx) + 2x 32G FC HBA',
            raid: '24G Tri-Mode RAID w/4GB FBWC',
            psu: '2x 1200W Titanium'
        },
        bom: [
            { partNumber: 'UCSC-C245-M8SX', description: 'UCS C245 M8 Rack 2U SFF Chassis', qty: 1 },
            { partNumber: 'UCS-CPU-A9255', description: 'AMD EPYC 9255 24C 200W', qty: 2 },
            { partNumber: 'UCS-MRX64G2RE5', description: '64GB DDR5-6400 RDIMM', qty: 24 },
            { partNumber: 'UCS-M2-240G-D', description: '240GB M.2 SATA SSD', qty: 2 },
            { partNumber: 'UCS-SD960GBM3XEPD', description: '960GB SATA SSD', qty: 6 },
            { partNumber: 'UCSC-O-N6CD25GFD', description: 'Mellanox CX6-Lx 2x25G OCP NIC', qty: 1 },
            { partNumber: 'UCSC-P-B7D32GF-D', description: 'Emulex LPe35002 32G FC HBA', qty: 2 },
            { partNumber: 'UCSC-RAID-M1L16', description: '24G Tri-Mode RAID w/4GB FBWC', qty: 2 },
            { partNumber: 'UCSC-PSU1-1200W-D', description: '1200W AC Titanium PSU', qty: 2 }
        ]
    },
    datawarehouse_intel: {
        name: 'DataWarehouse - Intel',
        serverPower: 964,
        serverCost: 96745.95,
        serverHeight: 2,
        storagePerServer: 50,
        networkSpeed: '25g',
        nicPorts: 2,
        description: 'Intel-based data warehouse servers',
        specs: {
            chassis: 'Cisco UCS C240 M8SX (2U SFF)',
            cpu: '2x Intel Xeon 6520P (24C, 210W)',
            ram: '2TB DDR5-6400 (32x 64GB RDIMMs)',
            boot: '2x 240GB M.2 SATA SSD (RAID1)',
            storage: '6x 960GB SATA SSD + 2x 24G RAID',
            nic: '2x 25G SFP28 (Mellanox CX6-Lx) + 2x 32G FC HBA',
            raid: '24G Tri-Mode RAID w/4GB FBWC',
            psu: '2x 1200W Titanium'
        },
        bom: [
            { partNumber: 'UCSC-C240-M8SX', description: 'UCS C240 M8 Rack 2U SFF Chassis', qty: 1 },
            { partNumber: 'UCS-CPU-I6520P', description: 'Intel Xeon 6520P 24C 210W', qty: 2 },
            { partNumber: 'UCS-MRX64G2RE5', description: '64GB DDR5-6400 RDIMM', qty: 32 },
            { partNumber: 'UCS-M2-240G-D', description: '240GB M.2 SATA SSD', qty: 2 },
            { partNumber: 'UCS-SD960GBM3XEPD', description: '960GB SATA SSD', qty: 6 },
            { partNumber: 'UCSC-O-N6CD25GFO', description: 'Mellanox CX6-Lx 2x25G OCP NIC', qty: 1 },
            { partNumber: 'UCSC-P-B7D32GF-D', description: 'Emulex LPe35002 32G FC HBA', qty: 2 },
            { partNumber: 'UCSC-RAID-M1L16', description: '24G Tri-Mode RAID w/4GB FBWC', qty: 2 },
            { partNumber: 'UCSC-PSU1-1200W-D', description: '1200W AC Titanium PSU', qty: 2 }
        ]
    },
    gp_local_intel: {
        name: 'General Purpose Local Intel',
        serverPower: 574,
        serverCost: 37583.81,
        serverHeight: 1,
        storagePerServer: 2,
        networkSpeed: '25g',
        nicPorts: 2,
        description: 'Intel general purpose with local storage',
        specs: {
            chassis: 'Cisco UCS C220 M7S (1U SFF)',
            cpu: '1x Intel Xeon 6548Y+ (32C, 250W)',
            ram: '512GB DDR5-5600 (8x 64GB RDIMMs)',
            boot: '2x 240GB M.2 SATA SSD (RAID1)',
            storage: '6x 960GB SATA SSD',
            nic: '2x 25G SFP28 (Mellanox CX6-Lx OCP)',
            raid: '24G Tri-Mode RAID w/4GB FBWC',
            psu: '2x 1200W Titanium'
        },
        bom: [
            { partNumber: 'UCSC-C220-M7S', description: 'UCS C220 M7 Rack 1U SFF Chassis', qty: 1 },
            { partNumber: 'UCS-CPU-I6548Y+', description: 'Intel Xeon 6548Y+ 32C 250W', qty: 1 },
            { partNumber: 'UCS-MRX64G2RE3', description: '64GB DDR5-5600 RDIMM', qty: 8 },
            { partNumber: 'UCS-M2-240G-D', description: '240GB M.2 SATA SSD', qty: 2 },
            { partNumber: 'UCS-SD960GBM3XEPD', description: '960GB SATA SSD', qty: 6 },
            { partNumber: 'UCSC-P-N6D25GF-D', description: 'Mellanox CX6-Lx 2x25G PCIe NIC', qty: 1 },
            { partNumber: 'UCSC-RAID-M1L16', description: '24G Tri-Mode RAID w/4GB FBWC', qty: 1 },
            { partNumber: 'UCSC-PSU1-1200W-D', description: '1200W AC Titanium PSU', qty: 2 }
        ]
    },
    gp_san_intel: {
        name: 'General Purpose SAN Intel',
        serverPower: 731,
        serverCost: 33697.29,
        serverHeight: 1,
        storagePerServer: 0,
        networkSpeed: '25g',
        nicPorts: 4,
        description: 'Intel general purpose with SAN storage',
        specs: {
            chassis: 'Cisco UCS C220 M7S (1U SFF)',
            cpu: '2x Intel Xeon 6526Y (16C, 195W)',
            ram: '512GB DDR5-5600 (16x 32GB RDIMMs)',
            boot: '2x 240GB M.2 SATA SSD (RAID1)',
            storage: 'SAN (no local)',
            nic: '2x 25G SFP28 (Mellanox CX6-Lx) + 1x 32G FC HBA',
            raid: 'N/A (SAN)',
            psu: '2x 1200W Titanium'
        },
        bom: [
            { partNumber: 'UCSC-C220-M7S', description: 'UCS C220 M7 Rack 1U SFF Chassis', qty: 1 },
            { partNumber: 'UCS-CPU-I6526Y', description: 'Intel Xeon 6526Y 16C 195W', qty: 2 },
            { partNumber: 'UCS-MRX32G1RE3', description: '32GB DDR5-5600 RDIMM', qty: 16 },
            { partNumber: 'UCS-M2-240G-D', description: '240GB M.2 SATA SSD', qty: 2 },
            { partNumber: 'UCSC-P-N6D25GF-D', description: 'Mellanox CX6-Lx 2x25G PCIe NIC', qty: 2 },
            { partNumber: 'UCSC-P-B7D32GF-D', description: 'Emulex LPe35002 32G FC HBA', qty: 1 },
            { partNumber: 'UCSC-PSU1-1200W-D', description: '1200W AC Titanium PSU', qty: 2 }
        ]
    },
    db_local_intel: {
        name: 'Database Local Optimized Intel',
        serverPower: 934,
        serverCost: 57980.73,
        serverHeight: 1,
        storagePerServer: 20,
        networkSpeed: '25g',
        nicPorts: 2,
        description: 'Intel database servers with local NVMe storage',
        specs: {
            chassis: 'Cisco UCS C220 M7S (1U SFF)',
            cpu: '2x Intel Xeon 6548Y+ (32C, 250W)',
            ram: '1TB DDR5-5600 (32x 32GB RDIMMs)',
            boot: '2x 240GB M.2 SATA SSD (RAID1)',
            storage: '6x 960GB SATA SSD',
            nic: '2x 25G SFP28 (Mellanox CX6-Lx OCP)',
            raid: 'M7 12G SAS RAID w/4GB FBWC',
            psu: '2x 1200W Titanium'
        },
        bom: [
            { partNumber: 'UCSC-C220-M7S', description: 'UCS C220 M7 Rack 1U SFF Chassis', qty: 1 },
            { partNumber: 'UCS-CPU-I6548Y+', description: 'Intel Xeon 6548Y+ 32C 250W', qty: 2 },
            { partNumber: 'UCS-MRX32G1RE3', description: '32GB DDR5-5600 RDIMM', qty: 32 },
            { partNumber: 'UCS-M2-240G-D', description: '240GB M.2 SATA SSD', qty: 2 },
            { partNumber: 'UCS-SD960GBM3XEPD', description: '960GB SATA SSD', qty: 6 },
            { partNumber: 'UCSC-P-N6D25GF-D', description: 'Mellanox CX6-Lx 2x25G PCIe NIC', qty: 1 },
            { partNumber: 'UCSC-RAID-T-D', description: 'M7 12G SAS RAID w/4GB FBWC', qty: 1 },
            { partNumber: 'UCSC-PSU1-1200W-D', description: '1200W AC Titanium PSU', qty: 2 }
        ]
    },
    db_san_intel: {
        name: 'Database SAN Optimized Intel',
        serverPower: 891,
        serverCost: 53551.32,
        serverHeight: 1,
        storagePerServer: 0,
        networkSpeed: '25g',
        nicPorts: 2,
        description: 'Intel database servers with SAN storage',
        specs: {
            chassis: 'Cisco UCS C220 M7S (1U SFF)',
            cpu: '2x Intel Xeon 6548Y+ (32C, 250W)',
            ram: '1TB DDR5-5600 (32x 32GB RDIMMs)',
            boot: '2x 240GB M.2 SATA SSD (RAID1)',
            storage: 'SAN (no local)',
            nic: '2x 25G SFP28 (Mellanox CX6-Lx) + 1x 32G FC HBA',
            raid: 'N/A (SAN)',
            psu: '2x 1200W Titanium'
        },
        bom: [
            { partNumber: 'UCSC-C220-M7S', description: 'UCS C220 M7 Rack 1U SFF Chassis', qty: 1 },
            { partNumber: 'UCS-CPU-I6548Y+', description: 'Intel Xeon 6548Y+ 32C 250W', qty: 2 },
            { partNumber: 'UCS-MRX32G1RE3', description: '32GB DDR5-5600 RDIMM', qty: 32 },
            { partNumber: 'UCS-M2-240G-D', description: '240GB M.2 SATA SSD', qty: 2 },
            { partNumber: 'UCSC-P-N6D25GF-D', description: 'Mellanox CX6-Lx 2x25G PCIe NIC', qty: 1 },
            { partNumber: 'UCSC-P-B7D32GF-D', description: 'Emulex LPe35002 32G FC HBA', qty: 1 },
            { partNumber: 'UCSC-PSU1-1200W-D', description: '1200W AC Titanium PSU', qty: 2 }
        ]
    },
    gp_local_amd: {
        name: 'General Purpose Local AMD',
        serverPower: 770,
        serverCost: 42388.37,
        serverHeight: 1,
        storagePerServer: 2,
        networkSpeed: '25g',
        nicPorts: 2,
        description: 'AMD general purpose with local storage',
        specs: {
            chassis: 'Cisco UCS C225 M8S (1U SFF)',
            cpu: '1x AMD EPYC 9335 (32C, 210W)',
            ram: '768GB DDR5-6400 (12x 64GB RDIMMs)',
            boot: '2x 240GB M.2 SATA SSD (RAID1)',
            storage: '6x 960GB SATA SSD',
            nic: '2x 25G SFP28 (Mellanox CX6-Lx OCP)',
            raid: '24G Tri-Mode RAID w/4GB FBWC',
            psu: '2x 1200W Titanium'
        },
        bom: [
            { partNumber: 'UCSC-C225-M8S', description: 'UCS C225 M8 Rack 1U SFF Chassis', qty: 1 },
            { partNumber: 'UCS-CPU-A9335', description: 'AMD EPYC 9335 32C 210W', qty: 1 },
            { partNumber: 'UCS-MRX64G2RE5', description: '64GB DDR5-6400 RDIMM', qty: 12 },
            { partNumber: 'UCS-M2-240G-D', description: '240GB M.2 SATA SSD', qty: 2 },
            { partNumber: 'UCS-SD960GBM3XEPD', description: '960GB SATA SSD', qty: 6 },
            { partNumber: 'UCSC-P-N6D25GF-D', description: 'Mellanox CX6-Lx 2x25G PCIe NIC', qty: 1 },
            { partNumber: 'UCSC-RAID-M1L16', description: '24G Tri-Mode RAID w/4GB FBWC', qty: 1 },
            { partNumber: 'UCSC-PSU1-1200W-D', description: '1200W AC Titanium PSU', qty: 2 }
        ]
    },
    gp_san_amd: {
        name: 'General Purpose SAN AMD',
        serverPower: 770,
        serverCost: 42388.37,
        serverHeight: 2,
        storagePerServer: 0,
        networkSpeed: '25g',
        nicPorts: 2,
        description: 'AMD general purpose with SAN storage',
        specs: {
            chassis: 'Cisco UCS C245 M8SX (2U SFF)',
            cpu: '2x AMD EPYC 9115 (16C, 125W)',
            ram: '768GB DDR5-6400 (24x 32GB RDIMMs)',
            boot: '2x 240GB M.2 SATA SSD (RAID1)',
            storage: 'SAN (no local)',
            nic: '2x 25G SFP28 (Mellanox CX6-Lx) + 1x 32G FC HBA',
            raid: 'N/A (SAN)',
            psu: '2x 1200W Titanium'
        },
        bom: [
            { partNumber: 'UCSC-C245-M8SX', description: 'UCS C245 M8 Rack 2U SFF Chassis', qty: 1 },
            { partNumber: 'UCS-CPU-A9115', description: 'AMD EPYC 9115 16C 125W', qty: 2 },
            { partNumber: 'UCS-MRX32G1RE5', description: '32GB DDR5-6400 RDIMM', qty: 24 },
            { partNumber: 'UCS-M2-240G-D', description: '240GB M.2 SATA SSD', qty: 2 },
            { partNumber: 'UCSC-P-N6D25GF-D', description: 'Mellanox CX6-Lx 2x25G PCIe NIC', qty: 1 },
            { partNumber: 'UCSC-P-B7D32GF-D', description: 'Emulex LPe35002 32G FC HBA', qty: 1 },
            { partNumber: 'UCSC-PSU1-1200W-D', description: '1200W AC Titanium PSU', qty: 2 }
        ]
    },
    db_local_amd: {
        name: 'Database Local Optimized AMD',
        serverPower: 994,
        serverCost: 75604.69,
        serverHeight: 2,
        storagePerServer: 20,
        networkSpeed: '25g',
        nicPorts: 2,
        description: 'AMD database servers with local NVMe storage',
        specs: {
            chassis: 'Cisco UCS C245 M8SX (2U SFF)',
            cpu: '2x AMD EPYC 9335 (32C, 210W)',
            ram: '1.5TB DDR5-6400 (24x 64GB RDIMMs)',
            boot: '2x 240GB M.2 SATA SSD (RAID1)',
            storage: '6x 960GB SATA SSD',
            nic: '2x 25G SFP28 (Mellanox CX6-Lx OCP)',
            raid: '24G Tri-Mode RAID w/4GB FBWC',
            psu: '2x 1200W Titanium'
        },
        bom: [
            { partNumber: 'UCSC-C245-M8SX', description: 'UCS C245 M8 Rack 2U SFF Chassis', qty: 1 },
            { partNumber: 'UCS-CPU-A9335', description: 'AMD EPYC 9335 32C 210W', qty: 2 },
            { partNumber: 'UCS-MRX64G2RE5', description: '64GB DDR5-6400 RDIMM', qty: 24 },
            { partNumber: 'UCS-M2-240G-D', description: '240GB M.2 SATA SSD', qty: 2 },
            { partNumber: 'UCS-SD960GBM3XEPD', description: '960GB SATA SSD', qty: 6 },
            { partNumber: 'UCSC-P-N6D25GF-D', description: 'Mellanox CX6-Lx 2x25G PCIe NIC', qty: 1 },
            { partNumber: 'UCSC-RAID-M1L16', description: '24G Tri-Mode RAID w/4GB FBWC', qty: 1 },
            { partNumber: 'UCSC-PSU1-1200W-D', description: '1200W AC Titanium PSU', qty: 2 }
        ]
    },
    db_san_amd: {
        name: 'Database SAN Optimized AMD',
        serverPower: 926,
        serverCost: 70077.29,
        serverHeight: 2,
        storagePerServer: 0,
        networkSpeed: '25g',
        nicPorts: 2,
        description: 'AMD database servers with SAN storage',
        specs: {
            chassis: 'Cisco UCS C245 M8SX (2U SFF)',
            cpu: '2x AMD EPYC 9335 (32C, 210W)',
            ram: '1.5TB DDR5-6400 (24x 64GB RDIMMs)',
            boot: '2x 240GB M.2 SATA SSD (RAID1)',
            storage: 'SAN (no local)',
            nic: '2x 25G SFP28 (Mellanox CX6-Lx) + 1x 32G FC HBA',
            raid: 'N/A (SAN)',
            psu: '2x 1200W Titanium'
        },
        bom: [
            { partNumber: 'UCSC-C245-M8SX', description: 'UCS C245 M8 Rack 2U SFF Chassis', qty: 1 },
            { partNumber: 'UCS-CPU-A9335', description: 'AMD EPYC 9335 32C 210W', qty: 2 },
            { partNumber: 'UCS-MRX64G2RE5', description: '64GB DDR5-6400 RDIMM', qty: 24 },
            { partNumber: 'UCS-M2-240G-D', description: '240GB M.2 SATA SSD', qty: 2 },
            { partNumber: 'UCSC-P-N6D25GF-D', description: 'Mellanox CX6-Lx 2x25G PCIe NIC', qty: 1 },
            { partNumber: 'UCSC-P-B7D32GF-D', description: 'Emulex LPe35002 32G FC HBA', qty: 1 },
            { partNumber: 'UCSC-PSU1-1200W-D', description: '1200W AC Titanium PSU', qty: 2 }
        ]
    },
    hypervisor: {
        name: 'Hypervisor',
        serverPower: 970,
        serverCost: 51501.34,
        serverHeight: 1,
        storagePerServer: 5,
        networkSpeed: '25g',
        nicPorts: 2,
        description: 'Virtualization hosts for VM workloads',
        specs: {
            chassis: 'Cisco UCS C220 M7S (1U SFF)',
            cpu: '2x Intel Xeon 6548Y+ (32C, 250W)',
            ram: '1TB DDR5-5600 (32x 32GB RDIMMs)',
            boot: '2x 240GB M.2 SATA SSD (RAID1)',
            storage: 'SAN (no local)',
            nic: '2x 25G SFP28 (Mellanox CX6-Lx) + 1x 4x1G NIC',
            raid: 'N/A (SAN)',
            psu: '2x 1200W Titanium'
        },
        bom: [
            { partNumber: 'UCSC-C220-M7S', description: 'UCS C220 M7 Rack 1U SFF Chassis', qty: 1 },
            { partNumber: 'UCS-CPU-I6548Y+', description: 'Intel Xeon 6548Y+ 32C 250W', qty: 2 },
            { partNumber: 'UCS-MRX32G1RE3', description: '32GB DDR5-5600 RDIMM', qty: 32 },
            { partNumber: 'UCS-M2-240G-D', description: '240GB M.2 SATA SSD', qty: 2 },
            { partNumber: 'UCSC-P-N6D25GF-D', description: 'Mellanox CX6-Lx 2x25G PCIe NIC', qty: 1 },
            { partNumber: 'UCSC-P-IQ1GC', description: 'Intel I710-T4L 4x1G NIC', qty: 1 },
            { partNumber: 'UCSC-PSU1-1200W-D', description: '1200W AC Titanium PSU', qty: 2 }
        ]
    },
    container_worker: {
        name: 'Container Worker',
        serverPower: 556,
        serverCost: 46312.82,
        serverHeight: 1,
        storagePerServer: 2,
        networkSpeed: '25g',
        nicPorts: 2,
        description: 'Kubernetes/container worker nodes',
        specs: {
            chassis: 'Cisco UCS C225 M8S (1U SFF)',
            cpu: '1x AMD EPYC 9535 (64C, 300W)',
            ram: '768GB DDR5-6400 (12x 64GB RDIMMs)',
            boot: '2x 240GB M.2 SATA SSD (RAID1)',
            storage: '2x 3.8TB SATA SSD + 2x 960GB SATA SSD',
            nic: '2x 25G SFP28 (Mellanox CX6-Lx OCP)',
            raid: '24G Tri-Mode RAID w/4GB FBWC',
            psu: '2x 1200W Titanium'
        },
        bom: [
            { partNumber: 'UCSC-C225-M8S', description: 'UCS C225 M8 Rack 1U SFF Chassis', qty: 1 },
            { partNumber: 'UCS-CPU-A9535', description: 'AMD EPYC 9535 64C 300W', qty: 1 },
            { partNumber: 'UCS-MRX64G2RE5', description: '64GB DDR5-6400 RDIMM', qty: 12 },
            { partNumber: 'UCS-M2-240G-D', description: '240GB M.2 SATA SSD', qty: 2 },
            { partNumber: 'UCS-SDB3T8SA1VD', description: '3.8TB SATA SSD', qty: 2 },
            { partNumber: 'UCS-SD960GBM3XEPD', description: '960GB SATA SSD', qty: 2 },
            { partNumber: 'UCSC-P-N6D25GF-D', description: 'Mellanox CX6-Lx 2x25G PCIe NIC', qty: 1 },
            { partNumber: 'UCSC-RAID-M1L16', description: '24G Tri-Mode RAID w/4GB FBWC', qty: 1 },
            { partNumber: 'UCSC-PSU1-1200W-D', description: '1200W AC Titanium PSU', qty: 2 }
        ]
    },
    oracle_db_intel: {
        name: 'Oracle DB Optimized Intel',
        serverPower: 871,
        serverCost: 81500.01,
        serverHeight: 1,
        storagePerServer: 30,
        networkSpeed: '25g',
        nicPorts: 4,
        description: 'Oracle database optimized configuration',
        specs: {
            chassis: 'Cisco UCS C220 M7S (1U SFF)',
            cpu: '2x Intel Xeon 6526Y (16C, 195W)',
            ram: '1TB DDR5-5600 (32x 32GB RDIMMs)',
            boot: '2x 240GB M.2 SATA SSD (RAID1)',
            storage: 'SAN (no local)',
            nic: '2x 25G SFP28 (Mellanox CX6-Lx)',
            raid: 'N/A (SAN)',
            psu: '2x 1200W Titanium'
        },
        bom: [
            { partNumber: 'UCSC-C220-M7S', description: 'UCS C220 M7 Rack 1U SFF Chassis', qty: 1 },
            { partNumber: 'UCS-CPU-I6526Y', description: 'Intel Xeon 6526Y 16C 195W', qty: 2 },
            { partNumber: 'UCS-MRX32G1RE3', description: '32GB DDR5-5600 RDIMM', qty: 32 },
            { partNumber: 'UCS-M2-240G-D', description: '240GB M.2 SATA SSD', qty: 2 },
            { partNumber: 'UCSC-P-N6D25GF-D', description: 'Mellanox CX6-Lx 2x25G PCIe NIC', qty: 2 },
            { partNumber: 'UCSC-PSU1-1200W-D', description: '1200W AC Titanium PSU', qty: 2 }
        ]
    },
    logging: {
        name: 'Logging',
        serverPower: 1073,
        serverCost: 53436.81,
        serverHeight: 2,
        storagePerServer: 50,
        networkSpeed: '25g',
        nicPorts: 2,
        description: 'Log aggregation and analysis servers',
        specs: {
            chassis: 'Cisco UCS C240 M8L (2U LFF)',
            cpu: '2x Intel Xeon 6730P (32C, 270W)',
            ram: '512GB DDR5-6400 (16x 32GB RDIMMs)',
            boot: '2x 240GB M.2 SATA SSD (RAID1)',
            storage: '8x 16TB SAS 7.2K + 4x 4TB SAS 7.2K',
            nic: '2x 25G SFP28 (Mellanox CX6-Lx OCP)',
            raid: '24G Tri-Mode RAID w/8GB FBWC 32Drv',
            psu: '2x 1200W Titanium'
        },
        bom: [
            { partNumber: 'UCSC-C240-M8L', description: 'UCS C240 M8 Rack 2U LFF Chassis', qty: 1 },
            { partNumber: 'UCS-CPU-I6730P', description: 'Intel Xeon 6730P 32C 270W', qty: 2 },
            { partNumber: 'UCS-MRX32G1RE5', description: '32GB DDR5-6400 RDIMM', qty: 16 },
            { partNumber: 'UCS-M2-240G-D', description: '240GB M.2 SATA SSD', qty: 2 },
            { partNumber: 'UCS-HDL16TT1S74K', description: '16TB SAS 7.2K RPM 4K HDD', qty: 8 },
            { partNumber: 'UCS-HDL4TG1S74K', description: '4TB SAS 7.2K RPM 4K HDD', qty: 4 },
            { partNumber: 'UCSC-P-N6D25GFO', description: 'Mellanox CX6-Lx 2x25G OCP NIC', qty: 1 },
            { partNumber: 'UCSC-RAIDMP1LL32', description: '24G Tri-Mode RAID w/8GB FBWC 32Drv', qty: 1 },
            { partNumber: 'UCSC-PSU1-1200W-D', description: '1200W AC Titanium PSU', qty: 2 }
        ]
    },
    data_storage: {
        name: 'Data Storage Servers',
        serverPower: 1151,
        serverCost: 52548.37,
        serverHeight: 2,
        storagePerServer: 200,
        networkSpeed: '25g',
        nicPorts: 2,
        description: 'High-density storage servers',
        specs: {
            chassis: 'Cisco UCS C240 M8L (2U LFF)',
            cpu: '2x Intel Xeon 6737P (32C, 270W)',
            ram: '512GB DDR5-6400 (16x 32GB RDIMMs)',
            boot: '2x 240GB M.2 SATA SSD (RAID1)',
            storage: '12x 8TB SAS 7.2K HDD',
            nic: '2x 25G SFP28 (Mellanox CX6-Lx OCP)',
            raid: '24G Tri-Mode RAID w/8GB FBWC 32Drv',
            psu: '2x 1200W Titanium'
        },
        bom: [
            { partNumber: 'UCSC-C240-M8L', description: 'UCS C240 M8 Rack 2U LFF Chassis', qty: 1 },
            { partNumber: 'UCS-CPU-I6737P', description: 'Intel Xeon 6737P 32C 270W', qty: 2 },
            { partNumber: 'UCS-MRX32G1RE5', description: '32GB DDR5-6400 RDIMM', qty: 16 },
            { partNumber: 'UCS-M2-240G-D', description: '240GB M.2 SATA SSD', qty: 2 },
            { partNumber: 'UCS-HDL8TT1S74K', description: '8TB SAS 7.2K RPM 4K HDD', qty: 12 },
            { partNumber: 'UCSC-P-N6D25GFO', description: 'Mellanox CX6-Lx 2x25G OCP NIC', qty: 1 },
            { partNumber: 'UCSC-RAIDMP1LL32', description: '24G Tri-Mode RAID w/8GB FBWC 32Drv', qty: 1 },
            { partNumber: 'UCSC-PSU1-1200W-D', description: '1200W AC Titanium PSU', qty: 2 }
        ]
    }
};

// Network speed presets
const networkPresets = {
    '25g': {
        torPorts: 48,
        torCost: 15000,
        torPower: 350,
        serverOpticsCost: 80,
        opticsPerServer: 2,
        uplinkOpticsCost: 300,
        uplinksPerTor: 4,
        spineCost: 45000,
        serversPerSpine: 500
    },
    '100g': {
        torPorts: 32,
        torCost: 35000,
        torPower: 500,
        serverOpticsCost: 250,
        opticsPerServer: 2,
        uplinkOpticsCost: 800,
        uplinksPerTor: 8,
        spineCost: 85000,
        serversPerSpine: 400
    }
};

// Tab navigation
function showTab(tabName) {
    document.querySelectorAll('.tab-section').forEach(section => section.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('tab-active'));
    document.getElementById(`section-${tabName}`).classList.remove('hidden');
    document.getElementById(`tab-${tabName}`).classList.add('tab-active');
    
    // Render visualizations when switching to visualize tab
    if (tabName === 'visualize') {
        setVisualizationView(currentVisualizationView || 'rack');
    }
    
    // Calculate migration efficiency when switching to migration tab
    if (tabName === 'migration') {
        calculateMigrationEfficiency();
    }
    
    lucide.createIcons();
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(amount);
}

// Format number with commas
function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

// Wizard functions
function showWizard() {
    document.getElementById('wizardOverlay').classList.remove('hidden');
    wizardStep = 1;
    updateWizardUI();
    lucide.createIcons();
}

function hideWizard() {
    document.getElementById('wizardOverlay').classList.add('hidden');
}

function skipWizard() {
    hideWizard();
    calculate();
}

function wizardNextStep() {
    if (wizardStep < 3) {
        wizardStep++;
        updateWizardUI();
        if (wizardStep === 2) updatePowerPreview();
        if (wizardStep === 3) updateTimelinePreview();
    }
}

function wizardPrevStep() {
    if (wizardStep > 1) {
        wizardStep--;
        updateWizardUI();
    }
}

function updateWizardUI() {
    // Hide all steps
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`wizardStep${i}`).classList.add('hidden');
        document.getElementById(`step${i}Indicator`).classList.remove('bg-blue-500', 'bg-green-500');
        document.getElementById(`step${i}Indicator`).classList.add('bg-slate-600');
    }
    
    // Show current step
    document.getElementById(`wizardStep${wizardStep}`).classList.remove('hidden');
    
    // Update indicators
    for (let i = 1; i <= wizardStep; i++) {
        document.getElementById(`step${i}Indicator`).classList.remove('bg-slate-600');
        document.getElementById(`step${i}Indicator`).classList.add(i < wizardStep ? 'bg-green-500' : 'bg-blue-500');
    }
    
    // Update progress bars
    document.getElementById('step1Bar').classList.toggle('bg-green-500', wizardStep > 1);
    document.getElementById('step2Bar').classList.toggle('bg-green-500', wizardStep > 2);
    
    // Update buttons
    document.getElementById('wizardBack').classList.toggle('hidden', wizardStep === 1);
    document.getElementById('wizardNext').classList.toggle('hidden', wizardStep === 3);
    document.getElementById('wizardFinish').classList.toggle('hidden', wizardStep !== 3);
    
    lucide.createIcons();
}

function selectNetworkSpeed(speed) {
    selectedNetworkSpeed = speed;
    document.querySelectorAll('.network-speed-btn').forEach(btn => {
        btn.classList.remove('border-blue-500', 'border-purple-500', 'bg-blue-900/30', 'bg-purple-900/30');
        btn.classList.add('border-slate-600');
    });
    const btn = document.getElementById(`net${speed}`);
    btn.classList.remove('border-slate-600');
    btn.classList.add(speed === '25g' ? 'border-blue-500' : 'border-purple-500');
    btn.classList.add(speed === '25g' ? 'bg-blue-900/30' : 'bg-purple-900/30');
}

function setRackPower(kw) {
    document.getElementById('wizardRackPower').value = kw;
    updatePowerPreview();
}

function selectRackLayout(layout) {
    selectedRackLayout = layout;
    document.querySelectorAll('.rack-layout-btn').forEach(btn => {
        btn.classList.remove('border-blue-500', 'border-purple-500', 'bg-blue-900/30', 'bg-purple-900/30');
        btn.classList.add('border-slate-600');
    });
    const btn = document.getElementById(layout === 'single' ? 'layoutSingle' : 'layoutSplit');
    btn.classList.remove('border-slate-600');
    btn.classList.add(layout === 'single' ? 'border-blue-500' : 'border-purple-500');
    btn.classList.add(layout === 'single' ? 'bg-blue-900/30' : 'bg-purple-900/30');
    
    const desc = document.getElementById('layoutDescription');
    if (layout === 'single') {
        desc.textContent = 'Single rack: 2 ToRs + servers in one rack. More compact but power-limited.';
    } else {
        desc.textContent = 'Split: 1 ToR per rack, servers cross-cabled to both ToRs across racks. More servers when power-constrained.';
    }
    updatePowerPreview();
}

function updateWorkloadDefaults() {
    const workloadType = document.getElementById('wizardWorkloadType').value;
    const specsDiv = document.getElementById('workloadSpecs');
    const specsContent = document.getElementById('workloadSpecsContent');
    const networkSpeedSection = document.getElementById('networkSpeedSection');
    
    if (workloadType && workloadPresets[workloadType]) {
        const preset = workloadPresets[workloadType];
        document.getElementById('workloadDescription').textContent = preset.description;
        
        // Auto-select network speed from preset if available
        if (preset.networkSpeed) {
            selectedNetworkSpeed = preset.networkSpeed;
            selectNetworkSpeed(preset.networkSpeed);
            // Hide network speed selector since it's determined by the workload
            if (networkSpeedSection) networkSpeedSection.classList.add('hidden');
        } else {
            // Show network speed selector if no preset
            if (networkSpeedSection) networkSpeedSection.classList.remove('hidden');
        }
        
        // Show specs if available
        if (preset.specs) {
            specsDiv.classList.remove('hidden');
            let html = '';
            const specLabels = {
                chassis: 'Chassis',
                cpu: 'CPU',
                ram: 'Memory',
                boot: 'Boot',
                storage: 'Storage',
                nic: 'Network',
                raid: 'RAID',
                psu: 'Power'
            };
            for (const [key, value] of Object.entries(preset.specs)) {
                html += `<div class="text-gray-400">${specLabels[key] || key}:</div><div class="text-cyan-300">${value}</div>`;
            }
            // Add power draw and server price
            if (preset.serverPower) {
                html += `<div class="text-gray-400">Power Draw:</div><div class="text-yellow-400 font-semibold">${preset.serverPower}W</div>`;
            }
            if (preset.serverCost) {
                html += `<div class="text-gray-400">Est. Price:</div><div class="text-green-400 font-semibold">$${preset.serverCost.toLocaleString()}</div>`;
            }
            specsContent.innerHTML = html;
        } else {
            specsDiv.classList.add('hidden');
        }
    } else {
        document.getElementById('workloadDescription').textContent = '';
        specsDiv.classList.add('hidden');
        // Show network speed selector when no workload selected
        if (networkSpeedSection) networkSpeedSection.classList.remove('hidden');
    }
}

function updatePowerPreview() {
    const workloadType = document.getElementById('wizardWorkloadType').value;
    const rackPower = parseFloat(document.getElementById('wizardRackPower').value) || 10;
    const totalServers = parseInt(document.getElementById('wizardTotalServers').value) || 6000;
    const isSplit = selectedRackLayout === 'split';
    
    let serverPower = 500;
    let serverHeight = 1;
    if (workloadType && workloadPresets[workloadType]) {
        serverPower = workloadPresets[workloadType].serverPower;
        serverHeight = workloadPresets[workloadType].serverHeight;
    }
    
    const networkPreset = networkPresets[selectedNetworkSpeed];
    const torPower = networkPreset.torPower;
    const torPowerKw = torPower / 1000;
    
    // Both layouts have 2 ToRs per scalable unit
    // Single: 2 ToRs in 1 rack (need to account for 2x ToR power in one rack)
    // Split: 1 ToR per rack across 2 racks
    
    let serversPerRack, serversPerScalableUnit, racksPerScalableUnit, availablePowerForServers;
    
    if (isSplit) {
        // Split: 1 ToR per rack, scalable unit spans 2 racks
        availablePowerForServers = rackPower - torPowerKw;
        const serversPerRackByPower = Math.floor((availablePowerForServers * 1000) / serverPower);
        const serversPerRackBySpace = Math.floor((42 - 2) / serverHeight); // Reserve 2U for 1 ToR
        serversPerRack = Math.max(1, Math.min(serversPerRackByPower, serversPerRackBySpace));
        serversPerScalableUnit = serversPerRack * 2;
        racksPerScalableUnit = 2;
    } else {
        // Single: 2 ToRs in 1 rack
        availablePowerForServers = rackPower - (torPowerKw * 2); // 2 ToRs worth of power
        const serversPerRackByPower = Math.floor((availablePowerForServers * 1000) / serverPower);
        const serversPerRackBySpace = Math.floor((42 - 4) / serverHeight); // Reserve 4U for 2 ToRs
        serversPerRack = Math.max(1, Math.min(serversPerRackByPower, serversPerRackBySpace));
        serversPerScalableUnit = serversPerRack;
        racksPerScalableUnit = 1;
    }
    
    const scalableUnits = Math.ceil(totalServers / serversPerScalableUnit);
    const totalRacks = scalableUnits * racksPerScalableUnit;
    
    const serversPerRackByPower = isSplit ? 
        Math.floor(((rackPower - torPowerKw) * 1000) / serverPower) :
        Math.floor(((rackPower - torPowerKw * 2) * 1000) / serverPower);
    const serversPerRackBySpace = isSplit ? Math.floor((42 - 2) / serverHeight) : Math.floor((42 - 4) / serverHeight);
    const limitedBy = serversPerRackByPower <= serversPerRackBySpace ? 'Power' : 'Space';
    
    const powerPerRack = isSplit ? 
        (serversPerRack * serverPower / 1000) + torPowerKw :
        (serversPerRack * serverPower / 1000) + (torPowerKw * 2);
    
    let layoutInfo = '';
    if (isSplit) {
        layoutInfo = `
            <div class="flex justify-between border-t border-slate-600 pt-2 mt-2"><span class="text-gray-400">Layout:</span><span class="text-purple-400 font-semibold">Split (2 Racks)</span></div>
            <div class="flex justify-between"><span class="text-gray-400">ToRs per Rack:</span><span>1</span></div>
            <div class="flex justify-between"><span class="text-gray-400">Servers per Rack:</span><span>${serversPerRack}</span></div>
            <div class="flex justify-between"><span class="text-gray-400">Servers per Scalable Unit:</span><span class="font-semibold">${serversPerScalableUnit}</span></div>
        `;
    } else {
        layoutInfo = `
            <div class="flex justify-between border-t border-slate-600 pt-2 mt-2"><span class="text-gray-400">Layout:</span><span class="text-blue-400 font-semibold">Single Rack</span></div>
            <div class="flex justify-between"><span class="text-gray-400">ToRs per Rack:</span><span>2</span></div>
            <div class="flex justify-between"><span class="text-gray-400">Servers per Scalable Unit:</span><span class="font-semibold">${serversPerScalableUnit}</span></div>
        `;
    }
    
    document.getElementById('powerPreview').innerHTML = `
        <div class="flex justify-between"><span class="text-gray-400">Server Power:</span><span>${serverPower}W each</span></div>
        <div class="flex justify-between"><span class="text-gray-400">ToR Switch Power:</span><span>${torPower}W each (×2 = ${torPower * 2}W)</span></div>
        <div class="flex justify-between"><span class="text-gray-400">Available for Servers:</span><span>${(availablePowerForServers).toFixed(1)} kW</span></div>
        ${layoutInfo}
        <div class="flex justify-between"><span class="text-gray-400">Limited by:</span><span class="${limitedBy === 'Power' ? 'text-yellow-400' : 'text-blue-400'}">${limitedBy}</span></div>
        <div class="flex justify-between"><span class="text-gray-400">Total Racks Needed:</span><span class="font-semibold">${formatNumber(totalRacks)}</span></div>
        <div class="flex justify-between"><span class="text-gray-400">Power per Rack:</span><span>${powerPerRack.toFixed(1)} kW</span></div>
    `;
}

function updateTimelinePreview() {
    const totalServers = parseInt(document.getElementById('wizardTotalServers').value) || 6000;
    const runRate = parseInt(document.getElementById('wizardRunRate').value) || 250;
    const rackRollRate = parseInt(document.getElementById('wizardRackRollRate').value) || 1000;
    
    const runRateMonths = Math.ceil(totalServers / runRate);
    const rackRollMonths = Math.ceil(totalServers / rackRollRate);
    const timeSaved = runRateMonths - rackRollMonths;
    
    document.getElementById('timelinePreview').innerHTML = `
        <div class="flex justify-between"><span class="text-gray-400">Run Rate Duration:</span><span class="text-blue-400 font-semibold">${runRateMonths} months (${(runRateMonths/12).toFixed(1)} years)</span></div>
        <div class="flex justify-between"><span class="text-gray-400">Rack & Roll Duration:</span><span class="text-purple-400 font-semibold">${rackRollMonths} months (${(rackRollMonths/12).toFixed(1)} years)</span></div>
        <div class="flex justify-between border-t border-slate-600 pt-2 mt-2"><span class="text-gray-400">Time Saved:</span><span class="text-green-400 font-semibold">${timeSaved} months</span></div>
    `;
}

function finishWizard() {
    // Apply wizard values to main form
    const totalServers = document.getElementById('wizardTotalServers').value;
    const workloadType = document.getElementById('wizardWorkloadType').value;
    const rackPower = document.getElementById('wizardRackPower').value;
    const runRate = document.getElementById('wizardRunRate').value;
    const rackRollRate = document.getElementById('wizardRackRollRate').value;
    
    // Set main form values
    document.getElementById('totalServers').value = totalServers;
    document.getElementById('rackPower').value = rackPower;
    document.getElementById('runRate').value = runRate;
    document.getElementById('rackRollRate').value = rackRollRate;
    document.getElementById('networkSpeed').value = selectedNetworkSpeed;
    document.getElementById('rackLayout').value = selectedRackLayout;
    
    // Apply workload preset
    if (workloadType) {
        document.getElementById('workloadType').value = workloadType;
        applyWorkloadPreset();
    }
    
    // Apply network preset
    applyNetworkPreset();
    
    // Update config badges
    updateConfigBadges();
    
    hideWizard();
    calculate();
}

function applyWorkloadPreset() {
    const workloadType = document.getElementById('workloadType').value;
    const preset = workloadPresets[workloadType];
    if (preset) {
        document.getElementById('serverPower').value = preset.serverPower;
        document.getElementById('serverCost').value = preset.serverCost;
        document.getElementById('serverHeight').value = preset.serverHeight;
        document.getElementById('storagePerServer').value = preset.storagePerServer;
        // Set optics per server based on NIC ports (2 optics per link)
        if (preset.nicPorts) {
            document.getElementById('opticsPerServer').value = preset.nicPorts * 2;
        }
        updateBomDisplay(preset);
    } else {
        hideBomDisplay();
    }
    updateConfigBadges();
}

function updateBomDisplay(preset) {
    const bomSection = document.getElementById('bomSection');
    const bomTableBody = document.getElementById('bomTableBody');
    
    if (!preset.bom || preset.bom.length === 0) {
        bomSection.classList.add('hidden');
        return;
    }
    
    bomSection.classList.remove('hidden');
    let html = '';
    
    preset.bom.forEach(item => {
        html += `
            <tr class="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td class="py-2 px-3 font-mono text-xs text-cyan-300">${item.partNumber}</td>
                <td class="py-2 px-3 text-gray-300">${item.description}</td>
                <td class="py-2 px-3 text-right">${item.qty}</td>
            </tr>
        `;
    });
    
    bomTableBody.innerHTML = html;
    lucide.createIcons();
}

function hideBomDisplay() {
    document.getElementById('bomSection').classList.add('hidden');
}

function applyNetworkPreset() {
    const speed = document.getElementById('networkSpeed').value;
    const preset = networkPresets[speed];
    if (preset) {
        document.getElementById('torPorts').value = preset.torPorts;
        document.getElementById('torCost').value = preset.torCost;
        document.getElementById('torPower').value = preset.torPower;
        document.getElementById('serverOpticsCost').value = preset.serverOpticsCost;
        document.getElementById('opticsPerServer').value = preset.opticsPerServer;
        document.getElementById('uplinkOpticsCost').value = preset.uplinkOpticsCost;
        document.getElementById('uplinksPerTor').value = preset.uplinksPerTor;
        document.getElementById('spineCost').value = preset.spineCost;
        document.getElementById('serversPerSpine').value = preset.serversPerSpine;
    }
    updateConfigBadges();
}

function updateConfigBadges() {
    const workloadType = document.getElementById('workloadType').value;
    const networkSpeed = document.getElementById('networkSpeed').value;
    const rackPower = document.getElementById('rackPower').value;
    const rackLayout = document.getElementById('rackLayout').value;
    
    if (workloadType && workloadPresets[workloadType]) {
        document.getElementById('configWorkloadBadge').textContent = workloadPresets[workloadType].name;
    }
    document.getElementById('configNetworkBadge').textContent = networkSpeed.toUpperCase() + ' Network';
    document.getElementById('configPowerBadge').textContent = rackPower + 'kW ' + (rackLayout === 'split' ? '(Split)' : '(Single)');
}

// Get input values
function getInputs() {
    return {
        totalServers: parseInt(document.getElementById('totalServers').value) || 6000,
        serverPower: parseInt(document.getElementById('serverPower').value) || 750,
        serverCost: parseFloat(document.getElementById('serverCost').value) || 8500,
        rackPower: parseFloat(document.getElementById('rackPower').value) || 10,
        rackUnits: parseInt(document.getElementById('rackUnits').value) || 42,
        serverHeight: parseInt(document.getElementById('serverHeight').value) || 1,
        rackCost: parseFloat(document.getElementById('rackCost').value) || 3500,
        rackLayout: document.getElementById('rackLayout').value || 'single',
        torPorts: parseInt(document.getElementById('torPorts').value) || 48,
        torCost: parseFloat(document.getElementById('torCost').value) || 15000,
        torPower: parseFloat(document.getElementById('torPower').value) || 350,
        spineCost: parseFloat(document.getElementById('spineCost').value) || 45000,
        serversPerSpine: parseInt(document.getElementById('serversPerSpine').value) || 500,
        serverOpticsCost: parseFloat(document.getElementById('serverOpticsCost').value) || 150,
        opticsPerServer: parseInt(document.getElementById('opticsPerServer').value) || 2,
        uplinkOpticsCost: parseFloat(document.getElementById('uplinkOpticsCost').value) || 500,
        uplinksPerTor: parseInt(document.getElementById('uplinksPerTor').value) || 4,
        storagePerServer: parseFloat(document.getElementById('storagePerServer').value) || 10,
        vastDriveOption: document.getElementById('vastDriveOption')?.value || '61.4TB',
        runRate: parseInt(document.getElementById('runRate').value) || 250,
        rackRollRate: parseInt(document.getElementById('rackRollRate').value) || 1000,
        rackRollPremium: parseFloat(document.getElementById('rackRollPremium').value) || 25,
        laborCostPerServer: parseFloat(document.getElementById('laborCostPerServer').value) || 50
    };
}

// Main calculation function
function calculate() {
    const inputs = getInputs();
    const isSplit = inputs.rackLayout === 'split';
    
    // Both layouts have 2 ToRs per scalable unit
    // Single: 2 ToRs in 1 rack
    // Split: 1 ToR per rack across 2 racks
    const torPowerKw = inputs.torPower / 1000;
    
    let serversPerRack, serversPerScalableUnit, racksPerScalableUnit, availablePowerForServers;
    let serversPerRackByPower, serversPerRackBySpace;
    
    if (isSplit) {
        // Split: 1 ToR per rack, scalable unit spans 2 racks
        availablePowerForServers = inputs.rackPower - torPowerKw;
        serversPerRackByPower = Math.floor((availablePowerForServers * 1000) / inputs.serverPower);
        serversPerRackBySpace = Math.floor((inputs.rackUnits - 2) / inputs.serverHeight); // Reserve 2U for 1 ToR
        serversPerRack = Math.max(1, Math.min(serversPerRackByPower, serversPerRackBySpace));
        serversPerScalableUnit = serversPerRack * 2;
        racksPerScalableUnit = 2;
    } else {
        // Single: 2 ToRs in 1 rack
        availablePowerForServers = inputs.rackPower - (torPowerKw * 2); // 2 ToRs worth of power
        serversPerRackByPower = Math.floor((availablePowerForServers * 1000) / inputs.serverPower);
        serversPerRackBySpace = Math.floor((inputs.rackUnits - 4) / inputs.serverHeight); // Reserve 4U for 2 ToRs
        serversPerRack = Math.max(1, Math.min(serversPerRackByPower, serversPerRackBySpace));
        serversPerScalableUnit = serversPerRack;
        racksPerScalableUnit = 1;
    }
    
    const rackLimitedBy = serversPerRackByPower <= serversPerRackBySpace ? 'Power' : 'Space';
    
    // Calculate scalable units based on actual capacity
    const scalableUnits = Math.ceil(inputs.totalServers / serversPerScalableUnit);
    const totalRacks = scalableUnits * racksPerScalableUnit;
    
    // 2 ToRs per scalable unit in both layouts
    const torSwitches = scalableUnits * 2;
    
    // Calculate network devices
    const spineSwitches = Math.ceil(inputs.totalServers / inputs.serversPerSpine);
    const totalNetworkDevices = torSwitches + spineSwitches;
    
    // Calculate optics
    const serverOptics = inputs.totalServers * inputs.opticsPerServer;
    const uplinkOptics = torSwitches * inputs.uplinksPerTor * 2;
    const totalOptics = serverOptics + uplinkOptics;
    
    // Calculate VAST EBox storage (no replication factor - VAST handles data protection internally)
    const totalStorageNeeded = inputs.totalServers * inputs.storagePerServer;
    
    // VAST EBox capacities per server (usable TB)
    const vastCapacities = {
        '15.3TB': 100,
        '30.7TB': 200,
        '61.4TB': 350
    };
    const vastUsablePerServer = vastCapacities[inputs.vastDriveOption] || 350;
    const vastServers = inputs.storagePerServer > 0 ? Math.max(STORAGE_CONFIG.minServers, Math.ceil(totalStorageNeeded / vastUsablePerServer)) : 0;
    const vastRacks = Math.ceil(vastServers / STORAGE_CONFIG.serversPerRack);
    const vastSwitches = vastRacks * STORAGE_CONFIG.switchesPerRack;
    const vastServerOptics = vastServers * STORAGE_CONFIG.opticsPerServer;
    const vastSpineOptics = vastSwitches * STORAGE_CONFIG.spineOpticsPerSwitch;
    
    // VAST drive costs per server
    const vastDriveCostsMap = {
        '15.3TB': (8 * STORAGE_PRICING.drives['15.3TB'] + 2 * STORAGE_PRICING.drives['960GB']),
        '30.7TB': (8 * STORAGE_PRICING.drives['30.7TB'] + 2 * STORAGE_PRICING.drives['1.92TB']),
        '61.4TB': (7 * STORAGE_PRICING.drives['61.4TB'] + 3 * STORAGE_PRICING.drives['1.92TB'])
    };
    const vastDriveCostPerServer = vastDriveCostsMap[inputs.vastDriveOption] || vastDriveCostsMap['61.4TB'];
    
    // Legacy compatibility
    const storageNodes = vastServers;
    
    // Calculate power with detailed breakdown
    const totalServerPower = inputs.totalServers * inputs.serverPower / 1000;
    const torSwitchPower = torSwitches * inputs.torPower / 1000;
    const spineSwitchPower = spineSwitches * 0.5; // Estimate 500W per spine
    const networkPowerEstimate = torSwitchPower + spineSwitchPower;
    const storagePowerEstimate = storageNodes * 2;
    const totalPower = totalServerPower + networkPowerEstimate + storagePowerEstimate;
    
    // Power per rack (actual)
    const actualPowerPerRack = totalPower / totalRacks;
    
    // Calculate costs
    const serversCost = inputs.totalServers * inputs.serverCost;
    const racksCost = totalRacks * inputs.rackCost;
    const torCost = torSwitches * inputs.torCost;
    const spinesCost = spineSwitches * inputs.spineCost;
    const networkCost = torCost + spinesCost;
    const serverOpticsCostTotal = serverOptics * inputs.serverOpticsCost;
    const uplinkOpticsCostTotal = uplinkOptics * inputs.uplinkOpticsCost;
    const opticsCost = serverOpticsCostTotal + uplinkOpticsCostTotal;
    
    // VAST EBox storage costs
    const vastServersCost = vastServers * STORAGE_PRICING.serverCost;
    const vastDrivesCost = vastServers * vastDriveCostPerServer;
    const vastSwitchesCost = vastSwitches * STORAGE_PRICING.switchCost;
    const vastServerOpticsCost = vastServerOptics * STORAGE_PRICING.serverOpticsCost;
    const vastSpineOpticsCost = vastSpineOptics * STORAGE_PRICING.spineOpticsCost;
    const storageCost = vastServersCost + vastDrivesCost + vastSwitchesCost + vastServerOpticsCost + vastSpineOpticsCost;
    
    const baseInfraCost = serversCost + racksCost + networkCost + opticsCost + storageCost;
    
    // Timeline calculations
    const runRateMonths = Math.ceil(inputs.totalServers / inputs.runRate);
    const rackRollMonths = Math.ceil(inputs.totalServers / inputs.rackRollRate);
    
    // Labor costs
    const runRateLaborCost = inputs.totalServers * inputs.laborCostPerServer;
    const rackRollLaborCost = inputs.totalServers * inputs.laborCostPerServer * (1 + inputs.rackRollPremium / 100);
    
    // Total costs
    const runRateTotalCost = baseInfraCost + runRateLaborCost;
    const rackRollTotalCost = baseInfraCost + rackRollLaborCost;
    
    calculationResults = {
        inputs, scalableUnits, serversPerRack, serversPerScalableUnit, racksPerScalableUnit,
        totalRacks, torSwitches, spineSwitches, totalNetworkDevices, serverOptics, 
        uplinkOptics, totalOptics, storageNodes, totalStorageNeeded, totalServerPower, 
        networkPowerEstimate, storagePowerEstimate, totalPower, serversCost, racksCost, 
        torCost, spinesCost, networkCost, serverOpticsCostTotal, uplinkOpticsCostTotal, 
        opticsCost, storageCost, baseInfraCost, runRateMonths, rackRollMonths, 
        runRateLaborCost, rackRollLaborCost, runRateTotalCost, rackRollTotalCost, 
        rackLimitedBy, torSwitchPower, actualPowerPerRack, availablePowerForServers, 
        torPowerKw, isSplit,
        // VAST EBox storage details
        vastServers, vastRacks, vastSwitches, vastServerOptics, vastSpineOptics,
        vastUsablePerServer, vastServersCost, vastDrivesCost, vastSwitchesCost,
        vastServerOpticsCost, vastSpineOpticsCost
    };
    
    // Update VAST EBox display in config section
    const vastServersDisplay = document.getElementById('vastServersDisplay');
    const vastRacksDisplay = document.getElementById('vastRacksDisplay');
    const vastCapacityDisplay = document.getElementById('vastCapacityDisplay');
    if (vastServersDisplay) vastServersDisplay.textContent = vastServers.toLocaleString();
    if (vastRacksDisplay) vastRacksDisplay.textContent = vastRacks.toLocaleString();
    if (vastCapacityDisplay) vastCapacityDisplay.textContent = (vastServers * vastUsablePerServer).toLocaleString() + ' TB';
    
    updateScalableUnitsSection();
    updateDeploymentScaleSummary();
    updateNetworkTopologyDiagram();
    updateTimelineSection();
    updateCostsSection();
    updateSummarySection();
    updateAdditionalSections();
}

function updateDeploymentScaleSummary() {
    const r = calculationResults;
    const i = r.inputs;
    
    const container = document.getElementById('deployment-scale-summary');
    if (!container) return;
    
    // Calculate network validation metrics
    const serversPerTor = Math.ceil(r.serversPerScalableUnit / 2);
    const serverPortsPerTor = serversPerTor * (i.opticsPerServer || 2);
    const availableTorPorts = i.torPorts - (i.uplinksPerTor || 4);
    const torUtilization = Math.round((serverPortsPerTor / availableTorPorts) * 100);
    const torOversubscribed = serverPortsPerTor > availableTorPorts;
    
    // Spine oversubscription
    const networkSpeed = selectedNetworkSpeed === '100g' ? 100 : 25;
    const totalServerBandwidth = i.totalServers * networkSpeed; // Gbps
    const spinePortsPerSwitch = 32; // Typical spine port count
    const totalSpineBandwidth = r.spineSwitches * spinePortsPerSwitch * networkSpeed;
    const spineOversubRatio = totalSpineBandwidth > 0 ? (totalServerBandwidth / totalSpineBandwidth).toFixed(1) : 'N/A';
    
    // Network validation display
    const networkValidation = torOversubscribed 
        ? `<div class="col-span-2 md:col-span-5 mt-2 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-sm">
            <div class="flex items-start gap-2">
                <span class="text-red-400">⚠</span>
                <div>
                    <div class="text-red-400 font-medium">ToR Port Density Exceeded</div>
                    <div class="text-gray-400 mt-1">Need ${serverPortsPerTor} server ports per ToR but only ${availableTorPorts} available (${i.torPorts} total - ${i.uplinksPerTor || 4} uplinks)</div>
                    <div class="text-yellow-400 mt-1">→ Reduce servers per rack or increase ToR port count</div>
                </div>
            </div>
           </div>`
        : `<div class="col-span-2 md:col-span-5 mt-2 p-3 bg-green-900/20 border border-green-500/30 rounded-lg text-sm">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div><span class="text-gray-400">ToR Ports:</span> <span class="font-medium text-green-400">${serverPortsPerTor}/${availableTorPorts} (${torUtilization}%)</span></div>
                <div><span class="text-gray-400">Uplinks/ToR:</span> <span class="font-medium">${i.uplinksPerTor || 4}</span></div>
                <div><span class="text-gray-400">Spine Oversub:</span> <span class="font-medium ${parseFloat(spineOversubRatio) > 4 ? 'text-yellow-400' : 'text-green-400'}">${spineOversubRatio}:1</span></div>
                <div><span class="text-gray-400">Network:</span> <span class="font-medium">${networkSpeed}G</span></div>
            </div>
           </div>`;
    
    container.innerHTML = `
        <div class="p-4 bg-gradient-to-br from-cyan-900/40 to-cyan-900/20 rounded-lg border border-cyan-500/30">
            <div class="text-3xl font-bold text-cyan-400">${i.totalServers.toLocaleString()}</div>
            <div class="text-sm text-gray-400">Total Servers</div>
        </div>
        <div class="p-4 bg-gradient-to-br from-purple-900/40 to-purple-900/20 rounded-lg border border-purple-500/30">
            <div class="text-3xl font-bold text-purple-400">${r.totalRacks.toLocaleString()}</div>
            <div class="text-sm text-gray-400">Total Racks</div>
        </div>
        <div class="p-4 bg-gradient-to-br from-green-900/40 to-green-900/20 rounded-lg border border-green-500/30">
            <div class="text-3xl font-bold text-green-400">${r.torSwitches.toLocaleString()}</div>
            <div class="text-sm text-gray-400">ToR Switches</div>
        </div>
        <div class="p-4 bg-gradient-to-br from-orange-900/40 to-orange-900/20 rounded-lg border border-orange-500/30">
            <div class="text-3xl font-bold text-orange-400">${r.spineSwitches.toLocaleString()}</div>
            <div class="text-sm text-gray-400">Spine Switches</div>
        </div>
        <div class="p-4 bg-gradient-to-br from-yellow-900/40 to-yellow-900/20 rounded-lg border border-yellow-500/30">
            <div class="text-3xl font-bold text-yellow-400">${Math.round(r.totalPower).toLocaleString()}</div>
            <div class="text-sm text-gray-400">Total kW</div>
        </div>
        <div class="col-span-2 md:col-span-5 mt-2 p-3 bg-slate-800/50 rounded-lg text-sm">
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div><span class="text-gray-400">Scalable Units:</span> <span class="font-medium text-cyan-400">${r.scalableUnits.toLocaleString()}</span></div>
                <div><span class="text-gray-400">Racks/Unit:</span> <span class="font-medium">${r.racksPerScalableUnit}</span></div>
                <div><span class="text-gray-400">Servers/Rack:</span> <span class="font-medium">${r.serversPerRack}</span></div>
                <div><span class="text-gray-400">Layout:</span> <span class="font-medium ${r.isSplit ? 'text-purple-400' : 'text-cyan-400'}">${r.isSplit ? 'Split' : 'Single'}</span></div>
                <div><span class="text-gray-400">Limited by:</span> <span class="font-medium ${r.rackLimitedBy === 'Power' ? 'text-yellow-400' : 'text-blue-400'}">${r.rackLimitedBy}</span></div>
            </div>
        </div>
        ${networkValidation}
    `;
}

function updateNetworkTopologyDiagram() {
    const r = calculationResults;
    const i = r.inputs;
    
    const container = document.getElementById('network-topology-diagram');
    if (!container) return;
    
    const networkSpeed = selectedNetworkSpeed === '100g' ? '100G' : '25G';
    const isSplit = r.isSplit;
    
    // Simplified topology showing the architecture
    container.innerHTML = `
        <div class="min-w-[500px]">
            <svg viewBox="0 0 500 220" class="w-full">
                <!-- Title -->
                <text x="250" y="15" text-anchor="middle" fill="#22d3ee" font-size="11" font-weight="bold">${isSplit ? 'Split Rack Layout' : 'Single Rack Layout'} - ${networkSpeed} Network</text>
                
                <!-- Spine Layer -->
                <text x="250" y="40" text-anchor="middle" fill="#9ca3af" font-size="10">Spine Layer (${r.spineSwitches} switches)</text>
                <rect x="180" y="45" width="60" height="25" rx="4" fill="#7c3aed" stroke="#8b5cf6" stroke-width="2"/>
                <text x="210" y="62" text-anchor="middle" fill="white" font-size="9">Spine</text>
                <rect x="260" y="45" width="60" height="25" rx="4" fill="#7c3aed" stroke="#8b5cf6" stroke-width="2"/>
                <text x="290" y="62" text-anchor="middle" fill="white" font-size="9">Spine</text>
                
                <!-- Connection lines spine to ToR -->
                <line x1="210" y1="70" x2="150" y2="100" stroke="#6b7280" stroke-width="1.5"/>
                <line x1="210" y1="70" x2="350" y2="100" stroke="#6b7280" stroke-width="1.5"/>
                <line x1="290" y1="70" x2="150" y2="100" stroke="#6b7280" stroke-width="1.5"/>
                <line x1="290" y1="70" x2="350" y2="100" stroke="#6b7280" stroke-width="1.5"/>
                
                <!-- ToR Layer -->
                <text x="250" y="95" text-anchor="middle" fill="#9ca3af" font-size="10">ToR Layer (${r.torSwitches} switches, 2 per scalable unit)</text>
                <rect x="100" y="100" width="100" height="25" rx="4" fill="#059669" stroke="#10b981" stroke-width="2"/>
                <text x="150" y="117" text-anchor="middle" fill="white" font-size="9">ToR A</text>
                <rect x="300" y="100" width="100" height="25" rx="4" fill="#059669" stroke="#10b981" stroke-width="2"/>
                <text x="350" y="117" text-anchor="middle" fill="white" font-size="9">ToR B</text>
                
                <!-- Connection lines ToR to servers -->
                <line x1="150" y1="125" x2="100" y2="155" stroke="#0891b2" stroke-width="1"/>
                <line x1="150" y1="125" x2="150" y2="155" stroke="#0891b2" stroke-width="1"/>
                <line x1="150" y1="125" x2="200" y2="155" stroke="#0891b2" stroke-width="1"/>
                <line x1="350" y1="125" x2="300" y2="155" stroke="#0891b2" stroke-width="1"/>
                <line x1="350" y1="125" x2="350" y2="155" stroke="#0891b2" stroke-width="1"/>
                <line x1="350" y1="125" x2="400" y2="155" stroke="#0891b2" stroke-width="1"/>
                
                <!-- Server Layer -->
                <text x="250" y="150" text-anchor="middle" fill="#9ca3af" font-size="10">Servers (${i.totalServers.toLocaleString()} total, ${r.serversPerRack}/rack)</text>
                
                <!-- Server icons - left rack -->
                <rect x="80" y="155" width="40" height="20" rx="2" fill="#0891b2" stroke="#22d3ee" stroke-width="1"/>
                <rect x="130" y="155" width="40" height="20" rx="2" fill="#0891b2" stroke="#22d3ee" stroke-width="1"/>
                <rect x="180" y="155" width="40" height="20" rx="2" fill="#0891b2" stroke="#22d3ee" stroke-width="1"/>
                
                <!-- Server icons - right rack -->
                <rect x="280" y="155" width="40" height="20" rx="2" fill="#0891b2" stroke="#22d3ee" stroke-width="1"/>
                <rect x="330" y="155" width="40" height="20" rx="2" fill="#0891b2" stroke="#22d3ee" stroke-width="1"/>
                <rect x="380" y="155" width="40" height="20" rx="2" fill="#0891b2" stroke="#22d3ee" stroke-width="1"/>
                
                <!-- Rack labels -->
                ${isSplit ? `
                <text x="150" y="195" text-anchor="middle" fill="#9ca3af" font-size="9">Rack A (${r.serversPerRack} servers)</text>
                <text x="350" y="195" text-anchor="middle" fill="#9ca3af" font-size="9">Rack B (${r.serversPerRack} servers)</text>
                ` : `
                <text x="250" y="195" text-anchor="middle" fill="#9ca3af" font-size="9">Single Rack (${r.serversPerRack} servers + 2 ToRs)</text>
                `}
                
                <!-- Legend -->
                <text x="50" y="215" fill="#6b7280" font-size="8">Uplinks: ${i.uplinksPerTor || 4}/ToR | Scalable Units: ${r.scalableUnits} | Racks: ${r.totalRacks}</text>
            </svg>
        </div>
    `;
}

function updateScalableUnitsSection() {
    const r = calculationResults;
    const i = r.inputs;
    
    document.getElementById('totalScalableUnits').textContent = formatNumber(r.scalableUnits);
    document.getElementById('totalRacks').textContent = formatNumber(r.totalRacks);
    document.getElementById('totalNetworkDevices').textContent = formatNumber(r.totalNetworkDevices);
    document.getElementById('totalStorageNodes').textContent = formatNumber(r.storageNodes);
    
    // Use actual servers per scalable unit for the table
    const tableData = [
        { component: 'Servers', perUnit: r.serversPerScalableUnit, total: i.totalServers, unitCost: i.serverCost, totalCost: r.serversCost },
        { component: 'Racks', perUnit: r.racksPerScalableUnit, total: r.totalRacks, unitCost: i.rackCost, totalCost: r.racksCost },
        { component: 'ToR Switches', perUnit: 2, total: r.torSwitches, unitCost: i.torCost, totalCost: r.torCost },
        { component: 'Spine Switches', perUnit: '-', total: r.spineSwitches, unitCost: i.spineCost, totalCost: r.spinesCost },
        { component: 'Server Optics', perUnit: r.serversPerScalableUnit * i.opticsPerServer, total: r.serverOptics, unitCost: i.serverOpticsCost, totalCost: r.serverOpticsCostTotal },
        { component: 'Uplink Optics', perUnit: '-', total: r.uplinkOptics, unitCost: i.uplinkOpticsCost, totalCost: r.uplinkOpticsCostTotal },
        { component: 'VAST EBox Servers', perUnit: '-', total: r.vastServers, unitCost: STORAGE_PRICING.serverCost, totalCost: r.storageCost }
    ];
    
    document.getElementById('scalableUnitTable').innerHTML = tableData.map(row => `
        <tr class="border-b border-slate-700 hover:bg-slate-700/30">
            <td class="py-3 px-4 font-medium">${row.component}</td>
            <td class="py-3 px-4 text-right">${row.perUnit}</td>
            <td class="py-3 px-4 text-right">${formatNumber(row.total)}</td>
            <td class="py-3 px-4 text-right">${formatCurrency(row.unitCost)}</td>
            <td class="py-3 px-4 text-right font-medium text-green-400">${formatCurrency(row.totalCost)}</td>
        </tr>
    `).join('');
    
    const powerWarning = r.actualPowerPerRack > i.rackPower ? 
        `<div class="mt-2 p-2 bg-red-900/50 border border-red-500 rounded text-sm text-red-300">⚠️ Actual power exceeds rack limit!</div>` : '';
    
    const layoutBadge = r.isSplit ? 
        `<div class="mb-4 p-2 bg-purple-900/30 border border-purple-500/50 rounded text-sm text-purple-300 flex items-center gap-2">
            <span>📐</span> Split Layout: 1 ToR per rack, servers cross-cabled between racks
        </div>` : 
        `<div class="mb-4 p-2 bg-blue-900/30 border border-blue-500/50 rounded text-sm text-blue-300 flex items-center gap-2">
            <span>📦</span> Single Rack: 2 ToRs in 1 rack
        </div>`;
    
    document.getElementById('powerAnalysis').innerHTML = `
        ${layoutBadge}
        <div class="flex justify-between py-2 border-b border-slate-700">
            <span class="text-gray-400">Server Power</span>
            <span class="font-medium">${formatNumber(Math.round(r.totalServerPower))} kW</span>
        </div>
        <div class="flex justify-between py-2 border-b border-slate-700">
            <span class="text-gray-400">ToR Switch Power</span>
            <span class="font-medium">${r.torSwitchPower.toFixed(1)} kW</span>
        </div>
        <div class="flex justify-between py-2 border-b border-slate-700">
            <span class="text-gray-400">Network Power (total)</span>
            <span class="font-medium">${formatNumber(Math.round(r.networkPowerEstimate))} kW</span>
        </div>
        <div class="flex justify-between py-2 border-b border-slate-700">
            <span class="text-gray-400">Storage Power (est.)</span>
            <span class="font-medium">${formatNumber(Math.round(r.storagePowerEstimate))} kW</span>
        </div>
        <div class="flex justify-between py-2 text-lg font-semibold">
            <span>Total Power</span>
            <span class="text-yellow-400">${formatNumber(Math.round(r.totalPower))} kW</span>
        </div>
        <div class="mt-4 p-3 bg-slate-800 rounded-lg">
            <div class="text-sm text-gray-400 mb-1">Rack Power Budget</div>
            <div class="text-xl font-bold">${i.rackPower} kW</div>
            <div class="text-xs text-gray-500 mt-1">${r.isSplit ? '1 ToR' : '2 ToRs'} uses ${r.isSplit ? r.torPowerKw.toFixed(2) : (r.torPowerKw * 2).toFixed(2)} kW, leaving ${r.availablePowerForServers.toFixed(2)} kW for servers</div>
        </div>
        <div class="mt-2 p-3 bg-slate-800 rounded-lg">
            <div class="text-sm text-gray-400 mb-1">Servers per Rack</div>
            <div class="text-xl font-bold">${r.serversPerRack} servers</div>
            <div class="text-xs ${r.rackLimitedBy === 'Power' ? 'text-yellow-400' : 'text-blue-400'} mt-1">Limited by: ${r.rackLimitedBy}</div>
        </div>
        ${r.isSplit ? `
        <div class="mt-2 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
            <div class="text-sm text-gray-400 mb-1">Servers per Scalable Unit</div>
            <div class="text-xl font-bold text-purple-400">${r.serversPerScalableUnit} servers</div>
            <div class="text-xs text-gray-500 mt-1">${r.serversPerRack} servers × 2 racks</div>
        </div>
        ` : ''}
        ${powerWarning}
    `;
}

function updateTimelineSection() {
    const r = calculationResults;
    const i = r.inputs;
    
    document.getElementById('runRateLabel').textContent = `(${formatNumber(i.runRate)}/month)`;
    document.getElementById('rackRollLabel').textContent = `(${formatNumber(i.rackRollRate)}/month)`;
    
    const milestones = [25, 50, 75, 100];
    
    const runRateTimeline = milestones.map(pct => ({
        pct, servers: Math.round(i.totalServers * pct / 100),
        months: Math.ceil((i.totalServers * pct / 100) / i.runRate)
    }));
    
    const rackRollTimeline = milestones.map(pct => ({
        pct, servers: Math.round(i.totalServers * pct / 100),
        months: Math.ceil((i.totalServers * pct / 100) / i.rackRollRate)
    }));
    
    document.getElementById('runRateTimeline').innerHTML = runRateTimeline.map(m => `
        <div class="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <div><span class="text-blue-400 font-semibold">${m.pct}%</span>
            <span class="text-gray-400 ml-2">(${formatNumber(m.servers)} servers)</span></div>
            <div class="text-right"><span class="font-medium">${m.months} months</span></div>
        </div>
    `).join('');
    
    document.getElementById('rackRollTimeline').innerHTML = rackRollTimeline.map(m => `
        <div class="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <div><span class="text-purple-400 font-semibold">${m.pct}%</span>
            <span class="text-gray-400 ml-2">(${formatNumber(m.servers)} servers)</span></div>
            <div class="text-right"><span class="font-medium">${m.months} months</span></div>
        </div>
    `).join('');
    
    const timeSaved = r.runRateMonths - r.rackRollMonths;
    document.getElementById('timelineComparison').innerHTML = `
        <div class="p-4 bg-blue-900/30 rounded-lg border border-blue-700/50">
            <div class="text-sm text-gray-400 mb-1">Run Rate Duration</div>
            <div class="text-2xl font-bold text-blue-400">${r.runRateMonths} months</div>
            <div class="text-sm text-gray-500">${(r.runRateMonths / 12).toFixed(1)} years</div>
        </div>
        <div class="p-4 bg-purple-900/30 rounded-lg border border-purple-700/50">
            <div class="text-sm text-gray-400 mb-1">Rack & Roll Duration</div>
            <div class="text-2xl font-bold text-purple-400">${r.rackRollMonths} months</div>
            <div class="text-sm text-gray-500">${(r.rackRollMonths / 12).toFixed(1)} years</div>
        </div>
        <div class="p-4 bg-green-900/30 rounded-lg border border-green-700/50">
            <div class="text-sm text-gray-400 mb-1">Time Saved</div>
            <div class="text-2xl font-bold text-green-400">${timeSaved} months</div>
            <div class="text-sm text-gray-500">${((timeSaved / r.runRateMonths) * 100).toFixed(0)}% faster</div>
        </div>
    `;
    
    // Progress chart
    const maxMonths = Math.max(r.runRateMonths, r.rackRollMonths);
    let chartHTML = '<div class="space-y-2">';
    for (let month = 1; month <= maxMonths; month++) {
        const runRateProgress = Math.min(100, (month * i.runRate / i.totalServers) * 100);
        const rackRollProgress = Math.min(100, (month * i.rackRollRate / i.totalServers) * 100);
        if (month <= 12 || month === maxMonths || month % 3 === 0) {
            chartHTML += `
                <div class="flex items-center gap-4">
                    <div class="w-16 text-sm text-gray-400">M${month}</div>
                    <div class="flex-1 space-y-1">
                        <div class="h-3 bg-slate-700 rounded-full overflow-hidden">
                            <div class="h-full bg-blue-500 rounded-full" style="width: ${runRateProgress}%"></div>
                        </div>
                        <div class="h-3 bg-slate-700 rounded-full overflow-hidden">
                            <div class="h-full bg-purple-500 rounded-full" style="width: ${rackRollProgress}%"></div>
                        </div>
                    </div>
                    <div class="w-24 text-right text-sm">
                        <div class="text-blue-400">${runRateProgress.toFixed(0)}%</div>
                        <div class="text-purple-400">${rackRollProgress.toFixed(0)}%</div>
                    </div>
                </div>`;
        }
    }
    chartHTML += '</div><div class="flex gap-4 mt-4 text-sm"><span class="flex items-center gap-2"><span class="w-3 h-3 bg-blue-500 rounded"></span>Run Rate</span><span class="flex items-center gap-2"><span class="w-3 h-3 bg-purple-500 rounded"></span>Rack & Roll</span></div>';
    document.getElementById('progressChart').innerHTML = chartHTML;
}

function updateCostsSection() {
    const r = calculationResults;
    const i = r.inputs;
    
    const costItems = [
        { label: 'Servers', cost: r.serversCost },
        { label: 'Racks', cost: r.racksCost },
        { label: 'ToR Switches', cost: r.torCost },
        { label: 'Spine Switches', cost: r.spinesCost },
        { label: 'Server Optics', cost: r.serverOpticsCostTotal },
        { label: 'Uplink Optics', cost: r.uplinkOpticsCostTotal },
        { label: 'VAST EBox Storage', cost: r.storageCost }
    ];
    
    const costItemsHTML = costItems.map(item => `
        <div class="flex justify-between items-center py-2 border-b border-slate-700">
            <span class="text-gray-400">${item.label}</span>
            <span class="font-medium">${formatCurrency(item.cost)}</span>
        </div>
    `).join('');
    
    document.getElementById('runRateCosts').innerHTML = costItemsHTML + `
        <div class="flex justify-between items-center py-2 border-b border-slate-700">
            <span class="text-gray-400">Infrastructure Subtotal</span>
            <span class="font-medium">${formatCurrency(r.baseInfraCost)}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-slate-700">
            <span class="text-gray-400">Labor (${r.runRateMonths} months)</span>
            <span class="font-medium">${formatCurrency(r.runRateLaborCost)}</span>
        </div>
    `;
    document.getElementById('runRateTotalCost').textContent = formatCurrency(r.runRateTotalCost);
    
    document.getElementById('rackRollCosts').innerHTML = costItemsHTML + `
        <div class="flex justify-between items-center py-2 border-b border-slate-700">
            <span class="text-gray-400">Infrastructure Subtotal</span>
            <span class="font-medium">${formatCurrency(r.baseInfraCost)}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-slate-700">
            <span class="text-gray-400">Labor (${r.rackRollMonths} months + ${i.rackRollPremium}% premium)</span>
            <span class="font-medium">${formatCurrency(r.rackRollLaborCost)}</span>
        </div>
    `;
    document.getElementById('rackRollTotalCost').textContent = formatCurrency(r.rackRollTotalCost);
    
    const costDiff = r.rackRollTotalCost - r.runRateTotalCost;
    const costPercentDiff = ((costDiff / r.runRateTotalCost) * 100).toFixed(1);
    const monthlyRunRate = r.runRateTotalCost / r.runRateMonths;
    const monthlyRackRoll = r.rackRollTotalCost / r.rackRollMonths;
    
    document.getElementById('costComparison').innerHTML = `
        <div class="p-4 bg-slate-800 rounded-lg">
            <div class="text-sm text-gray-400 mb-1">Run Rate Total</div>
            <div class="text-xl font-bold text-blue-400">${formatCurrency(r.runRateTotalCost)}</div>
            <div class="text-sm text-gray-500">${formatCurrency(monthlyRunRate)}/month</div>
        </div>
        <div class="p-4 bg-slate-800 rounded-lg">
            <div class="text-sm text-gray-400 mb-1">Rack & Roll Total</div>
            <div class="text-xl font-bold text-purple-400">${formatCurrency(r.rackRollTotalCost)}</div>
            <div class="text-sm text-gray-500">${formatCurrency(monthlyRackRoll)}/month</div>
        </div>
        <div class="p-4 ${costDiff > 0 ? 'bg-red-900/30 border border-red-700/50' : 'bg-green-900/30 border border-green-700/50'} rounded-lg">
            <div class="text-sm text-gray-400 mb-1">Cost Difference</div>
            <div class="text-xl font-bold ${costDiff > 0 ? 'text-red-400' : 'text-green-400'}">${costDiff > 0 ? '+' : ''}${formatCurrency(costDiff)}</div>
            <div class="text-sm text-gray-500">${costDiff > 0 ? '+' : ''}${costPercentDiff}% for Rack & Roll</div>
        </div>
        <div class="p-4 bg-slate-800 rounded-lg">
            <div class="text-sm text-gray-400 mb-1">Cost per Server</div>
            <div class="text-xl font-bold">${formatCurrency(r.runRateTotalCost / i.totalServers)}</div>
            <div class="text-sm text-gray-500">Run Rate avg</div>
        </div>
    `;
    
    // Add migration efficiency cost comparison if data available
    const migrationData = getMigrationEfficiencyData();
    if (migrationData) {
        document.getElementById('costComparison').innerHTML += `
            <div class="p-4 bg-slate-800 rounded-lg lg:col-span-4 mt-4 border-t-2 border-green-500/50">
                <div class="text-sm text-gray-400 mb-3 flex items-center gap-2">
                    <i data-lucide="zap" class="w-4 h-4 text-green-400"></i>
                    Migration Efficiency - Old Hardware Costs During Migration
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="p-3 bg-slate-700/50 rounded-lg">
                        <div class="text-xs text-gray-400">Run Rate Old HW Cost</div>
                        <div class="text-lg font-bold text-blue-400">${formatCurrency(migrationData.runRateTotalOldHwCost)}</div>
                        <div class="text-xs text-gray-500">${migrationData.runRateDuration} months</div>
                    </div>
                    <div class="p-3 bg-slate-700/50 rounded-lg">
                        <div class="text-xs text-gray-400">R&R Old HW Cost</div>
                        <div class="text-lg font-bold text-purple-400">${formatCurrency(migrationData.rackRollTotalOldHwCost)}</div>
                        <div class="text-xs text-gray-500">${migrationData.rackRollDuration} months</div>
                    </div>
                    <div class="p-3 bg-slate-700/50 rounded-lg">
                        <div class="text-xs text-gray-400">R&R Premium Cost</div>
                        <div class="text-lg font-bold text-yellow-400">${formatCurrency(migrationData.rackRollPremiumCost)}</div>
                        <div class="text-xs text-gray-500">expedited deployment</div>
                    </div>
                    <div class="p-3 ${migrationData.isRackRollBetter ? 'bg-green-900/30 border border-green-700/50' : 'bg-cyan-900/30 border border-cyan-700/50'} rounded-lg">
                        <div class="text-xs text-gray-400">Net Savings (R&R)</div>
                        <div class="text-lg font-bold ${migrationData.netSavings >= 0 ? 'text-green-400' : 'text-red-400'}">${migrationData.netSavings >= 0 ? '+' : ''}${formatCurrency(migrationData.netSavings)}</div>
                        <div class="text-xs ${migrationData.isRackRollBetter ? 'text-green-400' : 'text-cyan-400'}">${migrationData.isRackRollBetter ? 'R&R recommended' : 'Run Rate recommended'}</div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    }
    
    // Monthly budget table
    const maxMonths = Math.max(r.runRateMonths, r.rackRollMonths);
    let tableHTML = '';
    let runRateCumulative = 0, rackRollCumulative = 0;
    
    for (let month = 1; month <= maxMonths; month++) {
        const runRateSpend = month <= r.runRateMonths ? (r.runRateTotalCost / r.runRateMonths) : 0;
        const rackRollSpend = month <= r.rackRollMonths ? (r.rackRollTotalCost / r.rackRollMonths) : 0;
        runRateCumulative += runRateSpend;
        rackRollCumulative += rackRollSpend;
        
        if (month <= 12 || month === maxMonths || month % 6 === 0) {
            tableHTML += `
                <tr class="border-b border-slate-700 hover:bg-slate-700/30">
                    <td class="py-2 px-4">Month ${month}</td>
                    <td class="py-2 px-4 text-right ${runRateSpend === 0 ? 'text-gray-500' : ''}">${formatCurrency(runRateSpend)}</td>
                    <td class="py-2 px-4 text-right text-blue-400">${formatCurrency(runRateCumulative)}</td>
                    <td class="py-2 px-4 text-right ${rackRollSpend === 0 ? 'text-gray-500' : ''}">${formatCurrency(rackRollSpend)}</td>
                    <td class="py-2 px-4 text-right text-purple-400">${formatCurrency(rackRollCumulative)}</td>
                </tr>`;
        }
    }
    document.getElementById('monthlyBudgetTable').innerHTML = tableHTML;
}

// Helper function to get migration efficiency data for use in Summary and Costs
function getMigrationEfficiencyData() {
    // Get total servers to migrate
    let totalServers = 0;
    if (existingInfrastructure && existingInfrastructure.servers) {
        totalServers = existingInfrastructure.servers.length;
    } else if (calculationResults.totalServers) {
        totalServers = calculationResults.totalServers;
    }
    
    if (totalServers === 0) return null;
    
    // Get inputs (with fallbacks)
    const oldServerPower = parseFloat(document.getElementById('oldServerPower')?.value || 500);
    const powerCost = parseFloat(document.getElementById('migrationPowerCost')?.value || 0.10);
    const runRate = parseInt(document.getElementById('runRateServers')?.value || 250);
    const rackRollRate = parseInt(document.getElementById('rackRollServers')?.value || 500);
    const rackRollPremium = parseFloat(document.getElementById('rackRollPremium')?.value || 15) / 100;
    const pue = parseFloat(document.getElementById('migrationPUE')?.value || 1.5);
    const maintCost = parseFloat(document.getElementById('oldHardwareMaint')?.value || 50);
    
    // Calculate migration durations (in months)
    const runRateDuration = Math.ceil(totalServers / runRate);
    const rackRollDuration = Math.ceil(totalServers / rackRollRate);
    const timeSaved = runRateDuration - rackRollDuration;
    
    // Power cost per server per month
    const hoursPerMonth = 730;
    const powerCostPerServerMonth = (oldServerPower * hoursPerMonth * pue * powerCost) / 1000;
    const avgServersRunning = totalServers / 2;
    
    // Run Rate costs
    const runRatePowerCost = avgServersRunning * powerCostPerServerMonth * runRateDuration;
    const runRateMaintCost = avgServersRunning * maintCost * runRateDuration;
    const runRateTotalOldHwCost = runRatePowerCost + runRateMaintCost;
    
    // Rack & Roll costs
    const rackRollPowerCost = avgServersRunning * powerCostPerServerMonth * rackRollDuration;
    const rackRollMaintCost = avgServersRunning * maintCost * rackRollDuration;
    const rackRollTotalOldHwCost = rackRollPowerCost + rackRollMaintCost;
    
    // Premium cost
    const newServerCost = calculationResults.inputs?.serverCost || 15000;
    const rackRollPremiumCost = totalServers * newServerCost * rackRollPremium;
    
    // Savings analysis
    const oldHwSavings = runRateTotalOldHwCost - rackRollTotalOldHwCost;
    const netSavings = oldHwSavings - rackRollPremiumCost;
    const isRackRollBetter = netSavings > 0;
    const breakEvenPremium = (oldHwSavings / (totalServers * newServerCost)) * 100;
    
    return {
        totalServers,
        runRateDuration,
        rackRollDuration,
        timeSaved,
        runRateTotalOldHwCost,
        rackRollTotalOldHwCost,
        rackRollPremiumCost,
        oldHwSavings,
        netSavings,
        isRackRollBetter,
        breakEvenPremium,
        powerCostPerServerMonth
    };
}

function updateSummarySection() {
    const r = calculationResults;
    const i = r.inputs;
    const timeSaved = r.runRateMonths - r.rackRollMonths;
    const costDiff = r.rackRollTotalCost - r.runRateTotalCost;
    
    // Get migration efficiency data if available
    const migrationData = getMigrationEfficiencyData();
    
    let migrationSummaryHTML = '';
    if (migrationData) {
        migrationSummaryHTML = `
            <div class="p-4 bg-slate-800 rounded-lg border-l-4 ${migrationData.isRackRollBetter ? 'border-green-500' : 'border-cyan-500'}">
                <h3 class="font-semibold text-lg mb-2">Migration Efficiency Analysis</h3>
                <p class="text-gray-300">Migrating <strong>${formatNumber(migrationData.totalServers)} servers</strong> from legacy hardware.</p>
                <ul class="text-gray-300 space-y-1 mt-2">
                    <li>• Run Rate: ${migrationData.runRateDuration} months, ${formatCurrency(migrationData.runRateTotalOldHwCost)} old HW cost</li>
                    <li>• Rack & Roll: ${migrationData.rackRollDuration} months, ${formatCurrency(migrationData.rackRollTotalOldHwCost)} old HW cost + ${formatCurrency(migrationData.rackRollPremiumCost)} premium</li>
                    <li>• <strong class="${migrationData.netSavings >= 0 ? 'text-green-400' : 'text-red-400'}">Net ${migrationData.netSavings >= 0 ? 'Savings' : 'Cost'}: ${formatCurrency(Math.abs(migrationData.netSavings))}</strong> with Rack & Roll</li>
                </ul>
                <p class="text-sm mt-2 ${migrationData.isRackRollBetter ? 'text-green-400' : 'text-cyan-400'}">
                    <strong>Recommendation:</strong> ${migrationData.isRackRollBetter ? 'Rack & Roll' : 'Run Rate'} is more cost-effective for this migration.
                </p>
            </div>
        `;
    }
    
    document.getElementById('executiveSummary').innerHTML = `
        <div class="space-y-4">
            <div class="p-4 bg-slate-800 rounded-lg">
                <h3 class="font-semibold text-lg mb-2">Project Overview</h3>
                <p class="text-gray-300">Refresh of <strong>${formatNumber(i.totalServers)} servers</strong> requiring 
                <strong>${formatNumber(r.totalRacks)} racks</strong>, <strong>${formatNumber(r.totalNetworkDevices)} network devices</strong>, 
                and <strong>${formatNumber(r.storageNodes)} storage nodes</strong> for a total of 
                <strong>${formatNumber(Math.round(r.totalStorageNeeded))} TB</strong> raw storage capacity.</p>
            </div>
            <div class="p-4 bg-slate-800 rounded-lg">
                <h3 class="font-semibold text-lg mb-2">Power Requirements</h3>
                <p class="text-gray-300">Total power consumption: <strong>${formatNumber(Math.round(r.totalPower))} kW</strong> 
                (${(r.totalPower / 1000).toFixed(2)} MW). Average rack density: <strong>${(r.totalPower / r.totalRacks).toFixed(1)} kW/rack</strong>.</p>
            </div>
            <div class="p-4 bg-slate-800 rounded-lg">
                <h3 class="font-semibold text-lg mb-2">Budget Summary</h3>
                <ul class="text-gray-300 space-y-1">
                    <li>• Infrastructure Cost: <strong>${formatCurrency(r.baseInfraCost)}</strong></li>
                    <li>• Run Rate Total (${r.runRateMonths} months): <strong>${formatCurrency(r.runRateTotalCost)}</strong></li>
                    <li>• Rack & Roll Total (${r.rackRollMonths} months): <strong>${formatCurrency(r.rackRollTotalCost)}</strong></li>
                </ul>
            </div>
            ${migrationSummaryHTML}
        </div>
    `;
    
    const betterOption = costDiff > 0 ? 'Run Rate' : 'Rack & Roll';
    const savings = Math.abs(costDiff);
    
    document.getElementById('recommendation').innerHTML = `
        <div class="p-4 ${costDiff > 0 ? 'bg-blue-900/30 border border-blue-700/50' : 'bg-purple-900/30 border border-purple-700/50'} rounded-lg">
            <div class="text-lg font-semibold mb-2">${betterOption} Recommended</div>
            <p class="text-gray-300 text-sm">Based on total cost, ${betterOption} saves <strong>${formatCurrency(savings)}</strong>.</p>
        </div>
        <div class="p-4 bg-slate-800 rounded-lg">
            <div class="font-semibold mb-2">Time vs Cost Trade-off</div>
            <p class="text-gray-300 text-sm">Rack & Roll completes <strong>${timeSaved} months faster</strong> 
            at an additional cost of <strong>${formatCurrency(costDiff > 0 ? costDiff : 0)}</strong>.</p>
            <p class="text-gray-400 text-xs mt-2">Cost per month saved: ${formatCurrency(timeSaved > 0 ? costDiff / timeSaved : 0)}</p>
        </div>
    `;
    
    // Resource requirements
    const techsNeededRunRate = Math.ceil(i.runRate / 50);
    const techsNeededRackRoll = Math.ceil(i.rackRollRate / 50);
    
    document.getElementById('resourceRequirements').innerHTML = `
        <div class="p-4 bg-slate-800 rounded-lg">
            <div class="font-semibold mb-2 text-blue-400">Run Rate Resources</div>
            <ul class="text-gray-300 text-sm space-y-1">
                <li>• Technicians needed: ~${techsNeededRunRate}</li>
                <li>• Monthly server throughput: ${formatNumber(i.runRate)}</li>
                <li>• Project duration: ${r.runRateMonths} months</li>
                <li>• Monthly budget: ${formatCurrency(r.runRateTotalCost / r.runRateMonths)}</li>
            </ul>
        </div>
        <div class="p-4 bg-slate-800 rounded-lg">
            <div class="font-semibold mb-2 text-purple-400">Rack & Roll Resources</div>
            <ul class="text-gray-300 text-sm space-y-1">
                <li>• Technicians needed: ~${techsNeededRackRoll}</li>
                <li>• Monthly server throughput: ${formatNumber(i.rackRollRate)}</li>
                <li>• Project duration: ${r.rackRollMonths} months</li>
                <li>• Monthly budget: ${formatCurrency(r.rackRollTotalCost / r.rackRollMonths)}</li>
            </ul>
        </div>
    `;
    
    document.getElementById('riskAssessment').innerHTML = `
        <div class="p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
            <div class="font-semibold text-yellow-400">Supply Chain</div>
            <p class="text-sm text-gray-300">Lead times for ${formatNumber(i.totalServers)} servers and ${formatNumber(r.totalNetworkDevices)} network devices may vary.</p>
        </div>
        <div class="p-3 bg-orange-900/30 border border-orange-700/50 rounded-lg">
            <div class="font-semibold text-orange-400">Power Capacity</div>
            <p class="text-sm text-gray-300">${formatNumber(Math.round(r.totalPower))} kW required. Verify datacenter capacity.</p>
        </div>
        <div class="p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
            <div class="font-semibold text-red-400">Staffing</div>
            <p class="text-sm text-gray-300">Rack & Roll requires ${techsNeededRackRoll - techsNeededRunRate} additional technicians vs Run Rate.</p>
        </div>
    `;
}

// Export functions
function exportToJSON() {
    const data = { inputs: calculationResults.inputs, results: calculationResults, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'infrastructure-plan.json');
}

function exportToCSV() {
    const r = calculationResults;
    const i = r.inputs;
    let csv = 'Category,Item,Value\n';
    csv += `Configuration,Total Servers,${i.totalServers}\n`;
    csv += `Configuration,Servers per Unit,${i.serversPerUnit}\n`;
    csv += `Configuration,Server Power (W),${i.serverPower}\n`;
    csv += `Configuration,Server Cost,$${i.serverCost}\n`;
    csv += `Results,Scalable Units,${r.scalableUnits}\n`;
    csv += `Results,Total Racks,${r.totalRacks}\n`;
    csv += `Results,ToR Switches,${r.torSwitches}\n`;
    csv += `Results,Spine Switches,${r.spineSwitches}\n`;
    csv += `Results,Storage Nodes,${r.storageNodes}\n`;
    csv += `Results,Total Power (kW),${Math.round(r.totalPower)}\n`;
    csv += `Costs,Servers,$${r.serversCost}\n`;
    csv += `Costs,Racks,$${r.racksCost}\n`;
    csv += `Costs,Network,$${r.networkCost}\n`;
    csv += `Costs,Optics,$${r.opticsCost}\n`;
    csv += `Costs,Storage,$${r.storageCost}\n`;
    csv += `Costs,Run Rate Total,$${r.runRateTotalCost}\n`;
    csv += `Costs,Rack & Roll Total,$${r.rackRollTotalCost}\n`;
    csv += `Timeline,Run Rate Months,${r.runRateMonths}\n`;
    csv += `Timeline,Rack & Roll Months,${r.rackRollMonths}\n`;
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, 'infrastructure-plan.csv');
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function printSummary() {
    window.print();
}

// Save/Load Configuration Functions
function saveConfiguration(name) {
    const config = {
        name: name || `Config ${new Date().toLocaleDateString()}`,
        timestamp: new Date().toISOString(),
        inputs: getInputs(),
        workloadType: document.getElementById('workloadType').value,
        networkSpeed: document.getElementById('networkSpeed').value,
        rackLayout: document.getElementById('rackLayout').value
    };
    savedConfigurations.push(config);
    localStorage.setItem('infraPlannerConfigs', JSON.stringify(savedConfigurations));
    updateSavedConfigsList();
    return config;
}

function loadConfiguration(index) {
    const config = savedConfigurations[index];
    if (!config) return;
    
    // Set all input values
    Object.entries(config.inputs).forEach(([key, value]) => {
        const el = document.getElementById(key);
        if (el) el.value = value;
    });
    
    if (config.workloadType) {
        document.getElementById('workloadType').value = config.workloadType;
        applyWorkloadPreset();
    }
    if (config.networkSpeed) {
        document.getElementById('networkSpeed').value = config.networkSpeed;
        applyNetworkPreset();
    }
    if (config.rackLayout) {
        document.getElementById('rackLayout').value = config.rackLayout;
    }
    
    calculate();
    updateConfigBadges();
}

function deleteConfiguration(index) {
    savedConfigurations.splice(index, 1);
    localStorage.setItem('infraPlannerConfigs', JSON.stringify(savedConfigurations));
    updateSavedConfigsList();
}

function updateSavedConfigsList() {
    const container = document.getElementById('savedConfigsList');
    if (!container) return;
    
    if (savedConfigurations.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">No saved configurations</p>';
        return;
    }
    
    container.innerHTML = savedConfigurations.map((config, i) => `
        <div class="flex items-center justify-between p-2 bg-slate-800 rounded-lg">
            <div>
                <div class="font-medium text-sm">${config.name}</div>
                <div class="text-xs text-gray-500">${new Date(config.timestamp).toLocaleString()}</div>
            </div>
            <div class="flex gap-2">
                <button onclick="loadConfiguration(${i})" class="px-2 py-1 bg-cyan-600 hover:bg-cyan-700 rounded text-xs">Load</button>
                <button onclick="deleteConfiguration(${i})" class="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs">Delete</button>
            </div>
        </div>
    `).join('');
}

function shareConfiguration() {
    copyShareableURL();
}

function copyShareableURL() {
    const config = {
        inputs: getInputs(),
        workloadType: document.getElementById('workloadType').value,
        networkSpeed: document.getElementById('networkSpeed').value,
        rackLayout: document.getElementById('rackLayout').value
    };
    const encoded = btoa(JSON.stringify(config));
    const url = `${window.location.origin}${window.location.pathname}?config=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
        const btn = document.getElementById('shareBtn');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Copied!';
            btn.classList.add('bg-green-600');
            btn.classList.remove('bg-cyan-700');
            lucide.createIcons();
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('bg-green-600');
                btn.classList.add('bg-cyan-700');
                lucide.createIcons();
            }, 2000);
        }
    });
}

function setPresetServers(count) {
    document.getElementById('totalServers').value = count;
    document.getElementById('wizardTotalServers').value = count;
    calculate();
}

function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const configParam = params.get('config');
    if (configParam) {
        try {
            const config = JSON.parse(atob(configParam));
            Object.entries(config.inputs).forEach(([key, value]) => {
                const el = document.getElementById(key);
                if (el) el.value = value;
            });
            if (config.workloadType) {
                document.getElementById('workloadType').value = config.workloadType;
            }
            if (config.networkSpeed) {
                document.getElementById('networkSpeed').value = config.networkSpeed;
            }
            if (config.rackLayout) {
                document.getElementById('rackLayout').value = config.rackLayout;
            }
            hideWizard();
            applyWorkloadPreset();
            applyNetworkPreset();
            calculate();
        } catch (e) {
            console.error('Failed to load config from URL:', e);
        }
    }
}

// Validation and Warnings
function getValidationWarnings() {
    const warnings = [];
    const r = calculationResults;
    const i = r.inputs;
    
    // ToR port utilization check
    const portsNeededPerTor = Math.ceil(r.serversPerScalableUnit / 2) * (i.opticsPerServer / 2);
    const availableTorPorts = i.torPorts - i.uplinksPerTor;
    if (portsNeededPerTor > availableTorPorts) {
        warnings.push({
            type: 'error',
            title: 'ToR Port Oversubscription',
            message: `Need ${portsNeededPerTor} server ports per ToR but only ${availableTorPorts} available (${i.torPorts} total - ${i.uplinksPerTor} uplinks)`
        });
    }
    
    // Spine oversubscription check
    const totalServerBandwidth = i.totalServers * (i.opticsPerServer / 2) * (selectedNetworkSpeed === '100g' ? 100 : 25);
    const totalSpineBandwidth = r.spineSwitches * 32 * (selectedNetworkSpeed === '100g' ? 100 : 25); // Assume 32 ports per spine
    const oversubscriptionRatio = totalServerBandwidth / totalSpineBandwidth;
    if (oversubscriptionRatio > 4) {
        warnings.push({
            type: 'warning',
            title: 'High Spine Oversubscription',
            message: `${oversubscriptionRatio.toFixed(1)}:1 oversubscription ratio. Consider adding more spine switches.`
        });
    }
    
    // Power warning
    if (r.actualPowerPerRack > i.rackPower * 0.9) {
        warnings.push({
            type: 'warning',
            title: 'Near Power Limit',
            message: `Rack power utilization at ${((r.actualPowerPerRack / i.rackPower) * 100).toFixed(0)}% of capacity`
        });
    }
    
    return warnings;
}

function displayValidationWarnings() {
    const warnings = getValidationWarnings();
    const container = document.getElementById('validationWarnings');
    if (!container) return;
    
    if (warnings.length === 0) {
        container.innerHTML = '<div class="p-3 bg-green-900/30 border border-green-700/50 rounded-lg text-green-400 text-sm flex items-center gap-2"><i data-lucide="check-circle" class="w-4 h-4"></i>All validations passed</div>';
    } else {
        container.innerHTML = warnings.map(w => `
            <div class="p-3 ${w.type === 'error' ? 'bg-red-900/30 border-red-700/50' : 'bg-yellow-900/30 border-yellow-700/50'} border rounded-lg text-sm">
                <div class="font-semibold ${w.type === 'error' ? 'text-red-400' : 'text-yellow-400'}">${w.title}</div>
                <div class="text-gray-300">${w.message}</div>
            </div>
        `).join('');
    }
    lucide.createIcons();
}

// Network Topology Analysis
function calculateNetworkTopology() {
    const r = calculationResults;
    const i = r.inputs;
    
    const serverLinksPerTor = Math.ceil(r.serversPerScalableUnit / 2) * (i.opticsPerServer / 2);
    const uplinkBandwidth = i.uplinksPerTor * (selectedNetworkSpeed === '100g' ? 100 : 25);
    const serverBandwidth = serverLinksPerTor * (selectedNetworkSpeed === '100g' ? 100 : 25);
    const torOversubscription = serverBandwidth / uplinkBandwidth;
    
    const totalSpinePorts = r.spineSwitches * 64; // Assume 64-port spines
    const usedSpinePorts = r.torSwitches * i.uplinksPerTor;
    const spineUtilization = (usedSpinePorts / totalSpinePorts) * 100;
    
    return {
        serverLinksPerTor,
        uplinkBandwidth,
        serverBandwidth,
        torOversubscription,
        totalSpinePorts,
        usedSpinePorts,
        spineUtilization,
        totalFabricBandwidth: r.spineSwitches * 64 * (selectedNetworkSpeed === '100g' ? 100 : 25) / 1000 // Tbps
    };
}

// Cabling Estimates
function calculateCabling() {
    const r = calculationResults;
    const i = r.inputs;
    
    // Server to ToR cables (within rack, use DAC)
    const serverToTorCables = i.totalServers * (i.opticsPerServer / 2);
    const serverToTorLength = serverToTorCables * AVG_RACK_TO_TOR_LENGTH;
    const serverToTorCost = serverToTorLength * CABLE_COST_PER_METER_DAC;
    
    // ToR to Spine cables (longer runs, may need AOC)
    const torToSpineCables = r.torSwitches * i.uplinksPerTor;
    const torToSpineLength = torToSpineCables * AVG_TOR_TO_SPINE_LENGTH;
    const useAOC = AVG_TOR_TO_SPINE_LENGTH > DAC_MAX_LENGTH;
    const torToSpineCost = torToSpineLength * (useAOC ? CABLE_COST_PER_METER_AOC : CABLE_COST_PER_METER_DAC);
    
    return {
        serverToTorCables,
        serverToTorLength,
        serverToTorCost,
        serverToTorType: 'DAC',
        torToSpineCables,
        torToSpineLength,
        torToSpineCost,
        torToSpineType: useAOC ? 'AOC' : 'DAC',
        totalCables: serverToTorCables + torToSpineCables,
        totalLength: serverToTorLength + torToSpineLength,
        totalCost: serverToTorCost + torToSpineCost
    };
}

// Power Efficiency Metrics
function calculatePowerEfficiency() {
    const r = calculationResults;
    const i = r.inputs;
    const pue = parseFloat(document.getElementById('pueValue')?.value) || 1.5;
    const powerCostPerKwh = parseFloat(document.getElementById('powerCostPerKwh')?.value) || 0.10;
    
    const itPower = r.totalPower;
    const facilityPower = itPower * pue;
    const coolingOverhead = facilityPower - itPower;
    
    const annualKwh = facilityPower * 24 * 365;
    const annualPowerCost = annualKwh * powerCostPerKwh;
    const monthlyPowerCost = annualPowerCost / 12;
    
    return {
        pue,
        itPower,
        facilityPower,
        coolingOverhead,
        annualKwh,
        annualPowerCost,
        monthlyPowerCost,
        powerCostPerServer: annualPowerCost / i.totalServers
    };
}

// Comparison Mode
function enableComparisonMode() {
    comparisonMode = true;
    document.getElementById('comparisonPanel')?.classList.remove('hidden');
}

function disableComparisonMode() {
    comparisonMode = false;
    comparisonWorkload = null;
    document.getElementById('comparisonPanel')?.classList.add('hidden');
}

function setComparisonWorkload(workloadType) {
    comparisonWorkload = workloadType;
    updateComparisonDisplay();
}

function updateComparisonDisplay() {
    if (!comparisonMode || !comparisonWorkload) return;
    
    const container = document.getElementById('comparisonResults');
    if (!container) return;
    
    const currentWorkload = document.getElementById('workloadType').value;
    const current = workloadPresets[currentWorkload];
    const compare = workloadPresets[comparisonWorkload];
    
    if (!current || !compare) return;
    
    const currentInputs = getInputs();
    
    // Calculate for comparison workload
    const compareInputs = { ...currentInputs };
    compareInputs.serverPower = compare.serverPower;
    compareInputs.serverCost = compare.serverCost;
    compareInputs.serverHeight = compare.serverHeight;
    compareInputs.storagePerServer = compare.storagePerServer;
    
    const comparisons = [
        { label: 'Server Power', current: current.serverPower + 'W', compare: compare.serverPower + 'W', diff: compare.serverPower - current.serverPower },
        { label: 'Server Cost', current: '$' + current.serverCost.toLocaleString(), compare: '$' + compare.serverCost.toLocaleString(), diff: compare.serverCost - current.serverCost },
        { label: 'Height', current: current.serverHeight + 'U', compare: compare.serverHeight + 'U', diff: compare.serverHeight - current.serverHeight },
        { label: 'Storage/Server', current: current.storagePerServer + 'TB', compare: compare.storagePerServer + 'TB', diff: compare.storagePerServer - current.storagePerServer }
    ];
    
    container.innerHTML = `
        <div class="text-sm font-semibold mb-3">${current.name} vs ${compare.name}</div>
        <table class="w-full text-sm">
            <thead><tr class="border-b border-slate-600">
                <th class="text-left py-2">Metric</th>
                <th class="text-right py-2 text-cyan-400">${current.name}</th>
                <th class="text-right py-2 text-purple-400">${compare.name}</th>
                <th class="text-right py-2">Diff</th>
            </tr></thead>
            <tbody>
                ${comparisons.map(c => `
                    <tr class="border-b border-slate-700">
                        <td class="py-2 text-gray-400">${c.label}</td>
                        <td class="py-2 text-right">${c.current}</td>
                        <td class="py-2 text-right">${c.compare}</td>
                        <td class="py-2 text-right ${c.diff > 0 ? 'text-red-400' : c.diff < 0 ? 'text-green-400' : ''}">${c.diff > 0 ? '+' : ''}${typeof c.diff === 'number' ? c.diff.toLocaleString() : c.diff}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Custom Workload Builder
function openCustomWorkloadBuilder() {
    document.getElementById('customWorkloadModal')?.classList.remove('hidden');
}

function closeCustomWorkloadBuilder() {
    document.getElementById('customWorkloadModal')?.classList.add('hidden');
}

function saveCustomWorkload() {
    const name = document.getElementById('customWorkloadName')?.value;
    if (!name) {
        alert('Please enter a workload name');
        return;
    }
    
    const customWorkload = {
        name: name,
        serverPower: parseInt(document.getElementById('customServerPower')?.value) || 500,
        serverCost: parseFloat(document.getElementById('customServerCost')?.value) || 10000,
        serverHeight: parseInt(document.getElementById('customServerHeight')?.value) || 1,
        storagePerServer: parseFloat(document.getElementById('customStoragePerServer')?.value) || 10,
        networkSpeed: document.getElementById('customNetworkSpeed')?.value || '25g',
        nicPorts: parseInt(document.getElementById('customNicPorts')?.value) || 2,
        description: document.getElementById('customDescription')?.value || 'Custom workload',
        specs: {
            chassis: document.getElementById('customChassis')?.value || 'Custom',
            cpu: document.getElementById('customCpu')?.value || 'Custom CPU',
            ram: document.getElementById('customRam')?.value || 'Custom RAM',
            nic: document.getElementById('customNic')?.value || 'Custom NIC'
        },
        bom: [],
        isCustom: true
    };
    
    const key = 'custom_' + name.toLowerCase().replace(/\s+/g, '_');
    workloadPresets[key] = customWorkload;
    
    // Save to localStorage
    const customWorkloads = JSON.parse(localStorage.getItem('customWorkloads') || '{}');
    customWorkloads[key] = customWorkload;
    localStorage.setItem('customWorkloads', JSON.stringify(customWorkloads));
    
    // Add to dropdown
    addWorkloadToDropdowns(key, customWorkload.name);
    
    closeCustomWorkloadBuilder();
    alert('Custom workload saved!');
}

function loadCustomWorkloads() {
    const customWorkloads = JSON.parse(localStorage.getItem('customWorkloads') || '{}');
    Object.entries(customWorkloads).forEach(([key, workload]) => {
        workloadPresets[key] = workload;
        addWorkloadToDropdowns(key, workload.name);
    });
}

function addWorkloadToDropdowns(key, name) {
    ['workloadType', 'wizardWorkloadType', 'comparisonWorkloadSelect'].forEach(id => {
        const select = document.getElementById(id);
        if (select && !select.querySelector(`option[value="${key}"]`)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = name + ' (Custom)';
            select.appendChild(option);
        }
    });
}

// Multi-Site Planning
let sites = [{ name: 'Primary Site', servers: 1000, multiplier: 1.0 }];

function addSite() {
    sites.push({ name: `Site ${sites.length + 1}`, servers: 500, multiplier: 1.0 });
    updateSitesDisplay();
}

function removeSite(index) {
    if (sites.length > 1) {
        sites.splice(index, 1);
        updateSitesDisplay();
    }
}

function updateSitesDisplay() {
    const container = document.getElementById('sitesContainer');
    if (!container) return;
    
    container.innerHTML = sites.map((site, i) => `
        <div class="p-3 bg-slate-800 rounded-lg flex items-center gap-4">
            <input type="text" value="${site.name}" onchange="sites[${i}].name = this.value" class="input-field px-2 py-1 rounded text-sm w-32">
            <div class="flex items-center gap-2">
                <label class="text-xs text-gray-400">Servers:</label>
                <input type="number" value="${site.servers}" onchange="sites[${i}].servers = parseInt(this.value); calculateMultiSite()" class="input-field px-2 py-1 rounded text-sm w-24">
            </div>
            <div class="flex items-center gap-2">
                <label class="text-xs text-gray-400">Cost Mult:</label>
                <input type="number" value="${site.multiplier}" step="0.1" onchange="sites[${i}].multiplier = parseFloat(this.value); calculateMultiSite()" class="input-field px-2 py-1 rounded text-sm w-20">
            </div>
            ${sites.length > 1 ? `<button onclick="removeSite(${i})" class="text-red-400 hover:text-red-300"><i data-lucide="x" class="w-4 h-4"></i></button>` : ''}
        </div>
    `).join('');
    lucide.createIcons();
}

function calculateMultiSite() {
    const container = document.getElementById('multiSiteResults');
    if (!container) return;
    
    const baseInputs = getInputs();
    let totalServers = 0;
    let totalCost = 0;
    let totalPower = 0;
    let totalRacks = 0;
    
    const siteResults = sites.map(site => {
        const siteServers = site.servers;
        const siteCost = siteServers * baseInputs.serverCost * site.multiplier;
        const sitePower = siteServers * baseInputs.serverPower / 1000;
        const siteRacks = Math.ceil(siteServers / calculationResults.serversPerRack);
        
        totalServers += siteServers;
        totalCost += siteCost;
        totalPower += sitePower;
        totalRacks += siteRacks;
        
        return { ...site, cost: siteCost, power: sitePower, racks: siteRacks };
    });
    
    container.innerHTML = `
        <table class="w-full text-sm">
            <thead><tr class="border-b border-slate-600">
                <th class="text-left py-2">Site</th>
                <th class="text-right py-2">Servers</th>
                <th class="text-right py-2">Racks</th>
                <th class="text-right py-2">Power (kW)</th>
                <th class="text-right py-2">Cost</th>
            </tr></thead>
            <tbody>
                ${siteResults.map(s => `
                    <tr class="border-b border-slate-700">
                        <td class="py-2">${s.name}</td>
                        <td class="py-2 text-right">${formatNumber(s.servers)}</td>
                        <td class="py-2 text-right">${formatNumber(s.racks)}</td>
                        <td class="py-2 text-right">${formatNumber(Math.round(s.power))}</td>
                        <td class="py-2 text-right">${formatCurrency(s.cost)}</td>
                    </tr>
                `).join('')}
                <tr class="font-semibold">
                    <td class="py-2">Total</td>
                    <td class="py-2 text-right text-cyan-400">${formatNumber(totalServers)}</td>
                    <td class="py-2 text-right text-cyan-400">${formatNumber(totalRacks)}</td>
                    <td class="py-2 text-right text-yellow-400">${formatNumber(Math.round(totalPower))}</td>
                    <td class="py-2 text-right text-green-400">${formatCurrency(totalCost)}</td>
                </tr>
            </tbody>
        </table>
    `;
}

// Update additional sections after calculation
function updateAdditionalSections() {
    displayValidationWarnings();
    updateNetworkTopologyDisplay();
    updateCablingDisplay();
    updatePowerEfficiencyDisplay();
    updateSavedConfigsList();
    if (comparisonMode) updateComparisonDisplay();
}

function updateNetworkTopologyDisplay() {
    const container = document.getElementById('networkTopologyAnalysis');
    if (!container) return;
    
    const topo = calculateNetworkTopology();
    container.innerHTML = `
        <div class="grid grid-cols-2 gap-4">
            <div class="p-3 bg-slate-800 rounded-lg">
                <div class="text-xs text-gray-400">Server Links per ToR</div>
                <div class="text-xl font-bold text-cyan-400">${topo.serverLinksPerTor}</div>
            </div>
            <div class="p-3 bg-slate-800 rounded-lg">
                <div class="text-xs text-gray-400">ToR Oversubscription</div>
                <div class="text-xl font-bold ${topo.torOversubscription > 3 ? 'text-yellow-400' : 'text-green-400'}">${topo.torOversubscription.toFixed(1)}:1</div>
            </div>
            <div class="p-3 bg-slate-800 rounded-lg">
                <div class="text-xs text-gray-400">Spine Port Utilization</div>
                <div class="text-xl font-bold ${topo.spineUtilization > 80 ? 'text-yellow-400' : 'text-green-400'}">${topo.spineUtilization.toFixed(0)}%</div>
            </div>
            <div class="p-3 bg-slate-800 rounded-lg">
                <div class="text-xs text-gray-400">Total Fabric Bandwidth</div>
                <div class="text-xl font-bold text-purple-400">${topo.totalFabricBandwidth.toFixed(1)} Tbps</div>
            </div>
        </div>
    `;
}

function updateCablingDisplay() {
    const container = document.getElementById('cablingEstimates');
    if (!container) return;
    
    const cable = calculateCabling();
    container.innerHTML = `
        <div class="space-y-3">
            <div class="flex justify-between items-center py-2 border-b border-slate-700">
                <span class="text-gray-400">Server → ToR (${cable.serverToTorType})</span>
                <span>${formatNumber(cable.serverToTorCables)} cables (${formatNumber(cable.serverToTorLength)}m)</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-slate-700">
                <span class="text-gray-400">ToR → Spine (${cable.torToSpineType})</span>
                <span>${formatNumber(cable.torToSpineCables)} cables (${formatNumber(cable.torToSpineLength)}m)</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-slate-700">
                <span class="text-gray-400">Total Cables</span>
                <span class="font-semibold">${formatNumber(cable.totalCables)}</span>
            </div>
            <div class="flex justify-between items-center py-2 font-semibold">
                <span>Estimated Cable Cost</span>
                <span class="text-green-400">${formatCurrency(cable.totalCost)}</span>
            </div>
        </div>
    `;
}

function updatePowerEfficiencyDisplay() {
    const container = document.getElementById('powerEfficiencyMetrics');
    if (!container) return;
    
    const power = calculatePowerEfficiency();
    container.innerHTML = `
        <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="p-3 bg-slate-800 rounded-lg">
                <div class="text-xs text-gray-400">IT Power Load</div>
                <div class="text-xl font-bold text-cyan-400">${formatNumber(Math.round(power.itPower))} kW</div>
            </div>
            <div class="p-3 bg-slate-800 rounded-lg">
                <div class="text-xs text-gray-400">Facility Power (PUE ${power.pue})</div>
                <div class="text-xl font-bold text-yellow-400">${formatNumber(Math.round(power.facilityPower))} kW</div>
            </div>
            <div class="p-3 bg-slate-800 rounded-lg">
                <div class="text-xs text-gray-400">Annual Power Cost</div>
                <div class="text-xl font-bold text-green-400">${formatCurrency(power.annualPowerCost)}</div>
            </div>
            <div class="p-3 bg-slate-800 rounded-lg">
                <div class="text-xs text-gray-400">Monthly Power Cost</div>
                <div class="text-xl font-bold text-green-400">${formatCurrency(power.monthlyPowerCost)}</div>
            </div>
        </div>
        <div class="text-sm text-gray-400">
            <div>Cooling Overhead: ${formatNumber(Math.round(power.coolingOverhead))} kW</div>
            <div>Power Cost per Server/Year: ${formatCurrency(power.powerCostPerServer)}</div>
        </div>
    `;
}

// ============================================
// VISUALIZATION FUNCTIONS
// ============================================

function setVisualizationView(view) {
    currentVisualizationView = view;
    
    // Update button states
    document.querySelectorAll('.viz-view-btn').forEach(btn => {
        btn.classList.remove('bg-cyan-600');
        btn.classList.add('bg-slate-700');
    });
    document.getElementById(`view${view.charAt(0).toUpperCase() + view.slice(1)}`).classList.remove('bg-slate-700');
    document.getElementById(`view${view.charAt(0).toUpperCase() + view.slice(1)}`).classList.add('bg-cyan-600');
    
    // Show/hide views
    document.getElementById('vizRackView').classList.add('hidden');
    document.getElementById('vizTopologyView').classList.add('hidden');
    document.getElementById('vizDatacenterView').classList.add('hidden');
    document.getElementById(`viz${view.charAt(0).toUpperCase() + view.slice(1)}View`).classList.remove('hidden');
    
    // Render the selected view
    if (view === 'rack') renderRackDiagram();
    else if (view === 'topology') renderNetworkTopology();
    else if (view === 'datacenter') render3DDataCenter();
    
    lucide.createIcons();
}

function renderRackDiagram() {
    const container = document.getElementById('rackDiagramContainer');
    if (!container || !calculationResults.inputs) return;
    
    const r = calculationResults;
    const serverHeight = r.inputs.serverHeight || 1;
    const serversPerRack = r.serversPerRack || 20;
    const layout = r.inputs.rackLayout || 'single';
    // Map layout to rack count: single=1, split=2, quad=4
    const racksPerSU = layout === 'single' ? 1 : (layout === 'split' ? 2 : 4);
    
    // Layout labels
    const layoutLabels = {
        single: 'Single Rack (2 ToRs in rack)',
        split: 'Split Config (2 Racks, 1 ToR each, cross-cabled)',
        quad: 'Quad Config (4 Racks, ToRs to Spines)'
    };
    
    let html = `<div class="text-center text-sm text-gray-400 mb-4">${layoutLabels[layout] || layout}</div>`;
    html += `<div class="flex flex-wrap gap-4 justify-center items-start">`;
    
    // Render racks for one scalable unit (top to bottom)
    for (let rack = 0; rack < racksPerSU; rack++) {
        html += `
            <div class="rack-diagram bg-slate-900 border-2 border-slate-600 rounded-lg p-2" style="width: 120px;">
                <div class="text-center text-xs text-gray-400 mb-2 font-mono">Rack ${rack + 1}</div>
                <div class="rack-units flex flex-col gap-px">
        `;
        
        // 42U rack - render top to bottom
        let currentU = 0;
        
        // ToR switches at top
        if (layout === 'single') {
            // Single rack: 2 ToRs in the same rack
            html += `<div class="rack-unit bg-purple-600 text-white text-xs flex items-center justify-center font-mono" style="height: 16px;">ToR-A</div>`;
            html += `<div class="rack-unit bg-purple-600 text-white text-xs flex items-center justify-center font-mono" style="height: 16px;">ToR-B</div>`;
            currentU += 4;
        } else if (layout === 'split') {
            // Split: 1 ToR per rack
            html += `<div class="rack-unit bg-purple-600 text-white text-xs flex items-center justify-center font-mono" style="height: 16px;">ToR-${rack + 1}</div>`;
            currentU += 2;
        } else {
            // Quad: 2 ToRs per rack
            html += `<div class="rack-unit bg-purple-600 text-white text-xs flex items-center justify-center font-mono" style="height: 16px;">ToR-${rack + 1}A</div>`;
            html += `<div class="rack-unit bg-purple-600 text-white text-xs flex items-center justify-center font-mono" style="height: 16px;">ToR-${rack + 1}B</div>`;
            currentU += 4;
        }
        
        // Servers
        const torU = layout === 'split' ? 2 : 4;
        const maxServers = Math.min(serversPerRack, Math.floor((42 - torU) / serverHeight));
        for (let s = 0; s < maxServers; s++) {
            const height = serverHeight * 12;
            html += `<div class="rack-unit bg-cyan-600 text-white text-xs flex items-center justify-center font-mono rounded-sm" style="height: ${height}px;">S${rack * maxServers + s + 1}</div>`;
            currentU += serverHeight;
        }
        
        // Empty slots at bottom
        const remainingU = 42 - currentU;
        if (remainingU > 0) {
            html += `<div class="rack-unit bg-slate-700 text-gray-500 text-xs flex items-center justify-center" style="height: ${remainingU * 12}px;">${remainingU}U</div>`;
        }
        
        html += `</div></div>`;
        
        // Add inter-rack connection indicator for split config
        if (layout === 'split' && rack === 0) {
            html += `
                <div class="flex flex-col justify-center items-center gap-1" style="width: 60px;">
                    <div class="text-xs text-gray-500">Cross</div>
                    <div class="flex flex-col gap-1">
                        <div class="h-0.5 w-12 bg-cyan-500"></div>
                        <div class="h-0.5 w-12 bg-cyan-500"></div>
                        <div class="h-0.5 w-12 bg-cyan-500"></div>
                        <div class="h-0.5 w-12 bg-cyan-500"></div>
                    </div>
                    <div class="text-xs text-gray-500">cables</div>
                </div>
            `;
        }
    }
    
    html += `</div>`;
    
    // Add spine switches if quad layout
    if (layout === 'quad') {
        html += `
            <div class="mt-4 flex justify-center gap-4">
                <div class="text-xs text-gray-400">Spine Layer:</div>
                <div class="bg-yellow-600 text-white text-xs px-3 py-1 rounded font-mono">Spine-1</div>
                <div class="bg-yellow-600 text-white text-xs px-3 py-1 rounded font-mono">Spine-2</div>
            </div>
        `;
    }
    
    // Add summary
    html += `
        <div class="mt-4 text-xs text-gray-400 text-center">
            ${serversPerRack} servers/rack × ${racksPerSU} rack(s) = ${serversPerRack * racksPerSU} servers per scalable unit
        </div>
    `;
    
    container.innerHTML = html;
}

function renderNetworkTopology() {
    const container = document.getElementById('networkTopologyDiagram');
    if (!container || !calculationResults.inputs) return;
    
    const r = calculationResults;
    const layout = r.inputs.rackLayout || 'single';
    // Split config: 1 ToR per rack; Single: 2 ToRs in 1 rack; Quad: 2 ToRs per rack
    const torsPerRack = layout === 'split' ? 1 : 2;
    const racksPerSU = layout === 'single' ? 1 : (layout === 'split' ? 2 : 4);
    const totalTors = racksPerSU * torsPerRack;
    const spines = layout === 'single' ? 0 : (layout === 'split' ? 0 : 2); // split has no spines, just cross-cabled servers
    const serversPerRack = r.serversPerRack || 20;
    const totalServers = serversPerRack * racksPerSU;
    
    // Calculate how many servers to show per ToR pair (each rack has 2 ToRs that share servers)
    // Servers connect to BOTH ToRs in their rack for redundancy
    const serversPerTorPair = serversPerRack;
    
    let html = `<svg viewBox="0 0 800 500" class="w-full h-full">
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#64748b"/>
            </marker>
        </defs>
    `;
    
    // Spine layer (only for quad layout)
    if (spines > 0) {
        html += `<text x="400" y="30" text-anchor="middle" fill="#94a3b8" font-size="14" font-weight="bold">Spine Layer</text>`;
        const spineStartX = 400 - (spines * 80) / 2;
        for (let i = 0; i < spines; i++) {
            const x = spineStartX + i * 80 + 40;
            html += `<rect x="${x - 30}" y="40" width="60" height="30" rx="4" fill="#eab308"/>`;
            html += `<text x="${x}" y="60" text-anchor="middle" fill="#1e293b" font-size="10" font-weight="bold">Spine ${i + 1}</text>`;
        }
    }
    
    // ToR layer - group by rack
    const torY = spines > 0 ? 140 : 80;
    const torLabel = layout === 'split' ? 'ToR Layer (1 per rack)' : 'ToR Layer (2 per rack)';
    html += `<text x="400" y="${torY - 30}" text-anchor="middle" fill="#94a3b8" font-size="14" font-weight="bold">${torLabel}</text>`;
    
    // Calculate ToR positions grouped by rack
    const rackWidth = 140;
    const totalWidth = racksPerSU * rackWidth;
    const startX = 400 - totalWidth / 2;
    
    const torPositions = [];
    for (let rack = 0; rack < racksPerSU; rack++) {
        const rackCenterX = startX + rack * rackWidth + rackWidth / 2;
        if (layout === 'split') {
            // Split: 1 ToR per rack, centered
            torPositions.push({ x: rackCenterX, rack: rack, torInRack: 0 });
        } else {
            // Single/Quad: 2 ToRs per rack, side by side
            torPositions.push({ x: rackCenterX - 30, rack: rack, torInRack: 0 });
            torPositions.push({ x: rackCenterX + 30, rack: rack, torInRack: 1 });
        }
    }
    
    // Draw rack groupings
    for (let rack = 0; rack < racksPerSU; rack++) {
        const rackCenterX = startX + rack * rackWidth + rackWidth / 2;
        html += `<rect x="${rackCenterX - 65}" y="${torY - 10}" width="130" height="45" rx="4" fill="none" stroke="#475569" stroke-dasharray="4"/>`;
        html += `<text x="${rackCenterX}" y="${torY + 45}" text-anchor="middle" fill="#64748b" font-size="9">Rack ${rack + 1}</text>`;
    }
    
    // Draw ToRs
    torPositions.forEach((tor, i) => {
        html += `<rect x="${tor.x - 22}" y="${torY}" width="44" height="25" rx="4" fill="#a855f7"/>`;
        html += `<text x="${tor.x}" y="${torY + 16}" text-anchor="middle" fill="white" font-size="8" font-weight="bold">ToR ${i + 1}</text>`;
        
        // Lines to spines (quad layout)
        if (spines > 0) {
            for (let s = 0; s < spines; s++) {
                const spineX = (400 - (spines * 80) / 2) + s * 80 + 40;
                html += `<line x1="${tor.x}" y1="${torY}" x2="${spineX}" y2="70" stroke="#64748b" stroke-width="1" opacity="0.5"/>`;
            }
        }
    });
    
    // Server layer - group by rack
    html += `<text x="400" y="${torY + 100}" text-anchor="middle" fill="#94a3b8" font-size="14" font-weight="bold">Server Layer (${serversPerRack} per rack)</text>`;
    const serverY = torY + 120;
    
    // Show servers grouped by rack
    const maxServersToShow = Math.min(serversPerRack, 8); // Show up to 8 per rack for clarity
    
    for (let rack = 0; rack < racksPerSU; rack++) {
        const rackCenterX = startX + rack * rackWidth + rackWidth / 2;
        const serverWidth = Math.min(120 / maxServersToShow, 18);
        const serverGap = 2;
        const serversWidth = maxServersToShow * (serverWidth + serverGap);
        const serverStartX = rackCenterX - serversWidth / 2;
        
        for (let s = 0; s < maxServersToShow; s++) {
            const x = serverStartX + s * (serverWidth + serverGap) + serverWidth / 2;
            const serverNum = rack * serversPerRack + s + 1;
            
            html += `<rect x="${x - serverWidth/2}" y="${serverY}" width="${serverWidth}" height="18" rx="2" fill="#06b6d4"/>`;
            if (serverWidth > 14) {
                html += `<text x="${x}" y="${serverY + 12}" text-anchor="middle" fill="white" font-size="7">${serverNum}</text>`;
            }
            
            if (layout === 'split') {
                // Split: servers connect to BOTH ToRs (cross-cabled between racks)
                const tor1X = torPositions[0].x; // ToR in Rack 1
                const tor2X = torPositions[1].x; // ToR in Rack 2
                html += `<line x1="${x}" y1="${serverY}" x2="${tor1X}" y2="${torY + 25}" stroke="#64748b" stroke-width="1" opacity="0.3"/>`;
                html += `<line x1="${x}" y1="${serverY}" x2="${tor2X}" y2="${torY + 25}" stroke="#64748b" stroke-width="1" opacity="0.3"/>`;
            } else {
                // Single/Quad: servers connect to both ToRs in their own rack
                const tor1X = torPositions[rack * 2].x;
                const tor2X = torPositions[rack * 2 + 1].x;
                html += `<line x1="${x}" y1="${serverY}" x2="${tor1X}" y2="${torY + 25}" stroke="#64748b" stroke-width="1" opacity="0.3"/>`;
                html += `<line x1="${x}" y1="${serverY}" x2="${tor2X}" y2="${torY + 25}" stroke="#64748b" stroke-width="1" opacity="0.3"/>`;
            }
        }
        
        if (serversPerRack > maxServersToShow) {
            html += `<text x="${rackCenterX}" y="${serverY + 35}" text-anchor="middle" fill="#64748b" font-size="9">+${serversPerRack - maxServersToShow} more</text>`;
        }
    }
    
    // Legend
    html += `
        <g transform="translate(20, 420)">
            <text x="0" y="0" fill="#94a3b8" font-size="12" font-weight="bold">Legend</text>
            <rect x="0" y="10" width="20" height="12" rx="2" fill="#eab308"/>
            <text x="25" y="20" fill="#94a3b8" font-size="10">Spine Switch</text>
            <rect x="100" y="10" width="20" height="12" rx="2" fill="#a855f7"/>
            <text x="125" y="20" fill="#94a3b8" font-size="10">ToR Switch</text>
            <rect x="200" y="10" width="20" height="12" rx="2" fill="#06b6d4"/>
            <text x="225" y="20" fill="#94a3b8" font-size="10">Server (dual-homed)</text>
        </g>
    `;
    
    // Stats
    html += `
        <g transform="translate(520, 420)">
            <text x="0" y="0" fill="#94a3b8" font-size="12" font-weight="bold">Topology Stats</text>
            <text x="0" y="20" fill="#64748b" font-size="10">Racks: ${racksPerSU}</text>
            <text x="0" y="35" fill="#64748b" font-size="10">ToRs: ${totalTors} (${torsPerRack}/rack)</text>
            <text x="0" y="50" fill="#64748b" font-size="10">Servers: ${totalServers} (${serversPerRack}/rack)</text>
            <text x="0" y="65" fill="#64748b" font-size="10">Spines: ${spines}</text>
        </g>
    `;
    
    html += '</svg>';
    container.innerHTML = html;
}

function render3DDataCenter() {
    const container = document.getElementById('datacenter3DContainer');
    if (!container || !calculationResults.totalRacks) return;
    
    const racksPerRow = parseInt(document.getElementById('racksPerRow')?.value || 10);
    const numRows = parseInt(document.getElementById('numRows')?.value || 4);
    const totalRacks = calculationResults.totalRacks;
    
    // Calculate actual rows needed
    const actualRows = Math.min(numRows, Math.ceil(totalRacks / racksPerRow));
    
    // Use a cleaner 2.5D isometric view
    let html = `
        <div class="datacenter-floor relative" style="padding: 40px;">
            <div class="text-center text-gray-400 text-sm mb-4">Data Center Floor Plan (Isometric View)</div>
            <div class="dc-grid" style="display: grid; grid-template-columns: repeat(${racksPerRow}, 36px); gap: 4px; transform: rotateX(60deg) rotateZ(-45deg); transform-style: preserve-3d; margin: 80px auto; width: fit-content;">
    `;
    
    let rackCount = 0;
    for (let row = 0; row < actualRows; row++) {
        for (let col = 0; col < racksPerRow; col++) {
            if (rackCount >= totalRacks) {
                // Empty slot
                html += `<div class="dc-rack-slot bg-slate-800/30 border border-slate-700/50" style="width: 32px; height: 48px;"></div>`;
            } else {
                const fillPercent = Math.min(100, (calculationResults.serversPerRack / 38) * 100);
                const colorClass = fillPercent > 80 ? 'from-red-600 to-red-500' : 
                                   fillPercent > 50 ? 'from-yellow-600 to-yellow-500' : 
                                   'from-cyan-600 to-cyan-500';
                
                html += `
                    <div class="dc-rack relative group cursor-pointer" style="width: 32px; height: 48px; transform-style: preserve-3d;">
                        <!-- Rack top -->
                        <div class="absolute inset-0 bg-gradient-to-br ${colorClass} rounded-sm shadow-lg" style="transform: translateZ(20px);"></div>
                        <!-- Rack front -->
                        <div class="absolute bottom-0 left-0 right-0 bg-slate-900/80" style="height: 20px; transform: rotateX(-90deg) translateZ(10px);"></div>
                        <!-- Rack side -->
                        <div class="absolute top-0 right-0 bottom-0 bg-slate-800/60" style="width: 8px; transform: rotateY(90deg) translateZ(24px);"></div>
                        <!-- Tooltip -->
                        <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                            Rack ${rackCount + 1} (${fillPercent.toFixed(0)}%)
                        </div>
                    </div>
                `;
            }
            rackCount++;
        }
    }
    
    html += `
            </div>
        </div>
    `;
    
    // Summary and legend
    html += `
        <div class="flex justify-between items-end mt-4 px-4">
            <div class="bg-slate-800 p-4 rounded-lg text-sm">
                <div class="font-semibold mb-2">Data Center Summary</div>
                <div class="text-gray-400">Total Racks: ${totalRacks}</div>
                <div class="text-gray-400">Rows: ${actualRows} × ${racksPerRow}</div>
                <div class="text-gray-400">Floor Space: ~${(totalRacks * 6).toLocaleString()} sq ft</div>
            </div>
            <div class="flex gap-3 text-xs">
                <div class="flex items-center gap-1"><div class="w-3 h-3 bg-cyan-500 rounded"></div>&lt;50%</div>
                <div class="flex items-center gap-1"><div class="w-3 h-3 bg-yellow-500 rounded"></div>50-80%</div>
                <div class="flex items-center gap-1"><div class="w-3 h-3 bg-red-500 rounded"></div>&gt;80%</div>
                <div class="flex items-center gap-1"><div class="w-3 h-3 bg-slate-700 rounded"></div>Empty</div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

function exportToDrawio() {
    const r = calculationResults;
    if (!r.inputs) {
        alert('Please run a calculation first');
        return;
    }
    
    // Create Draw.io XML format
    const layout = r.inputs.rackLayout || 'single';
    const racksPerSU = layout === 'single' ? 1 : (layout === 'dual' ? 2 : 4);
    const torsPerRack = 2;
    const spines = layout === 'single' ? 0 : 2;
    
    let mxGraphModel = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net">
  <diagram name="Infrastructure Topology" id="infra-topology">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1100" pageHeight="850">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <!-- Title -->
        <mxCell id="title" value="Infrastructure Topology - ${r.totalServers} Servers" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;fontSize=18;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="400" y="20" width="300" height="30" as="geometry"/>
        </mxCell>
`;
    
    let cellId = 10;
    
    // Spine switches
    if (spines > 0) {
        for (let i = 0; i < spines; i++) {
            mxGraphModel += `
        <mxCell id="${cellId++}" value="Spine ${i + 1}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f9a825;strokeColor=#c17900;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="${400 + i * 120}" y="80" width="100" height="40" as="geometry"/>
        </mxCell>`;
        }
    }
    
    // ToR switches
    const totalTors = racksPerSU * torsPerRack;
    for (let i = 0; i < totalTors; i++) {
        mxGraphModel += `
        <mxCell id="${cellId++}" value="ToR ${i + 1}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#9c27b0;strokeColor=#7b1fa2;fontColor=#ffffff;" vertex="1" parent="1">
          <mxGeometry x="${200 + i * 100}" y="180" width="80" height="30" as="geometry"/>
        </mxCell>`;
    }
    
    // Racks
    for (let i = 0; i < racksPerSU; i++) {
        mxGraphModel += `
        <mxCell id="${cellId++}" value="Rack ${i + 1}&#xa;${r.serversPerRack} Servers" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#0097a7;strokeColor=#006064;fontColor=#ffffff;" vertex="1" parent="1">
          <mxGeometry x="${250 + i * 150}" y="280" width="100" height="80" as="geometry"/>
        </mxCell>`;
    }
    
    // Summary box
    mxGraphModel += `
        <mxCell id="${cellId++}" value="Summary&#xa;Total Servers: ${formatNumber(r.totalServers)}&#xa;Total Racks: ${formatNumber(r.totalRacks)}&#xa;Scalable Units: ${formatNumber(r.scalableUnits)}&#xa;Total Power: ${formatNumber(Math.round(r.totalPower))} kW" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#37474f;strokeColor=#263238;fontColor=#ffffff;align=left;spacingLeft=10;" vertex="1" parent="1">
          <mxGeometry x="700" y="280" width="180" height="100" as="geometry"/>
        </mxCell>`;
    
    mxGraphModel += `
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
    
    downloadBlob(mxGraphModel, 'infrastructure-topology.drawio', 'application/xml');
}

function exportDiagramAsPNG() {
    // For PNG export, we'll create a canvas from the current SVG or HTML
    const view = currentVisualizationView;
    let element;
    
    if (view === 'topology') {
        element = document.querySelector('#networkTopologyDiagram svg');
    } else {
        alert('PNG export is currently available for Network Topology view. Please switch to that view.');
        return;
    }
    
    if (!element) {
        alert('No diagram to export. Please generate a visualization first.');
        return;
    }
    
    // Convert SVG to canvas and download
    const svgData = new XMLSerializer().serializeToString(element);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const link = document.createElement('a');
        link.download = 'network-topology.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

function exportBOM() {
    const r = calculationResults;
    if (!r.inputs) {
        alert('Please run a calculation first');
        return;
    }
    
    const workloadType = document.getElementById('workloadType').value;
    const preset = workloadPresets[workloadType];
    
    if (!preset || !preset.bom) {
        alert('No BOM available for the selected workload type');
        return;
    }
    
    const totalServers = r.totalServers;
    
    // Build full BOM with quantities
    let csv = 'Part Number,Description,Qty Per Server,Total Qty,Category\n';
    
    // Server components
    preset.bom.forEach(item => {
        csv += `"${item.partNumber}","${item.description}",${item.qty},${item.qty * totalServers},Server\n`;
    });
    
    // Network equipment
    const totalTors = r.totalTors || r.totalRacks * 2;
    const totalSpines = r.totalSpines || (r.inputs.rackLayout === 'single' ? 0 : Math.ceil(r.scalableUnits * 2));
    
    csv += `"N9K-C93180YC-FX3","Nexus 93180YC-FX3 ToR Switch",1,${totalTors},Network\n`;
    if (totalSpines > 0) {
        csv += `"N9K-C9336C-FX2","Nexus 9336C-FX2 Spine Switch",1,${totalSpines},Network\n`;
    }
    
    // Optics
    const serverOptics = totalServers * (preset.nicPorts || 2);
    csv += `"SFP-25G-SR-S","25G SFP28 SR Optic",${preset.nicPorts || 2},${serverOptics},Optics\n`;
    
    // Cables
    const cabling = calculateCabling();
    csv += `"CAB-DAC-3M","3m DAC Cable",1,${cabling.serverToTorCables},Cabling\n`;
    if (cabling.torToSpineCables > 0) {
        csv += `"CAB-AOC-15M","15m AOC Cable",1,${cabling.torToSpineCables},Cabling\n`;
    }
    
    downloadBlob(csv, `full-bom-${totalServers}-servers.csv`, 'text/csv');
}

function exportExecutiveSummaryPDF() {
    const r = calculationResults;
    if (!r.inputs) {
        alert('Please run a calculation first');
        return;
    }
    
    // Create a printable HTML document
    const workloadType = document.getElementById('workloadType').value;
    const preset = workloadPresets[workloadType];
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Infrastructure Refresh - Executive Summary</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; }
        h1 { color: #0891b2; border-bottom: 2px solid #0891b2; padding-bottom: 10px; }
        h2 { color: #475569; margin-top: 30px; }
        .summary-box { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .metric { display: inline-block; width: 200px; margin: 10px 20px 10px 0; }
        .metric-value { font-size: 24px; font-weight: bold; color: #0891b2; }
        .metric-label { font-size: 12px; color: #64748b; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f1f5f9; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
    </style>
</head>
<body>
    <h1>Infrastructure Refresh - Executive Summary</h1>
    <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
    <p><strong>Workload Type:</strong> ${preset?.name || workloadType}</p>
    
    <div class="summary-box">
        <div class="metric">
            <div class="metric-value">${formatNumber(r.totalServers)}</div>
            <div class="metric-label">Total Servers</div>
        </div>
        <div class="metric">
            <div class="metric-value">${formatNumber(r.totalRacks)}</div>
            <div class="metric-label">Total Racks</div>
        </div>
        <div class="metric">
            <div class="metric-value">${formatNumber(r.scalableUnits)}</div>
            <div class="metric-label">Scalable Units</div>
        </div>
        <div class="metric">
            <div class="metric-value">${formatNumber(Math.round(r.totalPower))} kW</div>
            <div class="metric-label">Total Power</div>
        </div>
    </div>
    
    <h2>Cost Summary</h2>
    <table>
        <tr><th>Category</th><th>Amount</th></tr>
        <tr><td>Server Hardware</td><td>${formatCurrency(r.serverCost)}</td></tr>
        <tr><td>Network Equipment</td><td>${formatCurrency(r.networkCost)}</td></tr>
        <tr><td>Optics</td><td>${formatCurrency(r.opticsCost)}</td></tr>
        <tr><td>Storage</td><td>${formatCurrency(r.storageCost)}</td></tr>
        <tr><td>Base Infrastructure</td><td>${formatCurrency(r.baseInfraCost)}</td></tr>
        <tr style="font-weight: bold;"><td>Total Capital Cost</td><td>${formatCurrency(r.totalCost)}</td></tr>
    </table>
    
    <h2>Timeline Options</h2>
    <table>
        <tr><th>Approach</th><th>Duration</th><th>Total Cost</th></tr>
        <tr><td>Run Rate (${r.inputs.runRate}/month)</td><td>${r.runRateMonths} months</td><td>${formatCurrency(r.runRateTotalCost)}</td></tr>
        <tr><td>Rack & Roll (${r.inputs.rackRollRate}/month)</td><td>${r.rackRollMonths} months</td><td>${formatCurrency(r.rackRollTotalCost)}</td></tr>
    </table>
    
    <h2>Recommendation</h2>
    <p>${r.runRateTotalCost < r.rackRollTotalCost ? 
        'The <strong>Run Rate</strong> approach is recommended for cost optimization, though it requires a longer timeline.' :
        'The <strong>Rack & Roll</strong> approach is recommended for faster deployment, with a modest cost premium.'}</p>
    
    <div class="footer">
        <p>Generated by BaseConfig Infrastructure Planner | baseconfig.tech</p>
    </div>
</body>
</html>`;
    
    // Open in new window for printing/saving as PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}

// ============================================
// MIGRATION PLANNER FUNCTIONS
// ============================================

function handleMigrationFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            if (file.name.endsWith('.json')) {
                existingInfrastructure = JSON.parse(content);
            } else if (file.name.endsWith('.csv')) {
                existingInfrastructure = parseCSVToInfra(content);
            }
            updateMigrationDisplay();
        } catch (err) {
            alert('Error parsing file: ' + err.message);
        }
    };
    reader.readAsText(file);
}

function parseCSVToInfra(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const servers = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const server = {};
        headers.forEach((h, idx) => {
            server[h] = values[idx]?.trim() || '';
        });
        servers.push(server);
    }
    
    return { servers };
}

// Historical server templates - generalized estimates
const historicalServerTemplates = {
    2014: {
        high_compute: { cpu: '2x E5-2697v3 (14C)', cores: 28, ram: 256, power: 550, perf: 1.0, model: 'Dell R630 / HP DL380 G9' },
        general_purpose: { cpu: '2x E5-2680v3 (12C)', cores: 24, ram: 128, power: 450, perf: 1.0, model: 'Dell R630 / HP DL360 G9' },
        database: { cpu: '2x E5-2690v3 (12C)', cores: 24, ram: 512, power: 600, perf: 1.0, model: 'Dell R730 / HP DL380 G9' },
        storage: { cpu: '2x E5-2620v3 (6C)', cores: 12, ram: 64, power: 400, perf: 1.0, model: 'Dell R730xd / HP DL380 G9' }
    },
    2016: {
        high_compute: { cpu: '2x E5-2697v4 (18C)', cores: 36, ram: 384, power: 550, perf: 1.3, model: 'Dell R640 / HP DL380 G10' },
        general_purpose: { cpu: '2x E5-2680v4 (14C)', cores: 28, ram: 192, power: 450, perf: 1.25, model: 'Dell R640 / HP DL360 G10' },
        database: { cpu: '2x E5-2690v4 (14C)', cores: 28, ram: 768, power: 600, perf: 1.3, model: 'Dell R740 / HP DL380 G10' },
        storage: { cpu: '2x E5-2630v4 (10C)', cores: 20, ram: 128, power: 400, perf: 1.2, model: 'Dell R740xd / HP DL380 G10' }
    },
    2018: {
        high_compute: { cpu: '2x Gold 6154 (18C)', cores: 36, ram: 512, power: 600, perf: 1.8, model: 'Dell R640 / HP DL380 G10' },
        general_purpose: { cpu: '2x Gold 6140 (18C)', cores: 36, ram: 256, power: 500, perf: 1.7, model: 'Dell R640 / HP DL360 G10' },
        database: { cpu: '2x Gold 6154 (18C)', cores: 36, ram: 1024, power: 650, perf: 1.8, model: 'Dell R740 / HP DL380 G10' },
        storage: { cpu: '2x Silver 4116 (12C)', cores: 24, ram: 192, power: 450, perf: 1.5, model: 'Dell R740xd / HP DL380 G10' }
    },
    2020: {
        high_compute: { cpu: '2x Gold 6338 (32C)', cores: 64, ram: 512, power: 600, perf: 2.5, model: 'Dell R650 / HP DL380 G10+' },
        general_purpose: { cpu: '2x Gold 6330 (28C)', cores: 56, ram: 256, power: 500, perf: 2.3, model: 'Dell R650 / HP DL360 G10+' },
        database: { cpu: '2x Gold 6348 (28C)', cores: 56, ram: 1024, power: 650, perf: 2.5, model: 'Dell R750 / HP DL380 G10+' },
        storage: { cpu: '2x Silver 4316 (20C)', cores: 40, ram: 256, power: 450, perf: 2.0, model: 'Dell R750xd / HP DL380 G10+' }
    },
    2022: {
        high_compute: { cpu: '2x Gold 6448Y (32C)', cores: 64, ram: 512, power: 650, perf: 3.2, model: 'Dell R660 / HP DL380 G11' },
        general_purpose: { cpu: '2x Gold 6430 (32C)', cores: 64, ram: 256, power: 550, perf: 3.0, model: 'Dell R660 / HP DL360 G11' },
        database: { cpu: '2x Gold 6448Y (32C)', cores: 64, ram: 1024, power: 700, perf: 3.2, model: 'Dell R760 / HP DL380 G11' },
        storage: { cpu: '2x Silver 4416+ (20C)', cores: 40, ram: 256, power: 500, perf: 2.5, model: 'Dell R760xd / HP DL380 G11' }
    }
};

// Current generation (2024-2026) baseline for comparison
const currentGenBaseline = {
    high_compute: { cpu: '2x Xeon 6980P (128C)', cores: 256, ram: 1024, power: 700, perf: 5.0 },
    general_purpose: { cpu: '2x Xeon 6530 (32C)', cores: 64, ram: 512, power: 550, perf: 4.0 },
    database: { cpu: '2x Xeon 6980P (128C)', cores: 256, ram: 2048, power: 800, perf: 5.0 },
    storage: { cpu: '2x Xeon 6430 (32C)', cores: 64, ram: 512, power: 550, perf: 3.5 }
};

function updateHistoricalComparison() {
    const year = document.getElementById('historicalYear')?.value;
    const type = document.getElementById('historicalType')?.value;
    const count = parseInt(document.getElementById('historicalCount')?.value || 100);
    const container = document.getElementById('historicalComparison');
    
    if (!year || !type) {
        container.innerHTML = '<p>Select a server generation and type to see estimated performance gains.</p>';
        return;
    }
    
    const oldSpec = historicalServerTemplates[year]?.[type];
    const newSpec = currentGenBaseline[type];
    
    if (!oldSpec || !newSpec) {
        container.innerHTML = '<p>Invalid selection.</p>';
        return;
    }
    
    const perfMultiplier = newSpec.perf / oldSpec.perf;
    const coreMultiplier = newSpec.cores / oldSpec.cores;
    const equivalentNewServers = Math.ceil(count / perfMultiplier);
    const powerSavings = (count * oldSpec.power) - (equivalentNewServers * newSpec.power);
    const consolidationRatio = (count / equivalentNewServers).toFixed(1);
    
    // Also update the existing infrastructure for migration comparison
    existingInfrastructure = {
        servers: Array(count).fill(null).map((_, i) => ({
            hostname: `server-${String(i + 1).padStart(3, '0')}`,
            model: oldSpec.model.split(' / ')[0],
            age: 2026 - parseInt(year),
            power: oldSpec.power,
            cpu: oldSpec.cpu,
            ram: oldSpec.ram
        })),
        source: 'historical'
    };
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 class="font-semibold text-cyan-400 mb-3">Old Infrastructure (${year})</h4>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between"><span class="text-gray-400">Model:</span><span>${oldSpec.model}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">CPU:</span><span>${oldSpec.cpu}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">Cores/Server:</span><span>${oldSpec.cores}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">RAM/Server:</span><span>${oldSpec.ram} GB</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">Power/Server:</span><span>${oldSpec.power}W</span></div>
                    <div class="flex justify-between font-semibold border-t border-slate-600 pt-2 mt-2">
                        <span>Total Servers:</span><span>${count}</span>
                    </div>
                    <div class="flex justify-between"><span class="text-gray-400">Total Cores:</span><span>${formatNumber(count * oldSpec.cores)}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">Total Power:</span><span>${((count * oldSpec.power) / 1000).toFixed(1)} kW</span></div>
                </div>
            </div>
            <div>
                <h4 class="font-semibold text-green-400 mb-3">New Infrastructure (2024-2026)</h4>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between"><span class="text-gray-400">CPU:</span><span>${newSpec.cpu}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">Cores/Server:</span><span>${newSpec.cores}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">RAM/Server:</span><span>${newSpec.ram} GB</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">Power/Server:</span><span>${newSpec.power}W</span></div>
                    <div class="flex justify-between font-semibold border-t border-slate-600 pt-2 mt-2">
                        <span>Equivalent Servers:</span><span class="text-green-400">${equivalentNewServers}</span>
                    </div>
                    <div class="flex justify-between"><span class="text-gray-400">Total Cores:</span><span>${formatNumber(equivalentNewServers * newSpec.cores)}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">Total Power:</span><span>${((equivalentNewServers * newSpec.power) / 1000).toFixed(1)} kW</span></div>
                </div>
            </div>
        </div>
        
        <div class="mt-6 p-4 bg-slate-800 rounded-lg">
            <h4 class="font-semibold text-purple-400 mb-3">Estimated Migration Benefits</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div class="p-3 bg-slate-700/50 rounded-lg">
                    <div class="text-2xl font-bold text-cyan-400">${consolidationRatio}:1</div>
                    <div class="text-xs text-gray-400">Consolidation Ratio</div>
                </div>
                <div class="p-3 bg-slate-700/50 rounded-lg">
                    <div class="text-2xl font-bold text-green-400">${perfMultiplier.toFixed(1)}x</div>
                    <div class="text-xs text-gray-400">Performance Gain</div>
                </div>
                <div class="p-3 bg-slate-700/50 rounded-lg">
                    <div class="text-2xl font-bold text-yellow-400">${coreMultiplier.toFixed(1)}x</div>
                    <div class="text-xs text-gray-400">Core Density</div>
                </div>
                <div class="p-3 bg-slate-700/50 rounded-lg">
                    <div class="text-2xl font-bold ${powerSavings > 0 ? 'text-green-400' : 'text-red-400'}">${powerSavings > 0 ? '-' : '+'}${Math.abs(powerSavings / 1000).toFixed(1)} kW</div>
                    <div class="text-xs text-gray-400">Power Delta</div>
                </div>
            </div>
            <p class="text-xs text-gray-500 mt-3 italic">* These are rough estimates based on generalized performance benchmarks. Actual results depend on specific workloads, configurations, and vendor implementations.</p>
        </div>
    `;
    
    // Update the infrastructure summary and efficiency calculator
    updateMigrationDisplay();
    calculateMigrationEfficiency();
    
    lucide.createIcons();
}

function loadSampleMigrationData() {
    existingInfrastructure = {
        servers: [
            { hostname: 'web-001', model: 'Dell R630', age: 5, power: 450, cpu: 'E5-2680v4', ram: 128 },
            { hostname: 'web-002', model: 'Dell R630', age: 5, power: 450, cpu: 'E5-2680v4', ram: 128 },
            { hostname: 'db-001', model: 'Dell R730', age: 4, power: 600, cpu: 'E5-2690v4', ram: 256 },
            { hostname: 'db-002', model: 'Dell R730', age: 4, power: 600, cpu: 'E5-2690v4', ram: 256 },
            { hostname: 'app-001', model: 'HP DL380 G9', age: 6, power: 500, cpu: 'E5-2670v3', ram: 192 },
            { hostname: 'app-002', model: 'HP DL380 G9', age: 6, power: 500, cpu: 'E5-2670v3', ram: 192 },
            { hostname: 'app-003', model: 'HP DL380 G9', age: 6, power: 500, cpu: 'E5-2670v3', ram: 192 },
            { hostname: 'storage-001', model: 'Dell R740xd', age: 3, power: 700, cpu: 'Gold 6130', ram: 384 },
        ],
        summary: {
            totalServers: 8,
            avgAge: 4.9,
            totalPower: 4300,
            models: ['Dell R630', 'Dell R730', 'HP DL380 G9', 'Dell R740xd']
        }
    };
    updateMigrationDisplay();
}

function updateMigrationDisplay() {
    if (!existingInfrastructure) return;
    
    const infra = existingInfrastructure;
    const servers = infra.servers || [];
    
    // Current Infrastructure Summary
    const summaryContainer = document.getElementById('currentInfraSummary');
    const totalPower = servers.reduce((sum, s) => sum + (parseInt(s.power) || 500), 0);
    const avgAge = servers.reduce((sum, s) => sum + (parseInt(s.age) || 0), 0) / servers.length;
    const models = [...new Set(servers.map(s => s.model))];
    
    summaryContainer.innerHTML = `
        <div class="grid grid-cols-2 gap-4">
            <div class="p-3 bg-slate-800 rounded-lg">
                <div class="text-2xl font-bold text-cyan-400">${servers.length}</div>
                <div class="text-xs text-gray-400">Total Servers</div>
            </div>
            <div class="p-3 bg-slate-800 rounded-lg">
                <div class="text-2xl font-bold text-yellow-400">${avgAge.toFixed(1)} yrs</div>
                <div class="text-xs text-gray-400">Average Age</div>
            </div>
            <div class="p-3 bg-slate-800 rounded-lg">
                <div class="text-2xl font-bold text-purple-400">${(totalPower / 1000).toFixed(1)} kW</div>
                <div class="text-xs text-gray-400">Total Power</div>
            </div>
            <div class="p-3 bg-slate-800 rounded-lg">
                <div class="text-2xl font-bold text-green-400">${models.length}</div>
                <div class="text-xs text-gray-400">Unique Models</div>
            </div>
        </div>
        <div class="mt-4">
            <div class="text-sm font-semibold mb-2">Server Models:</div>
            <div class="flex flex-wrap gap-2">
                ${models.map(m => `<span class="px-2 py-1 bg-slate-700 rounded text-xs">${m}</span>`).join('')}
            </div>
        </div>
    `;
    
    // Migration Comparison
    updateMigrationComparison(servers, totalPower);
    
    // Migration Timeline
    calculateMigrationTimeline();
    
    lucide.createIcons();
}

function updateMigrationComparison(oldServers, oldPower) {
    const container = document.getElementById('migrationComparison');
    const r = calculationResults;
    
    if (!r.inputs) {
        container.innerHTML = '<p>Run a calculation to see comparison.</p>';
        return;
    }
    
    const newServers = r.totalServers;
    const newPower = r.totalPower;
    const oldServerCount = oldServers.length;
    
    const serverDiff = newServers - oldServerCount;
    const powerDiff = newPower - (oldPower / 1000);
    const consolidationRatio = oldServerCount > 0 ? (oldServerCount / newServers).toFixed(2) : 'N/A';
    
    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-slate-600">
                        <th class="text-left py-3 px-4 text-gray-400">Metric</th>
                        <th class="text-right py-3 px-4 text-gray-400">Current</th>
                        <th class="text-right py-3 px-4 text-gray-400">Refresh</th>
                        <th class="text-right py-3 px-4 text-gray-400">Change</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b border-slate-700">
                        <td class="py-3 px-4">Server Count</td>
                        <td class="py-3 px-4 text-right">${formatNumber(oldServerCount)}</td>
                        <td class="py-3 px-4 text-right text-cyan-400">${formatNumber(newServers)}</td>
                        <td class="py-3 px-4 text-right ${serverDiff > 0 ? 'text-green-400' : 'text-red-400'}">${serverDiff > 0 ? '+' : ''}${formatNumber(serverDiff)}</td>
                    </tr>
                    <tr class="border-b border-slate-700">
                        <td class="py-3 px-4">Total Power (kW)</td>
                        <td class="py-3 px-4 text-right">${(oldPower / 1000).toFixed(1)}</td>
                        <td class="py-3 px-4 text-right text-cyan-400">${newPower.toFixed(1)}</td>
                        <td class="py-3 px-4 text-right ${powerDiff > 0 ? 'text-yellow-400' : 'text-green-400'}">${powerDiff > 0 ? '+' : ''}${powerDiff.toFixed(1)}</td>
                    </tr>
                    <tr class="border-b border-slate-700">
                        <td class="py-3 px-4">Consolidation Ratio</td>
                        <td class="py-3 px-4 text-right">1:1</td>
                        <td class="py-3 px-4 text-right text-cyan-400">${consolidationRatio}:1</td>
                        <td class="py-3 px-4 text-right text-purple-400">${consolidationRatio !== 'N/A' && parseFloat(consolidationRatio) > 1 ? 'Consolidating' : 'Expanding'}</td>
                    </tr>
                    <tr>
                        <td class="py-3 px-4">Estimated Savings</td>
                        <td class="py-3 px-4 text-right">-</td>
                        <td class="py-3 px-4 text-right text-green-400">${powerDiff < 0 ? formatCurrency(Math.abs(powerDiff) * 0.10 * 8760) + '/yr' : '-'}</td>
                        <td class="py-3 px-4 text-right text-gray-400">(power @ $0.10/kWh)</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

function calculateMigrationTimeline() {
    const container = document.getElementById('migrationTimeline');
    if (!existingInfrastructure || !calculationResults.inputs) {
        container.innerHTML = '';
        return;
    }
    
    const startDate = document.getElementById('migrationStartDate')?.value || new Date().toISOString().split('T')[0];
    const serversPerWeek = parseInt(document.getElementById('migrationServersPerWeek')?.value || 50);
    const parallel = parseInt(document.getElementById('parallelMigrations')?.value || 2);
    
    const totalToMigrate = existingInfrastructure.servers?.length || 0;
    const effectiveRate = serversPerWeek * parallel;
    const weeksNeeded = Math.ceil(totalToMigrate / effectiveRate);
    
    const start = new Date(startDate);
    const phases = [
        { name: 'Planning & Procurement', weeks: 4, color: 'bg-blue-500' },
        { name: 'Pilot Migration (10%)', weeks: Math.ceil(weeksNeeded * 0.1), color: 'bg-yellow-500' },
        { name: 'Main Migration (80%)', weeks: Math.ceil(weeksNeeded * 0.8), color: 'bg-cyan-500' },
        { name: 'Final Migration & Cleanup', weeks: Math.ceil(weeksNeeded * 0.1) + 2, color: 'bg-green-500' },
    ];
    
    let currentDate = new Date(start);
    let html = `<div class="space-y-3">`;
    
    phases.forEach(phase => {
        const endDate = new Date(currentDate);
        endDate.setDate(endDate.getDate() + phase.weeks * 7);
        
        html += `
            <div class="flex items-center gap-4">
                <div class="w-32 text-sm text-gray-400">${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                <div class="${phase.color} h-8 rounded flex items-center px-3 text-sm font-medium" style="width: ${Math.max(phase.weeks * 20, 100)}px;">
                    ${phase.name}
                </div>
                <div class="text-sm text-gray-400">${phase.weeks} weeks</div>
            </div>
        `;
        
        currentDate = endDate;
    });
    
    html += `</div>
        <div class="mt-4 p-4 bg-slate-800 rounded-lg">
            <div class="text-sm"><strong>Total Duration:</strong> ${phases.reduce((sum, p) => sum + p.weeks, 0)} weeks</div>
            <div class="text-sm"><strong>Completion Date:</strong> ${currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            <div class="text-sm"><strong>Migration Rate:</strong> ${effectiveRate} servers/week (${parallel} parallel streams)</div>
        </div>
    `;
    
    container.innerHTML = html;
}

// ============================================
// MIGRATION EFFICIENCY CALCULATOR
// ============================================

function calculateMigrationEfficiency() {
    const container = document.getElementById('migrationEfficiencyResults');
    if (!container) return;
    
    // Get total servers to migrate (from existing infrastructure or calculation results)
    let totalServers = 0;
    if (existingInfrastructure && existingInfrastructure.servers) {
        totalServers = existingInfrastructure.servers.length;
    } else if (calculationResults.totalServers) {
        totalServers = calculationResults.totalServers;
    }
    
    if (totalServers === 0) {
        container.innerHTML = '<p class="text-gray-400">Select historical server generation or import infrastructure to calculate migration efficiency.</p>';
        return;
    }
    
    // Get inputs
    const oldServerPower = parseFloat(document.getElementById('oldServerPower')?.value || 500);
    const powerCost = parseFloat(document.getElementById('migrationPowerCost')?.value || 0.10);
    const runRate = parseInt(document.getElementById('runRateServers')?.value || 250);
    const rackRollRate = parseInt(document.getElementById('rackRollServers')?.value || 500);
    const rackRollPremium = parseFloat(document.getElementById('rackRollPremium')?.value || 15) / 100;
    const pue = parseFloat(document.getElementById('migrationPUE')?.value || 1.5);
    const maintCost = parseFloat(document.getElementById('oldHardwareMaint')?.value || 50);
    
    // Calculate migration durations (in months)
    const runRateDuration = Math.ceil(totalServers / runRate);
    const rackRollDuration = Math.ceil(totalServers / rackRollRate);
    const timeSaved = runRateDuration - rackRollDuration;
    
    // Calculate power cost per server per month
    // Power (W) * hours/month * PUE * $/kWh / 1000
    const hoursPerMonth = 730; // avg hours in a month
    const powerCostPerServerMonth = (oldServerPower * hoursPerMonth * pue * powerCost) / 1000;
    
    // Calculate total cost of running old hardware during migration
    // This is a declining balance as servers get migrated
    // Simplified: average servers running = totalServers / 2 over the migration period
    const avgServersRunning = totalServers / 2;
    
    // Run Rate costs
    const runRatePowerCost = avgServersRunning * powerCostPerServerMonth * runRateDuration;
    const runRateMaintCost = avgServersRunning * maintCost * runRateDuration;
    const runRateTotalOldHwCost = runRatePowerCost + runRateMaintCost;
    
    // Rack & Roll costs
    const rackRollPowerCost = avgServersRunning * powerCostPerServerMonth * rackRollDuration;
    const rackRollMaintCost = avgServersRunning * maintCost * rackRollDuration;
    const rackRollTotalOldHwCost = rackRollPowerCost + rackRollMaintCost;
    
    // Rack & Roll premium cost (applied to new hardware cost)
    const newServerCost = calculationResults.inputs?.serverCost || 15000;
    const rackRollPremiumCost = totalServers * newServerCost * rackRollPremium;
    
    // Total costs
    const runRateTotalCost = runRateTotalOldHwCost;
    const rackRollTotalCost = rackRollTotalOldHwCost + rackRollPremiumCost;
    
    // Savings analysis
    const oldHwSavings = runRateTotalOldHwCost - rackRollTotalOldHwCost;
    const netSavings = oldHwSavings - rackRollPremiumCost;
    const isRackRollBetter = netSavings > 0;
    
    // Break-even premium calculation
    const breakEvenPremium = (oldHwSavings / (totalServers * newServerCost)) * 100;
    
    // Format currency
    const fmt = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Run Rate Analysis -->
            <div class="p-4 bg-slate-800 rounded-lg border-2 ${!isRackRollBetter ? 'border-green-500' : 'border-slate-600'}">
                <h4 class="font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                    <i data-lucide="clock" class="w-4 h-4"></i>Run Rate Model
                </h4>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between"><span class="text-gray-400">Deployment Rate:</span><span>${runRate} servers/mo</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">Migration Duration:</span><span>${runRateDuration} months</span></div>
                    <div class="flex justify-between border-t border-slate-600 pt-2 mt-2"><span class="text-gray-400">Old HW Power Cost:</span><span>${fmt(runRatePowerCost)}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">Old HW Maintenance:</span><span>${fmt(runRateMaintCost)}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">Deployment Premium:</span><span>$0</span></div>
                    <div class="flex justify-between font-semibold border-t border-slate-600 pt-2 mt-2">
                        <span>Total Migration Cost:</span><span class="text-yellow-400">${fmt(runRateTotalCost)}</span>
                    </div>
                </div>
            </div>
            
            <!-- Rack & Roll Analysis -->
            <div class="p-4 bg-slate-800 rounded-lg border-2 ${isRackRollBetter ? 'border-green-500' : 'border-slate-600'}">
                <h4 class="font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <i data-lucide="zap" class="w-4 h-4"></i>Rack & Roll Model
                </h4>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between"><span class="text-gray-400">Deployment Rate:</span><span>${rackRollRate} servers/mo</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">Migration Duration:</span><span>${rackRollDuration} months</span></div>
                    <div class="flex justify-between border-t border-slate-600 pt-2 mt-2"><span class="text-gray-400">Old HW Power Cost:</span><span>${fmt(rackRollPowerCost)}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">Old HW Maintenance:</span><span>${fmt(rackRollMaintCost)}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">Deployment Premium (${(rackRollPremium * 100).toFixed(0)}%):</span><span>${fmt(rackRollPremiumCost)}</span></div>
                    <div class="flex justify-between font-semibold border-t border-slate-600 pt-2 mt-2">
                        <span>Total Migration Cost:</span><span class="text-yellow-400">${fmt(rackRollTotalCost)}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Summary -->
        <div class="mt-6 p-4 bg-slate-700/50 rounded-lg">
            <h4 class="font-semibold mb-3">Efficiency Analysis</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
                <div class="p-3 bg-slate-800 rounded-lg">
                    <div class="text-2xl font-bold text-cyan-400">${timeSaved}</div>
                    <div class="text-xs text-gray-400">Months Saved</div>
                </div>
                <div class="p-3 bg-slate-800 rounded-lg">
                    <div class="text-2xl font-bold text-green-400">${fmt(oldHwSavings)}</div>
                    <div class="text-xs text-gray-400">Old HW Cost Avoided</div>
                </div>
                <div class="p-3 bg-slate-800 rounded-lg">
                    <div class="text-2xl font-bold text-purple-400">${fmt(rackRollPremiumCost)}</div>
                    <div class="text-xs text-gray-400">R&R Premium Cost</div>
                </div>
                <div class="p-3 bg-slate-800 rounded-lg">
                    <div class="text-2xl font-bold ${netSavings >= 0 ? 'text-green-400' : 'text-red-400'}">${netSavings >= 0 ? '+' : ''}${fmt(netSavings)}</div>
                    <div class="text-xs text-gray-400">Net Savings (R&R)</div>
                </div>
            </div>
            
            <!-- Recommendation -->
            <div class="p-4 rounded-lg ${isRackRollBetter ? 'bg-green-500/10 border border-green-500/30' : 'bg-cyan-500/10 border border-cyan-500/30'}">
                <div class="flex items-start gap-3">
                    <i data-lucide="${isRackRollBetter ? 'check-circle' : 'info'}" class="w-5 h-5 ${isRackRollBetter ? 'text-green-400' : 'text-cyan-400'} mt-0.5"></i>
                    <div>
                        <div class="font-semibold ${isRackRollBetter ? 'text-green-400' : 'text-cyan-400'}">
                            ${isRackRollBetter ? 'Rack & Roll Recommended' : 'Run Rate Recommended'}
                        </div>
                        <p class="text-sm text-gray-300 mt-1">
                            ${isRackRollBetter 
                                ? `Faster deployment saves ${fmt(netSavings)} net by avoiding ${timeSaved} months of old hardware costs. Break-even premium is ${breakEvenPremium.toFixed(1)}%.`
                                : `The ${(rackRollPremium * 100).toFixed(0)}% deployment premium exceeds the ${fmt(oldHwSavings)} saved on old hardware. Consider R&R if premium drops below ${breakEvenPremium.toFixed(1)}%.`
                            }
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Assumptions -->
            <p class="text-xs text-gray-500 mt-3 italic">
                * Analysis assumes linear migration (avg ${Math.round(avgServersRunning)} servers running during migration). 
                Power cost: ${fmt(powerCostPerServerMonth)}/server/month at ${powerCost}/kWh with PUE ${pue}.
            </p>
        </div>
    `;
    
    lucide.createIcons();
}

// ============================================
// STORAGE CALCULATOR
// ============================================

// Storage Calculator Pricing (pre-discounted with standard conservative discounts - not configurable)
const STORAGE_PRICING = {
    serverCost: 26066.39,
    switchCost: 19475.05,
    serverOpticsCost: 155.88,
    spineOpticsCost: 875.00,
    drives: {
        '15.3TB': 5488.12,
        '30.7TB': 8291.25,
        '61.4TB': 15451.88,
        '960GB': 1870.51,
        '1.92TB': 3481.22
    }
};

const STORAGE_CONFIG = {
    serversPerRack: 30,
    switchesPerRack: 2,
    opticsPerServer: 2,
    spineOpticsPerSwitch: 4,
    minServers: 8
};

// Drive costs per server for each option
const storageDriveCosts = [
    (8 * STORAGE_PRICING.drives['15.3TB'] + 2 * STORAGE_PRICING.drives['960GB']),
    (8 * STORAGE_PRICING.drives['30.7TB'] + 2 * STORAGE_PRICING.drives['1.92TB']),
    (7 * STORAGE_PRICING.drives['61.4TB'] + 3 * STORAGE_PRICING.drives['1.92TB'])
];

// Capacity per server (raw and usable)
const storageCapacities = [
    { raw: 122.40, usable: 100.00 },
    { raw: 245.60, usable: 200.00 },
    { raw: 429.80, usable: 350.00 }
];

function calculateStorageMetrics() {
    const capacity = parseFloat(document.getElementById('storage-capacity')?.value) || 0;
    const capacityUnit = document.getElementById('storage-capacity-unit')?.value || 'TB';
    const capacityType = document.getElementById('storage-capacity-type')?.value || 'usable';

    const capacityInTB = capacityUnit === 'PB' ? capacity * 1000 : capacity;
    const capacityKey = capacityType === 'raw' ? 'raw' : 'usable';

    const serversRequired = storageCapacities.map(cap => 
        Math.max(STORAGE_CONFIG.minServers, Math.ceil(capacityInTB / cap[capacityKey] || 0))
    );
    const racksRequired = serversRequired.map(servers => 
        Math.ceil(servers / STORAGE_CONFIG.serversPerRack)
    );

    // Update sizing results
    const sizingResults = document.getElementById('storage-sizing-results');
    if (sizingResults) {
        if (capacity > 0) {
            sizingResults.innerHTML = `
                <div class="space-y-2">
                    <p><strong>For ${capacity} ${capacityUnit} of ${capacityType} capacity:</strong></p>
                    <div class="grid grid-cols-3 gap-2 text-center">
                        <div class="p-2 bg-cyan-900/30 rounded">
                            <div class="text-cyan-400 font-bold">${serversRequired[0]}</div>
                            <div class="text-xs">15.3TB servers</div>
                        </div>
                        <div class="p-2 bg-purple-900/30 rounded">
                            <div class="text-purple-400 font-bold">${serversRequired[1]}</div>
                            <div class="text-xs">30.7TB servers</div>
                        </div>
                        <div class="p-2 bg-green-900/30 rounded">
                            <div class="text-green-400 font-bold">${serversRequired[2]}</div>
                            <div class="text-xs">60.44TB servers</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            sizingResults.textContent = `Enter capacity to see the number of servers and racks required (minimum ${STORAGE_CONFIG.minServers} servers per cluster).`;
        }
    }

    // Get table cells
    const rawCapacityCells = document.querySelectorAll('.storage-raw-capacity');
    const usableCapacityCells = document.querySelectorAll('.storage-usable-capacity');
    const serversRequiredCells = document.querySelectorAll('.storage-servers-required');
    const racksRequiredCells = document.querySelectorAll('.storage-racks-required');
    const totalRackUnitsCells = document.querySelectorAll('.storage-total-rack-units');
    const networkSwitchesCells = document.querySelectorAll('.storage-network-switches');
    const opticsCountCells = document.querySelectorAll('.storage-optics-count');
    const spineOpticsCountCells = document.querySelectorAll('.storage-spine-optics-count');
    const totalSolutionPriceCells = document.querySelectorAll('.storage-total-solution-price');
    const pricePerUsableTbCells = document.querySelectorAll('.storage-price-per-usable-tb');
    const costBreakdownCells = document.querySelectorAll('.storage-cost-breakdown');

    // Calculate for each option
    for (let i = 0; i < 3; i++) {
        const servers = serversRequired[i];
        const racks = racksRequired[i];
        
        const switches = racks * STORAGE_CONFIG.switchesPerRack;
        const serverOptics = servers * STORAGE_CONFIG.opticsPerServer;
        const spineOptics = switches * STORAGE_CONFIG.spineOpticsPerSwitch;
        
        const serverCostTotal = STORAGE_PRICING.serverCost * servers;
        const driveCostTotal = storageDriveCosts[i] * servers;
        const switchesCostTotal = switches * STORAGE_PRICING.switchCost;
        const serverOpticsCostTotal = serverOptics * STORAGE_PRICING.serverOpticsCost;
        const spineOpticsCostTotal = spineOptics * STORAGE_PRICING.spineOpticsCost;

        const totalPrice = serverCostTotal + driveCostTotal + switchesCostTotal + serverOpticsCostTotal + spineOpticsCostTotal;

        if (rawCapacityCells[i]) rawCapacityCells[i].textContent = storageCapacities[i].raw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (usableCapacityCells[i]) usableCapacityCells[i].textContent = storageCapacities[i].usable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (serversRequiredCells[i]) serversRequiredCells[i].textContent = servers.toLocaleString('en-US');
        if (racksRequiredCells[i]) racksRequiredCells[i].textContent = racks.toLocaleString('en-US');
        if (totalRackUnitsCells[i]) totalRackUnitsCells[i].textContent = (servers + switches).toLocaleString('en-US');
        if (networkSwitchesCells[i]) networkSwitchesCells[i].textContent = switches.toLocaleString('en-US');
        if (opticsCountCells[i]) opticsCountCells[i].textContent = serverOptics.toLocaleString('en-US');
        if (spineOpticsCountCells[i]) spineOpticsCountCells[i].textContent = spineOptics.toLocaleString('en-US');
        if (totalSolutionPriceCells[i]) totalSolutionPriceCells[i].textContent = totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (pricePerUsableTbCells[i]) pricePerUsableTbCells[i].textContent = (totalPrice / (servers * storageCapacities[i].usable)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (costBreakdownCells[i]) costBreakdownCells[i].innerHTML = `Servers: ${serverCostTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br>Drives: ${driveCostTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br>Switches: ${switchesCostTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br>Server Optics: ${serverOpticsCostTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br>Spine Optics: ${spineOpticsCostTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
}

// Initialize storage calculator event listeners
function initStorageCalculator() {
    const storageInputs = [
        'storage-capacity', 'storage-capacity-unit', 'storage-capacity-type'
    ];
    
    storageInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', calculateStorageMetrics);
            el.addEventListener('change', calculateStorageMetrics);
        }
    });
    
    // Initial calculation
    calculateStorageMetrics();
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Load custom workloads from localStorage
    loadCustomWorkloads();
    
    // Initialize storage calculator
    initStorageCalculator();
    
    // Check for config in URL
    loadFromURL();
    
    // Show wizard on first load (unless loaded from URL)
    const params = new URLSearchParams(window.location.search);
    if (!params.get('config')) {
        selectNetworkSpeed('25g');
        selectRackLayout('single');
        updateWizardUI();
    }
    
    lucide.createIcons();
    
    // Also calculate with defaults in background
    calculate();
    updateSavedConfigsList();
    updateSitesDisplay();
    calculateMultiSite();
});
