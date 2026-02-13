// Login Logic
function attemptLogin() {
    const pin = document.getElementById("loginPin").value;
    const errorEl = document.getElementById("loginError");

    console.log("Login attempt with PIN:", pin);

    if (pin === "1234") {
        console.log("Login successful!");
        localStorage.setItem("dr_pin", "verified");
        showApp();
    } else {
        console.warn("Login failed: Invalid PIN");
        errorEl.style.display = "block";
        document.getElementById("loginPin").value = "";
        document.getElementById("loginPin").focus();
    }
}

// Clear error on input
document.addEventListener('DOMContentLoaded', () => {
    const pinInput = document.getElementById("loginPin");
    if (pinInput) {
        pinInput.addEventListener('input', () => {
            document.getElementById("loginError").style.display = "none";
        });
    }
});

function showApp() {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    // Check if we need to load anything on startup
    if (allSymptoms.length === 0) fetchSymptoms();
}

function logout() {
    localStorage.removeItem("dr_pin");
    window.location.reload();
}

function checkLogin() {
    if (localStorage.getItem("dr_pin") === "verified") {
        showApp();
    }
}

let symptoms = [];

// Fetch available symptoms on load
let allSymptoms = [];

async function fetchSymptoms() {
    try {
        const res = await fetch("/symptoms");
        if (res.ok) {
            allSymptoms = await res.json();
            console.log(`Loaded ${allSymptoms.length} symptoms for search.`);
        }
    } catch (e) {
        console.error("Failed to fetch symptoms", e);
    }
}

// Initial Setup
window.addEventListener('DOMContentLoaded', async () => {
    checkLogin();
    await fetchSymptoms();
});

// Dynamic Autocomplete for Symptoms (Performance Fix)
document.getElementById("symptom").addEventListener("input", function (e) {
    const val = this.value.toLowerCase();
    const datalist = document.getElementById("symptom-suggestions");
    datalist.innerHTML = ""; // Clear previous

    if (val.length < 2) return; // Only search after 2 chars to save processing

    // Filter top 20 matches
    const matches = allSymptoms.filter(s => s.toLowerCase().includes(val)).slice(0, 20);

    matches.forEach(s => {
        const option = document.createElement("option");
        option.value = s;
        datalist.appendChild(option);
    });
});

function addSymptom() {
    const symptomInput = document.getElementById("symptom");
    const symptom = symptomInput.value.trim();
    if (symptom) {
        // Prevent duplicates
        if (!symptoms.includes(symptom)) {
            symptoms.push(symptom);
            renderSymptoms();
        }
        symptomInput.value = ""; // Clear input
        symptomInput.focus();
    }
}

function removeSymptom(index) {
    symptoms.splice(index, 1);
    renderSymptoms();
}

function renderSymptoms() {
    const list = document.getElementById("symptomList");
    if (symptoms.length === 0) {
        list.innerHTML = "<span style='color: #888;'>No symptoms added yet.</span>";
        return;
    }
    list.innerHTML = symptoms.map((s, index) =>
        `<span class="symptom-tag" onclick="removeSymptom(${index})" title="Click to remove">${s} &times;</span>`
    ).join("");
}

