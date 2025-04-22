const express = require("express");
const path = require('path');
const cors = require("cors");
const ValidateToken = require("./Middleware/TokenValidation");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/global-setup/uploads', express.static('Uploads'));

// DASHBOARD
const dashboardRoutes = require("./Dashboard/AllReports");
app.use("/Dashboard", dashboardRoutes);

// Sales
const salesRoutes = require("./Sales/DailySalesInput");
app.use("/Sales", salesRoutes);

const salesParams = require("./Sales/SalesParams");
app.use("/SalesParams", salesParams);

// Forecourt Sales
const forecourtRoutes = require("./Sales/DailySalesInputForecourt");
app.use("/ForecourtSales", forecourtRoutes);

// Select Sales
const selectRoutes = require("./Sales/DailySalesInputSelect");
app.use("/SelectSales", selectRoutes);

// Manager Sales
const managerRoutes = require("./Sales/DailySalesInputManager");
app.use("/ManagerSales", managerRoutes);

// Fuel Price
const fuelPriceRoutes = require("./FuelManagement/FuelPrice");
app.use("/FuelManagement", fuelPriceRoutes);

// Fuel Price Item
const fuelPriceItemRoutes = require("./FuelManagement/FuelPriceItem");
app.use("/FuelManagement", fuelPriceItemRoutes);

// Fuel Price Attachment
const fuelPriceAttachmentRoutes = require("./FuelManagement/FuelPriceAttachment");
app.use("/FuelManagement", fuelPriceAttachmentRoutes);

// Fuel Delivery
const fuelDeliveryRoutes = require("./FuelManagement/FuelDelivery");
app.use("/FuelManagement", fuelDeliveryRoutes);

// Fuel Delivery Item
const fuelDeliveryItemRoutes = require("./FuelManagement/FuelDeliveryItem");
app.use("/FuelManagement", fuelDeliveryItemRoutes);

// Fuel Delivery Attachment
const fuelDeliveryAttachmentRoutes = require("./FuelManagement/FuelDeliveryAttachment");
app.use("/FuelManagement", fuelDeliveryAttachmentRoutes);

// Fuel Lubricant
const fuelLubricantRoutes = require("./FuelManagement/FuelLubricant");
app.use("/FuelManagement", fuelLubricantRoutes);

// Fuel Lubricant - Brand
const fuelLubricantBrandRoutes = require("./FuelManagement/Brand");
app.use("/FuelManagement", fuelLubricantBrandRoutes);

// Fuel Lubricant - Lube Type
const fuelLubricantLubeTypeRoutes = require("./FuelManagement/LubeType");
app.use("/FuelManagement", fuelLubricantLubeTypeRoutes);

// FUEL MASTER
const fuelMastersRoutes = require("./Setup/GlobalRecords/FuelMaster");
app.use("/Setup/GlobalRecords", fuelMastersRoutes);

// DEPARTMENT
const departmentRoutes = require("./Setup/GlobalRecords/Department");
app.use("/Setup/GlobalRecords", departmentRoutes);

// SHIFT
const shiftRoutes = require("./Setup/GlobalRecords/Shift");
app.use("/Setup/GlobalRecords", shiftRoutes);

// PAYMENT METHOD
const paymentModeRoutes = require("./Setup/GlobalRecords/PaymentMode");
app.use("/Setup/GlobalRecords", paymentModeRoutes);

// DISCOUNT
const discountRoutes = require("./Setup/GlobalRecords/Discount");
app.use("/Setup/GlobalRecords", discountRoutes);

// DROPDOWN
const dropdownRoutes = require("./Setup/GlobalRecords/Dropdown");
app.use("/Setup/GlobalRecords", dropdownRoutes);

// EMPLOYEE
const employeeRoutes = require("./Setup/GlobalRecords/Employee");
app.use("/Setup/GlobalRecords", employeeRoutes);

// EMPLOYEE CONTACT
const employeeContactRoutes = require("./Setup/GlobalRecords/EmployeeContact");
app.use("/Setup/GlobalRecords", employeeContactRoutes);

