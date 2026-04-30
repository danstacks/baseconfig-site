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
                description: '24x 2.5-inch SFF SAS/SATA drive bays, front bays 1\u20134 support NVMe',
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
                description: '12x 2.5-inch SFF SAS/SATA drive bays, front bays 1\u20134 support NVMe',
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
            'BIOS hot-plug support must be enabled',
            'UEFI boot mode required (legacy boot not supported for NVMe)',
            'NVMe SSDs cannot be controlled by SAS RAID controller',
            'NVMe SSDs do not show in SAS RAID controller configuration utilities',
        ],
        rearNvmeRisers: ['Riser 1A', 'Riser 3A'],
        controllerOptions: [
            { id: 'mraid', pid: 'UCSC-RAID-M6SD', label: 'Cisco 12G SAS RAID Controller', description: 'MegaRAID SAS controller for SAS/SATA + NVMe pass-through' },
            { id: 'hba', pid: 'UCSC-SAS-M6HD', label: 'Cisco 12G SAS HBA', description: 'SAS HBA — drives presented directly to OS (JBOD)' },
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
                nvmeRearBays: [],
                description: '24x 2.5-inch SFF SAS/SATA drive bays, front bays 1\u20134 support NVMe',
            },
        },
        requirements: [
            'Two CPUs must be installed for NVMe support',
            'BIOS hot-plug support must be enabled',
            'UEFI boot mode required (legacy boot not supported for NVMe)',
            'NVMe SSDs cannot be controlled by SAS RAID controller',
            'When mixing NVMe form factors, drives must be the same brand',
        ],
        rearNvmeRisers: ['Riser 1B (slots 2\u20133)', 'Riser 3B (slots 7\u20138)'],
        controllerOptions: [
            { id: 'mraid', pid: 'UCSC-RAID-M6SD', label: 'Cisco 12G Modular RAID Controller', description: 'RAID controller — requires cable CBL-SDFNVME-245M6 for front NVMe' },
            { id: 'dual-hba', pid: 'UCSC-SAS-240M6', label: 'Dual SAS HBAs (x2)', description: 'Two SAS HBAs — requires cable CBL-FNVME-C245M6 for front NVMe' },
            { id: 'none', pid: null, label: 'No Storage Controller (M.2 Boot Only)', description: 'No SAS/RAID controller installed — NVMe drives connect via direct PCIe cable' },
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
                description: '24x 2.5-inch SFF SAS/SATA bays, front bays 1\u20134 support U.3 NVMe',
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
            'PCIe Riser 2 not available in single-CPU configurations',
            'BIOS hot-plug support must be enabled',
            'UEFI boot mode required (legacy boot not supported for NVMe)',
            'NVMe SSDs cannot be controlled by SAS RAID controller',
            'U.3 NVMe drives supported (tri-mode backplane)',
        ],
        rearNvmeRisers: ['Riser 1B', 'Riser 3B'],
        controllerOptions: [
            { id: 'mraid', pid: 'UCSC-RAID-M7', label: 'Cisco 12G SAS RAID Controller', description: 'MegaRAID controller — SAS/SATA + NVMe pass-through via tri-mode backplane' },
            { id: 'hba', pid: 'UCSC-SAS-M7HD', label: 'Cisco 12G SAS HBA', description: 'SAS HBA — JBOD mode, drives presented directly to OS' },
            { id: 'none', pid: null, label: 'No Storage Controller (M.2 Boot Only)', description: 'No SAS/RAID controller installed — server boots from M.2, NVMe via direct PCIe' },
        ],
        biosSettings: {
            path: 'BIOS > Advanced > PCI Configuration',
            setting: 'NVMe Hot-Plug Support',
            value: 'Enabled',
        },
    },
};