async function analyze() {
    const resultDiv = document.getElementById("result");
    if (symptoms.length === 0) {
        resultDiv.innerHTML = "<div style='color: red; text-align: center;'>Please add at least one symptom.</div>";
        return;
    }

    resultDiv.innerHTML = "<div style='text-align: center;'>Analyzing...</div>";

    try {
        const res = await fetch("/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symptoms: symptoms })
        });
        const data = await res.json();
        let html = "<h3>Analysis Results</h3>";

        const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

        if (entries.length === 0) {
            html += "<div class='result-item'>No matching remedies found. Try different symptoms.</div>";
        } else {
            // Normalize scores to percentages
            const maxScore = entries[0][1];

            // Get top 6 remedies
            const topRemedies = entries.slice(0, 6);
            const topNames = topRemedies.map(e => e[0]);

            // Auto-fill prescription with top 3 suggestions only to keep it clean, but show 6
            const prescriptionBox = document.getElementById("prescription");
            if (topNames.length > 0) {
                // Formatting for prescription (still suggest top 3 in text area)
                const suggestionText = topNames.slice(0, 3).map((rem, i) => `${i + 1}. ${rem} 30C - 3 pills, 3 times a day`).join("\n");
                const autoPrescription = `Rx (Suggested):\n${suggestionText}\n\n(Edit as needed)`;

                if (!prescriptionBox.value.trim() || prescriptionBox.value.includes("Rx (Suggested)")) {
                    prescriptionBox.value = autoPrescription;
                }
            }

            html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">`;

            topRemedies.forEach((r, idx) => {
                const percentage = Math.round((r[1] / maxScore) * 100);
                // Highlight top 1 specially
                const isWinner = idx === 0 ? "border: 2px solid #005f73; background: #e0f2f1;" : "";

                html += `
                <div class="result-item" style="${isWinner} display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                        <div style="font-weight: bold; color: #005f73; font-size: 1.1em;">${idx + 1}. ${r[0]}</div>
                        <div class="result-score" style="font-size: 1em;">${r[1].toFixed(1)}</div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                        <span style="font-size: 0.85em; color: #666;">Confidence: ${percentage}%</span>
                        <button onclick="viewMateriaMedica('${r[0]}')" style="padding: 5px 10px; font-size: 0.8em; background: #005f73; color: white; border: none; border-radius: 4px; cursor: pointer;">📖 View MM</button>
                    </div>
                </div>`;
            });

            html += `</div>`; // End grid

            // Show remaining list if any (collapsed or formatted differently? for now just top 6 request)
        }
        resultDiv.innerHTML = html;

        // Scroll to prescription area
        document.getElementById("prescription-date").scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error("Error analyzing:", error);
        resultDiv.innerHTML = "<div style='color: red; text-align: center;'>Failed to analyze. Check backend connection.</div>";
    }
}

async function browseMateriaMedica() {
    // Show modal with list
    const modal = document.getElementById("mmModal");
    const title = document.getElementById("mmTitle");
    const content = document.getElementById("mmContent");

    title.innerText = "Materia Medica Index";

    // Initial loading state
    content.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-dark);">Loading remedies...</div>';
    modal.style.display = "block";
    content.scrollTop = 0;

    try {
        const res = await fetch("/remedies");
        if (!res.ok) throw new Error("Failed to load index.");
        const remedies = await res.json();

        if (remedies.length === 0) {
            content.innerHTML = "<div style='padding: 20px;'>No remedies found in database.</div>";
            return;
        }

        // Create Container
        const container = document.createElement("div");

        // Search Input
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.placeholder = "Search remedy...";
        searchInput.style.width = "100%";
        searchInput.style.padding = "10px";
        searchInput.style.marginBottom = "15px";
        searchInput.style.boxSizing = "border-box"; // Fix padding issue
        searchInput.style.border = "1px solid var(--accent-color)";
        searchInput.style.borderRadius = "var(--border-radius)";

        // Grid Container
        const grid = document.createElement("div");
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(140px, 1fr))";
        grid.style.gap = "10px";
        grid.style.padding = "10px";

        // Function to render buttons
        function renderButtons(filterText = "") {
            grid.innerHTML = ""; // Clear existing
            const filtered = remedies.filter(r => r.toLowerCase().includes(filterText.toLowerCase()));

            if (filtered.length === 0) {
                grid.innerHTML = "<div style='grid-column: 1/-1; text-align:center;'>No matches found.</div>";
                return;
            }

            filtered.forEach(rem => {
                const btn = document.createElement("button");
                btn.innerText = rem;
                btn.onclick = () => viewMateriaMedica(rem);
                btn.style.background = "var(--bg-color)";
                btn.style.color = "var(--primary-color)";
                btn.style.border = "1px solid var(--accent-color)";
                btn.style.padding = "10px";
                btn.style.borderRadius = "8px";
                btn.style.fontStyle = "italic";
                btn.style.fontFamily = "serif";
                btn.style.cursor = "pointer";
                btn.style.transition = "all 0.2s";

                // Hover effect logic handled via CSS generally, but inline simple one:
                btn.onmouseover = () => { btn.style.background = "var(--secondary-color)"; btn.style.color = "white"; };
                btn.onmouseout = () => { btn.style.background = "var(--bg-color)"; btn.style.color = "var(--primary-color)"; };

                grid.appendChild(btn);
            });
        }

        // Bind Search
        searchInput.oninput = (e) => renderButtons(e.target.value);

        // Assemble
        container.appendChild(searchInput);
        container.appendChild(grid);

        content.innerHTML = "";
        content.appendChild(container);

        // Initial Render
        renderButtons();

        // Auto-focus search
        searchInput.focus();

    } catch (e) {
        console.error("Browse Error:", e);
        content.innerHTML = `<div style='color: red; padding: 20px;'>
            <strong>Error loading remedies list.</strong><br>
            <small>${e.message}</small><br>
            <button onclick="browseMateriaMedica()" style="margin-top:10px;">Retry</button>
        </div>`;
    }
}

