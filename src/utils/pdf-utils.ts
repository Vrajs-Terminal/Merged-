import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateSalaryPDF = (slipData: any) => {
    const doc = new jsPDF();
    const { user, month, year, items, net_salary, total_earnings, total_deductions } = slipData;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text('MineHR-Solutions Pvt. Ltd.', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text(`Salary Slip for ${new Date(2000, month - 1).toLocaleString('default', { month: 'long' })} ${year}`, 105, 30, { align: 'center' });
    
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 35, 190, 35);
    
    // Employee Details
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(`Employee Name: ${user.name}`, 20, 45);
    doc.text(`Employee ID: EMP-${1000 + user.id}`, 20, 50);
    doc.text(`Department: ${user.department?.name || 'N/A'}`, 20, 55);
    doc.text(`Branch: ${user.branch?.name || 'N/A'}`, 120, 45);
    doc.text(`Designation: ${user.designation?.name || 'N/A'}`, 120, 50);
    doc.text(`Payment Mode: ${slipData.salary_mode || 'Bank Transfer'}`, 120, 55);
    
    // Summary Tables
    const earnings = items.filter((item: any) => item.type === 'Earning');
    const deductions = items.filter((item: any) => item.type === 'Deduction');
    
    autoTable(doc, {
        startY: 65,
        head: [['Earnings', 'Amount', 'Deductions', 'Amount']],
        body: Array.from({ length: Math.max(earnings.length, deductions.length) }).map((_, i) => [
            earnings[i]?.name || '',
            earnings[i] ? `INR ${earnings[i].amount.toLocaleString()}` : '',
            deductions[i]?.name || '',
            deductions[i] ? `INR ${deductions[i].amount.toLocaleString()}` : ''
        ]),
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 9 }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Earnings: INR ${total_earnings.toLocaleString()}`, 20, finalY);
    doc.text(`Total Deductions: INR ${total_deductions.toLocaleString()}`, 20, finalY + 7);
    
    doc.setFillColor(248, 250, 252);
    doc.rect(20, finalY + 15, 170, 15, 'F');
    doc.setTextColor(5, 150, 105);
    doc.setFontSize(14);
    doc.text(`Net Payable: INR ${net_salary.toLocaleString()}`, 105, finalY + 25, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text('This is a computer generated salary slip and does not require a signature.', 105, 280, { align: 'center' });
    
    doc.save(`SalarySlip_${user.name}_${month}_${year}.pdf`);
};