const CABLES = {
    'CBL-NVME-C240SFF': {
        pid: 'CBL-NVME-C240SFF',
        description: 'NVMe PCIe cable for C240 M6/M7 SFF front-loading drives',
        servers: ['C240-M6', 'C240-M7'],
        location: 'front',
        driveConnections: 'Connects front NVMe bays to PCIe switch/CPU',
        notes: 'Required for front-loading SFF NVMe drives',
    },
    'CBL-FNVME-240M6': {
        pid: 'CBL-FNVME-240M6=',
        description: 'Front NVMe cable kit for C240 M6 24-drive SFF configurations',
        servers: ['C240-M6'],
        location: 'front',
        driveConnections: 'Includes cable 74-126742-01 (drives 1\u20132) and 74-124687-01 (drives 3\u20134)',
        notes: 'For UCSC-C240-M6SX and UCSC-C240-M6SN PIDs',
        subCables: [
            { partNumber: '74-126742-01', drives: [1, 2] },
            { partNumber: '74-124687-01', drives: [3, 4] },
        ],
    },
    'CBL-NVME-C240LFF': {
        pid: 'CBL-NVME-C240LFF',
        description: 'NVMe PCIe cable for C240 M6 LFF configuration',
        servers: ['C240-M6'],
        location: 'front',
        driveConnections: 'Connects LFF bays with SFF NVMe sled adapters',
        notes: 'Requires UCS-LFF-SFF-SLED2 adapter in each LFF bay',
    },
    'CBL-RNVME-240M6': {
        pid: 'CBL-RNVME-240M6=',
        description: 'Rear NVMe cable kit for C240 M6',
        servers: ['C240-M6'],
        location: 'rear',
        driveConnections: 'Connects rear NVMe bays 101\u2013104 to riser slots',
        notes: 'Requires Riser 1A or 3A installed',
    },
    'CBL-SDFNVME-245M6': {
        pid: 'CBL-SDFNVME-245M6',
        description: 'NVMe cable for C245 M6 with RAID controller',
        servers: ['C245-M6'],
        location: 'front',
        driveConnections: 'Front NVMe drives 1\u20134 when UCSC-RAID-M6SD is installed',
        notes: 'Use when server has RAID controller UCSC-RAID-M6SD',
        requiresController: 'UCSC-RAID-M6SD',
    },
    'CBL-FNVME-C245M6': {
        pid: 'CBL-FNVME-C245M6',
        description: 'NVMe cable for C245 M6 (non-RAID path)',
        servers: ['C245-M6'],
        location: 'front',
        driveConnections: 'Front NVMe drives 1\u20134 via direct PCIe connection to CPU',
        notes: 'Use when server has dual SAS HBAs or no storage controller',
        requiresController: 'UCSC-SAS-240M6 (x2)',
        defaultForNoController: true,
    },
    'CBL-RNVME-C240M7': {
        pid: 'CBL-RNVME-C240M7=',
        description: 'Rear NVMe cable kit for C240 M7',
        servers: ['C240-M7'],
        location: 'rear',
        driveConnections: 'Connects rear NVMe bays 101\u2013104 to riser slots',
        notes: 'Requires Riser 1B or 3B, and PCIe Riser 2B or 2C installed',
    },
};

