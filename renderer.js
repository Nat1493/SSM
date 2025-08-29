// SS Mudyf Accounting System - Main Application Logic with Receipt Management
const { ipcRenderer } = require('electron');

// Application State
let expenses = JSON.parse(localStorage.getItem('ssMudyfExpenses') || '[]');
let settings = JSON.parse(localStorage.getItem('ssMudyfSettings') || '{}');
let currentReceipts = []; // Temporary storage for receipts during form entry

// Factory Configuration
const FACTORIES = {
    investments: {
        name: 'SS Mudyf Investments (PTY) ltd',
        location: 'Matsapha',
        id: 'investments'
    },
    textiles: {
        name: 'SS Mudyf Textiles (PTY) ltd',
        location: 'Matsanjeni',
        id: 'textiles'
    }
};

// Receipt Management
const RECEIPT_CONFIG = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'],
    maxFiles: 10
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏭 SS Mudyf Accounting System Loading...');
    initializeApp();
    setupEventListeners();
    populateYearDropdown();
    updateDashboard();
    loadRecentExpenses();
    console.log('✅ Application fully loaded!');
});

// Initialize application
function initializeApp() {
    // Set current date
    const dateInput = document.getElementById('expenseDate');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
    
    // Load settings
    if (settings.companyName) {
        const companyNameInput = document.getElementById('companyName');
        if (companyNameInput) companyNameInput.value = settings.companyName;
    }
    if (settings.companyAddress) {
        const companyAddressInput = document.getElementById('companyAddress');
        if (companyAddressInput) companyAddressInput.value = settings.companyAddress;
    }
    if (settings.companyContact) {
        const companyContactInput = document.getElementById('companyContact');
        if (companyContactInput) companyContactInput.value = settings.companyContact;
    }

    console.log('📊 Loaded', expenses.length, 'existing expenses');
}

// Setup event listeners
function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
            console.log('🔄 Switched to tab:', tabName);
        });
    });

    // Factory selector
    const factorySelect = document.getElementById('factorySelect');
    if (factorySelect) {
        factorySelect.addEventListener('change', function() {
            updateDashboard();
            loadRecentExpenses();
            console.log('🏭 Factory changed to:', this.value);
        });
    }

    // Expense form
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
    }

    // Receipt upload handling
    const receiptInput = document.getElementById('expenseReceipt');
    if (receiptInput) {
        receiptInput.addEventListener('change', handleReceiptUpload);
    }

    // Report generation
    const generateReportBtn = document.getElementById('generateReport');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }

    const printReportBtn = document.getElementById('printReport');
    if (printReportBtn) {
        printReportBtn.addEventListener('click', printReport);
    }

    const exportDataBtn = document.getElementById('exportData');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportData);
    }

    // Settings
    const backupDataBtn = document.getElementById('backupData');
    if (backupDataBtn) {
        backupDataBtn.addEventListener('click', backupData);
    }

    const importDataBtn = document.getElementById('importData');
    if (importDataBtn) {
        importDataBtn.addEventListener('click', importData);
    }

    const clearAllDataBtn = document.getElementById('clearAllData');
    if (clearAllDataBtn) {
        clearAllDataBtn.addEventListener('click', clearAllData);
    }

    // Settings save
    ['companyName', 'companyAddress', 'companyContact'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', saveSettings);
        }
    });

    // IPC listeners
    ipcRenderer.on('new-expense', () => switchTab('expenses'));
    ipcRenderer.on('generate-report', () => switchTab('reports'));
    ipcRenderer.on('monthly-report', () => {
        switchTab('reports');
        const reportType = document.getElementById('reportType');
        if (reportType) reportType.value = 'standard';
        generateReport();
    });
    ipcRenderer.on('bank-report', () => {
        switchTab('reports');
        const reportType = document.getElementById('reportType');
        if (reportType) reportType.value = 'bank';
        generateReport();
    });
    ipcRenderer.on('revenue-office-report', () => {
        switchTab('reports');
        const reportType = document.getElementById('reportType');
        if (reportType) reportType.value = 'revenue-office';
        generateReport();
    });

    console.log('🎯 All event listeners attached successfully');
}

// Tab switching
function switchTab(tabName) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Update content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.getElementById(tabName);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Update dashboard when switching to it
    if (tabName === 'dashboard') {
        updateDashboard();
        loadRecentExpenses();
    }
}

