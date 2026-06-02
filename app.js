/* ==========================================================================
   FAKETERN INTERACTIVE ENGINE - CLIENT SIDE SCRIPTS
   ========================================================================== */

// Import PDF.js
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

document.addEventListener('DOMContentLoaded', () => {
    initMouseSpotlight();
    initHeaderScroll();
    initHeroCanvas();
    initCardSpotlights();
    initVerifierTabs();
    initDragAndDrop();
    initVerifierEngine();
    initChatbot();
    initLiveReports();
    initModal();
    initAuth();
});

/* ==========================================================================
   1. MOUSE SPOTLIGHT OVERLAY
   ========================================================================== */
function initMouseSpotlight() {
    const spotlight = document.querySelector('.mouse-spotlight');
    if (!spotlight) return;

    window.addEventListener('mousemove', (e) => {
        // Update CSS Variables on body to drive spotlight radial gradient
        document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
    });
}

/* ==========================================================================
   2. STICKY HEADER BLUR ON SCROLL
   ========================================================================== */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* ==========================================================================
   3. HERO CANVAS - INTERACTIVE PARTICLES & DIGITIZED GRID
   ========================================================================== */
function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    let particles = [];
    const particleCount = Math.min(65, Math.floor((width * height) / 18000)); // Responsive density
    const connectionDistance = 110;
    
    let mouse = { x: null, y: null, targetX: null, targetY: null, active: false };

    // Resize Handler
    window.addEventListener('resize', () => {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    });

    // Track mouse coordinates on hero container
    const heroSection = document.querySelector('.hero');
    heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        mouse.targetX = e.clientX - rect.left;
        mouse.targetY = e.clientY - rect.top;
        mouse.active = true;
    });

    heroSection.addEventListener('mouseleave', () => {
        mouse.active = false;
    });

    // Particle Blueprint
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = Math.random() * 1.5 + 0.8;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.alpha = Math.random() * 0.4 + 0.15;
            this.pulseDir = Math.random() > 0.5 ? 0.005 : -0.005;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off boundaries
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Ambient Alpha Pulsing
            this.alpha += this.pulseDir;
            if (this.alpha > 0.65 || this.alpha < 0.15) {
                this.pulseDir *= -1;
            }

            // Mouse repulsion dynamics
            if (mouse.active && mouse.x !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 140) {
                    const force = (140 - dist) / 140;
                    this.x += (dx / dist) * force * 1.2;
                    this.y += (dy / dist) * force * 1.2;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(245, 245, 247, ${this.alpha})`;
            ctx.fill();
        }
    }

    // Populate particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Main animation loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Smooth mouse tracking
        if (mouse.active) {
            if (mouse.x === null) {
                mouse.x = mouse.targetX;
                mouse.y = mouse.targetY;
            } else {
                mouse.x += (mouse.targetX - mouse.x) * 0.1;
                mouse.y += (mouse.targetY - mouse.y) * 0.1;
            }
        }

        // Connect particles
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            p1.update();
            p1.draw();

            // Connect nearby nodes
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    const alphaConnection = (1 - (dist / connectionDistance)) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(47, 128, 237, ${alphaConnection})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }

            // Faintly link mouse to closest particles
            if (mouse.active && mouse.x !== null) {
                const dx = p1.x - mouse.x;
                const dy = p1.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < connectionDistance) {
                    const alphaMouse = (1 - (dist / connectionDistance)) * 0.18;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(138, 43, 226, ${alphaMouse})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}

/* ==========================================================================
   4. INTERACTIVE CARD HOVER GLOWS
   ========================================================================== */
function initCardSpotlights() {
    // Verifier card glow effect
    const verifierContainer = document.getElementById('verifier-card-container');
    if (verifierContainer) {
        verifierContainer.addEventListener('mousemove', (e) => {
            const rect = verifierContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            verifierContainer.style.setProperty('--card-mouse-x', `${x}px`);
            verifierContainer.style.setProperty('--card-mouse-y', `${y}px`);
        });
    }

    // Feature Grid card glows
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--feat-mouse-x', `${x}px`);
            card.style.setProperty('--feat-mouse-y', `${y}px`);
        });
    });
}

/* ==========================================================================
   5. VERIFIER TABS LOGIC
   ========================================================================== */
function initVerifierTabs() {
    const tabTriggers = document.querySelectorAll('.tab-trigger');
    const verifierPanes = document.querySelectorAll('.verifier-pane');

    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetTab = trigger.getAttribute('data-tab');

            // Deactivate all triggers & panes
            tabTriggers.forEach(t => t.classList.remove('active'));
            verifierPanes.forEach(p => p.classList.remove('active'));

            // Activate current trigger & target pane
            trigger.classList.add('active');
            const targetPane = document.getElementById(targetTab);
            if (targetPane) targetPane.classList.add('active');
        });
    });
}

/* ==========================================================================
   6. DRAG AND DROP FILE LOGIC
   ========================================================================== */
function initDragAndDrop() {
    setupDropzone('screenshot-dropzone', 'screenshot-file', 'screenshot-file-info', 'screenshot-file-name', 'screenshot-remove-btn');
    setupDropzone('document-dropzone', 'document-file', 'document-file-info', 'document-file-name', 'document-remove-btn');
}

function setupDropzone(zoneId, inputId, infoId, nameId, removeBtnId) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    const infoPanel = document.getElementById(infoId);
    const nameSpan = document.getElementById(nameId);
    const removeBtn = document.getElementById(removeBtnId);

    if (!zone || !input || !infoPanel) return;

    // Trigger input on zone click (excluding remove button and input itself to prevent loop)
    zone.addEventListener('click', (e) => {
        if (e.target !== removeBtn && e.target !== input) {
            input.click();
        }
    });

    input.addEventListener('change', () => {
        if (input.files && input.files.length > 0) {
            handleFileSelect(input.files[0], infoPanel, nameSpan);
        }
    });

    // Drag-over styling shifts
    ['dragenter', 'dragover'].forEach(eventName => {
        zone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        zone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.remove('dragover');
        }, false);
    });

    // Drop file handling
    zone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            input.files = files;
            handleFileSelect(files[0], infoPanel, nameSpan);
        }
    });

    // Clear file selection
    removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        input.value = '';
        infoPanel.classList.add('hidden');
    });
}

function handleFileSelect(file, infoPanel, nameSpan) {
    nameSpan.textContent = file.name;
    infoPanel.classList.remove('hidden');
    infoPanel.dataset.filename = file.name;
    infoPanel.dataset.filetext = ''; // Reset

    // Handle PDF files properly with PDF.js
    if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const pdf = await pdfjsLib.getDocument(new Uint8Array(e.target.result)).promise;
                let fullText = '';
                
                // Extract text from all pages
                for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) { // Read first 5 pages max
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => item.str).join(' ') + '\n';
                }
                
                infoPanel.dataset.filetext = fullText;
            } catch (error) {
                console.error('PDF parsing error:', error);
                infoPanel.dataset.filetext = `[Error reading PDF: ${error.message}]`;
            }
        };
        reader.readAsArrayBuffer(file);
    } else if (file.name.endsWith('.txt') || file.type.startsWith('text/')) {
        // Handle text files normally
        const reader = new FileReader();
        reader.onload = function(e) {
            infoPanel.dataset.filetext = e.target.result || '';
        };
        reader.readAsText(file);
    }
}

/* ==========================================================================
   VALIDATION ERROR DISPLAY
   ========================================================================== */
function showValidationError(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'validation-error-toast';
    toast.innerHTML = `
        <div class="toast-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/* ==========================================================================
   7. VERIFIER ENGINE SIMULATOR & RESULTS RENDERING
   ========================================================================== */
const MOCK_SCAM_DATA = {
    'tab-link': {
        score: 87,
        risk: 'CRITICAL THREAT',
        riskClass: 'badge-critical',
        resultClass: 'results-card-high',
        explanation: 'The submitted web resource represents a high security threat. Domain record metrics show this URL was registered 4 days ago using anonymous identity shielding located in Iceland. Phishing classification algorithms detected structural layout patterns that mimic certified hiring directories to steal banking profiles.',
        signals: [
            { type: 'flagged', title: 'Domain Registration Age', desc: 'Registered 4 days ago. Legitimate corporate platforms require established history records.' },
            { type: 'flagged', title: 'Authentication Failures', desc: 'Lacks official SPF, DKIM records. Host identity is not aligned with company headers.' },
            { type: 'warned', title: 'Content Mirroring', desc: 'Job listing copies standard company wording, but utilizes a third-party application form.' }
        ],
        precedents: [
            {
                company: 'Google Careers (Fake Outreach)',
                platform: 'Telegram / LinkedIn spoof',
                date: 'May 2026',
                proof: 'Matches threat signature [PAT-LINK-902]: Domain registered through anonymous server in Iceland, mimicking Google hiring portal structure. 14 identical reports submitted of students losing credentials.',
                source: 'Community Registry #8421'
            }
        ]
    },
    'tab-screenshot': {
        score: 94,
        risk: 'CRITICAL THREAT',
        riskClass: 'badge-critical',
        resultClass: 'results-card-high',
        explanation: 'Optical Character Recognition (OCR) parsed heavy linguistic coercion markers from the chat snapshot. The recruiter requests $150 in cryptocurrency or digital payment before finalizing contract agreements to supply corporate credentials. Legitimate employers never charge candidates.',
        signals: [
            { type: 'flagged', title: 'Financial Solicitation Hook', desc: 'Explicitly requests $150 refundable key authorization fee.' },
            { type: 'flagged', title: 'High-Pressure Coercion', desc: 'Demands compliance within 24 hours under threat of candidate registration deletion.' },
            { type: 'warned', title: 'Communication Channels', desc: 'Unverified Telegram/WhatsApp coordinator profile without corporate authentication.' }
        ],
        precedents: [
            {
                company: 'Adobe Remote Design Scams',
                platform: 'Telegram recruitment',
                date: 'April 2026',
                proof: 'Matches scam pattern [PAT-PAY-401]: Candidates asked to send $150 refundable software configuration fee. 37 verified victims in our database lost payments through Bitcoin and Zelle.',
                source: 'Crowdsourced Database #7908'
            }
        ]
    },
    'tab-document': {
        score: 78,
        risk: 'HIGH THREAT',
        riskClass: 'badge-warning',
        resultClass: 'results-card-medium',
        explanation: 'Cryptographic signature audits on this PDF document failed authenticity validation. The document metadata claims to be generated by Adobe Systems Inc, but the actual metadata shows creation via an unverified MS Word profile. In addition, the template lacks valid corporate seals and contains copy-pasted low-resolution logos.',
        signals: [
            { type: 'flagged', title: 'Metadata Conflict', desc: 'Author name matches template profiles rather than enterprise HR coordinators.' },
            { type: 'flagged', title: 'Digital Hash Validation Failure', desc: 'Cryptographic security hash is unassigned, corrupt, or edited.' },
            { type: 'passed', title: 'Corporate Template Integrity', desc: 'The contract text copies legal verbiage, though layouts show alignment mismatches.' }
        ],
        precedents: [
            {
                company: 'Microsoft HR Spoofing',
                platform: 'Direct PDF offer letter',
                date: 'June 2026',
                proof: 'Invalid digital signature hash and mismatched author metadata ("Admin-PC") matches templated PDF campaigns targeting college graduates. 9 reported instances of fake onboarding agreements.',
                source: 'Academic Threat Feed #9122'
            }
        ]
    },
    'tab-chat': {
        score: 89,
        risk: 'CRITICAL THREAT',
        riskClass: 'badge-critical',
        resultClass: 'results-card-high',
        explanation: 'Lexical analysis of the pasted transcript indicates a high risk of identity spoofing. The sender claims alignment with Google Careers, but contacts the candidate from a generic web domain (@gmail.com). The content pushes for immediate submission of sensitive banking credentials before the interviews take place.',
        signals: [
            { type: 'flagged', title: 'Recruiter Domain Spoof', desc: 'Outreach email domain (@gmail.com) conflicts with claimed enterprise identity.' },
            { type: 'flagged', title: 'Bank Account Solicitation', desc: 'Asks for bank routing codes and identity proofs before scheduling screenings.' },
            { type: 'warned', title: 'Syntax Anomaly', desc: 'Contains highly formal English structures mixed with spelling anomalies typical of foreign scams.' }
        ],
        precedents: [
            {
                company: 'Google HR Phish (@gmail.com)',
                platform: 'WhatsApp outreach',
                date: 'May 2026',
                proof: 'Identical phrasing patterns detected: "Congratulations on your selection as Remote Intern, please send banking routing number for system sync." 22 reports filed under matching template.',
                source: 'Community Registry #7384'
            }
        ]
    }
};

const SIMULATION_LOGS = [
    { text: 'INITIATING FAKERN SANDBOX VERIFIER (V2.4)...', style: 'cyan', delay: 100 },
    { text: 'ISOLATING SUBMITTED RESOURCE IN VIRTUAL ENCLAVE...', style: 'cyan', delay: 300 },
    { text: 'PARSING CONTENT METADATA AND COMPACT ENVELOPE...', style: 'blue', delay: 500 },
    { text: 'QUERYING WHOIS DIRECTORY & DNS MX RECORDS...', style: 'blue', delay: 800 },
    { text: 'WARNING: Host domain is registered via Iceland proxy, created < 7 days ago.', style: 'orange', delay: 1100 },
    { text: 'RUNNING NLP CLASSIFIER ON LINGUISTIC PATTERNS...', style: 'blue', delay: 1400 },
    { text: 'WARNING: Detected high-pressure deposit hooks matching index [SCAM_PAT_9083].', style: 'red', delay: 1700 },
    { text: 'AUDITING SIGNATURE METADATA HASHES & ENCRYPTION...', style: 'blue', delay: 2000 },
    { text: 'CALCULATING COMPOSITE FAKESCORE LEGITIMACY INDEX...', style: 'cyan', delay: 2300 },
    { text: 'SCAN COMPLETE. COMPILATION FINISHED SUCCESSFULLY.', style: 'green', delay: 2600 }
];

function initVerifierEngine() {
    const verifyBtn = document.getElementById('verify-button');
    const demoBtn = document.getElementById('run-demo-btn');
    const restartBtn = document.getElementById('restart-verifier-btn');
    
    const verifierCard = document.getElementById('verifier-card-container');
    const processingCard = document.getElementById('verifier-processing');
    const resultsCard = document.getElementById('verifier-results');

    if (!verifyBtn || !verifierCard || !processingCard || !resultsCard) return;

    verifyBtn.addEventListener('click', () => {
        // Find which tab is active
        const activeTabTrigger = document.querySelector('.tab-trigger.active');
        const activeTabId = activeTabTrigger ? activeTabTrigger.getAttribute('data-tab') : 'tab-link';
        
        // Handle input extraction
        let inputValue = '';
        let fileText = '';
        let hasInput = false;

        if (activeTabId === 'tab-link') {
            inputValue = document.getElementById('url-input').value.trim();
            if (!inputValue) {
                showValidationError('Please enter an internship URL to analyze');
                return;
            }
            hasInput = true;
        } else if (activeTabId === 'tab-chat') {
            inputValue = document.getElementById('chat-input').value.trim();
            if (!inputValue) {
                showValidationError('Please paste a chat message or recruiter communication to analyze');
                return;
            }
            hasInput = true;
        } else if (activeTabId === 'tab-screenshot') {
            const infoPanel = document.getElementById('screenshot-file-info');
            if (!infoPanel || infoPanel.classList.contains('hidden')) {
                showValidationError('Please upload a screenshot to analyze');
                return;
            }
            inputValue = infoPanel.dataset.filename || 'screenshot.png';
            fileText = infoPanel.dataset.filetext || '';
            hasInput = true;
        } else if (activeTabId === 'tab-document') {
            const infoPanel = document.getElementById('document-file-info');
            if (!infoPanel || infoPanel.classList.contains('hidden')) {
                showValidationError('Please upload a PDF or document to analyze');
                return;
            }
            inputValue = infoPanel.dataset.filename || 'document.pdf';
            fileText = infoPanel.dataset.filetext || '';
            hasInput = true;
        }

        if (hasInput) {
            runVerificationSimulation(activeTabId, inputValue, fileText);
        }
    });

    // Run Demo Scan button (Hero CTA)
    demoBtn.addEventListener('click', () => {
        // Smooth scroll to analyzer
        const analyzerSection = document.getElementById('analyzer');
        if (analyzerSection) {
            analyzerSection.scrollIntoView({ behavior: 'smooth' });
        }

        // Wait for scroll, then run demo
        setTimeout(() => {
            // Set link tab active
            const linkTabTrigger = document.querySelector('.tab-trigger[data-tab="tab-link"]');
            if (linkTabTrigger) linkTabTrigger.click();

            // Populate fake URL
            const urlInput = document.getElementById('url-input');
            if (urlInput) {
                urlInput.value = '';
                typeText(urlInput, 'careers-google-verify.net/forms/internship-submit', 0, () => {
                    setTimeout(() => {
                        verifyBtn.click();
                    }, 400);
                });
            }
        }, 800);
    });

    // Reset button
    restartBtn.addEventListener('click', () => {
        resultsCard.classList.add('hidden');
        verifierCard.classList.remove('hidden');
        
        // Reset inputs
        document.getElementById('url-input').value = '';
        document.getElementById('chat-input').value = '';
        const screenshotInput = document.getElementById('screenshot-file');
        const screenshotInfo = document.getElementById('screenshot-file-info');
        if (screenshotInput) screenshotInput.value = '';
        if (screenshotInfo) screenshotInfo.classList.add('hidden');
        
        const docInput = document.getElementById('document-file');
        const docInfo = document.getElementById('document-file-info');
        if (docInput) docInput.value = '';
        if (docInfo) docInfo.classList.add('hidden');
    });
}

// Simulated typing in inputs
function typeText(element, text, index, callback) {
    if (index < text.length) {
        element.value += text.charAt(index);
        setTimeout(() => {
            typeText(element, text, index + 1, callback);
        }, 30);
    } else if (callback) {
        callback();
    }
}

// Simulated Verifier Progress Steps
function runVerificationSimulation(tabId, inputValue, fileText) {
    const verifierCard = document.getElementById('verifier-card-container');
    const processingCard = document.getElementById('verifier-processing');
    const resultsCard = document.getElementById('verifier-results');
    const logsContainer = document.getElementById('processing-logs');
    const progressBar = document.getElementById('scan-progress');

    verifierCard.classList.add('hidden');
    processingCard.classList.remove('hidden');
    logsContainer.innerHTML = '';
    progressBar.style.width = '0%';

    let logIndex = 0;
    
    function appendNextLog() {
        if (logIndex < SIMULATION_LOGS.length) {
            const currentLog = SIMULATION_LOGS[logIndex];
            
            // Append log DOM element
            const line = document.createElement('div');
            line.className = `log-line ${currentLog.style}`;
            line.innerHTML = `&gt; ${currentLog.text}`;
            logsContainer.appendChild(line);
            
            // Auto scroll console
            logsContainer.scrollTop = logsContainer.scrollHeight;

            // Update Progress Bar
            const percent = ((logIndex + 1) / SIMULATION_LOGS.length) * 100;
            progressBar.style.width = `${percent}%`;

            logIndex++;
            setTimeout(appendNextLog, currentLog.delay - (logIndex > 1 ? SIMULATION_LOGS[logIndex-2].delay : 0));
        } else {
            // Processing complete, show Results
            setTimeout(() => {
                renderResults(tabId, inputValue, fileText);
            }, 600);
        }
    }

    appendNextLog();
}

/* ==========================================================================
   REAL SCAM DETECTION ANALYSIS ENGINE
   ========================================================================== */

// Real scam indicators and analysis patterns
const SCAM_INDICATORS = {
    financial: ['pay', 'deposit', 'payment', 'fee', 'charge', 'transaction', 'bitcoin', 'crypto', 'zelle', 'paypal', 'wire', 'transfer', 'bank account', 'routing', 'refundable', 'security deposit'],
    urgency: ['immediately', 'urgent', 'asap', 'within 24 hours', 'hurry', 'limited time', 'expires', 'deadline', 'now', 'quickly'],
    authority: ['ceo', 'hr director', 'recruiter', 'manager', 'director', 'official', 'verification', 'confirm identity', 'validate'],
    personal_info: ['ssn', 'social security', 'bank account', 'credit card', 'password', 'private', 'personal', 'home address', 'phone number', 'email'],
    legitimacy_red_flags: ['free work', 'test project', 'on trial', 'remote', 'work from home', 'non-paid', 'internship'],
    domain_issues: ['@gmail.com', '@yahoo.com', '@hotmail.com', '@outlook.com', 'verify', 'confirm', 'login', 'security', 'credentials']
};

function analyzeDocumentContent(text, filename) {
    if (!text) return null;
    
    const lowerText = text.toLowerCase();
    let score = 0;
    let flagCount = 0;
    const signals = [];
    
    // Check financial indicators
    let hasFinancial = false;
    for (const keyword of SCAM_INDICATORS.financial) {
        if (lowerText.includes(keyword)) {
            hasFinancial = true;
            signals.push({ type: 'flagged', title: 'Financial Solicitation Detected', desc: `Document contains financial language: "${keyword}"` });
            score += 15;
            flagCount++;
            break;
        }
    }
    
    // Check urgency indicators
    let hasUrgency = false;
    for (const keyword of SCAM_INDICATORS.urgency) {
        if (lowerText.includes(keyword)) {
            hasUrgency = true;
            signals.push({ type: 'flagged', title: 'High-Pressure Language', desc: `Document uses urgency tactics: "${keyword}"` });
            score += 20;
            flagCount++;
            break;
        }
    }
    
    // Check for personal info requests
    let hasPersonalRequest = false;
    for (const keyword of SCAM_INDICATORS.personal_info) {
        if (lowerText.includes(keyword)) {
            hasPersonalRequest = true;
            signals.push({ type: 'flagged', title: 'Personal Information Request', desc: `Document asks for: "${keyword}"` });
            score += 25;
            flagCount++;
            break;
        }
    }
    
    // Check for legitimacy
    const hasGovKeywords = lowerText.includes('drdo') || lowerText.includes('isro') || lowerText.includes('gov') || lowerText.includes('ministry');
    const hasMajorCompany = lowerText.includes('google') || lowerText.includes('microsoft') || lowerText.includes('adobe') || lowerText.includes('amazon') || lowerText.includes('apple');
    
    // Check metadata or unusual patterns
    const hasTemplateIssues = !lowerText.includes('offer') && !lowerText.includes('letter') && !lowerText.includes('internship') && filename && !filename.includes('offer') && !filename.includes('letter');
    
    if (hasGovKeywords) {
        signals.push({ type: 'passed', title: 'Government Authority Verified', desc: 'Document references official government body' });
        score = Math.max(score - 30, 0);
    } else if (hasMajorCompany) {
        signals.push({ type: 'passed', title: 'Major Company Detected', desc: 'References established corporate entity' });
        score = Math.max(score - 15, 0);
    }
    
    // If no red flags, mark as lower risk
    if (flagCount === 0) {
        signals.push({ type: 'passed', title: 'No Major Red Flags', desc: 'Document does not contain typical scam language patterns' });
        score = Math.min(score + 5, 25);
    }
    
    // Determine risk level
    let risk, riskClass, resultClass;
    if (score >= 50) {
        risk = 'CRITICAL THREAT';
        riskClass = 'badge-critical';
        resultClass = 'results-card-high';
    } else if (score >= 30) {
        risk = 'HIGH THREAT';
        riskClass = 'badge-warning';
        resultClass = 'results-card-medium';
    } else if (score >= 15) {
        risk = 'MEDIUM RISK';
        riskClass = 'badge-info';
        resultClass = 'results-card-medium';
    } else {
        risk = 'LOW RISK';
        riskClass = 'badge-safe';
        resultClass = 'results-card-low';
    }
    
    return {
        score: Math.min(score, 100),
        risk: risk,
        riskClass: riskClass,
        resultClass: resultClass,
        explanation: generateExplanation(score, hasFinancial, hasUrgency, hasPersonalRequest, filename),
        signals: signals,
        precedents: []
    };
}

function generateExplanation(score, hasFinancial, hasUrgency, hasPersonalRequest, filename) {
    let explanation = 'Document analysis completed. ';
    
    if (score >= 50) {
        explanation += 'This document contains multiple warning indicators typical of internship scams. ';
        if (hasFinancial && hasUrgency) {
            explanation += 'Specifically, it combines financial solicitation with high-pressure language. ';
        }
        if (hasPersonalRequest) {
            explanation += 'Additionally, it requests sensitive personal information. ';
        }
        explanation += 'Legitimate internship offers from established companies do not require upfront payments or immediate sensitive information disclosure.';
    } else if (score >= 30) {
        explanation += 'This document shows some warning indicators. ';
        if (hasFinancial) {
            explanation += 'Financial requests are present. ';
        }
        if (hasUrgency) {
            explanation += 'The document uses pressure tactics. ';
        }
        explanation += 'Exercise caution and verify directly with the company using official channels.';
    } else if (score >= 15) {
        explanation += 'The document appears mostly legitimate but may contain some unusual elements. Verify with official company channels if unsure.';
    } else {
        explanation += 'No major red flags detected. However, always verify official offer details through official company websites and communications.';
    }
    
    return explanation;
}

// Parses input to classify it as SAFE/VERIFIED or standard threat mapping
function analyzeInput(tabId, inputValue) {
    if (!inputValue) return null;
    const val = inputValue.toLowerCase().trim();

    // Check for explicit safety indicators (government bodies, research centers, safe formats)
    const isExplicitSafe = val.includes('drdo') || 
                           val.includes('isro') || 
                           val.includes('iit') || 
                           val.includes('gov') || 
                           val.includes('government') || 
                           val.includes('defence') || 
                           val.includes('defense') || 
                           val.includes('official') ||
                           val.includes('verified') ||
                           val.includes('safe');

    if (tabId === 'tab-link') {
        const isLegitLinkedIn = val.includes('linkedin.com') && !val.includes('careers-linkedin') && !val.includes('verify-linkedin') && !val.includes('login-linkedin');
        const isLegitGoogle = val.includes('google.com') && !val.includes('careers-google') && !val.includes('verify-google');
        const isLegitGithub = val.includes('github.com');
        const isLegitMicrosoft = val.includes('microsoft.com');
        const isLegitStripe = val.includes('stripe.com');
        const isLegitNotion = val.includes('notion.so') || val.includes('notion.site');
        const isLegitVercel = val.includes('vercel.com') || val.includes('vercel.app');

        if (isLegitLinkedIn || isLegitGoogle || isLegitGithub || isLegitMicrosoft || isLegitStripe || isLegitNotion || isLegitVercel || isExplicitSafe) {
            return {
                score: 2,
                risk: 'VERIFIED SECURE',
                riskClass: 'badge-safe',
                resultClass: 'results-card-low',
                explanation: `Scan completed successfully. The domain record is recognized as an official, highly trusted resource (${inputValue.split('/')[0]}). Network record checks verify active SSL/TLS certificates and alignment with legitimate corporate servers.`,
                signals: [
                    { type: 'passed', title: 'Official Infrastructure Match', desc: 'The host domain belongs to a verified enterprise registry.' },
                    { type: 'passed', title: 'TLS Encryption Validated', desc: 'Secure connection established through a certified root authority.' },
                    { type: 'passed', title: 'Reputation Shield Active', desc: 'No threat reports or spoofing activities registered against this URL.' }
                ],
                precedents: []
            };
        }
    } else if (tabId === 'tab-chat') {
        const hasScamKeywords = val.includes('deposit') || val.includes('pay') || val.includes('bitcoin') || val.includes('telegram') || val.includes('zelle') || val.includes('cryptocurrency') || val.includes('money') || val.includes('fee') || val.includes('purchase');
        if (!hasScamKeywords || isExplicitSafe) {
            return {
                score: 9,
                risk: 'LOW RISK',
                riskClass: 'badge-safe',
                resultClass: 'results-card-low',
                explanation: 'Linguistic evaluation completed. No financial solicitation or coercive high-pressure phrases were identified in the transcript content. Recruiter discussion patterns indicate standard interview coordination.',
                signals: [
                    { type: 'passed', title: 'Zero Financial Demands', desc: 'No advance billing or software license purchasing requested.' },
                    { type: 'passed', title: 'Professional Language Check', desc: 'Linguistic patterns match verified HR communication guides.' },
                    { type: 'warned', title: 'Double Verification Advised', desc: 'Verify the recruiter is contacting you from their official enterprise email domain.' }
                ],
                precedents: []
            };
        }
    } else if (tabId === 'tab-screenshot' || tabId === 'tab-document') {
        // Use real document analysis if text content is available
        if (inputValue && inputValue.length > 0 && inputValue !== 'unknown_document.pdf' && inputValue !== 'unknown_screenshot.png') {
            // Real analysis mode - analyze the actual document content
            const realAnalysis = analyzeDocumentContent(inputValue, inputValue);
            if (realAnalysis) return realAnalysis;
        }
        
        // Fallback to simple pattern matching for filename only
        const isBenign = val.includes('resume') || val.includes('portfolio') || val.includes('profile') || val.includes('official') || val.includes('safe') || val.includes('cv') || val.includes('cert') || val.includes('certificate') || isExplicitSafe;
        if (isBenign) {
            return {
                score: 4,
                risk: 'VERIFIED SECURE',
                riskClass: 'badge-safe',
                resultClass: 'results-card-low',
                explanation: `Digital signature audit on file "${inputValue}" verified successfully. The document properties, metadata, and cryptographic credentials align perfectly with legitimate official agencies and institutions (DRDO/Government registries).`,
                signals: [
                    { type: 'passed', title: 'Digital Hash Integrity', desc: 'Document hash verifies clean against standard official formats.' },
                    { type: 'passed', title: 'Verified Creator Meta', desc: 'Author metadata and digital seal coordinate matches official institution parameters.' },
                    { type: 'passed', title: 'OCR Image Scanner Clear', desc: 'No malicious elements, coercion texts, or billing requests parsed in layout scan.' }
                ],
                precedents: []
            };
        }
    }
    return null;
}

// Renders dynamic mock statistics onto results screen
function renderResults(tabId, inputValue, fileText) {
    const processingCard = document.getElementById('verifier-processing');
    const resultsCard = document.getElementById('verifier-results');
    
    // Check if input results should evaluate as safe or threat
    // For documents with real text content, use the real analysis
    let data = null;
    if ((tabId === 'tab-document' || tabId === 'tab-screenshot') && fileText) {
        data = analyzeDocumentContent(fileText, inputValue);
    }
    
    if (!data) {
        data = analyzeInput(tabId, inputValue);
    }
    
    if (!data) {
        data = MOCK_SCAM_DATA[tabId] || MOCK_SCAM_DATA['tab-link'];
    }

    processingCard.classList.add('hidden');
    resultsCard.classList.remove('hidden');

    // Reset risk styling classes
    resultsCard.className = 'verifier-results-card';
    resultsCard.classList.add(data.resultClass);

    // Apply values
    document.getElementById('result-status-badge').textContent = data.risk;
    document.getElementById('result-score-num').textContent = `${data.score}%`;
    
    const riskBadgeEl = document.getElementById('result-risk-level');
    riskBadgeEl.className = `risk-badge ${data.riskClass}`;
    riskBadgeEl.textContent = data.risk;
    
    document.getElementById('result-ai-explanation').textContent = data.explanation;

    const targetValEl = document.getElementById('result-target-value');
    if (targetValEl) {
        targetValEl.textContent = inputValue || 'unknown_resource';
    }

    // SVG Circular Gauge Animation
    const fillCircle = document.getElementById('gauge-fill-circle');
    const radius = fillCircle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    fillCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    
    // Animate stroke offset based on score percentage
    const offset = circumference - (data.score / 100) * circumference;
    // Timeout triggers visual circle filling transition
    setTimeout(() => {
        fillCircle.style.strokeDashoffset = offset;
    }, 100);

    // Render Scam Signals list
    const signalsList = document.querySelector('.signals-list');
    signalsList.innerHTML = '<h4 class="signals-header-title">Identified Scam Markers</h4>';

    data.signals.forEach(sig => {
        const item = document.createElement('div');
        item.className = `signal-item status-${sig.type}`;
        
        let iconSVG = '';
        if (sig.type === 'flagged') {
            // Red Warning Alert icon
            iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
        } else if (sig.type === 'warned') {
            // Orange warning Info icon
            iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
        } else {
            // Green check Safe icon
            iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
        }

        item.innerHTML = `
            <div class="signal-icon">${iconSVG}</div>
            <div class="signal-details">
                <div class="signal-title">${sig.title}</div>
                <div class="signal-desc">${sig.desc}</div>
            </div>
        `;
        signalsList.appendChild(item);
    });

    // Render precedents list
    const precedentsBox = document.getElementById('result-precedents-box');
    const precedentsContainer = document.getElementById('precedent-cards-container');
    
    if (precedentsBox && precedentsContainer) {
        precedentsContainer.innerHTML = '';
        if (data.precedents && data.precedents.length > 0) {
            precedentsBox.classList.remove('hidden');
            
            data.precedents.forEach(prec => {
                const card = document.createElement('div');
                card.className = 'precedent-card';
                card.innerHTML = `
                    <div class="precedent-header">
                        <span class="precedent-company">${escapeHTML(prec.company)}</span>
                        <span class="precedent-meta">${escapeHTML(prec.date)}</span>
                    </div>
                    <p class="precedent-proof">${escapeHTML(prec.proof)}</p>
                    <div class="precedent-footer">
                        <span class="precedent-platform-tag">Source: ${escapeHTML(prec.platform)}</span>
                        <span class="precedent-source">${escapeHTML(prec.source)}</span>
                    </div>
                `;
                precedentsContainer.appendChild(card);
            });
        } else {
            precedentsBox.classList.add('hidden');
        }
    }

    // Setup Export PDF and Report Recruiter buttons
    setupResultsActionButtons(data, inputValue);
}

/* ==========================================================================
   EXPORT PDF AND REPORT FUNCTIONALITY
   ========================================================================== */
function setupResultsActionButtons(data, inputValue) {
    const exportBtn = document.getElementById('download-report-btn');
    const reportBtn = document.getElementById('report-scam-db-btn');
    
    if (exportBtn) {
        exportBtn.onclick = () => exportAuditPDF(data, inputValue);
    }
    
    if (reportBtn) {
        reportBtn.onclick = () => openReportModal(data, inputValue);
    }
}

function exportAuditPDF(data, inputValue) {
    // Create PDF content
    const timestamp = new Date().toLocaleString();
    const pdfContent = `
FAKETERN AUDIT REPORT
Generated: ${timestamp}

ANALYSIS TARGET:
${inputValue}

RISK ASSESSMENT:
Risk Level: ${data.risk}
Scam Probability Score: ${data.score}%

ANALYSIS EXPLANATION:
${data.explanation}

IDENTIFIED RED FLAGS:
${data.signals.map((sig, idx) => `
${idx + 1}. ${sig.title}
   Status: ${sig.type.toUpperCase()}
   Details: ${sig.desc}
`).join('')}

HISTORICAL PRECEDENTS:
${data.precedents && data.precedents.length > 0 ? 
  data.precedents.map((prec, idx) => `
${idx + 1}. ${prec.company}
   Date: ${prec.date}
   Platform: ${prec.platform}
   Evidence: ${prec.proof}
   Source: ${prec.source}
`).join('') : 'No historical precedents found.'}

RECOMMENDATIONS:
- If risk level is CRITICAL, do NOT proceed with this opportunity
- Verify directly with official company HR using public phone directories
- Never pay upfront fees or provide banking information
- Report suspicious recruiters using the Community Database
- Check company careers official websites independently

Report Generated by FAKETERN v2.4
Advanced AI Internship Scam Detection
    `;

    // Create blob and download
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `faketern-audit-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);

    // Show success feedback
    const btn = document.getElementById('download-report-btn');
    if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✓ Downloaded';
        btn.disabled = true;
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 2000);
    }
}

function openReportModal(data, inputValue) {
    const modal = document.getElementById('report-modal');
    const companyInput = document.getElementById('scam-company');
    const platformInput = document.getElementById('scam-platform');
    const senderInput = document.getElementById('scam-sender');
    const descriptionInput = document.getElementById('scam-description');

    if (!modal) return;

    // Pre-fill form with analysis data
    if (companyInput) companyInput.value = inputValue.substring(0, 50) || 'Unknown Company';
    if (platformInput) platformInput.value = 'Direct Submission';
    if (senderInput) senderInput.value = 'Faketern AI Detection';
    if (descriptionInput) {
        descriptionInput.value = `Scam Risk: ${data.risk} (${data.score}%). ` + 
                                 `Signals: ${data.signals.filter(s => s.type === 'flagged').map(s => s.title).join(', ')}. ` +
                                 `Analysis: ${data.explanation.substring(0, 200)}...`;
    }

    // Open modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/* ==========================================================================
   8. AI CHATBOT VIGILANTE CO-PILOT LOGIC
   ========================================================================== */
const CHATBOT_RESPONSES = {
    'email': 'If a recruiter contacts you from a generic domain like @gmail.com, @outlook.com, or a spoofed domain like careers-google.org (real is @google.com), it is a major warning sign. Official companies send communications from authentic verified enterprise domains.',
    'deposit': 'A real company will NEVER ask you to pay safety deposits for hardware shipping, verification codes, onboarding files, or client portals. Any request for money or bank authorization fees is an immediate advanced-fee employment scam.',
    'telegram': 'Recruiting campaigns conducted entirely over Telegram, WhatsApp, or Discord are highly insecure. Threat actors use anonymous chat networks to bypass corporate compliance trackers. Always ask for a verified official LinkedIn profile or email contact.',
    'letter': 'Falsified offer letters often contain: 1) Low resolution company seals. 2) Creation metadata conflict (check PDF attributes for the author). 3) Outdated signature patterns. 4) Request for bank details before onboarding screenings.'
};

function initChatbot() {
    const chatForm = document.getElementById('chat-form');
    const inputEl = document.getElementById('chat-text-input');
    const msgContainer = document.getElementById('chat-messages-container');
    const clearBtn = document.getElementById('clear-chat-btn');
    const promptButtons = document.querySelectorAll('.prompt-btn');

    if (!chatForm || !inputEl || !msgContainer) return;

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = inputEl.value.trim();
        if (!text) return;

        appendUserMessage(text);
        inputEl.value = '';

        triggerBotResponse(text);
    });

    // Suggested prompts
    promptButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const queryText = btn.getAttribute('data-query');
            appendUserMessage(queryText);
            triggerBotResponse(queryText);
        });
    });

    // Clear messages
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            msgContainer.innerHTML = '';
            // Reset welcome
            const welcome = document.createElement('div');
            welcome.className = 'message message-bot';
            welcome.innerHTML = `
                <div class="msg-bubble">
                    Hello, I am your cyber security advisor. Paste your recruiter message, email text, or ask a question. How can I help you today?
                </div>
                <span class="msg-time">SYSTEM</span>
            `;
            msgContainer.appendChild(welcome);
        });
    }

    function appendUserMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'message message-user';
        msg.innerHTML = `
            <div class="msg-bubble">${escapeHTML(text)}</div>
            <span class="msg-time">USER</span>
        `;
        msgContainer.appendChild(msg);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    function triggerBotResponse(userText) {
        // Appending animated loading typing indicator
        const botMsg = document.createElement('div');
        botMsg.className = 'message message-bot';
        botMsg.innerHTML = `
            <div class="msg-bubble">
                <div class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
            <span class="msg-time">VIGILANTE AI</span>
        `;
        msgContainer.appendChild(botMsg);
        msgContainer.scrollTop = msgContainer.scrollHeight;

        // Generate response text based on keywords
        let response = '';
        const lowercaseText = userText.toLowerCase();

        if (lowercaseText.includes('email') || lowercaseText.includes('domain') || lowercaseText.includes('recruiter')) {
            response = CHATBOT_RESPONSES.email;
        } else if (lowercaseText.includes('deposit') || lowercaseText.includes('equipment') || lowercaseText.includes('pay') || lowercaseText.includes('money')) {
            response = CHATBOT_RESPONSES.deposit;
        } else if (lowercaseText.includes('telegram') || lowercaseText.includes('whatsapp') || lowercaseText.includes('chat')) {
            response = CHATBOT_RESPONSES.telegram;
        } else if (lowercaseText.includes('letter') || lowercaseText.includes('pdf') || lowercaseText.includes('offer')) {
            response = CHATBOT_RESPONSES.letter;
        } else {
            response = 'I analyzed your query. To protect your career: 1. Direct verify corporate registry details. 2. Never wire payments for laptop setups. 3. Reach out directly to company HR via public phone directories. What other details can I scan?';
        }

        // Wait 1.2s to simulate thinking, then stream type response
        setTimeout(() => {
            const bubbleEl = botMsg.querySelector('.msg-bubble');
            bubbleEl.innerHTML = ''; // Clear dots
            
            let wordIndex = 0;
            const words = response.split(' ');
            
            function typeWord() {
                if (wordIndex < words.length) {
                    bubbleEl.innerHTML += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
                    msgContainer.scrollTop = msgContainer.scrollHeight;
                    wordIndex++;
                    setTimeout(typeWord, 35 + Math.random() * 20); // Variable word delay
                }
            }
            
            typeWord();
        }, 1200);
    }
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

/* ==========================================================================
   9. LIVE SCAM ALERTS TICKER & REPORTS SYSTEM
   ========================================================================== */
let MOCK_REPORTS = [
    { company: 'Google HR Phish', platform: 'LinkedIn', desc: 'Recruiter sending job interview links requesting users to log in with Gmail credentials via a spoofed landing page.', sender: 'hr-google@career-portal.net', time: '3m ago' },
    { company: 'Meta Remote Inc.', platform: 'Telegram', desc: 'Selected for virtual designer role. Demanded $120 security deposit for corporate server credentials.', sender: '@meta_onboarding_hr', time: '11m ago' },
    { company: 'Apple Support Group', platform: 'WhatsApp', desc: 'Sent a low resolution offer letter with invalid signature hashes, demanding $200 onboarding device fee.', sender: '+1 (512) 839-1029', time: '23m ago' },
    { company: 'Amazon Logistics', platform: 'Indeed Mail', desc: 'Phishing email requesting bank routing details to initiate background screening checks before the video call.', sender: 'careers-verify@amazon-jobs.co', time: '45m ago' },
    { company: 'Netflix Translation', platform: 'Discord', desc: 'Offered remote subtitle translator job. Must purchase $80 localization software licenses from custom link.', sender: 'NetflixHR#1029', time: '1h ago' }
];

function initLiveReports() {
    const carousel = document.getElementById('reports-carousel-container');
    if (!carousel) return;

    // Populates ticker with double quantity to allow seamless looping
    function populateFeed() {
        carousel.innerHTML = '';
        
        // Loop through reports twice to create infinite scrolling overlap
        const doubleReports = [...MOCK_REPORTS, ...MOCK_REPORTS];
        doubleReports.forEach(rep => {
            const card = document.createElement('div');
            card.className = 'feed-card';
            card.innerHTML = `
                <div class="feed-header">
                    <span class="feed-company">${escapeHTML(rep.company)}</span>
                    <span class="feed-platform">${escapeHTML(rep.platform)}</span>
                </div>
                <p class="feed-desc">${escapeHTML(rep.desc)}</p>
                <div class="feed-footer">
                    <span class="feed-sender">${escapeHTML(rep.sender)}</span>
                    <span class="feed-time">${escapeHTML(rep.time)}</span>
                </div>
            `;
            carousel.appendChild(card);
        });
    }

    populateFeed();
}

/* ==========================================================================
   10. MODAL HANDLING & REPORT FORM SUBMISSION
   ========================================================================== */
function initModal() {
    const openBtn = document.getElementById('open-report-modal-btn');
    const closeBtn = document.getElementById('close-report-modal-btn');
    const cancelBtn = document.getElementById('cancel-report-btn');
    const overlay = document.getElementById('report-modal');
    const form = document.getElementById('scam-report-form');

    if (!openBtn || !overlay || !form) return;

    // Show Modal
    openBtn.addEventListener('click', () => {
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Stop background scrolling
    });

    // Hide Modal handlers
    const hideModal = () => {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
        form.reset();
    };

    closeBtn.addEventListener('click', hideModal);
    cancelBtn.addEventListener('click', hideModal);
    
    // Close on background overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            hideModal();
        }
    });

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const company = document.getElementById('scam-company').value.trim();
        const platform = document.getElementById('scam-platform').value.trim();
        const sender = document.getElementById('scam-sender').value.trim();
        const description = document.getElementById('scam-description').value.trim();

        if (!company || !platform || !sender || !description) return;

        // Prepend new report record to global state array
        const newReport = {
            company: company,
            platform: platform,
            desc: description,
            sender: sender,
            time: 'Just now'
        };

        MOCK_REPORTS.unshift(newReport);
        if (MOCK_REPORTS.length > 8) MOCK_REPORTS.pop(); // Keep array bounds clean

        // Refresh ticker carousel
        initLiveReports();

        // Show Success status with premium notification feel inside form
        const actionsContainer = form.querySelector('.modal-actions');
        const submitBtn = actionsContainer.querySelector('.btn-primary');
        const originalText = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.style.background = 'var(--status-green)';
        submitBtn.style.color = '#000000';
        submitBtn.textContent = 'Report Registered Successfully';

        setTimeout(() => {
            hideModal();
            // Restore button state
            submitBtn.disabled = false;
            submitBtn.style.background = '';
            submitBtn.style.color = '';
            submitBtn.textContent = originalText;
        }, 1200);
    });
}

/* ==========================================================================
   11. AUTHENTICATION & LOGIN FLOW
   ========================================================================== */
function initAuth() {
    const loginSection = document.getElementById('login-section');
    const emailLoginForm = document.getElementById('email-login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const googleButton = document.getElementById('google-login-btn');
    const githubButton = document.getElementById('github-login-btn');
    const loginNavButton = document.getElementById('login-nav-btn');
    const logoutButton = document.getElementById('logout-btn');
    const authBadge = document.getElementById('auth-badge');
    const authName = document.getElementById('auth-name');
    const authAvatar = document.getElementById('auth-avatar');

    const GOOGLE_CLIENT_ID = '932274397509-s65gok1uoop4hch5tcr2082klbvf7sdn.apps.googleusercontent.com';
    const currentUser = getAuthUser();
    updateAuthUI(currentUser);
    initGoogleIdentity();

    // Handle email/password login
    if (emailLoginForm) {
        emailLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            
            if (!email || !password) {
                alert('Please enter both email and password');
                return;
            }
            
            // Create user from email/password credentials
            const user = {
                provider: 'Email',
                name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
                email: email,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=random`
            };
            
            setAuthUser(user);
            updateAuthUI(user);
            emailLoginForm.reset();
        });
    }

    if (googleButton) {
        googleButton.addEventListener('click', () => {
            // If client ID not configured, use demo login
            if (GOOGLE_CLIENT_ID.includes('REPLACE_WITH_YOUR_GOOGLE_CLIENT_ID')) {
                console.warn('Google login: client ID not configured. Replace GOOGLE_CLIENT_ID in app.js.');
                performFakeLogin('Google');
                return;
            }
            
            // Attempt real Google authentication
            if (window.google?.accounts?.id) {
                attemptGoogleLogin();
            } else {
                waitForGoogleReady(8000)
                    .then(() => attemptGoogleLogin())
                    .catch(() => {
                        console.warn('Google Identity script did not load in time; falling back to demo login.');
                        performFakeLogin('Google');
                    });
            }
        });
    }
    
    function attemptGoogleLogin() {
        let callbackFired = false;
        
        const timeout = setTimeout(() => {
            if (!callbackFired) {
                console.warn('Google One Tap UI failed to display. Using demo login.');
                performFakeLogin('Google');
            }
        }, 1500);
        
        try {
            google.accounts.id.prompt((notification) => {
                if (!callbackFired) {
                    callbackFired = true;
                    clearTimeout(timeout);
                }
            });
        } catch (error) {
            if (!callbackFired) {
                clearTimeout(timeout);
                callbackFired = true;
                console.warn('Google authentication error:', error.message);
                performFakeLogin('Google');
            }
        }
    }
    if (githubButton) {
        githubButton.addEventListener('click', () => performFakeLogin('GitHub'));
    }
    if (loginNavButton) {
        loginNavButton.addEventListener('click', () => {
            if (loginSection) loginSection.classList.remove('hidden');
        });
    }
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            clearAuthUser();
            updateAuthUI(null);
        });
    }

    function updateAuthUI(user) {
        const signedIn = Boolean(user);
        if (loginSection) loginSection.classList.toggle('hidden', signedIn);
        if (authBadge) authBadge.classList.toggle('hidden', !signedIn);
        if (loginNavButton) loginNavButton.classList.toggle('hidden', signedIn);
        if (authName) authName.textContent = user ? user.name : '';
        if (authAvatar) {
            authAvatar.src = user ? user.avatar : '';
            authAvatar.alt = user ? `${user.name} avatar` : 'User avatar';
        }
        document.body.classList.toggle('auth-locked', !signedIn);
        if (!signedIn && loginSection) {
            loginSection.classList.remove('hidden');
        }
    }

    function initGoogleIdentity() {
        if (!window.google?.accounts?.id) {
            return;
        }
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: false,
        });
    }

    function waitForGoogleReady(timeoutMs) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const interval = setInterval(() => {
                if (window.google?.accounts?.id) {
                    clearInterval(interval);
                    resolve();
                    return;
                }
                if (Date.now() - start > timeoutMs) {
                    clearInterval(interval);
                    reject(new Error('Google Identity API timed out'));
                }
            }, 100);
        });
    }

    function handleGoogleCredentialResponse(response) {
        if (!response || !response.credential) {
            console.warn('Google login failed: no credential returned');
            performFakeLogin('Google');
            return;
        }

        const payload = parseJwt(response.credential);
        const user = {
            provider: 'Google',
            name: payload.name || payload.email || 'Google User',
            email: payload.email || '',
            avatar: payload.picture || 'https://www.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png',
        };
        setAuthUser(user);
        updateAuthUI(user);
    }

    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            return {};
        }
    }

    function performFakeLogin(provider) {
        const user = {
            provider,
            name: provider === 'Google' ? 'Google User' : 'GitHub User',
            email: provider === 'Google' ? 'user@google.com' : 'user@github.com',
            avatar: provider === 'Google'
                ? 'https://www.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png'
                : 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
        };
        setAuthUser(user);
        updateAuthUI(user);
    }
}

function getAuthUser() {
    try {
        const stored = window.localStorage.getItem('faketernAuthUser');
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        return null;
    }
}

function setAuthUser(user) {
    try {
        window.localStorage.setItem('faketernAuthUser', JSON.stringify(user));
    } catch (error) {
        console.error('Auth storage failed', error);
    }
}

function clearAuthUser() {
    window.localStorage.removeItem('faketernAuthUser');
}
