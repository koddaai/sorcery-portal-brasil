// ============================================
// SORCERY CARD SCANNER
// Camera-based card recognition using OCR
// ============================================

class CardScanner {
    constructor() {
        this.videoStream = null;
        this.currentFacingMode = 'environment'; // back camera
        this.isProcessing = false;
        this.tesseractWorker = null;
        this.isInitialized = false;
    }

    // Initialize Tesseract worker
    async initTesseract() {
        if (this.isInitialized) return;

        try {
            console.log('Initializing Tesseract OCR...');
            this.tesseractWorker = await Tesseract.createWorker('eng', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                    }
                }
            });
            this.isInitialized = true;
            console.log('Tesseract initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Tesseract:', error);
            throw error;
        }
    }

    // Start camera (optimized for mobile)
    async startCamera() {
        const video = document.getElementById('scanner-video');

        // Mobile-optimized constraints
        const constraints = {
            video: {
                facingMode: { ideal: this.currentFacingMode },
                width: { ideal: 1920, max: 1920 },
                height: { ideal: 1080, max: 1080 },
                // Better for card scanning
                focusMode: { ideal: 'continuous' },
                exposureMode: { ideal: 'continuous' }
            },
            audio: false
        };

        try {
            // Stop any existing stream
            this.stopCamera();

            this.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = this.videoStream;

            // Wait for video to be ready
            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play();
                    resolve();
                };
            });

            console.log('Camera started successfully');
            return true;
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showCameraError(error);
            return false;
        }
    }

    // Stop camera
    stopCamera() {
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }
    }

    // Switch between front and back camera
    async switchCamera() {
        this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
        await this.startCamera();
    }

    // Capture image from video
    captureImage() {
        const video = document.getElementById('scanner-video');
        const canvas = document.getElementById('scanner-canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);

        return imageDataUrl;
    }

    // Capture and crop to the name area (top portion of card)
    captureNameArea() {
        const video = document.getElementById('scanner-video');
        const canvas = document.getElementById('scanner-canvas');
        const ctx = canvas.getContext('2d');

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // Estimate card name area (top 15% of the frame, centered)
        const cropWidth = videoWidth * 0.7;
        const cropHeight = videoHeight * 0.15;
        const cropX = (videoWidth - cropWidth) / 2;
        const cropY = videoHeight * 0.1;

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // Draw cropped area
        ctx.drawImage(
            video,
            cropX, cropY, cropWidth, cropHeight,
            0, 0, cropWidth, cropHeight
        );

        // Apply image processing for better OCR
        this.enhanceForOCR(ctx, cropWidth, cropHeight);

        return canvas.toDataURL('image/jpeg', 0.95);
    }

    // Enhance image for better OCR results
    enhanceForOCR(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Convert to grayscale and increase contrast
        for (let i = 0; i < data.length; i += 4) {
            // Grayscale
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

            // Increase contrast
            const contrast = 1.5;
            const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));
            const newValue = Math.min(255, Math.max(0, factor * (avg - 128) + 128));

            // Threshold for cleaner text
            const threshold = newValue > 128 ? 255 : 0;

            data[i] = threshold;
            data[i + 1] = threshold;
            data[i + 2] = threshold;
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // Perform OCR on captured image
    async recognizeText(imageDataUrl) {
        if (!this.isInitialized) {
            await this.initTesseract();
        }

        this.isProcessing = true;
        this.showProcessing(true);

        try {
            const result = await this.tesseractWorker.recognize(imageDataUrl);
            const text = result.data.text.trim();
            console.log('OCR Result:', text);
            return text;
        } catch (error) {
            console.error('OCR Error:', error);
            return '';
        } finally {
            this.isProcessing = false;
            this.showProcessing(false);
        }
    }

    // Find matching cards from the database
    findMatchingCards(searchText, allCards, limit = 5) {
        if (!searchText || searchText.length < 2) return [];

        const normalizedSearch = searchText.toLowerCase().trim();
        const words = normalizedSearch.split(/\s+/).filter(w => w.length > 2);

        // Score each card based on match quality
        const scored = allCards.map(card => {
            const cardName = card.name.toLowerCase();
            let score = 0;

            // Exact match
            if (cardName === normalizedSearch) {
                score = 1000;
            }
            // Starts with search text
            else if (cardName.startsWith(normalizedSearch)) {
                score = 500;
            }
            // Contains search text
            else if (cardName.includes(normalizedSearch)) {
                score = 300;
            }
            // Word matches
            else {
                words.forEach(word => {
                    if (cardName.includes(word)) {
                        score += 50 * word.length;
                    }
                });
            }

            // Fuzzy match for OCR errors
            if (score === 0) {
                const similarity = this.calculateSimilarity(normalizedSearch, cardName);
                if (similarity > 0.6) {
                    score = similarity * 100;
                }
            }

            return { card, score };
        });

        // Sort by score and return top matches
        return scored
            .filter(s => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(s => s.card);
    }

    // Calculate string similarity (Levenshtein-based)
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1.0;

        const costs = [];
        for (let i = 0; i <= shorter.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= longer.length; j++) {
                if (i === 0) {
                    costs[j] = j;
                } else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (shorter.charAt(i - 1) !== longer.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) costs[longer.length] = lastValue;
        }

        return (longer.length - costs[longer.length]) / longer.length;
    }

    // Clean OCR text (remove common artifacts)
    cleanOCRText(text) {
        return text
            // Remove special characters that OCR might misread
            .replace(/[|\\{}\[\]<>@#$%^&*()_+=]/g, '')
            // Fix common OCR mistakes
            .replace(/0/g, 'O')
            .replace(/1/g, 'l')
            .replace(/5/g, 'S')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Show/hide processing indicator
    showProcessing(show) {
        const processingEl = document.getElementById('scanner-processing');
        if (processingEl) {
            processingEl.classList.toggle('hidden', !show);
        }
    }

    // Show camera error message
    showCameraError(error) {
        let message = 'Unable to access camera.';

        if (error.name === 'NotAllowedError') {
            message = 'Camera access denied. Please allow camera access and try again.';
        } else if (error.name === 'NotFoundError') {
            message = 'No camera found on this device.';
        } else if (error.name === 'NotReadableError') {
            message = 'Camera is already in use by another application.';
        }

        const videoContainer = document.getElementById('scanner-video-container');
        if (videoContainer) {
            videoContainer.innerHTML = `
                <div class="scanner-error">
                    <span class="error-icon">&#9888;</span>
                    <p>${message}</p>
                    <button class="btn" onclick="cardScanner.startCamera()">Retry</button>
                </div>
            `;
        }
    }

    // Cleanup
    destroy() {
        this.stopCamera();
        if (this.tesseractWorker) {
            this.tesseractWorker.terminate();
            this.tesseractWorker = null;
            this.isInitialized = false;
        }
    }
}

// Global instance
const cardScanner = new CardScanner();

// Scanner UI Controller
const scannerUI = {
    isOpen: false,

    // Open scanner modal
    open() {
        const modal = document.getElementById('scanner-modal');
        if (!modal) return;

        modal.classList.remove('hidden');
        this.isOpen = true;
        this.showCameraView();
        cardScanner.startCamera();
    },

    // Close scanner modal
    close() {
        const modal = document.getElementById('scanner-modal');
        if (!modal) return;

        modal.classList.add('hidden');
        this.isOpen = false;
        cardScanner.stopCamera();
    },

    // Show camera view
    showCameraView() {
        const cameraSection = document.querySelector('.scanner-camera-section');
        const resultsSection = document.getElementById('scanner-results');

        if (cameraSection) cameraSection.classList.remove('hidden');
        if (resultsSection) resultsSection.classList.add('hidden');

        // Reset UI
        document.getElementById('scanner-matches')?.classList.add('hidden');
        document.getElementById('scanner-detected-text')?.classList.add('hidden');
    },

    // Show results view
    showResultsView(imageDataUrl) {
        const cameraSection = document.querySelector('.scanner-camera-section');
        const resultsSection = document.getElementById('scanner-results');
        const capturedImg = document.getElementById('scanner-captured');

        if (cameraSection) cameraSection.classList.add('hidden');
        if (resultsSection) resultsSection.classList.remove('hidden');
        if (capturedImg) capturedImg.src = imageDataUrl;
    },

    // Capture and process image
    async capture() {
        if (cardScanner.isProcessing) return;

        // Capture the full frame
        const fullImage = cardScanner.captureImage();

        // Capture the name area for OCR
        const nameAreaImage = cardScanner.captureNameArea();

        // Show results view with full image
        this.showResultsView(fullImage);

        // Perform OCR on name area
        const rawText = await cardScanner.recognizeText(nameAreaImage);
        const cleanedText = cardScanner.cleanOCRText(rawText);

        // Show detected text
        this.showDetectedText(cleanedText);

        // Search for matches if we got text
        if (cleanedText.length >= 2) {
            this.searchCards(cleanedText);
        }
    },

    // Show detected text input
    showDetectedText(text) {
        const container = document.getElementById('scanner-detected-text');
        const input = document.getElementById('scanner-text-input');

        if (container) container.classList.remove('hidden');
        if (input) input.value = text;
    },

    // Search for cards
    searchCards(searchText) {
        // Use allCards from the main app
        if (typeof allCards === 'undefined' || !allCards.length) {
            console.error('Card database not loaded');
            return;
        }

        const matches = cardScanner.findMatchingCards(searchText, allCards, 6);
        this.showMatches(matches);
    },

    // Show matching cards
    showMatches(matches) {
        const container = document.getElementById('scanner-matches');
        const list = document.getElementById('scanner-matches-list');

        if (!container || !list) return;

        if (matches.length === 0) {
            list.innerHTML = '<p class="no-matches">Nenhum card encontrado. Tente ajustar o texto acima.</p>';
        } else {
            list.innerHTML = matches.map(card => `
                <div class="scanner-match-card" data-card-name="${card.name}">
                    <img src="${card.image || ''}" alt="${card.name}" onerror="this.src='placeholder.png'">
                    <div class="match-info">
                        <span class="match-name">${card.name}</span>
                        <span class="match-type">${card.guardian?.type || ''}</span>
                    </div>
                    <div class="match-actions">
                        <button class="btn btn-small primary add-to-collection-btn" title="Adicionar à coleção">+</button>
                    </div>
                </div>
            `).join('');

            // Add click handlers
            list.querySelectorAll('.scanner-match-card').forEach(el => {
                const cardName = el.dataset.cardName;

                // Click card to view details
                el.addEventListener('click', (e) => {
                    if (!e.target.closest('.add-to-collection-btn')) {
                        const card = allCards.find(c => c.name === cardName);
                        if (card && typeof showCardDetail === 'function') {
                            this.close();
                            showCardDetail(card);
                        }
                    }
                });

                // Add to collection button
                el.querySelector('.add-to-collection-btn')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (typeof collection !== 'undefined' && typeof saveData === 'function') {
                        collection.add(cardName);
                        saveData();
                        if (typeof renderCollection === 'function') renderCollection();
                        if (typeof updateStats === 'function') updateStats();
                        showScannerNotification(`Added "${cardName}" to collection!`);

                        // Visual feedback
                        el.classList.add('added');
                        setTimeout(() => el.classList.remove('added'), 1000);
                    }
                });
            });
        }

        container.classList.remove('hidden');
    },

    // Setup event listeners
    setupListeners() {
        // Scanner button
        document.getElementById('scanner-btn')?.addEventListener('click', () => {
            this.open();
        });

        // Close button
        document.querySelector('#scanner-modal .close-modal')?.addEventListener('click', () => {
            this.close();
        });

        // Capture button
        document.getElementById('scanner-capture-btn')?.addEventListener('click', () => {
            this.capture();
        });

        // Switch camera button
        document.getElementById('scanner-switch-camera-btn')?.addEventListener('click', () => {
            cardScanner.switchCamera();
        });

        // Retry button
        document.getElementById('scanner-retry-btn')?.addEventListener('click', () => {
            this.showCameraView();
            cardScanner.startCamera();
        });

        // Search button (after OCR)
        document.getElementById('scanner-search-btn')?.addEventListener('click', () => {
            const input = document.getElementById('scanner-text-input');
            if (input && input.value.trim()) {
                this.searchCards(input.value.trim());
            }
        });

        // Manual search input
        document.getElementById('scanner-manual-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const input = e.target;
                if (input.value.trim()) {
                    this.searchCards(input.value.trim());
                }
            }
        });

        // Manual search button
        document.getElementById('scanner-manual-search-btn')?.addEventListener('click', () => {
            const input = document.getElementById('scanner-manual-input');
            if (input && input.value.trim()) {
                this.searchCards(input.value.trim());
                // Show results section
                document.querySelector('.scanner-camera-section')?.classList.add('hidden');
                document.getElementById('scanner-results')?.classList.remove('hidden');
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Close on backdrop click
        document.getElementById('scanner-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'scanner-modal') {
                this.close();
            }
        });
    }
};

// Show scanner notification
function showScannerNotification(message) {
    // Use existing notification function if available
    if (typeof showNotification === 'function') {
        showNotification(message);
        return;
    }

    // Fallback notification
    const notification = document.createElement('div');
    notification.className = 'notification show';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize scanner when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        scannerUI.setupListeners();
        console.log('Card Scanner initialized');
    }, 200);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CardScanner, cardScanner, scannerUI };
}