// Handle expense form submission
function handleExpenseSubmit(e) {
    e.preventDefault();
    console.log('💰 Adding new expense...');
    
    const formData = {
        id: Date.now().toString(),
        date: document.getElementById('expenseDate').value,
        factory: document.getElementById('expenseFactory').value,
        category: document.getElementById('expenseCategory').value,
        description: document.getElementById('expenseDescription').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        reference: document.getElementById('expenseReference').value || '',
        vendor: document.getElementById('expenseVendor').value || '',
        receipts: [...currentReceipts], // Include uploaded receipts
        timestamp: new Date().toISOString()
    };

    // Validation
    if (!formData.date || !formData.factory || !formData.category || !formData.description || !formData.amount) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    if (formData.amount <= 0) {
        showNotification('Amount must be greater than 0', 'error');
        return;
    }

    // Add to expenses array
    expenses.unshift(formData);
    
    // Save to localStorage
    localStorage.setItem('ssMudyfExpenses', JSON.stringify(expenses));
    
    // Reset form and receipts
    document.getElementById('expenseForm').reset();
    document.getElementById('expenseDate').valueAsDate = new Date();
    currentReceipts = [];
    updateReceiptPreview();
    
    // Show success message
    const receiptText = formData.receipts.length > 0 ? ` with ${formData.receipts.length} receipt(s)` : '';
    showNotification(`💰 Expense of E ${formData.amount.toLocaleString()}${receiptText} added successfully!`, 'success');
    
    // Update dashboard
    updateDashboard();
    loadRecentExpenses();

    console.log('✅ Expense added:', formData.description, 'E', formData.amount, 'Receipts:', formData.receipts.length);
}

// Handle receipt file upload
async function handleReceiptUpload(event) {
    const files = Array.from(event.target.files);
    console.log('📎 Processing', files.length, 'receipt files...');
    
    for (const file of files) {
        // Validate file
        if (!validateReceiptFile(file)) {
            continue;
        }
        
        // Check if already at max files
        if (currentReceipts.length >= RECEIPT_CONFIG.maxFiles) {
            showNotification(`Maximum ${RECEIPT_CONFIG.maxFiles} receipts allowed per expense`, 'error');
            break;
        }
        
        try {
            const receipt = await processReceiptFile(file);
            currentReceipts.push(receipt);
            console.log('✅ Receipt processed:', file.name);
        } catch (error) {
            console.error('❌ Receipt processing failed:', error);
            showNotification(`Failed to process ${file.name}: ${error.message}`, 'error');
        }
    }
    
    updateReceiptPreview();
    
    // Clear the file input to allow re-uploading the same file
    event.target.value = '';
}

// Validate receipt file
function validateReceiptFile(file) {
    // Check file type
    if (!RECEIPT_CONFIG.acceptedTypes.includes(file.type)) {
        showNotification(`${file.name}: Unsupported file type. Please use JPG, PNG, GIF, or PDF files.`, 'error');
        return false;
    }
    
    // Check file size
    if (file.size > RECEIPT_CONFIG.maxFileSize) {
        const maxSizeMB = RECEIPT_CONFIG.maxFileSize / (1024 * 1024);
        showNotification(`${file.name}: File too large. Maximum size is ${maxSizeMB}MB.`, 'error');
        return false;
    }
    
    // Check for duplicate names
    if (currentReceipts.some(receipt => receipt.name === file.name)) {
        showNotification(`${file.name}: File already attached.`, 'error');
        return false;
    }
    
    return true;
}

// Process receipt file to base64
function processReceiptFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            resolve({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: file.name,
                type: file.type,
                size: file.size,
                data: event.target.result, // Base64 data
                uploadDate: new Date().toISOString()
            });
        };
        
        reader.onerror = function() {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(file);
    });
}

// Update receipt preview
function updateReceiptPreview() {
    const previewContainer = document.getElementById('receiptPreview');
    if (!previewContainer) return;
    
    if (currentReceipts.length === 0) {
        previewContainer.innerHTML = '';
        return;
    }
    
    previewContainer.innerHTML = currentReceipts.map(receipt => `
        <div class="receipt-item" data-receipt-id="${receipt.id}">
            ${receipt.type.startsWith('image/') ? 
                `<img src="${receipt.data}" alt="${receipt.name}" onclick="viewReceipt('${receipt.id}')">` :
                `<div class="pdf-preview" onclick="viewReceipt('${receipt.id}')">
                    <div style="background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 4px;">
                        📄 PDF<br><small>Click to view</small>
                    </div>
                </div>`
            }
            <div class="file-name">${receipt.name}</div>
            <div class="file-size">${formatFileSize(receipt.size)}</div>
            <button class="remove-btn" onclick="removeReceipt('${receipt.id}')">×</button>
        </div>
    `).join('');
}

// Remove receipt from current uploads
function removeReceipt(receiptId) {
    currentReceipts = currentReceipts.filter(receipt => receipt.id !== receiptId);
    updateReceiptPreview();
    showNotification('Receipt removed', 'success');
    console.log('🗑️ Receipt removed:', receiptId);
}

