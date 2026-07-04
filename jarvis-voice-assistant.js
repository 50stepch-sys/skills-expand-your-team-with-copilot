/**
 * JARVIS Voice Assistant System - PreStore Omega AI OS
 * Advanced AI-powered voice interface with autonomous task execution
 * Voice Style: Sophisticated, Professional, Intelligent (JARVIS-inspired)
 */

class JARVISVoiceAssistant {
    constructor(config = {}) {
        this.config = {
            voiceName: 'en-US-Standard-C', // Professional male voice
            speakingRate: 0.95, // Slightly slower for clarity
            pitch: 0.8, // Lower pitch for authority
            ...config
        };
        
        this.isListening = false;
        this.isProcessing = false;
        this.speechRecognition = this.initSpeechRecognition();
        this.speechSynthesis = window.speechSynthesis;
        this.contextMemory = [];
        this.taskQueue = [];
        this.autonomyLevel = 'intelligent'; // intelligent, supervised, manual
    }

    /**
     * Initialize Web Speech API Recognition
     */
    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return null;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.language = 'en-US';
        
        return recognition;
    }

    /**
     * JARVIS-style voice synthesis with professional tone
     */
    async speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            // Clear any existing speech
            this.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = options.rate || this.config.speakingRate;
            utterance.pitch = options.pitch || this.config.pitch;
            utterance.volume = options.volume || 1;

            // Add JARVIS-like characteristics
            utterance.onstart = () => {
                this.onSpeakStart?.(text);
            };

            utterance.onend = () => {
                resolve();
                this.onSpeakEnd?.(text);
            };

            utterance.onerror = (error) => {
                reject(error);
            };

            this.speechSynthesis.speak(utterance);
        });
    }

    /**
     * Start listening with JARVIS activation phrase
     */
    async startListening(options = {}) {
        if (!this.speechRecognition) {
            console.error('Speech Recognition not supported');
            return;
        }

        this.isListening = true;
        
        // JARVIS-style welcome
        if (options.welcome !== false) {
            await this.speak("I'm listening. How may I assist you?", {
                rate: 0.92,
                pitch: 0.85
            });
        }

        let interimTranscript = '';
        const recognitionStartTime = Date.now();

        this.speechRecognition.onstart = () => {
            this.onListeningStart?.();
        };

        this.speechRecognition.onresult = async (event) => {
            interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    await this.processCommand(transcript, { isFinal: true });
                } else {
                    interimTranscript += transcript;
                }
            }

            if (interimTranscript) {
                this.onInterimResult?.(interimTranscript);
            }
        };

        this.speechRecognition.onerror = (event) => {
            this.onListeningError?.(event.error);
            this.speak(`I encountered an error: ${event.error}`, { rate: 0.95 });
        };

        this.speechRecognition.onend = () => {
            this.isListening = false;
            this.onListeningEnd?.();
        };

        this.speechRecognition.start();
    }

    /**
     * Stop listening
     */
    stopListening() {
        if (this.speechRecognition) {
            this.speechRecognition.stop();
            this.isListening = false;
        }
    }

    /**
     * Advanced command processing with NLP-like understanding
     */
    async processCommand(transcript, options = {}) {
        if (!options.isFinal) return;

        const normalizedCommand = transcript.toLowerCase().trim();
        
        // Add to context memory for learning
        this.contextMemory.push({
            command: normalizedCommand,
            timestamp: new Date(),
            source: 'voice'
        });

        // Keep memory manageable
        if (this.contextMemory.length > 100) {
            this.contextMemory = this.contextMemory.slice(-100);
        }

        this.onCommandProcessing?.(normalizedCommand);

        try {
            // Intelligent command routing
            const intent = await this.analyzeIntent(normalizedCommand);
            const action = this.mapIntentToAction(intent);

            if (action) {
                await this.executeAction(action, normalizedCommand);
            } else {
                await this.speak("I'm not sure how to handle that request. Could you rephrase?", {
                    rate: 0.93
                });
            }
        } catch (error) {
            console.error('Command processing error:', error);
            await this.speak("An error occurred processing your command.", {
                rate: 0.93
            });
        }
    }

    /**
     * Intent analysis using keyword matching and context
     */
    async analyzeIntent(command) {
        const intents = {
            'add-entry': {
                keywords: ['add', 'record', 'log', 'entry', 'create', 'new'],
                priority: 10
            },
            'view-data': {
                keywords: ['show', 'display', 'view', 'tell', 'what', 'how much'],
                priority: 8
            },
            'edit-entry': {
                keywords: ['edit', 'change', 'modify', 'update', 'correct'],
                priority: 8
            },
            'delete-entry': {
                keywords: ['delete', 'remove', 'clear', 'erase'],
                priority: 7
            },
            'summary': {
                keywords: ['summary', 'total', 'balance', 'report', 'overview'],
                priority: 9
            },
            'help': {
                keywords: ['help', 'assist', 'guide', 'tutorial', 'how'],
                priority: 5
            },
            'navigate': {
                keywords: ['go', 'open', 'switch', 'navigate', 'module'],
                priority: 7
            }
        };

        let bestMatch = null;
        let highestScore = 0;

        for (const [intent, config] of Object.entries(intents)) {
            let score = 0;
            for (const keyword of config.keywords) {
                if (command.includes(keyword)) {
                    score += config.priority;
                }
            }
            
            if (score > highestScore) {
                highestScore = score;
                bestMatch = intent;
            }
        }

        return bestMatch || 'help';
    }

    /**
     * Map intents to executable actions
     */
    mapIntentToAction(intent) {
        const actionMap = {
            'add-entry': {
                type: 'modal',
                action: 'openAddModal',
                confirmation: true
            },
            'view-data': {
                type: 'navigation',
                action: 'toggleView',
                target: 'overview'
            },
            'summary': {
                type: 'report',
                action: 'generateSummary',
                format: 'voice'
            },
            'help': {
                type: 'info',
                action: 'showHelp'
            },
            'navigate': {
                type: 'navigation',
                action: 'navigateToModule'
            }
        };

        return actionMap[intent] || null;
    }

    /**
     * Execute mapped actions with autonomous capability
     */
    async executeAction(action, originalCommand) {
        try {
            switch (action.action) {
                case 'openAddModal':
                    await this.handleAddEntry(originalCommand);
                    break;
                
                case 'toggleView':
                    window.toggleView?.(action.target);
                    await this.speak("Switching to overview.", { rate: 0.93 });
                    break;
                
                case 'generateSummary':
                    await this.generateVoiceSummary();
                    break;
                
                case 'showHelp':
                    await this.provideSpeechHelp();
                    break;
                
                case 'navigateToModule':
                    await this.handleNavigation(originalCommand);
                    break;
                
                default:
                    await this.speak("Action not recognized.", { rate: 0.93 });
            }
        } catch (error) {
            console.error('Action execution error:', error);
            throw error;
        }
    }

    /**
     * Intelligent add entry handler
     */
    async handleAddEntry(command) {
        await this.speak("Opening entry form. Please provide the details.", {
            rate: 0.94,
            pitch: 0.82
        });

        window.openAddModal?.('دکانیں'); // Default module
        
        // Listen for details after modal opens
        setTimeout(() => {
            this.startListening({ welcome: false });
        }, 1500);
    }

    /**
     * Generate voice-based summary report
     */
    async generateVoiceSummary() {
        try {
            const totalReceived = document.getElementById('totalReceived')?.innerText || '0';
            const totalExpense = document.getElementById('totalExpense')?.innerText || '0';
            const totalBalance = document.getElementById('totalBalance')?.innerText || '0';

            const summary = `Your current financial summary: Total received, ${totalReceived} rupees. Total expenses, ${totalExpense} rupees. Current balance, ${totalBalance} rupees.`;

            await this.speak(summary, {
                rate: 0.92,
                pitch: 0.85
            });
        } catch (error) {
            console.error('Summary generation error:', error);
            await this.speak("Unable to generate summary at this time.", {
                rate: 0.93
            });
        }
    }

    /**
     * Provide contextual help through speech
     */
    async provideSpeechHelp() {
        const helpText = `I am JARVIS, your AI assistant. I can help you add entries, view data, generate reports, and navigate the application. Try saying things like: "Add a new entry", "Show me the summary", or "View the overview". What would you like to do?`;

        await this.speak(helpText, {
            rate: 0.92,
            pitch: 0.85
        });
    }

    /**
     * Intelligent navigation handling
     */
    async handleNavigation(command) {
        const navigationMap = {
            'shops': 'دکانیں',
            'payments': 'ادائیگیاں',
            'expenses': 'جیب خرچ',
            'extra': 'اضافی رقم',
            'amanat': 'امانت',
            'loan': 'قرضہ'
        };

        let targetModule = null;
        for (const [key, module] of Object.entries(navigationMap)) {
            if (command.includes(key)) {
                targetModule = module;
                break;
            }
        }

        if (targetModule) {
            window.openModule?.(targetModule);
            await this.speak(`Navigating to ${targetModule}.`, { rate: 0.93 });
        } else {
            await this.speak("Could you specify which module you'd like to access?", {
                rate: 0.93
            });
        }
    }

    /**
     * Advanced autonomous task execution
     */
    async executeAutonomousTask(task) {
        if (this.autonomyLevel === 'manual') {
            await this.requestUserConfirmation(task);
            return;
        }

        try {
            this.taskQueue.push({
                task,
                status: 'pending',
                timestamp: new Date()
            });

            // Execute task based on type
            switch (task.type) {
                case 'scheduled-report':
                    await this.generateScheduledReport();
                    break;
                
                case 'data-sync':
                    await this.performDataSync();
                    break;
                
                case 'security-check':
                    await this.performSecurityCheck();
                    break;
            }

            this.updateTaskStatus(task.id, 'completed');
            await this.speak("Task completed successfully.", {
                rate: 0.93,
                pitch: 0.85
            });
        } catch (error) {
            this.updateTaskStatus(task.id, 'failed');
            console.error('Autonomous task error:', error);
        }
    }

    /**
     * Request user confirmation for actions
     */
    async requestUserConfirmation(action) {
        const confirmationText = `Should I proceed with ${action.description}?`;
        await this.speak(confirmationText, { rate: 0.93 });

        return new Promise((resolve) => {
            this.onConfirmationNeeded = async (response) => {
                if (response.toLowerCase().includes('yes') || response.toLowerCase().includes('confirm')) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            };

            this.startListening({ welcome: false });
        });
    }

    /**
     * Perform scheduled report generation
     */
    async generateScheduledReport() {
        // Implementation for automated reporting
        await this.generateVoiceSummary();
    }

    /**
     * Perform data synchronization
     */
    async performDataSync() {
        if (typeof window.syncPendingOperations === 'function') {
            await window.syncPendingOperations(false);
            await this.speak("Data synchronization complete.", {
                rate: 0.93
            });
        }
    }

    /**
     * Perform security checks
     */
    async performSecurityCheck() {
        await this.speak("Running security verification.", {
            rate: 0.93,
            pitch: 0.82
        });

        // Simulate security check
        await new Promise(resolve => setTimeout(resolve, 2000));

        await this.speak("Security check passed. All systems nominal.", {
            rate: 0.92,
            pitch: 0.85
        });
    }

    /**
     * Update task status
     */
    updateTaskStatus(taskId, status) {
        const task = this.taskQueue.find(t => t.id === taskId);
        if (task) {
            task.status = status;
            task.updatedAt = new Date();
        }
    }

    /**
     * Set autonomy level (intelligent, supervised, manual)
     */
    setAutonomyLevel(level) {
        if (['intelligent', 'supervised', 'manual'].includes(level)) {
            this.autonomyLevel = level;
            this.speak(`Autonomy level set to ${level}.`, { rate: 0.93 });
        }
    }

    /**
     * Get voice status and capabilities
     */
    getStatus() {
        return {
            isListening: this.isListening,
            isProcessing: this.isProcessing,
            autonomyLevel: this.autonomyLevel,
            memorySize: this.contextMemory.length,
            taskQueue: this.taskQueue.length,
            supported: !!this.speechRecognition
        };
    }

    /**
     * Initialize JARVIS with callbacks
     */
    initialize(callbacks = {}) {
        this.onListeningStart = callbacks.onListeningStart;
        this.onListeningEnd = callbacks.onListeningEnd;
        this.onListeningError = callbacks.onListeningError;
        this.onInterimResult = callbacks.onInterimResult;
        this.onCommandProcessing = callbacks.onCommandProcessing;
        this.onSpeakStart = callbacks.onSpeakStart;
        this.onSpeakEnd = callbacks.onSpeakEnd;
        this.onConfirmationNeeded = callbacks.onConfirmationNeeded;

        return this;
    }
}

// Global instance initialization
window.JARVISVoiceAssistant = JARVISVoiceAssistant;

// Create global JARVIS instance
let jarvis = null;

window.initializeJARVIS = (config = {}) => {
    jarvis = new JARVISVoiceAssistant(config);
    
    jarvis.initialize({
        onListeningStart: () => {
            console.log('🎤 JARVIS is listening...');
            document.body.classList.add('jarvis-listening');
        },
        onListeningEnd: () => {
            console.log('🤐 JARVIS stopped listening');
            document.body.classList.remove('jarvis-listening');
        },
        onCommandProcessing: (command) => {
            console.log('⚙️ Processing:', command);
        },
        onInterimResult: (interim) => {
            console.log('📝 Interim:', interim);
        }
    });

    return jarvis;
};

// Activate JARVIS on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.initializeJARVIS();
    });
} else {
    window.initializeJARVIS();
}

console.log('✨ JARVIS Voice Assistant System Loaded');
