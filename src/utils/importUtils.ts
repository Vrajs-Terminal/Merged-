import * as XLSX from 'xlsx';

/**
 * Parses an Excel or CSV file and returns an array of objects
 * @param file The File object from an input element
 * @returns Promise resolving to an array of objects
 */
export const importFromExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to JSON
                const json = XLSX.utils.sheet_to_json(worksheet);
                resolve(json);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);

        reader.readAsBinaryString(file);
    });
};

/**
 * Triggers a file input dialog and returns the selected file's parsed data
 */
export const triggerImport = (): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx, .xls, .csv';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) {
                reject('No file selected');
                return;
            }
            try {
                const data = await importFromExcel(file);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        };
        input.click();
    });
};
