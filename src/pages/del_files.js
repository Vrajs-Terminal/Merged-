const fs = require('fs');
['leaveApprovals.tsx', 'leaveRequest.tsx', 'leaveRequest.css', 'hierarchyChart.tsx', 'hierarchyChart.css'].forEach(f => {
    if (fs.existsSync(f)) {
        try {
            fs.unlinkSync(f);
            console.log('Successfully deleted ' + f);
        } catch (e) {
            console.log('Error deleting ' + f + ': ' + e.message);
        }
    } else {
        console.log(f + ' does not exist');
    }
});
