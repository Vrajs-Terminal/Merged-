import React from 'react';
import { FileText, Table } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

interface ExportButtonsProps {
    data: any[];
    fileName: string;
    title?: string;
    headers?: string[];
    sheetName?: string;
    orientation?: 'portrait' | 'landscape';
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
    data,
    fileName,
    title = 'Report',
    headers,
    sheetName = 'Data',
}) => {
    return (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button
                className="btn-secondary"
                onClick={() => exportToExcel(data, fileName, sheetName)}
                title="Export to Excel"
            >
                <Table size={16} />
                Excel
            </button>
            <button
                className="btn-primary"
                onClick={() => exportToPDF(data, fileName, title, headers)}
                title="Export to PDF"
            >
                <FileText size={16} />
                PDF
            </button>
        </div>
    );
};

export default ExportButtons;