// View receipt in modal
function viewReceipt(receiptId, expenseReceipts = null) {
    const receipts = expenseReceipts || currentReceipts;
    const receipt = receipts.find(r => r.id === receiptId);
    
    if (!receipt) {
        showNotification('Receipt not found', 'error');
        return;
    }
    
    showReceiptModal([receipt], 0);
}

// View all receipts for an expense
function viewExpenseReceipts(expenseId) {
    const expense = expenses.find(exp => exp.id === expenseId);
    if (!expense || !expense.receipts || expense.receipts.length === 0) {
        showNotification('No receipts found for this expense', 'error');
        return;
    }
    
    showReceiptModal(expense.receipts, 0);
}

// Show receipt modal
function showReceiptModal(receipts, currentIndex = 0) {
    const modal = document.createElement('div');
    modal.className = 'receipt-modal';
    modal.innerHTML = `
        <div class="receipt-modal-content">
            <div class="receipt-modal-header">
                <h3>📄 Receipt Viewer (${currentIndex + 1} of ${receipts.length})</h3>
                <button class="receipt-download-btn" onclick="downloadReceipt('${receipts[currentIndex].id}', ${JSON.stringify(receipts).replace(/"/g, '&quot;')})">
                    💾 Download
                </button>
                <button class="receipt-modal-close" onclick="closeReceiptModal()">×</button>
            </div>
            <div class="receipt-modal-body">
                <div class="receipt-viewer" id="receiptViewer">
                    ${receipts[currentIndex].type.startsWith('image/') ? 
                        `<img src="${receipts[currentIndex].data}" alt="${receipts[currentIndex].name}">` :
                        `<iframe src="${receipts[currentIndex].data}" type="application/pdf"></iframe>`
                    }
                </div>
                ${receipts.length > 1 ? `
                    <div class="receipt-navigation">
                        ${receipts.map((receipt, index) => `
                            <button class="receipt-nav-btn ${index === currentIndex ? 'active' : ''}" 
                                    onclick="switchReceipt(${index}, ${JSON.stringify(receipts).replace(/"/g, '&quot;')})">
                                ${index + 1}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.receiptData = receipts; // Store receipts data on modal element
    
    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeReceiptModal();
        }
    });
    
    // Close modal on escape key
    document.addEventListener('keydown', handleReceiptModalKeydown);
}

// Switch receipt in modal
function switchReceipt(index, receiptsData) {
    const receipts = typeof receiptsData === 'string' ? JSON.parse(receiptsData) : receiptsData;
    const viewer = document.getElementById('receiptViewer');
    const headerTitle = document.querySelector('.receipt-modal-header h3');
    const downloadBtn = document.querySelector('.receipt-download-btn');
    
    if (!viewer || !receipts[index]) return;
    
    // Update viewer
    viewer.innerHTML = receipts[index].type.startsWith('image/') ? 
        `<img src="${receipts[index].data}" alt="${receipts[index].name}">` :
        `<iframe src="${receipts[index].data}" type="application/pdf"></iframe>`;
    
    // Update header
    headerTitle.textContent = `📄 Receipt Viewer (${index + 1} of ${receipts.length})`;
    
    // Update download button
    downloadBtn.setAttribute('onclick', `downloadReceipt('${receipts[index].id}', ${JSON.stringify(receipts).replace(/"/g, '&quot;')})`);
    
    // Update navigation buttons
    document.querySelectorAll('.receipt-nav-btn').forEach((btn, btnIndex) => {
        btn.classList.toggle('active', btnIndex === index);
    });
}

// Download receipt
function downloadReceipt(receiptId, receiptsData) {
    const receipts = typeof receiptsData === 'string' ? JSON.parse(receiptsData) : receiptsData;
    const receipt = receipts.find(r => r.id === receiptId);
    
    if (!receipt) {
        showNotification('Receipt not found', 'error');
        return;
    }
    
    // Create download link
    const link = document.createElement('a');
    link.href = receipt.data;
    link.download = receipt.name;
    link.click();
    
    showNotification(`📥 Downloading ${receipt.name}`, 'success');
    console.log('💾 Downloaded receipt:', receipt.name);
}

// Close receipt modal
function closeReceiptModal() {
    const modal = document.querySelector('.receipt-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            document.removeEventListener('keydown', handleReceiptModalKeydown);
        }, 300);
    }
}

// Handle keyboard navigation in receipt modal
function handleReceiptModalKeydown(e) {
    const modal = document.querySelector('.receipt-modal');
    if (!modal || !modal.receiptData) return;
    
    const receipts = modal.receiptData;
    const currentActiveBtn = document.querySelector('.receipt-nav-btn.active');
    let currentIndex = 0;
    
    if (currentActiveBtn) {
        currentIndex = Array.from(currentActiveBtn.parentNode.children).indexOf(currentActiveBtn);
    }
    
    switch (e.key) {
        case 'Escape':
            closeReceiptModal();
            break;
        case 'ArrowLeft':
            if (currentIndex > 0) {
                switchReceipt(currentIndex - 1, receipts);
            }
            break;
        case 'ArrowRight':
            if (currentIndex < receipts.length - 1) {
                switchReceipt(currentIndex + 1, receipts);
            }
            break;
    }
}

// Update dashboard statistics
function updateDashboard() {
    const factorySelect = document.getElementById('factorySelect');
    const selectedFactory = factorySelect ? factorySelect.value : 'both';
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    let filteredExpenses = expenses;
    
    // Filter by factory if specific factory selected
    if (selectedFactory !== 'both') {
        filteredExpenses = expenses.filter(exp => exp.factory === selectedFactory);
    }
    
    // Calculate this month's expenses
    const monthlyExpenses = filteredExpenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });
    
    const monthlyTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Calculate yearly expenses
    const yearlyExpenses = filteredExpenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getFullYear() === currentYear;
    });
    
    const yearlyTotal = yearlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Update UI
    const monthlyTotalEl = document.getElementById('monthlyTotal');
    const yearlyTotalEl = document.getElementById('yearlyTotal');
    const transactionCountEl = document.getElementById('transactionCount');
    
    if (monthlyTotalEl) {
        monthlyTotalEl.textContent = `E ${monthlyTotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
    if (yearlyTotalEl) {
        yearlyTotalEl.textContent = `E ${yearlyTotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
    if (transactionCountEl) {
        transactionCountEl.textContent = filteredExpenses.length;
    }
    
    // Update factory info
    const factoryInfo = selectedFactory === 'both' ? 'Both Factories' : FACTORIES[selectedFactory].name;
    const monthlyFactoryEl = document.getElementById('monthlyFactory');
    const yearlyFactoryEl = document.getElementById('yearlyFactory');
    const transactionFactoryEl = document.getElementById('transactionFactory');
    
    if (monthlyFactoryEl) monthlyFactoryEl.textContent = factoryInfo;
    if (yearlyFactoryEl) yearlyFactoryEl.textContent = factoryInfo;
    if (transactionFactoryEl) transactionFactoryEl.textContent = factoryInfo;
}

// Load recent expenses
function loadRecentExpenses() {
    const factorySelect = document.getElementById('factorySelect');
    const selectedFactory = factorySelect ? factorySelect.value : 'both';
    const tbody = document.querySelector('#recentExpensesTable tbody');
    
    if (!tbody) return;
    
    let filteredExpenses = expenses;
    
    // Filter by factory if specific factory selected
    if (selectedFactory !== 'both') {
        filteredExpenses = expenses.filter(exp => exp.factory === selectedFactory);
    }
    
    // Get last 10 expenses
    const recentExpenses = filteredExpenses.slice(0, 10);
    
    tbody.innerHTML = '';
    
    recentExpenses.forEach(expense => {
        const receiptCount = expense.receipts ? expense.receipts.length : 0;
        const receiptIndicator = receiptCount > 0 ? 
            `<div class="receipt-indicator has-receipts" onclick="viewExpenseReceipts('${expense.id}')">
                📎 <span class="receipt-count">${receiptCount}</span>
            </div>` :
            `<div class="receipt-indicator no-receipts">
                📎 <span class="receipt-count">0</span>
            </div>`;
            
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${formatDate(expense.date)}</td>
            <td>${expense.description}</td>
            <td>${formatCategory(expense.category)}</td>
            <td>E ${expense.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td>${FACTORIES[expense.factory] ? FACTORIES[expense.factory].name : expense.factory}</td>
            <td>${receiptIndicator}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editExpense('${expense.id}')">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteExpense('${expense.id}')">Delete</button>
            </td>
        `;
    });
    
    if (recentExpenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #888; padding: 20px;">No expenses found. Click "Add Expense" to get started!</td></tr>';
    }
}

// Generate reports
function generateReport() {
    console.log('📊 Generating report...');
    
    const factoryEl = document.getElementById('reportFactory');
    const monthEl = document.getElementById('reportMonth');
    const yearEl = document.getElementById('reportYear');
    const reportTypeEl = document.getElementById('reportType');
    
    if (!factoryEl || !monthEl || !yearEl || !reportTypeEl) {
        console.error('Report elements not found');
        return;
    }
    
    const factory = factoryEl.value;
    const month = monthEl.value;
    const year = yearEl.value;
    const reportType = reportTypeEl.value;
    
    let filteredExpenses = expenses;
    
    // Filter by factory
    if (factory !== 'both') {
        filteredExpenses = filteredExpenses.filter(exp => exp.factory === factory);
    }
    
    // Filter by year
    if (year) {
        filteredExpenses = filteredExpenses.filter(exp => {
            return new Date(exp.date).getFullYear().toString() === year;
        });
    }
    
    // Filter by month
    if (month) {
        filteredExpenses = filteredExpenses.filter(exp => {
            const expMonth = (new Date(exp.date).getMonth() + 1).toString().padStart(2, '0');
            return expMonth === month;
        });
    }
    
    // Sort by date (newest first)
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const reportOutput = document.getElementById('reportOutput');
    if (!reportOutput) return;
    
    if (filteredExpenses.length === 0) {
        reportOutput.innerHTML = `
            <div class="report-placeholder">
                <p>No expenses found for the selected criteria.</p>
                <p>Try adjusting your filters or add some expenses first.</p>
            </div>
        `;
        return;
    }
    
    // Generate report based on type
    let reportHTML = '';
    
    switch (reportType) {
        case 'bank':
            reportHTML = generateBankReport(filteredExpenses, factory, month, year);
            break;
        case 'revenue-office':
            reportHTML = generateRevenueOfficeReport(filteredExpenses, factory, month, year);
            break;
        default:
            reportHTML = generateStandardReport(filteredExpenses, factory, month, year);
    }
    
    reportOutput.innerHTML = reportHTML;
    showNotification('Report generated successfully!', 'success');
    console.log('✅ Report generated with', filteredExpenses.length, 'expenses');
}

// Generate standard report
function generateStandardReport(expenses, factory, month, year) {
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const factoryName = factory === 'both' ? 'Both Factories' : FACTORIES[factory].name;
    const monthName = month ? getMonthName(parseInt(month)) : 'All Months';
    const yearText = year || 'All Years';
    
    // Group expenses by category
    const categoryTotals = {};
    expenses.forEach(exp => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });
    
    let html = `
        <div class="report-content">
            <div class="report-header">
                <h2>📊 Expense Report</h2>
                <div class="company-info">
                    <strong>SS Mudyf Group</strong><br>
                    ${factoryName}<br>
                    Period: ${monthName} ${yearText}<br>
                    Generated: ${formatDate(new Date().toISOString().split('T')[0])}
                </div>
            </div>
            
            <div class="report-summary">
                <div class="summary-item">
                    <h4>Total Expenses</h4>
                    <div class="summary-value">E ${totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                </div>
                <div class="summary-item">
                    <h4>Number of Transactions</h4>
                    <div class="summary-value">${expenses.length}</div>
                </div>
                <div class="summary-item">
                    <h4>Average Transaction</h4>
                    <div class="summary-value">E ${(totalAmount / expenses.length).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                </div>
            </div>
            
            <h3>💰 Expenses by Category</h3>
            <table style="width: 100%; margin-bottom: 30px;">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Amount (E)</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>`;
    
    Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, amount]) => {
            const percentage = ((amount / totalAmount) * 100).toFixed(1);
            html += `
                <tr>
                    <td>${formatCategory(category)}</td>
                    <td>E ${amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    <td>${percentage}%</td>
                </tr>
            `;
        });
    
    html += `
                </tbody>
            </table>
            
            <h3>📋 Detailed Expenses</h3>
            <table style="width: 100%;">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Factory</th>
                        <th>Vendor</th>
                        <th>Receipts</th>
                        <th>Amount (E)</th>
                    </tr>
                </thead>
                <tbody>`;
    
    expenses.forEach(expense => {
        const receiptCount = expense.receipts ? expense.receipts.length : 0;
        const receiptCell = receiptCount > 0 ? 
            `<span style="color: #27ae60; font-weight: bold;">✓ ${receiptCount}</span>` : 
            `<span style="color: #e74c3c;">✗ 0</span>`;
            
        html += `
            <tr>
                <td>${formatDate(expense.date)}</td>
                <td>${expense.description}</td>
                <td>${formatCategory(expense.category)}</td>
                <td>${FACTORIES[expense.factory] ? FACTORIES[expense.factory].location : expense.factory}</td>
                <td>${expense.vendor || '-'}</td>
                <td>${receiptCell}</td>
                <td>E ${expense.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
            
            ${getReceiptSummaryHtml(expenses)}
        </div>
    `;
    
    return html;
}

// Generate bank report
function generateBankReport(expenses, factory, month, year) {
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const factoryName = factory === 'both' ? 'SS Mudyf Group (Consolidated)' : FACTORIES[factory].name;
    const monthName = month ? getMonthName(parseInt(month)) : 'All Months';
    const yearText = year || new Date().getFullYear();
    
    let html = `
        <div class="report-content">
            <div class="report-header">
                <h2>🏦 Bank Financial Statement</h2>
                <div class="company-info">
                    <strong>${factoryName}</strong><br>
                    Matsapha & Matsanjeni, Eswatini<br>
                    Period: ${monthName} ${yearText}<br>
                    Generated: ${formatDate(new Date().toISOString().split('T')[0])}
                </div>
            </div>
            
            <div class="report-summary">
                <div class="summary-item">
                    <h4>Total Operating Expenses</h4>
                    <div class="summary-value">E ${totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                </div>
                <div class="summary-item">
                    <h4>Transaction Volume</h4>
                    <div class="summary-value">${expenses.length}</div>
                </div>
            </div>
            
            <h3>📊 Expense Categories Summary</h3>
            <table style="width: 100%; margin-bottom: 30px;">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Amount (E)</th>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody>`;
    
    const categoryStats = {};
    expenses.forEach(exp => {
        if (!categoryStats[exp.category]) {
            categoryStats[exp.category] = { amount: 0, count: 0 };
        }
        categoryStats[exp.category].amount += exp.amount;
        categoryStats[exp.category].count++;
    });
    
    Object.entries(categoryStats)
        .sort((a, b) => b[1].amount - a[1].amount)
        .forEach(([category, stats]) => {
            html += `
                <tr>
                    <td>${formatCategory(category)}</td>
                    <td>E ${stats.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    <td>${stats.count}</td>
                </tr>
            `;
        });
    
    html += `
                </tbody>
            </table>
            
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
                This report has been generated by SS Mudyf Accounting System and represents actual business expenses 
                for the specified period. All amounts are in Emalangeni (E). Supporting documentation (receipts/invoices) 
                is available for ${countTotalReceipts(expenses)} transactions.
            </p>
            
            ${getReceiptSummaryHtml(expenses)}
        </div>
    `;
    
    return html;
}

// Generate revenue office report
function generateRevenueOfficeReport(expenses, factory, month, year) {
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const factoryName = factory === 'both' ? 'SS Mudyf Group' : FACTORIES[factory].name;
    const monthName = month ? getMonthName(parseInt(month)) : 'All Months';
    const yearText = year || new Date().getFullYear();
    
    // Tax-relevant categories
    const taxCategories = {
        'raw-materials': 'Cost of Goods Sold',
        'labor': 'Employee Costs',
        'utilities': 'Utilities & Services',
        'rent': 'Rent & Property Expenses',
        'equipment': 'Depreciation & Equipment',
        'transportation': 'Transport & Logistics',
        'maintenance': 'Maintenance & Repairs',
        'insurance': 'Insurance Premiums',
        'administrative': 'Administrative Expenses',
        'taxes': 'Taxes & Government Fees',
        'other': 'Other Operating Expenses'
    };
    
    let html = `
        <div class="report-content">
            <div class="report-header">
                <h2>🏛️ Eswatini Revenue Service</h2>
                <h3>Business Expense Declaration</h3>
                <div class="company-info">
                    <strong>${factoryName}</strong><br>
                    Tax Registration: [To be filled]<br>
                    Period: ${monthName} ${yearText}<br>
                    Generated: ${formatDate(new Date().toISOString().split('T')[0])}
                </div>
            </div>
            
            <div class="report-summary">
                <div class="summary-item">
                    <h4>Total Deductible Expenses</h4>
                    <div class="summary-value">E ${totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                </div>
            </div>
            
            <h3>📋 Expense Categories for Tax Purposes</h3>
            <table style="width: 100%; margin-bottom: 30px;">
                <thead>
                    <tr>
                        <th>Tax Category</th>
                        <th>Amount (E)</th>
                        <th>Supporting Documents</th>
                    </tr>
                </thead>
                <tbody>`;
    
    const taxCategoryTotals = {};
    expenses.forEach(exp => {
        const taxCategory = taxCategories[exp.category] || 'Other Operating Expenses';
        taxCategoryTotals[taxCategory] = (taxCategoryTotals[taxCategory] || 0) + exp.amount;
    });
    
    Object.entries(taxCategoryTotals)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, amount]) => {
            const expenseCount = expenses.filter(exp => 
                (taxCategories[exp.category] || 'Other Operating Expenses') === category
            ).length;
            
            html += `
                <tr>
                    <td>${category}</td>
                    <td>E ${amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    <td>${expenseCount} receipts/invoices</td>
                </tr>
            `;
        });
    
    html += `
                </tbody>
            </table>
            
            <div style="margin-top: 30px; padding: 20px; background: rgba(52, 152, 219, 0.1); border-radius: 10px; border-left: 4px solid #3498db;">
                <h4>📝 Declaration</h4>
                <p style="font-size: 12px; line-height: 1.6;">
                    I hereby declare that the information provided in this report is true and correct to the best of my knowledge. 
                    All expenses listed are legitimate business expenses incurred in the ordinary course of business operations 
                    of ${factoryName}. Supporting documentation (receipts and invoices) totaling ${countTotalReceipts(expenses)} 
                    files is available for inspection upon request.
                </p>
                <div style="margin-top: 20px;">
                    <p>Signature: ___________________________ Date: _______________</p>
                    <p>Name: _____________________________</p>
                    <p>Position: __________________________</p>
                </div>
            </div>
            
            ${getReceiptSummaryHtml(expenses)}
        </div>
    `;
    
    return html;
}

// Print report
function printReport() {
    const reportContent = document.getElementById('reportOutput');
    if (!reportContent) return;
    
    if (reportContent.innerHTML.includes('report-placeholder')) {
        showNotification('Please generate a report first', 'error');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>SS Mudyf Accounting Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f8f9fa; font-weight: bold; }
                .report-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .report-summary { display: flex; justify-content: space-around; margin: 20px 0; flex-wrap: wrap; }
                .summary-item { text-align: center; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                .summary-value { font-size: 20px; font-weight: bold; color: #27ae60; margin-top: 5px; }
                h2, h3 { color: #2c3e50; }
                @media print { body { margin: 0; } .no-print { display: none; } }
            </style>
        </head>
        <body>
            ${reportContent.innerHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 250);
    
    showNotification('Report sent to printer', 'success');
}

// Export data
async function exportData() {
    try {
        const result = await ipcRenderer.invoke('export-data');
        
        if (!result.canceled && result.filePath) {
            const exportData = {
                expenses: expenses,
                settings: settings,
                factories: FACTORIES,
                exportDate: new Date().toISOString(),
                version: '1.0.0',
                appName: 'SS Mudyf Accounting System'
            };
            
            require('fs').writeFileSync(result.filePath, JSON.stringify(exportData, null, 2));
            showNotification('Data exported successfully!', 'success');
            console.log('💾 Data exported to:', result.filePath);
        }
    } catch (error) {
        showNotification('Export failed: ' + error.message, 'error');
        console.error('Export error:', error);
    }
}

// Backup data
function backupData() {
    const backup = {
        expenses: expenses,
        settings: settings,
        factories: FACTORIES,
        backupDate: new Date().toISOString(),
        version: '1.0.0'
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `ss-mudyf-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Backup created successfully!', 'success');
    console.log('💾 Backup created with', expenses.length, 'expenses');
}

// Import data
async function importData() {
    try {
        const result = await ipcRenderer.invoke('import-data');
        
        if (!result.canceled && result.filePaths.length > 0) {
            const data = JSON.parse(require('fs').readFileSync(result.filePaths[0], 'utf8'));
            
            if (data.expenses && Array.isArray(data.expenses)) {
                const oldCount = expenses.length;
                expenses = data.expenses;
                localStorage.setItem('ssMudyfExpenses', JSON.stringify(expenses));
                
                if (data.settings) {
                    settings = data.settings;
                    localStorage.setItem('ssMudyfSettings', JSON.stringify(settings));
                    initializeApp(); // Reload settings
                }
                
                updateDashboard();
                loadRecentExpenses();
                showNotification(`Data imported successfully! Loaded ${data.expenses.length} expenses (previously ${oldCount})`, 'success');
                console.log('📥 Data imported:', data.expenses.length, 'expenses');
            } else {
                showNotification('Invalid data format - not a valid SS Mudyf backup file', 'error');
            }
        }
    } catch (error) {
        showNotification('Import failed: ' + error.message, 'error');
        console.error('Import error:', error);
    }
}

// Clear all data
function clearAllData() {
    if (confirm('⚠️ Are you sure you want to clear all data? This action cannot be undone!\n\nThis will delete all expenses and settings.')) {
        if (confirm('🚨 FINAL WARNING: This will permanently delete ALL your accounting data!\n\nClick OK to proceed or Cancel to keep your data.')) {
            const oldCount = expenses.length;
            expenses = [];
            settings = {};
            localStorage.removeItem('ssMudyfExpenses');
            localStorage.removeItem('ssMudyfSettings');
            
            updateDashboard();
            loadRecentExpenses();
            
            // Reset form
            const expenseForm = document.getElementById('expenseForm');
            if (expenseForm) expenseForm.reset();
            
            showNotification(`All data cleared! Deleted ${oldCount} expenses.`, 'success');
            console.log('🗑️ All data cleared, deleted', oldCount, 'expenses');
        }
    }
}

// Edit expense
function editExpense(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) {
        showNotification('Expense not found', 'error');
        return;
    }
    
    // Switch to expenses tab and populate form
    switchTab('expenses');
    
    document.getElementById('expenseDate').value = expense.date;
    document.getElementById('expenseFactory').value = expense.factory;
    document.getElementById('expenseCategory').value = expense.category;
    document.getElementById('expenseDescription').value = expense.description;
    document.getElementById('expenseAmount').value = expense.amount;
    document.getElementById('expenseReference').value = expense.reference || '';
    document.getElementById('expenseVendor').value = expense.vendor || '';
    
    // Load existing receipts
    currentReceipts = expense.receipts ? [...expense.receipts] : [];
    updateReceiptPreview();
    
    // Remove the expense from array (will be re-added when form is submitted)
    expenses = expenses.filter(exp => exp.id !== id);
    localStorage.setItem('ssMudyfExpenses', JSON.stringify(expenses));
    
    const receiptText = currentReceipts.length > 0 ? ` (${currentReceipts.length} receipts loaded)` : '';
    showNotification(`Expense loaded for editing${receiptText}`, 'success');
    console.log('✏️ Editing expense:', expense.description, 'Receipts:', currentReceipts.length);
}

// Delete expense
function deleteExpense(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) {
        showNotification('Expense not found', 'error');
        return;
    }
    
    if (confirm(`🗑️ Are you sure you want to delete this expense?\n\n"${expense.description}" - E ${expense.amount.toLocaleString()}\n\nThis action cannot be undone.`)) {
        expenses = expenses.filter(exp => exp.id !== id);
        localStorage.setItem('ssMudyfExpenses', JSON.stringify(expenses));
        
        updateDashboard();
        loadRecentExpenses();
        showNotification(`Expense "${expense.description}" deleted successfully`, 'success');
        console.log('🗑️ Deleted expense:', expense.description, 'E', expense.amount);
    }
}

// Save settings
function saveSettings() {
    settings.companyName = document.getElementById('companyName').value;
    settings.companyAddress = document.getElementById('companyAddress').value;
    settings.companyContact = document.getElementById('companyContact').value;
    
    localStorage.setItem('ssMudyfSettings', JSON.stringify(settings));
    showNotification('Settings saved successfully', 'success');
    console.log('⚙️ Settings updated');
}

// Populate year dropdown
function populateYearDropdown() {
    const yearSelect = document.getElementById('reportYear');
    if (!yearSelect) return;
    
    const currentYear = new Date().getFullYear();
    
    yearSelect.innerHTML = '<option value="">All Years</option>';
    
    for (let year = currentYear; year >= currentYear - 10; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }
}

// Utility functions
function formatDate(dateStr) {
    try {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        });
    } catch (e) {
        return dateStr;
    }
}

function formatCategory(category) {
    return category.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function getMonthName(monthNumber) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || `Month ${monthNumber}`;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function countTotalReceipts(expenseList) {
    return expenseList.reduce((total, expense) => {
        return total + (expense.receipts ? expense.receipts.length : 0);
    }, 0);
}

function getReceiptSummaryHtml(expenseList) {
    const totalReceipts = countTotalReceipts(expenseList);
    const expensesWithReceipts = expenseList.filter(exp => exp.receipts && exp.receipts.length > 0).length;
    const totalReceiptSize = expenseList.reduce((total, expense) => {
        if (!expense.receipts) return total;
        return total + expense.receipts.reduce((sum, receipt) => sum + (receipt.size || 0), 0);
    }, 0);
    
    return `
        <div class="report-receipts">
            <h4>📎 Receipt Summary</h4>
            <div class="report-receipt-summary">
                <div class="report-receipt-stat">
                    <div class="value">${totalReceipts}</div>
                    <div class="label">Total Receipts</div>
                </div>
                <div class="report-receipt-stat">
                    <div class="value">${expensesWithReceipts}</div>
                    <div class="label">Documented Expenses</div>
                </div>
                <div class="report-receipt-stat">
                    <div class="value">${((expensesWithReceipts / expenseList.length) * 100).toFixed(1)}%</div>
                    <div class="label">Documentation Rate</div>
                </div>
                <div class="report-receipt-stat">
                    <div class="value">${formatFileSize(totalReceiptSize)}</div>
                    <div class="label">Total Storage</div>
                </div>
            </div>
        </div>
    `;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Set background color based on type
    let backgroundColor;
    switch (type) {
        case 'success':
            backgroundColor = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            break;
        case 'error':
            backgroundColor = 'linear-gradient(135deg, #e74c3c, #c0392b)';
            break;
        default:
            backgroundColor = 'linear-gradient(135deg, #3498db, #2980b9)';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 30px;
        padding: 15px 25px;
        border-radius: 25px;
        color: white;
        z-index: 1000;
        font-weight: 500;
        font-size: 14px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        backdrop-filter: blur(10px);
        background: ${backgroundColor};
        animation: slideInRight 0.3s ease;
        max-width: 350px;
        word-wrap: break-word;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
    
    console.log(`💬 ${type.toUpperCase()}:`, message);
}