// EMPLOYEE PHOTO
const employeePhotoRoutes = require("./Setup/GlobalRecords/EmployeePhoto");
app.use("/Setup/GlobalRecords", employeePhotoRoutes);

// CUSTOMER
const customerRoutes = require("./Setup/GlobalRecords/Customer");
app.use("/Setup/GlobalRecords", customerRoutes);

// CUSTOMER CONTACT
const customerContactRoutes = require("./Setup/GlobalRecords/CustomerContact");
app.use("/Setup/GlobalRecords", customerContactRoutes);

// CUSTOMER VEHICLE
const customerVehicleRoutes = require("./Setup/GlobalRecords/CustomerVehicle");
app.use("/Setup/GlobalRecords", customerVehicleRoutes);

// TARGET
const targetRoutes = require("./Setup/GlobalRecords/Target");
app.use("/Setup/GlobalRecords", targetRoutes);

// TARGET WEEKLY
const targetWeeklyRoutes = require("./Setup/GlobalRecords/TargetWeekly");
app.use("/Setup/GlobalRecords", targetWeeklyRoutes);

// TARGET MONTHLY
const targetMonthlyRoutes = require("./Setup/GlobalRecords/TargetMonthly");
app.use("/Setup/GlobalRecords", targetMonthlyRoutes);

// STATION
const stationRoutes = require("./Setup/Stations/Station");
app.use("/Setup/Stations", stationRoutes);

// STATION DEPARTMENT
const stationDepartmentRoutes = require("./Setup/Stations/StationDepartment");
app.use("/Setup/Stations", stationDepartmentRoutes);

// STATION SUB DEPARTMENT
const stationDepartmentSubRoutes = require("./Setup/Stations/StationDepartmentSub");
app.use("/Setup/Stations", stationDepartmentSubRoutes);

// STATION DISCOUNT
const stationDiscountRoutes = require("./Setup/Stations/StationDiscount");
app.use("/Setup/Stations", stationDiscountRoutes);

// STATION PAYMENT MODE
const stationPaymentModeRoutes = require("./Setup/Stations/StationPaymentMode");
app.use("/Setup/Stations", stationPaymentModeRoutes);

// STATION SHIFT
const stationShiftRoutes = require("./Setup/Stations/StationShift");
app.use("/Setup/Stations", stationShiftRoutes);

// STATION TANK
const stationTankRoutes = require("./Setup/Stations/StationTank");
app.use("/Setup/Stations", stationTankRoutes);

// STATION TANK PUMP
const stationTankPumpRoutes = require("./Setup/Stations/StationTankPump");
app.use("/Setup/Stations", stationTankPumpRoutes);

// STATION Employee
const stationEmpRoutes = require("./Setup/Stations/StationEmployee");
app.use("/Setup/Stations", stationEmpRoutes);

// USERS
const settingsUserRoutes = require("./Settings/Users");
app.use("/Settings/Users", ValidateToken, settingsUserRoutes);

// AUTHENTICATION
const authenticationRoutes = require("./Authentication/Authentication");
app.use("/Authentication", authenticationRoutes);

// ROLES
const rolesRoutes = require("./Settings/Roles");
app.use("/Settings", ValidateToken, rolesRoutes);

// PERMISSIONS ROUTES
const permissionRoutes  = require("./Settings/Permissions");
app.use("/Settings/Permissions", ValidateToken, permissionRoutes);

//locations PH addresses
const locationRoutes = require('./Locations/Address') ;
app.use('/Locations', ValidateToken, locationRoutes);

/*NO ACTUAL PURPOSE JUST FOR TESTING, CHECK ONLY IF SERVER RESPONSE*/
app.use("/testing/token", ValidateToken, async (req, res) => {
    res.status(201).json({
        success: true,
        message: 'Valid',
        body: {},
    })
});

const port = process.env.PORT;

// Serve static files from React build
app.use(express.static(path.join(__dirname, '/build/client')));
// Fallback to React's index.html for any unmatched route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, '/build/client', 'index.html'));
});

app.listen(port, () => console.log(`Server running on port ${port}`));
