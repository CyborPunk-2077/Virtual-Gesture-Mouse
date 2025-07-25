// Cybor's Virtual Mouse - Main Application Logic
class CyborVirtualMouse {
    constructor() {
        this.isSystemActive = false;
        this.isDemoMode = false;
        this.currentGesture = 'Neutral Gesture';
        this.gestureConfidence = 98.5;
        this.isVoiceActive = false;
        this.currentCommand = '';
        this.performanceMetrics = {
            fps: 30.2,
            latency: 12,
            memory: 4.2,
            cpu: 15
        };
        this.settings = this.loadSettings();
        this.gestureHistory = [];
        this.commandHistory = [];
        
        // Gesture and Voice data from the provided JSON
        this.gestureData = [
            {
                name: "Neutral Gesture",
                description: "Default hand position for system recognition",
                action: "No action, cursor ready state",
                fingers: []
            },
            {
                name: "Move Cursor",
                description: "Index finger pointing to control cursor movement",
                action: "Real-time cursor positioning",
                fingers: ['index']
            },
            {
                name: "Left Click",
                description: "Index and middle finger together",
                action: "Perform left mouse click",
                fingers: ['index', 'middle']
            },
            {
                name: "Right Click",
                description: "Index finger and thumb together",
                action: "Perform right mouse click",
                fingers: ['index', 'thumb']
            },
            {
                name: "Double Click",
                description: "Quick double tap gesture",
                action: "Execute double-click action",
                fingers: ['index', 'middle']
            },
            {
                name: "Scrolling",
                description: "Two-finger vertical movement",
                action: "Scroll up/down on pages",
                fingers: ['index', 'middle']
            },
            {
                name: "Drag and Drop",
                description: "Closed fist gesture with movement",
                action: "Select and move objects",
                fingers: ['thumb', 'index', 'middle', 'ring', 'pinky']
            },
            {
                name: "Multiple Selection",
                description: "Spread fingers gesture",
                action: "Select multiple items",
                fingers: ['thumb', 'index', 'middle', 'ring', 'pinky']
            },
            {
                name: "Volume Control",
                description: "Pinch gesture with horizontal movement",
                action: "Adjust system volume",
                fingers: ['thumb', 'index']
            },
            {
                name: "Brightness Control",
                description: "Pinch gesture with vertical movement",
                action: "Adjust screen brightness",
                fingers: ['thumb', 'index']
            }
        ];
        
        this.voiceCommands = {
            system: [
                { command: "Cybor launch gesture recognition", action: "Start gesture recognition system" },
                { command: "Cybor stop gesture recognition", action: "Stop gesture recognition system" },
                { command: "Cybor sleep", action: "Put voice assistant to sleep" },
                { command: "Cybor wake up", action: "Wake up voice assistant" },
                { command: "Cybor exit", action: "Exit the application" }
            ],
            navigation: [
                { command: "Cybor search [query]", action: "Perform Google search" },
                { command: "Cybor find location [place]", action: "Open location in Google Maps" },
                { command: "Cybor list files", action: "Show current directory files" },
                { command: "Cybor open [filename]", action: "Open specified file" },
                { command: "Cybor go back", action: "Navigate to previous directory" }
            ],
            utilities: [
                { command: "Cybor what time is it", action: "Display current date and time" },
                { command: "Cybor copy", action: "Copy selected content" },
                { command: "Cybor paste", action: "Paste copied content" }
            ]
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateGestureList();
        this.populateVoiceCommands();
        this.startPerformanceMonitoring();
        this.updateStatusIndicators();
        this.initializeAnimations();
        this.loadUserSettings();
    }

    setupEventListeners() {
        // Tab navigation - Fixed to properly handle tab switching
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = e.target.getAttribute('data-tab');
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });

        // Dashboard controls
        const startBtn = document.getElementById('start-system');
        const demoBtn = document.getElementById('demo-mode');
        