async function viewMateriaMedica(remedyName) {
    // Show modal or alert
    const modal = document.getElementById("mmModal");
    const title = document.getElementById("mmTitle");
    const content = document.getElementById("mmContent");

    // Reset
    title.innerText = "Loading...";
    content.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-dark);">Fetching Materia Medica...</div>';
    modal.style.display = "block";

    // Scroll content to top in case it was scrolled down previously
    content.scrollTop = 0;

    try {
        const res = await fetch(`/remedy/${encodeURIComponent(remedyName)}`);

        if (!res.ok) {
            throw new Error("Remedy details not found.");
        }

        const data = await res.json();
        title.innerText = data.name; // Set title from data to be sure of proper casing

        let detailsHtml = "";

        // Add "Back to Index" button if browsing
        detailsHtml += `<button onclick="browseMateriaMedica()" style="margin-bottom: 20px; font-size: 0.8em; padding: 5px 10px; width: auto;">← Back to Index</button>`;

        if (data.details && typeof data.details === 'object') {
            for (const [section, text] of Object.entries(data.details)) {
                detailsHtml += `<div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                    <strong style="color: var(--accent-color); text-transform: uppercase; font-size: 0.95em; display: block; margin-bottom: 5px;">${section}</strong>
                    <div style="color: var(--text-dark); line-height: 1.6; text-align: justify;">${text}</div>
                </div>`;
            }
        } else {
            detailsHtml += "<div style='padding: 20px;'>No detailed description available.</div>";
        }

        content.innerHTML = detailsHtml;

    } catch (error) {
        title.innerText = remedyName;
        content.innerHTML = `<div style="color: #d32f2f; padding: 10px;">
            Materia Medica details not available for this remedy yet. <br>
            <button onclick="browseMateriaMedica()" style="margin-top: 15px;">Back to Index</button>
        </div>`;
    }
}

function closeMmModal() {
    document.getElementById("mmModal").style.display = "none";
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById("mmModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

async function save() {
    const name = document.getElementById("name").value.trim();
    const age = document.getElementById("age").value.trim();
    const gender = document.getElementById("gender").value;
    const mobile = document.getElementById("mobile").value.trim();
    const address = document.getElementById("address").value.trim();
    const complaint = document.getElementById("complaint").value.trim();
    const prescription = document.getElementById("prescription").value.trim();

    if (!name || !age || !gender) {
        alert("Please fill in all patient details (Name, Age, Gender).");
        return;
    }

    if (mobile && mobile.length !== 10) {
        alert("Mobile number must be exactly 10 digits.");
        return;
    }

    try {
        await fetch("/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: name,
                age: age,
                gender: gender,
                mobile: mobile,
                address: address,
                complaint: complaint,
                symptoms: symptoms,
                prescription: prescription,
                date: new Date().toISOString()
            })
        });
        alert("Case saved successfully!");

        // Reset form
        document.getElementById("name").value = "";
        document.getElementById("age").value = "";
        document.getElementById("gender").value = "";
        document.getElementById("mobile").value = "";
        document.getElementById("address").value = "";
        document.getElementById("complaint").value = "";
        document.getElementById("prescription").value = "";
        symptoms = [];
        renderSymptoms();
        document.getElementById("result").innerHTML = "";

        // Refresh case list if visible
        if (document.getElementById("caseList").innerHTML !== "") {
            viewCases();
        }
    } catch (error) {
        console.error("Error saving:", error);
        alert("Failed to save case.");
    }
}

// Initial render
renderSymptoms();

