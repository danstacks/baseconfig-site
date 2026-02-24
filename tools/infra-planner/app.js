// Initialize Lucide icons
lucide.createIcons();

// Global state
let calculationResults = {};
let wizardStep = 1;
let selectedNetworkSpeed = '25g';
let selectedRackLayout = 'single';

// Workload presets with typical configurations
const workloadPresets = {
    high_compute: {
        name: 'High Compute',
        serverPower: 1224,
        serverCost: 93718.61,
        serverHeight: 1,
        storagePerServer: 5,
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
        description: 'Hadoop distributed storage and compute nodes'
    },
    datawarehouse_amd: {
        name: 'DataWarehouse - AMD',
        serverPower: 993,
        serverCost: 77524.56,
        serverHeight: 2,
        storagePerServer: 50,
        description: 'AMD-based data warehouse servers'
    },
    datawarehouse_intel: {
        name: 'DataWarehouse - Intel',
        serverPower: 964,
        serverCost: 96745.95,
        serverHeight: 2,
        storagePerServer: 50,
        description: 'Intel-based data warehouse servers'
    },
    gp_local_intel: {
        name: 'General Purpose Local Intel',
        serverPower: 574,
        serverCost: 37583.81,
        serverHeight: 1,
        storagePerServer: 2,
        description: 'Intel general purpose with local storage'
    },
    gp_san_intel: {
        name: 'General Purpose SAN Intel',
        serverPower: 731,
        serverCost: 33697.29,
        serverHeight: 1,
        storagePerServer: 0,
        description: 'Intel general purpose with SAN storage'
    },
    db_local_intel: {
        name: 'Database Local Optimized Intel',
        serverPower: 934,
        serverCost: 57980.73,
        serverHeight: 2,
        storagePerServer: 20,
        description: 'Intel database servers with local NVMe storage'
    },
    db_san_intel: {
        name: 'Database SAN Optimized Intel',
        serverPower: 891,
        serverCost: 53551.32,
        serverHeight: 2,
        storagePerServer: 0,
        description: 'Intel database servers with SAN storage'
    },
    gp_san_amd: {
        name: 'General Purpose SAN AMD',
        serverPower: 770,
        serverCost: 42388.37,
        serverHeight: 1,
        storagePerServer: 0,
        description: 'AMD general purpose with SAN storage'
    },
    db_local_amd: {
        name: 'Database Local Optimized AMD',
        serverPower: 994,
        serverCost: 75604.69,
        serverHeight: 2,
        storagePerServer: 20,
        description: 'AMD database servers with local NVMe storage'
    },
    db_san_amd: {
        name: 'Database SAN Optimized AMD',
        serverPower: 926,
        serverCost: 70077.29,
        serverHeight: 2,
        storagePerServer: 0,
        description: 'AMD database servers with SAN storage'
    },
    hypervisor: {
        name: 'Hypervisor',
        serverPower: 970,
        serverCost: 51501.34,
        serverHeight: 2,
        storagePerServer: 5,
        description: 'Virtualization hosts for VM workloads'
    },
    container_worker: {
        name: 'Container Worker',
        serverPower: 556,
        serverCost: 46312.82,
        serverHeight: 1,
        storagePerServer: 2,
        description: 'Kubernetes/container worker nodes'
    },
    oracle_db_intel: {
        name: 'Oracle DB Optimized Intel',
        serverPower: 871,
        serverCost: 81500.01,
        serverHeight: 2,
        storagePerServer: 30,
        description: 'Oracle database optimized configuration'
    },
    logging: {
        name: 'Logging',
        serverPower: 1073,
        serverCost: 53436.81,
        serverHeight: 2,
        storagePerServer: 50,
        description: 'Log aggregation and analysis servers'
    },
    data_storage: {
        name: 'Data Storage Servers',
        serverPower: 1151,
        serverCost: 52548.37,
        serverHeight: 4,
        storagePerServer: 200,
        description: 'High-density storage servers'
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
    
    if (workloadType && workloadPresets[workloadType]) {
        const preset = workloadPresets[workloadType];
        document.getElementById('workloadDescription').textContent = preset.description;
        
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
            specsContent.innerHTML = html;
        } else {
            specsDiv.classList.add('hidden');
        }
    } else {
        document.getElementById('workloadDescription').textContent = '';
        specsDiv.classList.add('hidden');
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
        storageNodeCapacity: parseFloat(document.getElementById('storageNodeCapacity').value) || 500,
        storageNodeCost: parseFloat(document.getElementById('storageNodeCost').value) || 75000,
        replicationFactor: parseInt(document.getElementById('replicationFactor').value) || 3,
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
    
    // Calculate storage
    const totalStorageNeeded = inputs.totalServers * inputs.storagePerServer * inputs.replicationFactor;
    const storageNodes = inputs.storagePerServer > 0 ? Math.ceil(totalStorageNeeded / inputs.storageNodeCapacity) : 0;
    
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
    const storageCost = storageNodes * inputs.storageNodeCost;
    
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
        torPowerKw, isSplit
    };
    
    updateScalableUnitsSection();
    updateTimelineSection();
    updateCostsSection();
    updateSummarySection();
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
        { component: 'Storage Nodes', perUnit: '-', total: r.storageNodes, unitCost: i.storageNodeCost, totalCost: r.storageCost }
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
        { label: 'Storage Nodes', cost: r.storageCost }
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

function updateSummarySection() {
    const r = calculationResults;
    const i = r.inputs;
    const timeSaved = r.runRateMonths - r.rackRollMonths;
    const costDiff = r.rackRollTotalCost - r.runRateTotalCost;
    
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

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Show wizard on first load
    selectNetworkSpeed('25g');
    selectRackLayout('single');
    updateWizardUI();
    lucide.createIcons();
    
    // Also calculate with defaults in background
    calculate();
});