        if (startBtn) startBtn.addEventListener('click', () => this.toggleSystem());
        if (demoBtn) demoBtn.addEventListener('click', () => this.toggleDemoMode());

        // Gesture controls
        const simulateBtn = document.getElementById('simulate-gesture');
        const calibrateBtn = document.getElementById('calibrate-gestures');
        
        if (simulateBtn) simulateBtn.addEventListener('click', () => this.simulateRandomGesture());
        if (calibrateBtn) calibrateBtn.addEventListener('click', () => this.calibrateGestures());

        // Voice controls
        const activateVoiceBtn = document.getElementById('activate-voice');
        const testCommandBtn = document.getElementById('test-command');
        
        if (activateVoiceBtn) activateVoiceBtn.addEventListener('click', () => this.toggleVoiceActivation());
        if (testCommandBtn) testCommandBtn.addEventListener('click', () => this.testVoiceCommand());

        // Settings
        this.setupSettingsListeners();

        // Gesture item clicks for demonstration
        document.addEventListener('click', (e) => {
            if (e.target.closest('.gesture-item')) {
                const gestureItem = e.target.closest('.gesture-item');
                const gestureName = gestureItem.querySelector('.gesture-name').textContent;
                this.simulateSpecificGesture(gestureName);
            }
        });

        // Voice command clicks for demonstration
        document.addEventListener('click', (e) => {
            if (e.target.closest('.command-item')) {
                const commandItem = e.target.closest('.command-item');
                const commandText = commandItem.querySelector('.command-text').textContent;
                this.simulateVoiceCommand(commandText);
            }
        });
    }

    setupSettingsListeners() {
        // Gesture settings
        const gestureSettings = ['gesture-sensitivity', 'recognition-threshold', 'detection-range'];
        gestureSettings.forEach(id => {
            const range = document.getElementById(id);
            const valueSpan = document.getElementById(id + '-value');
            if (range && valueSpan) {
                range.addEventListener('input', () => {
                    let value = range.value;
                    if (id === 'detection-range') {
                        value = (value / 10).toFixed(1) + 'm';
                    } else {
                        value += '%';
                    }
                    valueSpan.textContent = value;
                    this.settings[id.replace('-', '_')] = parseInt(range.value);
                    this.saveSettings();
                });
            }
        });

        // Voice settings
        const voiceSettings = ['voice-sensitivity', 'command-timeout'];
        voiceSettings.forEach(id => {
            const range = document.getElementById(id);
            const valueSpan = document.getElementById(id + '-value');
            if (range && valueSpan) {
                range.addEventListener('input', () => {
                    let value = range.value;
                    if (id === 'command-timeout') {
                        value += 's';
                    } else {
                        value += '%';
                    }
                    valueSpan.textContent = value;
                    this.settings[id.replace('-', '_')] = parseInt(range.value);
                    this.saveSettings();
                });
            }
        });

        // Performance settings
        const perfSettings = ['thread-count', 'frame-rate'];
        perfSettings.forEach(id => {
            const range = document.getElementById(id);
            const valueSpan = document.getElementById(id + '-value');
            if (range && valueSpan) {
                range.addEventListener('input', () => {
                    let value = range.value;
                    if (id === 'frame-rate') {
                        value += ' FPS';
                    }
                    valueSpan.textContent = value;
                    this.settings[id.replace('-', '_')] = parseInt(range.value);
                    this.saveSettings();
                    this.updatePerformanceMetrics();
                });
            }
        });

        // Checkbox settings
        const checkboxes = ['multi-hand-mode', 'continuous-listening', 'voice-feedback', 'gpu-acceleration', 'debug-mode'];
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.settings[id.replace('-', '_')] = e.target.checked;
                    this.saveSettings();
                });
            }
        });
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Show content - Fixed to use correct ID mapping
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        let tabContentId;
        switch(tabName) {
            case 'dashboard':
                tabContentId = 'dashboard-tab';
                break;
            case 'gestures':
                tabContentId = 'gestures-tab';
                break;
            case 'voice':
                tabContentId = 'voice-tab';
                break;
            case 'settings':
                tabContentId = 'settings-tab';
                break;
            case 'documentation':
                tabContentId = 'documentation-tab';
                break;
            default:
                tabContentId = 'dashboard-tab';
        }
        
        const tabContent = document.getElementById(tabContentId);
        if (tabContent) {
            tabContent.classList.add('active');
        }

        // Update status
        this.updateStatusText(`Switched to ${tabName.charAt(0).toUpperCase() + tabName.slice(1)} tab`);
    }

    toggleSystem() {
        this.isSystemActive = !this.isSystemActive;
        const btn = document.getElementById('start-system');
        const statusElement = document.getElementById('system-status');
        
        if (this.isSystemActive) {
            btn.textContent = 'Stop Cybor System';
            btn.classList.remove('btn--primary');
            btn.classList.add('btn--secondary');
            statusElement.textContent = 'Active';
            statusElement.classList.add('pulse');
            this.updateStatusText('Cybor Virtual Mouse system activated');
            this.startSystemAnimations();
        } else {
            btn.textContent = 'Start Cybor System';
            btn.classList.remove('btn--secondary');
            btn.classList.add('btn--primary');
            statusElement.textContent = 'Standby';
            statusElement.classList.remove('pulse');
            this.updateStatusText('Cybor Virtual Mouse system deactivated');
            this.stopSystemAnimations();
        }
        
        this.updateStatusIndicators();
    }

    toggleDemoMode() {
        this.isDemoMode = !this.isDemoMode;
        const btn = document.getElementById('demo-mode');
        
        if (this.isDemoMode) {
            btn.textContent = 'Stop Demo';
            btn.classList.remove('btn--secondary');
            btn.classList.add('btn--primary');
            this.startDemoSequence();
            this.updateStatusText('Demo mode activated - showcasing gestures and voice commands');
        } else {
            btn.textContent = 'Demo Mode';
            btn.classList.remove('btn--primary');
            btn.classList.add('btn--secondary');
            this.stopDemoSequence();
            this.updateStatusText('Demo mode deactivated');
        }
    }

    startDemoSequence() {
        let gestureIndex = 0;
        this.demoInterval = setInterval(() => {
            if (gestureIndex < this.gestureData.length) {
                this.simulateSpecificGesture(this.gestureData[gestureIndex].name);
                gestureIndex++;
            } else {
                gestureIndex = 0;
            }
        }, 3000);
    }

    stopDemoSequence() {
        if (this.demoInterval) {
            clearInterval(this.demoInterval);
            this.demoInterval = null;
        }
        this.resetGestureVisualization();
    }

    populateGestureList() {
        const gestureItems = document.getElementById('gesture-items');
        if (!gestureItems) return;
        
        gestureItems.innerHTML = '';
        
        this.gestureData.forEach(gesture => {
            const item = document.createElement('div');
            item.className = 'gesture-item';
            item.innerHTML = `
                <div class="gesture-name">${gesture.name}</div>
                <div class="gesture-description">${gesture.description}</div>
                <div class="gesture-action">Action: ${gesture.action}</div>
            `;
            gestureItems.appendChild(item);
        });
    }

    populateVoiceCommands() {
        Object.keys(this.voiceCommands).forEach(category => {
            const container = document.getElementById(`${category}-commands`);
            if (container) {
                container.innerHTML = '';
                
                this.voiceCommands[category].forEach(cmd => {
                    const item = document.createElement('div');
                    item.className = 'command-item';
                    item.innerHTML = `
                        <div class="command-text">${cmd.command}</div>
                        <div class="command-description">${cmd.action}</div>
                    `;
                    container.appendChild(item);
                });
            }
        });
    }

    simulateRandomGesture() {
        const randomGesture = this.gestureData[Math.floor(Math.random() * this.gestureData.length)];
        this.simulateSpecificGesture(randomGesture.name);
    }

    simulateSpecificGesture(gestureName) {
        const gesture = this.gestureData.find(g => g.name === gestureName);
        if (!gesture) return;

        this.currentGesture = gestureName;
        this.gestureConfidence = Math.random() * 10 + 90; // 90-100%
        
        // Update display elements
        const currentGestureEl = document.getElementById('current-gesture');
        const gestureConfidenceEl = document.getElementById('gesture-confidence');
        
        if (currentGestureEl) currentGestureEl.textContent = gestureName;
        if (gestureConfidenceEl) gestureConfidenceEl.textContent = `Confidence: ${this.gestureConfidence.toFixed(1)}%`;
        
        // Update hand visualization
        this.updateHandVisualization(gesture.fingers);
        
        // Update active gesture in list
        document.querySelectorAll('.gesture-item').forEach(item => {
            item.classList.remove('active');
            const nameElement = item.querySelector('.gesture-name');
            if (nameElement && nameElement.textContent === gestureName) {
                item.classList.add('active');
            }
        });
        
        // Add to history
        this.addGestureLogEntry(`Detected: ${gestureName} (${this.gestureConfidence.toFixed(1)}% confidence)`, 'success');
        
        // Simulate action feedback
        setTimeout(() => {
            this.addGestureLogEntry(`Executed: ${gesture.action}`, 'command');
        }, 500);
    }

    updateHandVisualization(activeFingers) {
        // Reset all fingers
        document.querySelectorAll('.finger').forEach(finger => {
            finger.classList.remove('active');
        });
        
        // Activate specified fingers
        activeFingers.forEach(fingerName => {
            const finger = document.querySelector(`[data-finger="${fingerName}"]`);
            if (finger) {
                finger.classList.add('active');
            }
        });
    }

    resetGestureVisualization() {
        this.currentGesture = 'Neutral Gesture';
        this.gestureConfidence = 98.5;
        
        const currentGestureEl = document.getElementById('current-gesture');
        const gestureConfidenceEl = document.getElementById('gesture-confidence');
        
        if (currentGestureEl) currentGestureEl.textContent = this.currentGesture;
        if (gestureConfidenceEl) gestureConfidenceEl.textContent = `Confidence: ${this.gestureConfidence}%`;
        
        this.updateHandVisualization([]);
        document.querySelectorAll('.gesture-item').forEach(item => item.classList.remove('active'));
    }

    calibrateGestures() {
        this.updateStatusText('Calibrating gesture recognition system...');
        this.addGestureLogEntry('Starting gesture calibration...', 'command');
        
        let progress = 0;
        const calibrationInterval = setInterval(() => {
            progress += Math.random() * 20 + 10;
            this.addGestureLogEntry(`Calibration progress: ${Math.min(progress, 100).toFixed(0)}%`, 'success');
            
            if (progress >= 100) {
                clearInterval(calibrationInterval);
                this.addGestureLogEntry('Gesture calibration completed successfully!', 'success');
                this.updateStatusText('Gesture calibration completed');
            }
        }, 800);
    }

    toggleVoiceActivation() {
        this.isVoiceActive = !this.isVoiceActive;
        const btn = document.getElementById('activate-voice');
        const voiceState = document.getElementById('voice-state');
        const voiceCommand = document.getElementById('voice-command');
        const voiceWaves = document.getElementById('voice-waves');
        
        if (this.isVoiceActive) {
            if (btn) {
                btn.textContent = 'Deactivate Cybor';
                btn.classList.remove('btn--primary');
                btn.classList.add('btn--secondary');
            }
            if (voiceState) voiceState.textContent = 'Listening...';
            if (voiceCommand) voiceCommand.textContent = 'Cybor is ready for commands';
            if (voiceWaves) voiceWaves.style.display = 'block';
            
            this.updateStatusText('Cybor AI voice assistant activated');
            this.addCommandLogEntry('Cybor AI activated and listening', 'success');
        } else {
            if (btn) {
                btn.textContent = 'Activate Cybor';
                btn.classList.remove('btn--secondary');
                btn.classList.add('btn--primary');
            }
            if (voiceState) voiceState.textContent = 'Standby';
            if (voiceCommand) voiceCommand.textContent = 'Say "Cybor" to activate';
            if (voiceWaves) voiceWaves.style.display = 'none';
            
            this.updateStatusText('Cybor AI voice assistant deactivated');
            this.addCommandLogEntry('Cybor AI deactivated', 'command');
        }
        
        this.updateStatusIndicators();
    }

    testVoiceCommand() {
        const commands = [];
        Object.values(this.voiceCommands).forEach(category => {
            commands.push(...category);
        });
        const randomCommand = commands[Math.floor(Math.random() * commands.length)];
        this.simulateVoiceCommand(randomCommand.command);
    }

    simulateVoiceCommand(commandText) {
        if (!this.isVoiceActive) {
            this.toggleVoiceActivation();
        }
        
        const voiceCommandEl = document.getElementById('voice-command');
        if (voiceCommandEl) voiceCommandEl.textContent = `"${commandText}"`;
        
        this.addCommandLogEntry(`Voice input: "${commandText}"`, 'command');
        
        // Find the command
        let commandFound = null;
        Object.values(this.voiceCommands).forEach(category => {
            const found = category.find(cmd => cmd.command === commandText);
            if (found) commandFound = found;
        });
        
        setTimeout(() => {
            if (commandFound) {
                this.addCommandLogEntry(`Executing: ${commandFound.action}`, 'success');
                this.updateStatusText(`Executed command: ${commandText}`);
                
                // Simulate command-specific actions
                if (commandText.includes('launch gesture recognition')) {
                    if (!this.isSystemActive) {
                        this.toggleSystem();
                    }
                } else if (commandText.includes('stop gesture recognition')) {
                    if (this.isSystemActive) {
                        this.toggleSystem();
                    }
                } else if (commandText.includes('sleep')) {
                    this.toggleVoiceActivation();
                } else if (commandText.includes('what time is it')) {
                    const now = new Date();
                    const timeString = now.toLocaleTimeString();
                    this.addCommandLogEntry(`Current time: ${timeString}`, 'success');
                }
            } else {
                this.addCommandLogEntry('Command not recognized', 'error');
            }
            
            if (voiceCommandEl) voiceCommandEl.textContent = 'Cybor is ready for commands';
        }, 1500);
    }

    addGestureLogEntry(message, type = '') {
        const log = document.getElementById('gesture-log');
        if (!log) return;
        
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
        
        // Keep only last 50 entries
        while (log.children.length > 50) {
            log.removeChild(log.firstChild);
        }
    }

    addCommandLogEntry(message, type = '') {
        const log = document.getElementById('command-log');
        if (!log) return;
        
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
        
        // Keep only last 50 entries
        while (log.children.length > 50) {
            log.removeChild(log.firstChild);
        }
    }

    startPerformanceMonitoring() {
        this.performanceInterval = setInterval(() => {
            // Simulate realistic performance fluctuations
            this.performanceMetrics.fps = 28 + Math.random() * 4;
            this.performanceMetrics.latency = 10 + Math.random() * 8;
            this.performanceMetrics.cpu = 12 + Math.random() * 10;
            this.performanceMetrics.memory = 4.0 + Math.random() * 0.8;
            
            this.updatePerformanceDisplay();
        }, 2000);
    }

    updatePerformanceDisplay() {
        const fpsIndicator = document.getElementById('fps-indicator');
        const latencyIndicator = document.getElementById('latency-indicator');
        
        if (fpsIndicator) fpsIndicator.textContent = `${this.performanceMetrics.fps.toFixed(1)} FPS`;
        if (latencyIndicator) latencyIndicator.textContent = `${Math.round(this.performanceMetrics.latency)}ms`;
        
        // Update dashboard metrics
        const metricElements = document.querySelectorAll('.metric-value');
        if (metricElements.length >= 4) {
            metricElements[0].textContent = this.performanceMetrics.fps.toFixed(1);
            metricElements[1].textContent = Math.round(this.performanceMetrics.latency) + 'ms';
            metricElements[2].textContent = this.performanceMetrics.memory.toFixed(1) + 'GB';
            metricElements[3].textContent = Math.round(this.performanceMetrics.cpu) + '%';
        }
    }

    updatePerformanceMetrics() {
        // Adjust metrics based on settings
        const frameRate = this.settings.frame_rate || 30;
        this.performanceMetrics.fps = frameRate * (0.9 + Math.random() * 0.2);
        
        const threadCount = this.settings.thread_count || 4;
        this.performanceMetrics.cpu = Math.max(5, 20 - (threadCount * 2) + Math.random() * 10);
    }

    updateStatusIndicators() {
        const indicators = {
            'camera-status': this.isSystemActive,
            'microphone-status': this.isVoiceActive,
            'gesture-status': this.isSystemActive,
            'voice-status': this.isVoiceActive
        };
        
        Object.entries(indicators).forEach(([id, active]) => {
            const indicator = document.getElementById(id);
            if (indicator) {
                if (active) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            }
        });
        
        // Update connection indicator
        const connectionIndicator = document.getElementById('connection-indicator');
        if (connectionIndicator) {
            connectionIndicator.classList.add('active');
        }
    }

    updateStatusText(message) {
        const statusText = document.getElementById('status-text');
        if (statusText) {
            statusText.textContent = `Cybor Virtual Mouse v2.1.0 - ${message}`;
        }
    }

    startSystemAnimations() {
        // Add pulsing effect to active elements
        document.querySelectorAll('.status-indicator.active').forEach(indicator => {
            indicator.classList.add('pulse');
        });
    }

    stopSystemAnimations() {
        // Remove pulsing effects
        document.querySelectorAll('.status-indicator').forEach(indicator => {
            indicator.classList.remove('pulse');
        });
    }

    initializeAnimations() {
        // Initialize any startup animations
        setTimeout(() => {
            this.updateStatusText('Ready');
        }, 1000);
    }

    loadUserSettings() {
        // Apply loaded settings to UI
        Object.entries(this.settings).forEach(([key, value]) => {
            const element = document.getElementById(key.replace('_', '-'));
            if (element) {
                if (element.type === 'range') {
                    element.value = value;
                    const event = new Event('input');
                    element.dispatchEvent(event);
                } else if (element.type === 'checkbox') {
                    element.checked = value;
                }
            }
        });
    }

    loadSettings() {
        const defaultSettings = {
            gesture_sensitivity: 75,
            recognition_threshold: 85,
            detection_range: 12,
            voice_sensitivity: 80,
            command_timeout: 3,
            thread_count: 4,
            frame_rate: 30,
            multi_hand_mode: true,
            continuous_listening: true,
            voice_feedback: true,
            gpu_acceleration: true,
            debug_mode: false
        };
        
        try {
            const saved = localStorage.getItem('cybor-virtual-mouse-settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch {
            return defaultSettings;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('cybor-virtual-mouse-settings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Could not save settings:', e);
        }
    }

    // Cleanup method
    destroy() {
        if (this.performanceInterval) {
            clearInterval(this.performanceInterval);
        }
        if (this.demoInterval) {
            clearInterval(this.demoInterval);
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cyborVirtualMouse = new CyborVirtualMouse();
    
    // Add some welcome messages to logs
    setTimeout(() => {
        if (window.cyborVirtualMouse) {
            window.cyborVirtualMouse.addGestureLogEntry('Cybor Virtual Mouse gesture recognition initialized', 'success');
            window.cyborVirtualMouse.addCommandLogEntry('Cybor AI voice assistant ready', 'success');
        }
    }, 500);
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.cyborVirtualMouse) {
        window.cyborVirtualMouse.destroy();
    }
});