let allCasesData = [];

function updateTime() {
    const now = new Date();
    const dateString = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeString = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const element = document.getElementById("prescription-date");
    if (element) {
        element.innerText = `${dateString} | ${timeString}`;
    }
}
setInterval(updateTime, 1000);
updateTime(); // Initial call

async function viewCases() {
    const list = document.getElementById("caseList");
    const searchContainer = document.getElementById("searchContainer");

    // Toggle visibility
    if (list.style.display === "none" || !list.innerHTML) {
        list.style.display = "block";
        searchContainer.style.display = "block";
    } else {
        // If already visible, maybe just refresh data, or toggle off?
        // Let's assume user wants to refresh.
        searchContainer.style.display = "block";
    }

    list.innerHTML = "<div style='text-align: center;'>Loading cases...</div>";

    try {
        const res = await fetch("/cases");
        const cases = await res.json();
        allCasesData = cases; // Store globally for filtering

        if (cases.length === 0) {
            list.innerHTML = "<div style='text-align: center; color: #666;'>No saved cases found.</div>";
            searchContainer.style.display = "none"; // Hide search if no cases
            return;
        }

        renderCaseList(allCasesData);

    } catch (error) {
        console.error("Error loading cases:", error);
        list.innerHTML = "<div style='color: red; text-align: center;'>Failed to load cases.</div>";
    }
}

function filterCases() {
    const query = document.getElementById("caseSearchInput").value.toLowerCase();
    const filtered = allCasesData.filter(c => {
        const nameMatch = c.name.toLowerCase().includes(query);
        const mobileMatch = c.mobile && c.mobile.includes(query);
        return nameMatch || mobileMatch;
    });
    renderCaseList(filtered);
}

function renderCaseList(cases) {
    const list = document.getElementById("caseList");

    if (cases.length === 0) {
        list.innerHTML = "<div style='text-align: center; color: #666; margin-top: 20px;'>No matches found.</div>";
        return;
    }

    let html = "<h3>Saved Records</h3>";

    // Sort by date descending
    cases.sort((a, b) => new Date(b.date) - new Date(a.date));

    cases.forEach(c => {
        const date = new Date(c.date).toLocaleDateString() + " " + new Date(c.date).toLocaleTimeString();
        const symptomString = c.symptoms && c.symptoms.length > 0 ? c.symptoms.join(", ") : "None";
        const prescriptionString = c.prescription || "None";
        const mobileString = c.mobile || "N/A";
        const addressString = c.address || "N/A";
        const complaintString = c.complaint || "N/A";

        html += `
        <div class="case-card">
            <div class="case-header">
                <div>
                    <span class="patient-name">${c.name}</span>
                    <span class="patient-demographics">${c.age} Y / ${c.gender}</span>
                </div>
                <div class="case-date">📅 ${date}</div>
            </div>
            
            <div class="case-body">
                <div class="case-section">
                    <div class="label">Contact Info</div>
                    <div class="value">📞 ${mobileString} <br> 🏠 ${addressString}</div>
                </div>

                <div class="case-section">
                    <div class="label">Present Complaint</div>
                    <div class="value">${complaintString}</div>
                </div>

                <div class="case-rx">
                    <div class="rx-badge">Rx</div>
                    <div class="rx-content">${prescriptionString}</div>
                </div>
                
                <div class="case-symptoms">
                    <strong>Analyzed Symptoms:</strong> ${symptomString}
                </div>

                <div class="case-actions">
                    <button onclick="loadCase('${c.date}')" class="load-btn">📂 Load Case to Edit</button>
                </div>
            </div>
        </div>`;
    });

    list.innerHTML = html;
}

