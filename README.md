// ==============================================
// README.md - Project Documentation
// ==============================================
/*
# SS Mudyf Order Tracking System

A comprehensive desktop application for managing textile manufacturing orders, production tracking, and inventory management designed specifically for SS Mudyf CMT Factory in Eswatini.

## Features

### 📋 Order Management
- Create, edit, and track orders with comprehensive details
- Sort and filter by delivery date, style number, cutsheet#, account, brand, price, colour, customer, and production line
- Real-time status tracking (Pending, In Production, Completed)
- Customer relationship management
- Advanced search and filtering capabilities

### 🏭 Production Tracking  
- Stage-by-stage production monitoring (Cutting, Sewing, Packing)
- Units per size tracking with detailed reporting
- Production line assignment and monitoring
- Daily production score recording and reporting
- Efficiency tracking and performance analytics
- Quality check integration

### 📦 Inventory Management
- Fabric, materials, and trims inventory tracking
- Receiving and usage reporting with marker functionality
- Low stock alerts and automatic reorder points
- Supplier management and cost tracking
- Real-time inventory valuation

### 📊 Reporting & Analytics
- Visual dashboards with key performance indicators
- Production efficiency reports
- Order completion analysis
- Financial performance tracking
- Customizable report generation
- Export capabilities (JSON, CSV, Print)

## Technology Stack

- **Frontend**: React.js with Tailwind CSS
- **Desktop Framework**: Electron
- **Database**: SQLite (with JSON fallback)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build System**: Create React App + Electron Builder

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)

### Setup Instructions

1. **Clone or create the project directory:**
   ```bash
   mkdir ss-mudyf-order-tracker
   cd ss-mudyf-order-tracker
   ```

2. **Copy all provided files into their respective locations**

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Initialize Tailwind CSS:**
   ```bash
   npx tailwindcss init -p
   ```

5. **Start the application in development mode:**
   ```bash
   npm run electron-dev
   ```

6. **Build for production:**
   ```bash
   # Windows
   npm run build-win
   
   # macOS
   npm run build-mac
   
   # Linux
   npm run build-linux
   
   # All platforms
   npm run build-all
   ```

## Project Structure

```
ss-mudyf-order-tracker/
├── public/
│   ├── index.html              # Main HTML template
│   ├── electron.js             # Electron main process
│   ├── splash.html             # Loading screen
│   └── manifest.json           # Web app manifest
├── src/
│   ├── components/
│   │   ├── Dashboard.js        # Main dashboard with KPIs
│   │   ├── OrderManager.js     # Order CRUD operations
│   │   ├── CustomerManager.js  # Customer management
│   │   ├── InventoryManager.js # Inventory tracking
│   │   ├── ProductionTracker.js# Production monitoring
│   │   └── Reports.js          # Analytics and reporting
│   ├── database/
│   │   └── database.js         # Database layer (JSON-based)
│   ├── App.js                  # Main React application
│   ├── App.css                 # Styles with Tailwind
│   └── index.js                # React entry point
├── package.json                # Project configuration
├── tailwind.config.js          # Tailwind configuration
└── README.md                   # Documentation
```

## Usage

### Quick Start Guide

1. **Dashboard**: Overview of key metrics, recent activity, and alerts
2. **Orders**: Manage all orders with full CRUD operations
3. **Customers**: Maintain customer database with contact information
4. **Inventory**: Track materials, fabrics, and trims with usage monitoring
5. **Production**: Monitor production stages and daily performance scores
6. **Reports**: Generate comprehensive business intelligence reports

### Keyboard Shortcuts

- `Ctrl+1` - Dashboard
- `Ctrl+2` - Orders
- `Ctrl+3` - Production
- `Ctrl+4` - Reports
- `Ctrl+N` - New Order
- `Ctrl+E` - Export Data
- `Ctrl+I` - Import Data
- `F11` - Toggle Fullscreen
- `F12` - Developer Tools

## Features in Detail

### Order Tracking
- **Comprehensive Order Details**: Order number, style, cutsheet, account, brand, customer, delivery date, price, colour, production line
- **Advanced Filtering**: Multi-criteria filtering and sorting
- **Status Management**: Automated status updates based on production progress
- **Deadline Monitoring**: Visual alerts for approaching delivery dates

### Production Management
- **Multi-Stage Tracking**: Cutting → Sewing → Packing → Quality Check
- **Size-Wise Reporting**: Track units completed per size (XS, S, M, L, XL, XXL)
- **Daily Scorecards**: Target vs actual production with efficiency calculations
- **Operator Performance**: Individual operator tracking and performance metrics

### Business Intelligence
- **Real-Time Dashboards**: Live updates of key performance indicators
- **Trend Analysis**: Historical performance tracking and forecasting
- **Cost Analysis**: Material costs, labor efficiency, and profit margins
- **Export Capabilities**: Multiple format support for external analysis

## Deployment

The application can be packaged for distribution on Windows, macOS, and Linux:

```bash
# Build for your current platform
npm run electron-build

# Build for specific platforms
npm run build-win     # Windows installer
npm run build-mac     # macOS app bundle
npm run build-linux   # Linux AppImage
```

## Support and Maintenance

### Data Backup
The application automatically creates daily backups of your data. Manual export is available through the File menu.

### Updates
The application includes auto-update functionality for seamless version upgrades.

### Troubleshooting
- Check the console (F12) for error messages
- Ensure all dependencies are properly installed
- Verify file permissions for data directory
- Contact support for persistent issues

## License

Copyright © 2025 SS Mudyf Textile Factory, Eswatini. All rights reserved.

This software is proprietary to SS Mudyf and is intended solely for internal business operations.

## Company Information

**SS Mudyf**  
Textile CMT Factory  
Eswatini  

Specialized in high-quality garment manufacturing with comprehensive order tracking and production management capabilities.

---

*Built with ❤️ for textile manufacturing excellence*
*/