const NVME_DRIVES = {
    // M6 Generation
    'UCS-SD960G6I1X-EV':   { pid: 'UCS-SD960G6I1X-EV',   capacity: '960 GB',  capacityBytes: 960e9,   formFactor: '2.5-inch U.2', interface: 'NVMe PCIe Gen4 x4', endurance: 'Mixed Use', servers: ['C240-M6','C245-M6'], vendor: 'Intel/Solidigm' },
    'UCS-SD19T6G6I1X-EV':  { pid: 'UCS-SD19T6G6I1X-EV',  capacity: '1.92 TB', capacityBytes: 1.92e12, formFactor: '2.5-inch U.2', interface: 'NVMe PCIe Gen4 x4', endurance: 'Mixed Use', servers: ['C240-M6','C245-M6'], vendor: 'Intel/Solidigm' },
    'UCS-SD38T3G6I1X-EV':  { pid: 'UCS-SD38T3G6I1X-EV',  capacity: '3.84 TB', capacityBytes: 3.84e12, formFactor: '2.5-inch U.2', interface: 'NVMe PCIe Gen4 x4', endurance: 'Mixed Use', servers: ['C240-M6','C245-M6'], vendor: 'Intel/Solidigm' },
    'UCS-SD76T8G6I1X-EV':  { pid: 'UCS-SD76T8G6I1X-EV',  capacity: '7.68 TB', capacityBytes: 7.68e12, formFactor: '2.5-inch U.2', interface: 'NVMe PCIe Gen4 x4', endurance: 'Mixed Use', servers: ['C240-M6','C245-M6'], vendor: 'Intel/Solidigm' },
    'UCS-SD960GK6I1X-EV':  { pid: 'UCS-SD960GK6I1X-EV',  capacity: '960 GB',  capacityBytes: 960e9,   formFactor: '2.5-inch U.2', interface: 'NVMe PCIe Gen4 x4', endurance: 'Mixed Use', servers: ['C240-M6','C245-M6'], vendor: 'KIOXIA' },
    'UCS-SD19T6G6K1X-EV':  { pid: 'UCS-SD19T6G6K1X-EV',  capacity: '1.92 TB', capacityBytes: 1.92e12, formFactor: '2.5-inch U.2', interface: 'NVMe PCIe Gen4 x4', endurance: 'Mixed Use', servers: ['C240-M6','C245-M6'], vendor: 'KIOXIA' },
    'UCS-SD38T3G6K1X-EV':  { pid: 'UCS-SD38T3G6K1X-EV',  capacity: '3.84 TB', capacityBytes: 3.84e12, formFactor: '2.5-inch U.2', interface: 'NVMe PCIe Gen4 x4', endurance: 'Mixed Use', servers: ['C240-M6','C245-M6'], vendor: 'KIOXIA' },
    'UCS-SD76T8G6K1X-EV':  { pid: 'UCS-SD76T8G6K1X-EV',  capacity: '7.68 TB', capacityBytes: 7.68e12, formFactor: '2.5-inch U.2', interface: 'NVMe PCIe Gen4 x4', endurance: 'Mixed Use', servers: ['C240-M6','C245-M6'], vendor: 'KIOXIA' },
    'UCS-SD960GM6I1X-EV':  { pid: 'UCS-SD960GM6I1X-EV',  capacity: '960 GB',  capacityBytes: 960e9,   formFactor: '2.5-inch U.2', interface: 'NVMe PCIe Gen4 x4', endurance: 'Mixed Use', servers: ['C240-M6','C245-M6'], vendor: 'Micron' },
    'UCS-SD19T6G6M1X-EV':  { pid: 'UCS-SD19T6G6M1X-EV',  capacity: '1.92 TB', capacityBytes: 1.92e12, formFactor: '2.5-inch U.2', interface: 'NVMe PCIe Gen4 x4', endurance: 'Mixed Use', servers: ['C240-M6','C245-M6'], vendor: 'Micron' },
    // M7 Generation
    'UCS-SD960G7I1X-EV':   { pid: 'UCS-SD960G7I1X-EV',   capacity: '960 GB',  capacityBytes: 960e9,   formFactor: '2.5-inch U.3', interface: 'NVMe PCIe Gen4 x4', endurance: 'Mixed Use', servers: ['C240-M7'], vendor: 'Intel/Solidigm' },
    'UCS-SD19T6G7I1X-EV':  { pid: 'UCS-SD19T6G7I1X-EV',  capacity: '1.92 TB', capacityBytes: 1.92e12, formFactor: '2.5-inch U.3', interface: 'NVMe PCIe Gen4 x4', endurance: 'Mixed Use', servers: ['C240-M7'], vendor: 'Intel/Solidigm' },
    'UCS-SD38T3G7I1X-EV':  { pid: 'UCS-SD38T3G7I1X-EV',  capacity: '3.84 TB', capacityBytes: 3.84e12, formFactor: '2.5-inch U.3', interface: 'NVMe PCIe Gen4 x4', endurance: 'Mixed Use', servers: ['C240-M7'], vendor: 'Intel/Solidigm' },
    'UCS-SD76T8G7I1X-EV':  { pid: 'UCS-SD76T8G7I1X-EV',  capacity: '7.68 TB', capacityBytes: 7.68e12, formFactor: '2.5-inch U.3', interface: 'NVMe PCIe Gen4 x4', endurance: 'Mixed Use', servers: ['C240-M7'], vendor: 'Intel/Solidigm' },
    'UCS-SD960G7K1X-EV':   { pid: 'UCS-SD960G7K1X-EV',   capacity: '960 GB',  capacityBytes: 960e9,   formFactor: '2.5-inch U.3', interface: 'NVMe PCIe Gen4 x4', endurance: 'Mixed Use', servers: ['C240-M7'], vendor: 'KIOXIA' },
    'UCS-SD19T6G7K1X-EV':  { pid: 'UCS-SD19T6G7K1X-EV',  capacity: '1.92 TB', capacityBytes: 1.92e12, formFactor: '2.5-inch U.3', interface: 'NVMe PCIe Gen4 x4', endurance: 'Mixed Use', servers: ['C240-M7'], vendor: 'KIOXIA' },
    'UCS-SD38T3G7K1X-EV':  { pid: 'UCS-SD38T3G7K1X-EV',  capacity: '3.84 TB', capacityBytes: 3.84e12, formFactor: '2.5-inch U.3', interface: 'NVMe PCIe Gen4 x4', endurance: 'Mixed Use', servers: ['C240-M7'], vendor: 'KIOXIA' },
    'UCS-SD76T8G7K1X-EV':  { pid: 'UCS-SD76T8G7K1X-EV',  capacity: '7.68 TB', capacityBytes: 7.68e12, formFactor: '2.5-inch U.3', interface: 'NVMe PCIe Gen4 x4', endurance: 'Mixed Use', servers: ['C240-M7'], vendor: 'KIOXIA' },
    'UCS-SD960G7M1X-EV':   { pid: 'UCS-SD960G7M1X-EV',   capacity: '960 GB',  capacityBytes: 960e9,   formFactor: '2.5-inch U.3', interface: 'NVMe PCIe Gen4 x4', endurance: 'Mixed Use', servers: ['C240-M7'], vendor: 'Micron' },
    'UCS-SD19T6G7M1X-EV':  { pid: 'UCS-SD19T6G7M1X-EV',  capacity: '1.92 TB', capacityBytes: 1.92e12, formFactor: '2.5-inch U.3', interface: 'NVMe PCIe Gen4 x4', endurance: 'Mixed Use', servers: ['C240-M7'], vendor: 'Micron' },
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
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCompatibleDrives(serverKey) {
    return Object.values(NVME_DRIVES).filter(d => d.servers.includes(serverKey));
}

function getRequiredCables(serverKey, location) {
    const server = SERVER_MODELS[serverKey];
    return Object.values(CABLES).filter(c => {
        if (!c.servers.includes(serverKey)) return false;
        if (c.location !== location) return false;

        // Cable has no controller dependency — always show
        if (!c.requiresController) return true;

        // Controller not yet selected — hide controller-dependent cables
        if (!state.selectedController) return false;

        // "No controller" selected — show cables marked as default for no-controller
        if (state.selectedController === 'none') {
            return c.defaultForNoController === true;
        }

        // Match selected controller PID against cable's required controller
        const selectedOpt = server.controllerOptions?.find(o => o.id === state.selectedController);
        if (!selectedOpt || !selectedOpt.pid) return false;
        const cableCtrl = c.requiresController.replace(/\s*\(x2\)/, '');
        return selectedOpt.pid === cableCtrl;
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
        items.push({ pid: drive.pid, description: `${drive.capacity} ${drive.formFactor} NVMe SSD (${drive.vendor})`, qty: state.selectedBays.length });
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">`;

    Object.entries(SERVER_MODELS).forEach(([key, server]) => {
        const pidCount = Object.keys(server.pids).length;
        html += `<button onclick="selectServer('${key}')" class="card card-hover rounded-xl p-6 text-left group">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                    <i data-lucide="server" class="w-5 h-5 text-cyan-400"></i>
                </div>
                <div>
                    <h3 class="font-bold text-white">${server.name}</h3>
                    <span class="text-xs font-mono text-cyan-400">${server.generation}</span>
                </div>
            </div>
            <p class="text-sm text-gray-400 mb-3">${server.processor}</p>
            <div class="text-xs text-gray-500">${pidCount} configuration${pidCount > 1 ? 's' : ''} available</div>
            <i data-lucide="chevron-right" class="w-4 h-4 text-cyan-500 mt-3 opacity-0 group-hover:opacity-100 transition-opacity"></i>
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
            ${state.selectedDrive ? `<span class="flex items-center gap-1 text-green-400"><i data-lucide="check-circle" class="w-4 h-4"></i> ${NVME_DRIVES[state.selectedDrive].capacity}</span>` : ''}
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

    const hasControllerCables = Object.values(CABLES).some(
        c => c.servers.includes(state.serverKey) && c.requiresController
    );

    let html = `<div class="card rounded-xl p-5 space-y-4">
        <h4 class="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <i data-lucide="cpu" class="w-4 h-4 text-purple-400"></i> Storage Controller
            ${hasControllerCables ? '<span class="text-xs font-normal text-amber-400 ml-2">* Determines which NVMe cable is required</span>' : ''}
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

    if (!state.selectedController && hasControllerCables) {
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

        html += `<button onclick="${isNvme ? `toggleBay(${bay})` : ''}" ${!isNvme ? 'disabled' : ''}
            class="bay-btn relative h-12 rounded-lg border text-xs font-mono flex flex-col items-center justify-center ${cls}"
            title="${isNvme ? `Bay ${bay} \u2014 NVMe supported` : `Bay ${bay} \u2014 SAS/SATA only`}">
            <span class="font-bold">${bay}</span>
            ${isNvme ? '<span class="text-[9px] opacity-60">NVMe</span>' : ''}
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
    const drives = getCompatibleDrives(state.serverKey);
    const grouped = {};
    drives.forEach(d => {
        if (!grouped[d.vendor]) grouped[d.vendor] = [];
        grouped[d.vendor].push(d);
    });

    let html = `<div class="card rounded-xl p-5 space-y-3">
        <h4 class="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <i data-lucide="hard-drive" class="w-4 h-4 text-cyan-400"></i> Compatible NVMe Drives
        </h4>
        <div class="text-xs text-amber-400/80 flex items-center gap-1 mb-2">
            <i data-lucide="alert-triangle" class="w-3 h-3"></i>
            Always verify latest compatibility on <a href="https://ucshcltool.cloudapps.cisco.com/public/" target="_blank" rel="noopener" class="underline hover:text-amber-300 ml-1">Cisco HCL Tool</a>
        </div>`;

    Object.entries(grouped).forEach(([vendor, vendorDrives]) => {
        const isExpanded = state.expandedVendor === vendor;
        html += `<div class="card rounded-lg overflow-hidden">
            <button onclick="toggleVendor('${vendor}')" class="vendor-header w-full flex items-center justify-between px-4 py-3">
                <span class="font-medium text-sm">${vendor}</span>
                <div class="flex items-center gap-2 text-xs text-gray-400">
                    <span>${vendorDrives.length} drives</span>
                    <i data-lucide="${isExpanded ? 'chevron-up' : 'chevron-down'}" class="w-4 h-4"></i>
                </div>
            </button>`;

        if (isExpanded) {
            html += '<div class="border-t border-slate-600/50">';
            vendorDrives.forEach(drive => {
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
                    <div class="text-right">
                        <span class="font-bold text-white">${drive.capacity}</span>
                        <div class="text-xs text-gray-500">${drive.endurance}</div>
                    </div>
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
    const hasControllerCables = Object.values(CABLES).some(
        c => c.servers.includes(state.serverKey) && c.requiresController
    );
    const needsControllerFirst = hasControllerCables && !state.selectedController;

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
            No special cables required for this configuration &mdash; drives connect via backplane.
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

function selectServer(key) {
    state.serverKey = key;
    state.pid = null;
    state.selectedBays = [];
    state.selectedDrive = null;
    state.expandedVendor = null;
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
    if (step === 0) { state.serverKey = null; state.pid = null; }
    if (step <= 1) { state.pid = null; state.selectedBays = []; state.selectedDrive = null; }
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

// ─── Init ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    render();
});
