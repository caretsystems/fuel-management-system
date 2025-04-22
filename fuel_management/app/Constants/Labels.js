const AppTitle = 'Fortunewell';
const AppSubtitle = 'Integrated Fuel Management System';

const DashboardTabs = [
    "Fuels",
    "Other Products",
    "Tanks",
    "KPI",
    "PMTDR",
    "Navigator"
]

const Locations = [
    { id: 1, description: "NUV" },
    { id: 2, description: "ETON" },
    { id: 3, description: "CAR" },
    { id: 4, description: "SR" }
]

const Fuels = [
    { name: "VPR", color: "red" },
    { name: "VPG", color: "green" },
    { name: "VPD", color: "yellow" },
    { name: "FSG", color: "blue" },
    { name: "FSD", color: "cyan" }
]

const Products = [
    { name: "FC Lubes", color: "#0891b2" },
    { name: "Select", color: "#0ea5e9" },
    { name: "SHOC", color: "#3b82f6" },
    { name: "OCPD", color: "#6366f1" }
]

const SalesTabs = [
    "Daily Sales Input",
    "Upload POS",
    "Reconcile"
]

const SampleEmployeeName = [
    { id: 1, description: "Lester Mercado" },
    { id: 2, description: "Emil Pili" },
    { id: 3, description: "Jose Dela Cruz" }
]

const Shifts = [
    { id: 1, description: "1st Shift"},
    { id: 2, description: "2nd Shift"},
    { id: 3, description: "3rd Shift"}
]

const InputMode = [
    { id: 1, description: "Cashier - Forecourt" },
    { id: 2, description: "Cashier - Select" },
    { id: 3, description: "Shift Manager" }
]

const Bills = [
    { id: 1, description: "1" },
    { id: 5, description: "5" },
    { id: 10, description: "10" },
    { id: 20, description: "20" },
    { id: 50, description: "50" },
    { id: 100, description: "100" },
    { id: 200, description: "200" },
    { id: 500, description: "500" },
    { id: 1000, description: "1000" }
]

const PaymentMode = [
    { id: 1, description: "Cash - Label" },
    { id: 2, description: "Card - Label" }
]

const PurchaseOrder = [
    { id: 1, description: "FSD" },
    { id: 2, description: "VPG" },
    { id: 3, description: "VPD" }
]

const Lubricants = [
    { id: 1, description: "Lube1" },
    { id: 2, description: "Lube2" },
    { id: 3, description: "Lube3" }
]

const Discounts = [
    { id: 1, description: "Senior" },
    { id: 2, description: "PWD" },
    { id: 3, description: "Pregnant" }
]

const InventoryItems = [
    { id: 1, description: "Accessories" },
    { id: 2, description: "Beverage" },
    { id: 3, description: "Tools" }
]

const DummyDesc = [
    { id: 1, description: "test 1" },
    { id: 2, description: "test 2" },
    { id: 3, description: "test 3" }
]

export { AppTitle, AppSubtitle, DashboardTabs, Locations, Fuels, Products, SalesTabs, SampleEmployeeName, Shifts, InputMode, Bills, PaymentMode, PurchaseOrder, Lubricants, Discounts, InventoryItems, DummyDesc };