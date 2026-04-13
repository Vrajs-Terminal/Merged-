import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF with autotable types if needed, but jspdf-autotable handles it
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

/**
 * Exports data to an Excel file (.xlsx)
 * @param data Array of objects to export
 * @param fileName Name of the file (without extension)
 * @param sheetName Name of the worksheet
 */
export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Clean filename
    const safeFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    XLSX.writeFile(workbook, `${safeFileName}_${new Date().getTime()}.xlsx`);
};

/**
 * Exports data to a PDF file (.pdf) using an auto-generated table
 * @param data Array of objects to export
 * @param fileName Name of the file (without extension)
 * @param title Title heading in the PDF
 * @param headers Optional custom headers (keys from data objects)
 */
export const exportToPDF = (data: any[], fileName: string, title: string = 'Report', headers?: string[]) => {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    const doc = new jsPDF('landscape');
    const timestamp = new Date().toLocaleString();

    // Add Title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${timestamp}`, 14, 30);

    // Extract columns (headers)
    const columns = headers || Object.keys(data[0]);

    // Format data for autotable
    const rows = data.map(item => columns.map(col => {
        const val = item[col];
        return val === null || val === undefined ? '' : String(val);
    }));

    // Generate table
    doc.autoTable({
        head: [columns.map(c => c.toUpperCase().replace(/_/g, ' '))],
        body: rows,
        startY: 35,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { top: 35 }
    });

    const safeFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`${safeFileName}_${new Date().getTime()}.pdf`);
};
