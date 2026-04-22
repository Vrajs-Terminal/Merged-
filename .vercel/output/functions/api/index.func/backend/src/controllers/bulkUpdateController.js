"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyBulkUpdate = exports.validateBulkUpdate = exports.generateTemplate = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// 1. Generate Template
const generateTemplate = async (req, res) => {
    try {
        const { updateType, branchId, departmentId } = req.query;
        let headers = ["Employee ID", "Employee Name (Read-Only)"];
        switch (updateType) {
            case "Job Information":
                headers.push("Designation ID", "Department ID", "Branch ID", "Level ID", "Manager ID");
                break;
            case "Contact Details":
                headers.push("Mobile", "Personal Email", "Current Address", "Emergency Number");
                break;
            case "Personal Information":
                headers.push("First Name", "Last Name", "DOB (YYYY-MM-DD)", "Blood Group", "Gender");
                break;
            case "Bank Details":
                headers.push("Bank Name", "Account No", "IFSC Code", "PAN No");
                break;
            case "Employee Status":
                headers.push("Status");
                break;
            case "Shift Assignment":
                headers.push("Shift");
                break;
            default:
                return res.status(400).json({ error: "Invalid update type" });
        }
        const filters = {};
        if (branchId)
            filters.branchId = parseInt(branchId);
        if (departmentId)
            filters.departmentId = parseInt(departmentId);
        const employees = await prismaClient_1.default.employee.findMany({
            where: filters,
            select: { employeeId: true, firstName: true, lastName: true, status: true }
        });
        let csvContent = headers.join(",") + "\n";
        employees.forEach(emp => {
            const name = `"${emp.firstName} ${emp.lastName || ''}"`;
            const row = [emp.employeeId, name];
            for (let i = 2; i < headers.length; i++) {
                row.push(""); // empty slots for the editable columns
            }
            csvContent += row.join(",") + "\n";
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${updateType === null || updateType === void 0 ? void 0 : updateType.toString().replace(/\s+/g, "_")}_Template.csv`);
        res.send(csvContent);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate template" });
    }
};
exports.generateTemplate = generateTemplate;
// 2. Validate Uploaded Data (JSON format from frontend CSV parser)
const validateBulkUpdate = async (req, res) => {
    try {
        const { updateType, data } = req.body; // data is array of objects
        if (!data || !Array.isArray(data))
            return res.status(400).json({ error: "Invalid data format" });
        const results = [];
        // Check cache for branches, departments, etc. to minimize DB hits
        const branches = await prismaClient_1.default.branch.findMany();
        const branchIds = branches.map(b => b.id);
        for (const row of data) {
            const empId = row["Employee ID"];
            let isValid = true;
            let errors = [];
            let oldData = {};
            let mappedData = {};
            if (!empId) {
                results.push({ row, status: 'Error', errors: ["Missing Employee ID"] });
                continue;
            }
            const employee = await prismaClient_1.default.employee.findUnique({
                where: { employeeId: String(empId) }
            });
            if (!employee) {
                results.push({ row, status: 'Error', errors: ["Employee not found"] });
                continue;
            }
            // Validation logic based on type
            if (updateType === "Job Information") {
                oldData = {
                    branchId: employee.branchId,
                    departmentId: employee.departmentId,
                    designationId: employee.designationId
                };
                const newBranch = parseInt(row["Branch ID"]);
                if (row["Branch ID"] && !branchIds.includes(newBranch)) {
                    isValid = false;
                    errors.push("Invalid Branch ID");
                }
                else if (row["Branch ID"]) {
                    mappedData.branchId = newBranch;
                }
                if (row["Department ID"])
                    mappedData.departmentId = parseInt(row["Department ID"]);
                if (row["Designation ID"])
                    mappedData.designationId = parseInt(row["Designation ID"]);
                if (row["Level ID"])
                    mappedData.levelId = parseInt(row["Level ID"]);
            }
            else if (updateType === "Contact Details") {
                oldData = { mobile: employee.mobile, personalEmail: employee.personalEmail };
                if (row["Mobile"])
                    mappedData.mobile = row["Mobile"];
                if (row["Personal Email"])
                    mappedData.personalEmail = row["Personal Email"];
                if (row["Current Address"])
                    mappedData.currentAddress = row["Current Address"];
                if (row["Emergency Number"])
                    mappedData.emergencyNumber = row["Emergency Number"];
            }
            else if (updateType === "Personal Information") {
                oldData = { firstName: employee.firstName, lastName: employee.lastName };
                if (row["First Name"])
                    mappedData.firstName = row["First Name"];
                if (row["Last Name"])
                    mappedData.lastName = row["Last Name"];
                if (row["DOB (YYYY-MM-DD)"]) {
                    const parsedDate = new Date(row["DOB (YYYY-MM-DD)"]);
                    if (isNaN(parsedDate.getTime())) {
                        isValid = false;
                        errors.push("Invalid DOB Format");
                    }
                    else {
                        mappedData.dob = parsedDate;
                    }
                }
            }
            else if (updateType === "Bank Details") {
                oldData = { bankName: employee.bankName, accountNo: employee.accountNo };
                if (row["Bank Name"])
                    mappedData.bankName = row["Bank Name"];
                if (row["Account No"])
                    mappedData.accountNo = row["Account No"];
                if (row["IFSC Code"])
                    mappedData.ifscCode = row["IFSC Code"];
                if (row["PAN No"])
                    mappedData.panNo = row["PAN No"];
            }
            else if (updateType === "Employee Status") {
                oldData = { status: employee.status };
                if (row["Status"]) {
                    if (["Active", "Inactive", "Terminated", "Resigned"].includes(row["Status"])) {
                        mappedData.status = row["Status"];
                    }
                    else {
                        isValid = false;
                        errors.push("Invalid Status value");
                    }
                }
            }
            else if (updateType === "Shift Assignment") {
                oldData = { shift: employee.shift };
                if (row["Shift"])
                    mappedData.shift = row["Shift"];
            }
            results.push({
                row,
                mappedData,
                oldData,
                status: isValid ? (Object.keys(mappedData).length ? 'Valid' : 'Warning') : 'Error',
                errors: isValid && !Object.keys(mappedData).length ? ["No valid fields to update"] : errors
            });
        }
        res.json({ results });
    }
    catch (error) {
        console.error("Validation error:", error);
        res.status(500).json({ error: "Failed to validate batch" });
    }
};
exports.validateBulkUpdate = validateBulkUpdate;
// 3. Apply Bulk Update
const applyBulkUpdate = async (req, res) => {
    try {
        const { updateType, validatedData } = req.body;
        if (!updateType || !validatedData || !Array.isArray(validatedData)) {
            return res.status(400).json({ error: "Invalid data format" });
        }
        let successCount = 0;
        let failCount = 0;
        await prismaClient_1.default.$transaction(async (tx) => {
            var _a;
            // @ts-ignore
            const batch = await tx.bulkUpdateBatch.create({
                data: {
                    updateType,
                    status: "Completed"
                }
            });
            for (const item of validatedData) {
                if (item.status !== 'Valid') {
                    failCount++;
                    // Optionally log failed rows
                    // @ts-ignore
                    await tx.bulkUpdateLog.create({
                        data: {
                            batchId: batch.id,
                            employeeId: String(item.row["Employee ID"] || "Unknown"),
                            status: "Failed",
                            errorMessage: (_a = item.errors) === null || _a === void 0 ? void 0 : _a.join(", "),
                            changesDetected: JSON.stringify(item.mappedData || {})
                        }
                    });
                    continue;
                }
                await tx.employee.update({
                    where: { employeeId: item.row["Employee ID"] },
                    data: item.mappedData
                });
                // @ts-ignore
                await tx.bulkUpdateLog.create({
                    data: {
                        batchId: batch.id,
                        employeeId: String(item.row["Employee ID"]),
                        status: "Success",
                        changesDetected: JSON.stringify({ old: item.oldData, new: item.mappedData })
                    }
                });
                successCount++;
            }
        });
        res.json({ message: "Batch updated successfully", successCount, failCount });
    }
    catch (error) {
        console.error("Apply error:", error);
        res.status(500).json({ error: "Failed to apply batch updates" });
    }
};
exports.applyBulkUpdate = applyBulkUpdate;
//# sourceMappingURL=bulkUpdateController.js.map