function loadCase(dateIso) {
    const caseData = allCasesData.find(c => c.date === dateIso);

    if (!caseData) {
        console.error("Case not found in current data.");
        alert("Error: Case not found! Please refresh the page.");
        return;
    }

    // Populate fields
    document.getElementById("name").value = caseData.name || "";
    document.getElementById("age").value = caseData.age || "";
    document.getElementById("gender").value = caseData.gender || "";
    document.getElementById("mobile").value = caseData.mobile || "";
    document.getElementById("address").value = caseData.address || "";
    document.getElementById("complaint").value = caseData.complaint || "";
    document.getElementById("prescription").value = caseData.prescription || "";

    // symptoms
    symptoms = Array.isArray(caseData.symptoms) ? [...caseData.symptoms] : []; // Ensure array
    renderSymptoms();

    // Clear analysis result as we are loading an existing final state
    document.getElementById("result").innerHTML = "";

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    console.log("Case loaded successfully:", caseData.name);
    // Visual feedback
    const originalBtnColor = document.querySelector(`button[onclick="loadCase('${dateIso}')"]`)?.style.backgroundColor;
    // We can't easily change the specific button color because we scrolling away.
    // Instead maybe flash the form?
    document.querySelector('.container').style.transition = "box-shadow 0.3s";
    document.querySelector('.container').style.boxShadow = "0 0 20px rgba(0, 95, 115, 0.5)";
    setTimeout(() => {
        document.querySelector('.container').style.boxShadow = "none";
    }, 1000);

    // Provide feedback
    // alert(`Loaded case: ${caseData.name}`);
    // Optional: Highlight that we are in edit mode?
    // For now, simple load is enough.
}

function shareOnWhatsApp() {
    const name = document.getElementById("name").value.trim();
    const age = document.getElementById("age").value.trim();
    const gender = document.getElementById("gender").value;
    const mobile = document.getElementById("mobile").value.trim();
    const complaint = document.getElementById("complaint").value.trim();
    const prescription = document.getElementById("prescription").value.trim();

    if (!name || !prescription) {
        alert("Please ensure Patient Name and Prescription are filled.");
        return;
    }

    // Construct the message
    const dateTime = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    let message = `*Dr. Bamania's Classical Homeopathy - Prescription*\n`;
    message += `*Date:* ${dateTime}\n\n`;
    message += `*Patient:* ${name} (${age}, ${gender})\n`;
    if (complaint) message += `*Complaint:* ${complaint}\n`;
    message += `\n*Rx:*\n${prescription}\n\n`;
    message += `Get well soon!`;

    // Encode for URL
    const encodedMessage = encodeURIComponent(message);

    // Determine the phone number to send to
    let url = "https://wa.me/";
    if (mobile && mobile.length === 10) {
        url += `91${mobile}`; // Appending country code 91
    }
    url += `?text=${encodedMessage}`;

    window.open(url, '_blank');
}

function addDoseDetails() {
    const frequency = document.getElementById("frequency").value;
    const duration = document.getElementById("duration").value.trim();
    const prescriptionBox = document.getElementById("prescription");

    if (!frequency && !duration) {
        alert("Please select Frequency or enter Duration.");
        return;
    }

    let addition = "\n→ ";
    if (frequency) addition += `Take: ${frequency}`;
    if (frequency && duration) addition += " | ";
    if (duration) addition += `Duration: ${duration}`;

    prescriptionBox.value += addition;
    prescriptionBox.focus();
}

// Initialize App: Check Backend & Set Date
window.onload = async () => {
    // 1. Set Date
    const dateElement = document.getElementById("prescription-date");
    if (dateElement) {
        dateElement.innerText = "Date: " + new Date().toLocaleDateString();
    }

    // Auto-login check
    if (localStorage.getItem("dr_pin") === "verified") {
        const loginEl = document.getElementById("login-screen");
        const mainEl = document.getElementById("mainApp");
        if (loginEl) loginEl.style.display = "none";
        if (mainEl) mainEl.style.display = "block";
    }

    // 2. Add Enter key support for login
    const loginPinInput = document.getElementById("loginPin");
    if (loginPinInput) {
        loginPinInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") attemptLogin();
        });
    }

    // 3. Load Symptoms for Datalist (Optimization)
    // We don't have a specific endpoint for ALL symptoms yet, but user types freely.
    // However, let's verify backend health.
    try {
        const res = await fetch("/remedies");
        if (res.ok) {
            console.log("System Ready: Backend connected.");
        } else {
            console.warn("System Warning: Backend reachable but returned error.");
        }
    } catch (e) {
        console.error("System Error: Backend connection failed.", e);
        // Only alert if we ARE logged in and trying to use the app
        if (localStorage.getItem("dr_pin") === "verified") {
            // alert("⚠️ Connection Error: Ensure server is running (node server.js).");
        }
    }
};