console.log("ERP Filter: Content script loaded on " + window.location.href);

let filterActive = true;
let gridFound = false;

// Queue system for checking eligibility without spamming the server
const checkQueue = [];
let isChecking = false;

async function processQueue() {
    if (isChecking || checkQueue.length === 0) return;
    isChecking = true;
    
    while (checkQueue.length > 0) {
        const task = checkQueue.shift();
        await task();
        // Wait 300ms between requests to be gentle on the ERP server
        await new Promise(r => setTimeout(r, 300));
    }
    
    isChecking = false;
}

function queueEligibilityCheck(tr, applyLink) {
    if (tr.dataset.eligibilityChecked) return;
    tr.dataset.eligibilityChecked = "queued";
    
    checkQueue.push(async () => {
        try {
            // Extract rollno and yop from the header
            let rollno = "";
            const statusLink = document.querySelector('a[onclick^="StudentPlacementStatus"]');
            if (statusLink) {
                const match = statusLink.getAttribute('onclick').match(/StudentPlacementStatus\('[^']+',\s*'([^']+)'\)/);
                if (match) rollno = match[1];
            }
            
            // Extract jnf_id, com_id, yop from apply link
            const onclickStr = applyLink.getAttribute('onclick');
            const match = onclickStr.match(/TPJNFView\("([^"]+)","([^"]+)","([^"]+)"\)/);
            
            if (match && rollno) {
                const jnf_id = match[1];
                const com_id = match[2];
                const yop = match[3];
                
                const url = `https://erp.iitkgp.ac.in/TrainingPlacementSSO/TPJNFView.jsp?jnf_id=${jnf_id}&com_id=${com_id}&yop=${yop}&user_type=SU&rollno=${rollno}`;
                
                const response = await fetch(url);
                const text = await response.text();
                
                // Check if the response contains the CGPA cutoff warning
                // Add more strings here if there are other reasons for ineligibility
                const isNotEligible = text.includes("greater than yours");
                
                if (isNotEligible) {
                    tr.dataset.eligible = "false";
                } else {
                    tr.dataset.eligible = "true";
                }
            } else {
                tr.dataset.eligible = "unknown";
            }
        } catch (e) {
            console.error("ERP Filter: Failed to check eligibility", e);
            tr.dataset.eligible = "error";
        }
        
        tr.dataset.eligibilityChecked = "done";
        
        // Re-apply visual filters for this row specifically
        applyFiltersToRow(tr);
    });
    
    processQueue();
}

function applyFiltersToRow(tr) {
    const isExpired = tr.dataset.expired === "true";
    const isEligible = tr.dataset.eligible !== "false"; // true, unknown, or undefined are treated as eligible initially
    
    if (filterActive) {
        if (isExpired || !isEligible) {
            tr.style.setProperty('display', 'none', 'important');
        } else {
            tr.style.setProperty('display', '', 'important');
            tr.style.setProperty('opacity', '1', 'important');
            tr.style.setProperty('background-color', '#e8f5e9', 'important'); // green for active & eligible
        }
    } else {
        // Show everything, but color code them
        tr.style.setProperty('display', '', 'important');
        
        if (isExpired || !isEligible) {
            tr.style.setProperty('opacity', '0.4', 'important');
            tr.style.setProperty('background-color', '#ffebee', 'important'); // red for expired or ineligible
        } else {
            tr.style.setProperty('opacity', '1', 'important');
            tr.style.setProperty('background-color', '#e8f5e9', 'important'); // green for active & eligible
        }
    }
}

function filterCompanies() {
    const deadlineCells = document.querySelectorAll('td[aria-describedby$="_resumedeadline"]');
    
    if (deadlineCells.length > 0 && !gridFound) {
        console.log("ERP Filter: Found " + deadlineCells.length + " company rows. Applying filter...");
        gridFound = true;
    }

    if (deadlineCells.length === 0) return;

    const now = new Date();
    
    deadlineCells.forEach(cell => {
        const dateStr = (cell.textContent || "").trim();
        if (!dateStr || dateStr === "") return;

        const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
        if (match) {
            const year = parseInt(match[1]);
            const month = parseInt(match[2]) - 1; 
            const day = parseInt(match[3]);
            const hour = parseInt(match[4]);
            const minute = parseInt(match[5]);
            
            const deadline = new Date(year, month, day, hour, minute);
            const tr = cell.closest('tr');
            
            if (tr) {
                // Determine if expired
                if (deadline < now) {
                    tr.dataset.expired = "true";
                } else {
                    tr.dataset.expired = "false";
                }
                
                // Trigger eligibility check if not already done AND if the deadline has not expired
                const applyLink = tr.querySelector('a[onclick^="TPJNFView"]');
                if (applyLink && !tr.dataset.eligibilityChecked && tr.dataset.expired === "false") {
                    queueEligibilityCheck(tr, applyLink);
                }

                // Apply visibility rules immediately (eligibility might take a second to load)
                applyFiltersToRow(tr);
            }
        }
    });
}

function addToggleButton() {
    if (document.getElementById('erp-filter-btn')) return;
    if (document.querySelectorAll('td[aria-describedby$="_resumedeadline"]').length === 0) return;

    const btn = document.createElement('button');
    btn.id = 'erp-filter-btn';
    btn.textContent = filterActive ? 'Show All Companies' : 'Filter Active & Eligible';
    btn.style.position = 'fixed';
    btn.style.top = '10px';
    btn.style.right = '10px';
    btn.style.zIndex = '999999';
    btn.style.padding = '10px 15px';
    btn.style.backgroundColor = filterActive ? '#4CAF50' : '#f44336';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.borderRadius = '5px';
    btn.style.cursor = 'pointer';
    btn.style.fontWeight = 'bold';
    btn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';

    btn.onclick = () => {
        filterActive = !filterActive;
        btn.textContent = filterActive ? 'Show All Companies' : 'Filter Active & Eligible';
        btn.style.backgroundColor = filterActive ? '#4CAF50' : '#f44336';
        console.log("ERP Filter: Button clicked. filterActive = " + filterActive);
        
        // Re-apply filters to all rows
        const rows = document.querySelectorAll('tr[role="row"]');
        rows.forEach(tr => {
            if (tr.dataset.expired) applyFiltersToRow(tr);
        });
    };

    document.body.appendChild(btn);
}

setInterval(() => {
    addToggleButton();
    filterCompanies();
}, 1000);
