import React, { useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { importFromExcel } from '../utils/importUtils';

interface ImportButtonProps {
    onImport: (data: any[]) => void;
    accept?: string;
    label?: string;
}

const ImportButton: React.FC<ImportButtonProps> = ({
    onImport,
    accept = '.xlsx, .xls, .csv',
    label = 'Import'
}) => {
    const [isImporting, setIsImporting] = React.useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            const data = await importFromExcel(file);
            onImport(data);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error('Import failed', error);
            alert('Failed to parse file. Please ensure it is a valid Excel or CSV file.');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept={accept}
                onChange={handleFileChange}
            />
            <button
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
            >
                {isImporting ? <Loader2 size={16} className="spinner" /> : <Upload size={16} />}
                {isImporting ? 'Processing...' : label}
            </button>
        </div>
    );
};

export default ImportButton;
