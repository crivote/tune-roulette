import { createSignal, createMemo, createEffect, createRoot } from 'solid-js';
import Fuse from 'fuse.js';

const [tunes, setTunes] = createSignal([]);
const [isSpinning, setIsSpinning] = createSignal(false);
const [currentSet, setCurrentSet] = createSignal([]);
const [lastDrawnTune, setLastDrawnTune] = createSignal(null);

// Filters
const [typeFilter, setTypeFilter] = createSignal('all');
const [keyFilter, setKeyFilter] = createSignal('all');
const [popularityFilter, setPopularityFilter] = createSignal('all');
const [creativeMode, setCreativeMode] = createSignal('medium');
const [audioContext, setAudioContext] = createSignal(null);
const [isDispatcherOpen, setIsDispatcherOpen] = createSignal(true);
const [lastDrawnSet, setLastDrawnSet] = createSignal([]);
const [seedTune, setSeedTune] = createSignal(null);
const [isResultsClosing, setIsResultsClosing] = createSignal(false);
const [favorites, setFavorites] = createSignal(JSON.parse(localStorage.getItem('folk_favorites') || '[]'));
let fuseInstance = null;

export function useRouletteStore() {
    const loadTunes = async () => {
        try {
            const response = await fetch(`${import.meta.env.BASE_URL}tunes.json`);
            const data = await response.json();

            // Calculate global popularity ranks
            const sorted = [...data].sort((a, b) => (b.tunebooks || 0) - (a.tunebooks || 0));
            sorted.forEach((t, index) => {
                t.globalRank = (index + 1).toString().padStart(4, '0');
            });

            setTunes(sorted);

            // Initialize History with Favorites
            const favTunes = sorted.filter(t => favorites().includes(t.id));
            setCurrentSet(favTunes);

            // Initialize Fuse.js for fuzzy search
            fuseInstance = new Fuse(sorted, {
                keys: ['name'],
                threshold: 0.3,
                distance: 100,
                ignoreLocation: true
            });
        } catch (e) {
            console.error('Failed to load tunes', e);
        }
    };

    const getAvailableTypes = createMemo(() => {
        const types = new Set(tunes().map(t => t.type).filter(Boolean));
        return ['all', ...Array.from(types).sort()];
    });

    // Dynamic keys based on type and popularity
    const getAvailableKeys = createMemo(() => {
        let pool = tunes();

        // 1. Filter by Type
        if (typeFilter() !== 'all') {
            pool = pool.filter(t => t.type === typeFilter());
        }

        // 2. Filter by Popularity within that type
        if (popularityFilter() !== 'all' && pool.length > 0) {
            const rankedPool = [...pool].sort((a, b) => (b.tunebooks || 0) - (a.tunebooks || 0));
            const total = rankedPool.length;

            pool = rankedPool.filter((t, index) => {
                const rank = index + 1;
                const percentile = (rank / total) * 100;
                const p = popularityFilter();
                if (p === 'very popular') return percentile <= 10;
                if (p === 'common') return percentile > 10 && percentile <= 30;
                if (p === 'rare') return percentile > 30 && percentile <= 60;
                if (p === 'obscure') return percentile > 60;
                return true;
            });
        }

        const keys = new Set(pool.map(t => t.key).filter(Boolean));
        return ['all', ...Array.from(keys).sort()];
    });

    const getRelatedKeys = (key) => {
        if (!key) return [];
        const parts = key.split(' ');
        const tonic = parts[0];
        const mode = parts[1] || 'major';

        // High priority: same tonic, different mode
        const modalShifts = ['major', 'mixolydian', 'dorian', 'minor'].map(m => tonic + (m === 'major' ? '' : ' ' + m));

        // Secondary priority: common relatives
        const relatives = [];
        if (tonic === 'G') relatives.push('D', 'C', 'E minor', 'A dorian');
        if (tonic === 'D') relatives.push('A', 'G', 'B minor', 'E dorian');
        if (tonic === 'A') relatives.push('E', 'D', 'F# minor', 'B dorian');
        if (tonic === 'C') relatives.push('G', 'F', 'A minor', 'D dorian');
        if (tonic === 'E') relatives.push('A', 'B', 'G major', 'D major');

        return Array.from(new Set([...modalShifts, ...relatives])).filter(k => k !== key);
    };

    const getTuneTier = (t) => {
        const all = tunes();
        const total = all.length;
        const rank = parseInt(t.globalRank);
        const percentile = (rank / total) * 100;
        if (percentile <= 10) return 0; // very popular
        if (percentile <= 30) return 1; // common
        if (percentile <= 60) return 2; // rare
        return 3; // obscure
    };

    const getCandidatesByTiers = (tiers, typePool, primaryKey, mode = 'medium') => {
        const tieredPool = typePool.filter(t => tiers.includes(getTuneTier(t)));

        if (mode === 'strict') {
            return tieredPool.filter(t => t.key === primaryKey);
        }

        if (mode === 'creative') {
            // Find modal shifts or keys that AREN'T the primary key
            const related = getRelatedKeys(primaryKey);
            let matches = tieredPool.filter(t => related.length > 0 && !related.includes(t.key) && t.key !== primaryKey);
            if (matches.length < 5) matches = tieredPool.filter(t => t.key !== primaryKey);
            return matches.length > 0 ? matches : tieredPool;
        }

        // 'medium' (classic logic)
        // Try same key first
        let matches = tieredPool.filter(t => t.key === primaryKey);

        // Then related keys
        if (matches.length < 2) {
            const related = getRelatedKeys(primaryKey);
            const relatedMatches = tieredPool.filter(t => related.includes(t.key));
            matches = [...new Set([...matches, ...relatedMatches])];
        }

        // Then any key in these tiers
        if (matches.length < 2) {
            matches = tieredPool;
        }

        return matches;
    };

    const spin = async (customFilters = null) => {
        if (isSpinning()) return;

        if (lastDrawnSet().length > 0) {
            addToSet(lastDrawnSet());
            setLastDrawnSet([]);
        }

        setIsSpinning(true);

        const targetType = customFilters?.type || typeFilter();
        const targetPop = customFilters?.popularity || popularityFilter();
        const targetKey = customFilters?.key || keyFilter();

        let pool = tunes();

        if (targetType !== 'all') {
            pool = pool.filter(t => t.type === targetType);
        }

        if (targetPop !== 'all' && pool.length > 0) {
            const rankedPool = [...pool].sort((a, b) => (b.tunebooks || 0) - (a.tunebooks || 0));
            const total = rankedPool.length;
            pool = rankedPool.filter((t, index) => {
                const rank = index + 1;
                const percentile = (rank / total) * 100;
                if (targetPop === 'very popular') return percentile <= 10;
                if (targetPop === 'common') return percentile > 10 && percentile <= 30;
                if (targetPop === 'rare') return percentile > 30 && percentile <= 60;
                if (targetPop === 'obscure') return percentile > 60;
                return true;
            });
        }

        if (targetKey !== 'all') {
            pool = pool.filter(t => t.key === targetKey);
        }

        const currentSetIds = currentSet().map(t => t.id);
        pool = pool.filter(t => !currentSetIds.includes(t.id));

        if (pool.length === 0 && !seedTune()) {
            setIsSpinning(false);
            return null;
        }

        const primaryTune = seedTune() || pool[Math.floor(Math.random() * pool.length)];
        const finalSet = [primaryTune];
        const primaryTier = getTuneTier(primaryTune);

        // Reset seed tune after use so next spin is random if not re-selected
        setSeedTune(null);

        const mode = creativeMode();
        const basePool = tunes().filter(t =>
            t.id !== primaryTune.id &&
            !currentSet().some(s => s.id === t.id)
        );

        const typeFilteredPool = basePool.filter(t => {
            if (mode === 'strict') return t.type === primaryTune.type;
            if (mode === 'medium') return Math.random() > 0.15 ? t.type === primaryTune.type : true;
            return Math.random() > 0.5 ? t.type === primaryTune.type : true;
        });

        let candidates = getCandidatesByTiers([primaryTier], typeFilteredPool, primaryTune.key, mode);
        if (candidates.length < 2 && mode !== 'strict') {
            const adjacentTiers = [primaryTier - 1, primaryTier, primaryTier + 1].filter(t => t >= 0 && t <= 3);
            candidates = getCandidatesByTiers(adjacentTiers, typeFilteredPool, primaryTune.key, mode);
        }
        if (candidates.length < 2 && mode !== 'strict') {
            candidates = typeFilteredPool;
        }

        const shuffled = [...candidates].sort(() => 0.5 - Math.random());
        for (let i = 0; i < 2 && shuffled.length > i; i++) {
            finalSet.push(shuffled[i]);
        }

        setLastDrawnSet(finalSet);
        await new Promise(resolve => setTimeout(resolve, 3500));
        setIsSpinning(false);
        return finalSet;
    };

    const drawOneMore = async () => {
        if (isSpinning() || lastDrawnSet().length === 0) return;

        setIsSpinning(true);

        const primaryTune = lastDrawnSet()[lastDrawnSet().length - 1] || lastDrawnSet()[0];
        const primaryTier = getTuneTier(primaryTune);
        const mode = creativeMode();

        const basePool = tunes().filter(t =>
            t.id !== primaryTune.id &&
            !currentSet().some(s => s.id === t.id) &&
            !lastDrawnSet().some(s => s.id === t.id)
        );

        const typeFilteredPool = basePool.filter(t => {
            if (mode === 'strict') return t.type === primaryTune.type;
            if (mode === 'medium') return Math.random() > 0.15 ? t.type === primaryTune.type : true;
            return Math.random() > 0.5 ? t.type === primaryTune.type : true;
        });

        let candidates = getCandidatesByTiers([primaryTier], typeFilteredPool, primaryTune.key, mode);
        if (candidates.length === 0 && mode !== 'strict') {
            const adjacentTiers = [primaryTier - 1, primaryTier, primaryTier + 1].filter(t => t >= 0 && t <= 3);
            candidates = getCandidatesByTiers(adjacentTiers, typeFilteredPool, primaryTune.key, mode);
        }
        if (candidates.length === 0 && mode !== 'strict') candidates = typeFilteredPool;

        if (candidates.length > 0) {
            const newTune = candidates[Math.floor(Math.random() * candidates.length)];
            setLastDrawnSet(prev => [...prev, newTune]);
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        setIsSpinning(false);
    };

    const addToSet = (tuneOrSet) => {
        if (!tuneOrSet || (Array.isArray(tuneOrSet) && tuneOrSet.length === 0)) return;
        const newItems = Array.isArray(tuneOrSet) ? tuneOrSet : [tuneOrSet];
        setCurrentSet(prev => {
            const existingIds = new Set(prev.map(t => t.id));
            const uniqueNew = newItems.filter(t => !existingIds.has(t.id));
            return [...prev, ...uniqueNew];
        });
    };

    const removeFromLastSet = (tuneId) => {
        setLastDrawnSet(prev => prev.filter(t => t.id !== tuneId));
    };

    const moveTuneInLastSet = (index, direction) => {
        const newIndex = index + direction;
        const set = lastDrawnSet();
        if (newIndex < 0 || newIndex >= set.length) return;

        const newSet = [...set];
        const temp = newSet[index];
        newSet[index] = newSet[newIndex];
        newSet[newIndex] = temp;
        setLastDrawnSet(newSet);
    };

    const toggleFavorite = (tuneId) => {
        setFavorites(prev => {
            const next = prev.includes(tuneId)
                ? prev.filter(id => id !== tuneId)
                : [...prev, tuneId];
            localStorage.setItem('folk_favorites', JSON.stringify(next));
            return next;
        });
    };

    const isFavorite = (tuneId) => favorites().includes(tuneId);

    const removeFromSet = (tuneId) => {
        // If it was a favorite, remove from favorites too
        if (isFavorite(tuneId)) {
            toggleFavorite(tuneId);
        }
        setCurrentSet(prev => prev.filter(t => t.id !== tuneId));
    };

    const clearSet = () => {
        setCurrentSet([]);
        setLastDrawnSet([]);
    };

    const resetDraw = async () => {
        const current = lastDrawnSet();
        if (current.length > 0) {
            addToSet(current);
        }
        setIsResultsClosing(true);
        // Wait for the roll-up animation to complete (matching duration-700)
        await new Promise(r => setTimeout(r, 700));
        setLastDrawnSet([]);
        setIsResultsClosing(false);
    };

    const resetAll = () => {
        setTypeFilter('all');
        setKeyFilter('all');
        setPopularityFilter('all');
        setSeedTune(null);
    };

    const seedAndSpin = async (tune) => {
        const current = lastDrawnSet();
        if (current.length > 0) {
            addToSet(current);
        }
        setLastDrawnSet([]);
        resetAll();
        setSeedTune(tune);
        return await spin();
    };

    const findMatchingTune = async () => {
        const set = currentSet();
        if (set.length === 0) return;
        const lastTune = set[set.length - 1];
        return await spin({ type: lastTune.type, key: lastTune.key });
    };

    const initializeAudio = async () => {
        const existingCtx = audioContext();
        if (existingCtx && existingCtx.state === 'running') return existingCtx;
        if (existingCtx && existingCtx.state !== 'closed') {
            try { await existingCtx.close(); } catch (e) { console.warn("Error closing AudioContext:", e); }
        }
        setAudioContext(null);
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        await ctx.resume();
        setAudioContext(ctx);
        return ctx;
    };

    const playClickSound = () => {
        const ctx = audioContext();
        if (!ctx || ctx.state !== 'running') return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    };

    return {
        tunes, isSpinning, currentSet, lastDrawnTune,
        typeFilter, setTypeFilter, keyFilter, setKeyFilter,
        popularityFilter, setPopularityFilter,
        loadTunes, getAvailableTypes, getAvailableKeys,
        spin, addToSet, removeFromSet, removeFromLastSet, moveTuneInLastSet,
        clearSet, resetDraw, resetAll, seedAndSpin, findMatchingTune, getTuneTier,
        audioContext, initializeAudio, isDispatcherOpen, setIsDispatcherOpen,
        lastDrawnSet, playClickSound, drawOneMore,
        seedTune, setSeedTune, isResultsClosing,
        creativeMode, setCreativeMode,
        favorites, toggleFavorite, isFavorite,
        searchTunes: (term) => fuseInstance ? fuseInstance.search(term).slice(0, 10).map(r => r.item) : []
    };
}

export const rouletteStore = createRoot(useRouletteStore);
