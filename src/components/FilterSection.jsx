import { useRouletteStore } from '../store/rouletteStore';
import { For, Show, createSignal, createMemo, onMount, onCleanup, createEffect } from 'solid-js';

function FilterDropdown(props) {
    const [isOpen, setIsOpen] = createSignal(false);
    let dropdownRef;

    const handleWindowClick = (e) => {
        if (dropdownRef && !dropdownRef.contains(e.target)) {
            setIsOpen(false);
        }
    };

    onMount(() => {
        window.addEventListener('click', handleWindowClick);
    });

    onCleanup(() => {
        window.removeEventListener('click', handleWindowClick);
    });

    const selectedLabel = createMemo(() => {
        const item = props.options.find(o => o.id === props.value);
        return item ? item.label : props.value;
    });

    return (
        <div class="flex flex-col gap-3 relative" ref={dropdownRef}>
            <label class="text-[10px] font-black uppercase tracking-widest text-ui-text/40 ml-1">
                {props.label}
            </label>
            <button
                onClick={() => setIsOpen(!isOpen())}
                class={`w-full bg-ui-surface border rounded-2xl px-5 py-3.5 font-bold text-sm text-ui-text flex items-center justify-between transition-all ${isOpen() ? 'border-brand-green ring-2 ring-brand-green/10' : 'border-ui-border hover:bg-ui-bg'}`}
            >
                <span class="truncate">{selectedLabel()}</span>
                <span class={`material-symbols-rounded text-ui-text/30 transition-transform duration-300 ${isOpen() ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            <Show when={isOpen()}>
                <div class="absolute z-[60] top-[calc(100%+8px)] left-0 w-full bg-ui-surface border border-ui-border rounded-2xl shadow-modern-lg overflow-hidden animate__animated animate__fadeIn animate__faster">
                    <div class="max-height-[240px] overflow-y-auto py-2 custom-scrollbar">
                        <For each={props.options}>
                            {(option) => (
                                <button
                                    onClick={() => {
                                        props.onChange(option.id);
                                        setIsOpen(false);
                                    }}
                                    class={`w-full px-5 py-3 text-left text-sm font-bold transition-colors flex items-center justify-between ${props.value === option.id ? 'bg-brand-light text-brand-green-dark' : 'text-ui-text hover:bg-ui-bg'}`}
                                >
                                    <span>{option.label}</span>
                                    <Show when={props.value === option.id}>
                                        <span class="material-symbols-rounded text-base">check</span>
                                    </Show>
                                </button>
                            )}
                        </For>
                    </div>
                </div>
            </Show>
        </div>
    );
}

function FilterSection() {
    const {
        typeFilter, setTypeFilter,
        keyFilter, setKeyFilter,
        popularityFilter, setPopularityFilter,
        getAvailableTypes, getAvailableKeys,
        spin, isSpinning, initializeAudio, setIsDispatcherOpen,
        tunes, seedTune, setSeedTune, searchTunes,
        creativeMode, setCreativeMode
    } = useRouletteStore();

    const [searchTerm, setSearchTerm] = createSignal("");
    const [isDropdownVisible, setIsDropdownVisible] = createSignal(false);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = createSignal(false);

    let searchContainer;

    const handleWindowClick = (e) => {
        if (searchContainer && !searchContainer.contains(e.target)) {
            setIsDropdownVisible(false);
        }
    };

    onMount(() => {
        window.addEventListener('click', handleWindowClick);
    });

    onCleanup(() => {
        window.removeEventListener('click', handleWindowClick);
    });

    createEffect(() => {
        if (seedTune()) {
            setSearchTerm(seedTune().name);
        } else if (searchTerm() !== "" && !searchTerm().includes(' ') && seedTune() === null) {
            // Only clear if it wasn't a manual type-in (heuristically)
            // Actually, simpler: if seedTune is null, we can just let searchTerm stay or clear it?
            // User said "resetting all filters".
        }
    });

    // Let's make it simpler: if the store is reset, we clear local states
    createEffect(() => {
        if (!seedTune() && typeFilter() === 'all' && keyFilter() === 'all' && popularityFilter() === 'all') {
            setSearchTerm("");
            setIsFilterPanelOpen(false);
        }
    });

    const matches = createMemo(() => {
        const term = searchTerm().trim();
        if (term.length < 2) return [];
        return searchTunes(term);
    });

    const handleInitiate = async () => {
        setIsDispatcherOpen(false);
        setIsFilterPanelOpen(false);
        await initializeAudio();
        await spin();
    };

    const handleSelectTune = (tune) => {
        setSeedTune(tune);
        setSearchTerm(tune.name);
        setIsDropdownVisible(false);
        setTypeFilter('all');
        setKeyFilter('all');
        setPopularityFilter('all');
        setIsFilterPanelOpen(false);
    };

    const resetAll = () => {
        setSearchTerm("");
        setSeedTune(null);
        setTypeFilter('all');
        setKeyFilter('all');
        setPopularityFilter('all');
        setIsFilterPanelOpen(false);
    };

    const clearSearch = () => {
        setSearchTerm("");
        setSeedTune(null);
    };

    const rhythmOptions = createMemo(() =>
        getAvailableTypes().map(type => ({
            id: type,
            label: type === 'all' ? 'Any Rhythm' : type.charAt(0).toUpperCase() + type.slice(1)
        }))
    );

    const keyOptions = createMemo(() =>
        getAvailableKeys().slice(0, 20).map(key => ({
            id: key,
            label: key === 'all' ? 'Any Key' : key
        }))
    );

    const popularityTiers = [
        { id: 'all', label: 'Any Popularity' },
        { id: 'very popular', label: 'Top 100' },
        { id: 'common', label: 'Usual' },
        { id: 'rare', label: 'Rare' },
        { id: 'obscure', label: 'Obscure' }
    ];

    const getStatusMessage = () => {
        const parts = [];
        if (seedTune()) {
            parts.push(`Starting with '${seedTune().name}'`);
        } else if (searchTerm().trim()) {
            parts.push(`Searching for '${searchTerm()}'`);
        } else {
            parts.push("Random selection");
        }

        if (typeFilter() !== 'all') parts.push(`Rhythm: ${typeFilter()}`);
        if (keyFilter() !== 'all') parts.push(`Key: ${keyFilter()}`);
        if (popularityFilter() !== 'all') {
            const tier = popularityTiers.find(t => t.id === popularityFilter());
            parts.push(tier ? tier.label : popularityFilter());
        }

        return parts.join(" • ");
    };

    return (
        <div class="w-full flex flex-col">
            {/* Main Search & Filter Toggle Row */}
            <div class="flex flex-col gap-4">
                <div class="flex items-center gap-2 text-ui-text font-bold">
                    <span class="material-symbols-rounded text-xl text-brand-green-dark">search</span>
                    <h3>Write the name of a  tune</h3>
                </div>

                <div class="flex flex-col md:flex-row gap-4 w-full">
                    <div class="relative flex-grow group" ref={searchContainer}>
                        <div class="relative">
                            <input
                                type="text"
                                value={searchTerm()}
                                onInput={(e) => {
                                    setSearchTerm(e.target.value);
                                    setSeedTune(null);
                                    setIsDropdownVisible(true);
                                }}
                                onFocus={() => setIsDropdownVisible(true)}
                                placeholder="The Kesh Jig..."
                                class="w-full bg-ui-bg border border-ui-border rounded-3xl px-6 md:px-8 py-4 md:py-5 text-lg font-medium text-ui-text-muted focus:outline-none focus:border-brand-green focus:text-ui-text transition-all"
                            />

                            <Show when={searchTerm() || seedTune()}>
                                <button
                                    onClick={clearSearch}
                                    class="absolute right-6 top-1/2 -translate-y-1/2 text-ui-text-muted hover:text-ui-text"
                                >
                                    <span class="material-symbols-rounded">close</span>
                                </button>
                            </Show>
                        </div>

                        {/* Autocomplete Dropdown */}
                        <Show when={isDropdownVisible() && matches().length > 0}>
                            <div class="absolute z-50 top-full mt-2 w-full bg-ui-surface border border-ui-border rounded-3xl shadow-modern-lg overflow-hidden py-2 animate__animated animate__fadeIn animate__faster">
                                <For each={matches()}>
                                    {(tune) => (
                                        <button
                                            onClick={() => handleSelectTune(tune)}
                                            class="w-full px-8 py-4 flex items-center justify-between hover:bg-brand-light transition-colors text-left"
                                        >
                                            <div class="flex flex-col">
                                                <span class="font-bold text-ui-text">{tune.name}</span>
                                                <span class="text-xs text-ui-text-muted uppercase font-black tracking-widest">{tune.type} // {tune.key}</span>
                                            </div>
                                            <span class="text-[10px] font-black text-brand-green-dark">SELECT</span>
                                        </button>
                                    )}
                                </For>
                            </div>
                        </Show>
                    </div>

                    <button
                        onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen())}
                        class={`flex items-center justify-center gap-2 px-6 md:px-8 py-4 md:py-5 rounded-3xl border font-bold transition-all whitespace-nowrap ${isFilterPanelOpen() ? 'bg-ui-text text-ui-surface border-ui-text' : 'bg-ui-surface text-ui-text border-ui-border hover:bg-ui-bg'}`}
                    >
                        <span class="material-symbols-rounded text-xl">tune</span>
                        <span>Filters</span>
                        <span class={`material-symbols-rounded transition-transform duration-300 ${isFilterPanelOpen() ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>
                </div>
            </div>

            {/* Slide-down Filter Panel - Positioned immediately below row */}
            <div class={`filter-panel-transition ${isFilterPanelOpen() ? 'filter-panel-open-tight' : 'filter-panel-closed'}`}>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 md:py-6">
                    <FilterDropdown
                        label="Rhythm"
                        value={typeFilter()}
                        options={rhythmOptions()}
                        onChange={setTypeFilter}
                    />
                    <FilterDropdown
                        label="Key"
                        value={keyFilter()}
                        options={keyOptions()}
                        onChange={setKeyFilter}
                    />
                    <FilterDropdown
                        label="Popularity"
                        value={popularityFilter()}
                        options={popularityTiers}
                        onChange={setPopularityFilter}
                    />
                </div>
            </div>

            {/* Action Button & Mode Switch */}
            <div class="flex flex-col items-center mt-6 md:mt-8 gap-8">

                {/* Status Message Text - Now on top of the button */}
                <div class="flex flex-col items-center gap-3">
                    <p class="text-sm text-brand-green-dark font-black tracking-tight uppercase text-center min-h-[20px] animate__animated animate__fadeIn">
                        {getStatusMessage()}
                    </p>
                    <Show when={seedTune() || searchTerm().length > 0 || typeFilter() !== 'all' || keyFilter() !== 'all' || popularityFilter() !== 'all'}>
                        <button
                            onClick={resetAll}
                            class="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-ui-text-muted hover:text-red-500 transition-colors py-1 px-3 bg-ui-bg rounded-full border border-ui-border/50"
                            title="Reset all filters"
                        >
                            <span class="material-symbols-rounded text-xs">close</span>
                            <span>Clear Selection</span>
                        </button>
                    </Show>
                </div>

                <button
                    disabled={isSpinning()}
                    onClick={handleInitiate}
                    class="btn-primary w-full md:w-auto shadow-brand-glow"
                >
                    <Show when={isSpinning()} fallback={
                        <>
                            <span class="material-symbols-rounded text-3xl">casino</span>
                            <span>Build the set!</span>
                        </>
                    }>
                        <div class="animate-spin size-6 border-4 border-black/20 border-t-black rounded-full"></div>
                        <span>Searching...</span>
                    </Show>
                </button>

                {/* Creative Mode Switch */}
                <div class="flex flex-col items-center gap-3">
                    <div class="flex items-center gap-2">
                        <span class="text-[9px] font-black uppercase tracking-widest text-ui-text/30">Set Cohesion</span>
                        <div class="group relative">
                            <span class="material-symbols-rounded text-sm text-ui-text/20 cursor-help">info</span>
                            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-black text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] font-medium leading-relaxed shadow-xl">
                                Determines how similar the subsequent tunes will be to the current one.
                                <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center bg-ui-bg p-1 rounded-2xl border border-ui-border shadow-sm">
                        <For each={[
                            { id: 'strict', label: 'Strict', tip: 'Maximum cohesion. Similar types and common transitions.' },
                            { id: 'medium', label: 'Medium', tip: 'Balanced variety. Familiar links with occasional surprises.' },
                            { id: 'creative', label: 'Creative', tip: 'Full library. Maximum variety and unexpected combinations.' }
                        ]}>
                            {(mode) => (
                                <div class="group relative">
                                    <button
                                        onClick={() => setCreativeMode(mode.id)}
                                        class={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${creativeMode() === mode.id ? 'bg-ui-surface text-brand-green-dark shadow-sm border border-ui-border' : 'text-ui-text/30 hover:text-ui-text'}`}
                                    >
                                        {mode.label}
                                    </button>
                                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-black text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] font-bold text-center">
                                        {mode.tip}
                                        <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                                    </div>
                                </div>
                            )}
                        </For>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FilterSection;
