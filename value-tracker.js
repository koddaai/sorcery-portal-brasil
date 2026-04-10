// ============================================
// SORCERY PORTAL BRASIL - VALUE TRACKER
// Historical collection value tracking
// ============================================

class ValueTracker {
    constructor() {
        this.storageKey = 'sorcery-value-history';
        this.snapshots = [];
        this.settings = {
            retentionDays: 90,
            snapshotFrequency: 'daily'
        };
        this.loadFromStorage();
    }

    /**
     * Load history from localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.snapshots = data.snapshots || [];
                this.settings = { ...this.settings, ...data.settings };
            }
        } catch (error) {
            console.error('[ValueTracker] Error loading history:', error);
            this.snapshots = [];
        }
    }

    /**
     * Save history to localStorage
     */
    saveToStorage() {
        try {
            const data = {
                snapshots: this.snapshots,
                settings: this.settings,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('[ValueTracker] Error saving history:', error);
        }
    }

    /**
     * Get today's date as ISO string (YYYY-MM-DD)
     */
    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * Check if a snapshot already exists for today
     */
    hasSnapshotForToday() {
        const today = this.getTodayDate();
        return this.snapshots.some(s => s.date === today);
    }

    /**
     * Take a snapshot of current collection value
     */
    takeSnapshot(collectionValue, brlRate = 5.50) {
        if (this.hasSnapshotForToday()) {
            // Update today's snapshot instead of creating a new one
            const todayIndex = this.snapshots.findIndex(s => s.date === this.getTodayDate());
            if (todayIndex !== -1) {
                this.snapshots[todayIndex] = this.createSnapshotData(collectionValue, brlRate);
                this.saveToStorage();
                return this.snapshots[todayIndex];
            }
        }

        const snapshot = this.createSnapshotData(collectionValue, brlRate);
        this.snapshots.push(snapshot);

        // Sort by date (newest first)
        this.snapshots.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Prune old snapshots
        this.pruneOldSnapshots();

        this.saveToStorage();
        console.log('[ValueTracker] Snapshot taken:', snapshot.date, '$' + snapshot.totalValueUSD.toFixed(2));

        return snapshot;
    }

    /**
     * Create snapshot data object
     */
    createSnapshotData(collectionValue, brlRate) {
        const totalUSD = collectionValue.combinedValue || collectionValue.totalValue || 0;

        return {
            date: this.getTodayDate(),
            totalValueUSD: totalUSD,
            totalValueBRL: totalUSD * brlRate,
            brlRate: brlRate,
            cardCount: collectionValue.cardCount || 0,
            pricedCards: collectionValue.pricedCards || 0,
            estimatedCards: collectionValue.estimatedCards || 0,
            averageCardValue: collectionValue.averageCardValue || 0,
            breakdown: collectionValue.breakdown || {},
            topCards: (collectionValue.topCards || []).slice(0, 10).map(c => ({
                name: c.name,
                value: c.price || c.value,
                source: c.source
            })),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Prune snapshots older than retention period
     */
    pruneOldSnapshots() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.settings.retentionDays);
        const cutoffStr = cutoffDate.toISOString().split('T')[0];

        const before = this.snapshots.length;
        this.snapshots = this.snapshots.filter(s => s.date >= cutoffStr);

        if (this.snapshots.length < before) {
            console.log(`[ValueTracker] Pruned ${before - this.snapshots.length} old snapshots`);
        }
    }

    /**
     * Get value trend for specified number of days
     */
    getValueTrend(days = 7) {
        if (this.snapshots.length < 2) {
            return { change: 0, changePercent: 0, trend: 'neutral', data: [] };
        }

        // Get snapshots within the period
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffStr = cutoffDate.toISOString().split('T')[0];

        const periodSnapshots = this.snapshots
            .filter(s => s.date >= cutoffStr)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (periodSnapshots.length < 2) {
            return { change: 0, changePercent: 0, trend: 'neutral', data: periodSnapshots };
        }

        const oldest = periodSnapshots[0];
        const newest = periodSnapshots[periodSnapshots.length - 1];

        const change = newest.totalValueUSD - oldest.totalValueUSD;
        const changePercent = oldest.totalValueUSD > 0
            ? (change / oldest.totalValueUSD) * 100
            : 0;

        return {
            change: change,
            changePercent: changePercent,
            changeBRL: change * (newest.brlRate || 5.50),
            trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
            startValue: oldest.totalValueUSD,
            endValue: newest.totalValueUSD,
            startDate: oldest.date,
            endDate: newest.date,
            data: periodSnapshots
        };
    }

    /**
     * Get daily change (today vs yesterday)
     */
    getDailyChange() {
        if (this.snapshots.length < 2) {
            return { change: 0, changePercent: 0, trend: 'neutral' };
        }

        const today = this.snapshots[0];
        const yesterday = this.snapshots[1];

        if (!today || !yesterday) {
            return { change: 0, changePercent: 0, trend: 'neutral' };
        }

        const change = today.totalValueUSD - yesterday.totalValueUSD;
        const changePercent = yesterday.totalValueUSD > 0
            ? (change / yesterday.totalValueUSD) * 100
            : 0;

        return {
            change: change,
            changePercent: changePercent,
            changeBRL: change * (today.brlRate || 5.50),
            trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
        };
    }

    /**
     * Get chart data for visualization
     */
    getChartData(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffStr = cutoffDate.toISOString().split('T')[0];

        return this.snapshots
            .filter(s => s.date >= cutoffStr)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(s => ({
                date: s.date,
                label: this.formatDateLabel(s.date),
                valueUSD: s.totalValueUSD,
                valueBRL: s.totalValueBRL,
                cardCount: s.cardCount
            }));
    }

    /**
     * Format date for chart labels
     */
    formatDateLabel(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    }

    /**
     * Get latest snapshot
     */
    getLatestSnapshot() {
        return this.snapshots.length > 0 ? this.snapshots[0] : null;
    }

    /**
     * Get all snapshots
     */
    getAllSnapshots() {
        return this.snapshots;
    }

    /**
     * Detect significant price changes in top cards
     */
    detectPriceChanges(threshold = 0.20) {
        if (this.snapshots.length < 2) return [];

        const current = this.snapshots[0];
        const previous = this.snapshots[1];

        if (!current?.topCards || !previous?.topCards) return [];

        const changes = [];

        current.topCards.forEach(currentCard => {
            const previousCard = previous.topCards.find(p => p.name === currentCard.name);
            if (previousCard && previousCard.value > 0) {
                const change = currentCard.value - previousCard.value;
                const changePercent = change / previousCard.value;

                if (Math.abs(changePercent) >= threshold) {
                    changes.push({
                        name: currentCard.name,
                        previousValue: previousCard.value,
                        currentValue: currentCard.value,
                        change: change,
                        changePercent: changePercent * 100,
                        trend: change > 0 ? 'up' : 'down'
                    });
                }
            }
        });

        return changes.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    }

    /**
     * Get value breakdown summary
     */
    getBreakdownSummary() {
        const latest = this.getLatestSnapshot();
        if (!latest?.breakdown) return null;

        return {
            bySet: latest.breakdown.bySet || {},
            byRarity: latest.breakdown.byRarity || {},
            byElement: latest.breakdown.byElement || {},
            byType: latest.breakdown.byType || {}
        };
    }

    /**
     * Export history as JSON
     */
    exportToJSON() {
        return JSON.stringify({
            snapshots: this.snapshots,
            settings: this.settings,
            exportDate: new Date().toISOString()
        }, null, 2);
    }

    /**
     * Import history from JSON
     */
    importFromJSON(jsonStr) {
        try {
            const data = JSON.parse(jsonStr);
            if (data.snapshots && Array.isArray(data.snapshots)) {
                this.snapshots = data.snapshots;
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                }
                this.saveToStorage();
                return true;
            }
            return false;
        } catch (error) {
            console.error('[ValueTracker] Import failed:', error);
            return false;
        }
    }

    /**
     * Clear all history
     */
    clearHistory() {
        this.snapshots = [];
        this.saveToStorage();
        console.log('[ValueTracker] History cleared');
    }
}

// ============================================
// CHART RENDERER (Canvas 2D - No external libs)
// ============================================

class ValueChartRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    }

    /**
     * Draw a sparkline chart
     */
    drawSparkline(data, options = {}) {
        if (!this.ctx || !data || data.length === 0) return;

        const {
            color = '#d4af37',
            fillColor = 'rgba(212, 175, 55, 0.1)',
            lineWidth = 2,
            showDots = false,
            padding = 10
        } = options;

        const canvas = this.canvas;
        const ctx = this.ctx;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width - padding * 2;
        const height = canvas.height - padding * 2;

        // Get values
        const values = data.map(d => d.valueUSD || d.value || 0);
        const min = Math.min(...values) * 0.95;
        const max = Math.max(...values) * 1.05;
        const range = max - min || 1;

        // Calculate points
        const points = values.map((value, i) => ({
            x: padding + (i / (values.length - 1)) * width,
            y: padding + height - ((value - min) / range) * height
        }));

        // Draw fill gradient
        ctx.beginPath();
        ctx.moveTo(points[0].x, canvas.height - padding);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, canvas.height - padding);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, fillColor);
        gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw line
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        points.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();

        // Draw dots on hover points
        if (showDots) {
            points.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            });
        }

        // Draw current value dot (last point)
        const lastPoint = points[points.length - 1];
        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    /**
     * Draw a simple bar chart
     */
    drawBarChart(data, options = {}) {
        if (!this.ctx || !data || Object.keys(data).length === 0) return;

        const {
            colors = ['#d4af37', '#c49b30', '#a88429', '#8c6e22', '#705a1c'],
            padding = 20,
            barGap = 4
        } = options;

        const canvas = this.canvas;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
        const maxValue = Math.max(...entries.map(e => e[1]));

        const width = canvas.width - padding * 2;
        const height = canvas.height - padding * 2;
        const barWidth = (width - barGap * (entries.length - 1)) / entries.length;

        entries.forEach(([label, value], i) => {
            const barHeight = (value / maxValue) * height;
            const x = padding + i * (barWidth + barGap);
            const y = padding + height - barHeight;

            // Draw bar
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw label
            ctx.fillStyle = '#86868b';
            ctx.font = '10px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText(label.substring(0, 5), x + barWidth / 2, canvas.height - 4);
        });
    }
}

// ============================================
// INITIALIZE
// ============================================

const valueTracker = new ValueTracker();
window.valueTracker = valueTracker;
window.ValueChartRenderer = ValueChartRenderer;

console.log('[ValueTracker] Service loaded');
