import { useRouletteStore } from '../store/rouletteStore';
import { For } from 'solid-js';

function FilterSection() {
    const {
        typeFilter, setTypeFilter,
        keyFilter, setKeyFilter,
        popularityFilter, setPopularityFilter,
        getAvailableTypes, getAvailableKeys,
        spin, isSpinning, initializeAudio, setIsDispatcherOpen
    } = useRouletteStore();

    const handleInitiate = async () => {
        setIsDispatcherOpen(false);
        await initializeAudio();
        await spin();
    };

    return (
        <div class="w-full flex flex-col gap-6">
            <div class="flex flex-col gap-2">
                <label class="text-[9px] font-mono font-black text-terminal-gold uppercase tracking-[0.3em] flex items-center gap-2 opacity-70">
                    <span class="material-symbols-outlined text-xs">category</span>
                    01. TUNE_CLASSIFICATION
                </label>
                <select
                    value={typeFilter()}
                    onInput={(e) => setTypeFilter(e.target.value)}
                    class="bg-terminal-black border border-white/20 rounded-sm px-4 py-3 font-mono font-bold text-terminal-white focus:border-terminal-gold outline-none transition-all appearance-none cursor-pointer w-full text-xs uppercase tracking-[0.2em] shadow-inner"
                >
                    <For each={getAvailableTypes()}>
                        {(type) => <option value={type} class="bg-terminal-black">{type === 'all' ? 'FULL DISPATCH (ALL TYPES)' : type}</option>}
                    </For>
                </select>
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-[9px] font-mono font-black text-terminal-gold uppercase tracking-[0.3em] flex items-center gap-2 opacity-70">
                    <span class="material-symbols-outlined text-xs">analytics</span>
                    02. POPULARITY_TIER
                </label>
                <select
                    value={popularityFilter()}
                    onInput={(e) => setPopularityFilter(e.target.value)}
                    class="bg-terminal-black border border-white/20 rounded-sm px-4 py-3 font-mono font-bold text-terminal-white focus:border-terminal-gold outline-none transition-all appearance-none cursor-pointer w-full text-xs uppercase tracking-[0.2em] shadow-inner"
                >
                    <option value="all" class="bg-terminal-black">UNRESTRICTED ACCESS</option>
                    <option value="very popular" class="bg-terminal-black">CORE REPERTOIRE (TOP 10%)</option>
                    <option value="common" class="bg-terminal-black">STANDARD SELECTION (10-30%)</option>
                    <option value="rare" class="bg-terminal-black">RARE DISCOVERIES (30-60%)</option>
                    <option value="obscure" class="bg-terminal-black">OBSCURE ARCHIVES (+60%)</option>
                </select>
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-[9px] font-mono font-black text-terminal-gold uppercase tracking-[0.3em] flex items-center gap-2 opacity-70">
                    <span class="material-symbols-outlined text-xs">tune</span>
                    03. HARMONIC_KEY
                </label>
                <select
                    value={keyFilter()}
                    onInput={(e) => setKeyFilter(e.target.value)}
                    class="bg-terminal-black border border-white/20 rounded-sm px-4 py-3 font-mono font-bold text-terminal-white focus:border-terminal-gold outline-none transition-all appearance-none cursor-pointer w-full text-xs uppercase tracking-[0.2em] shadow-inner"
                >
                    <For each={getAvailableKeys()}>
                        {(key) => <option value={key} class="bg-terminal-black">{key === 'all' ? 'ALL HARMONIES' : key}</option>}
                    </For>
                </select>
            </div>

            <button
                disabled={isSpinning()}
                onClick={handleInitiate}
                class={`mt-6 w-full group relative py-6 rounded-sm font-mono font-black text-xl transition-all flex items-center justify-center gap-4 overflow-hidden border-2 shadow-[0_0_15px_rgba(255,215,0,0.1)] ${isSpinning()
                    ? 'bg-terminal-black border-white/5 text-terminal-dim cursor-not-allowed'
                    : 'bg-terminal-black border-terminal-gold text-terminal-gold hover:bg-terminal-gold hover:text-black hover:shadow-[0_0_30px_rgba(255,215,0,0.3)]'
                    }`}
            >
                {/* Corner Accents for industrial look */}
                <div class="absolute top-1 left-1 size-1 border-t border-l border-current opacity-40"></div>
                <div class="absolute top-1 right-1 size-1 border-t border-r border-current opacity-40"></div>
                <div class="absolute bottom-1 left-1 size-1 border-b border-l border-current opacity-40"></div>
                <div class="absolute bottom-1 right-1 size-1 border-b border-r border-current opacity-40"></div>

                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-[8px] tracking-[0.3em] font-mono opacity-30 select-none hidden sm:block">
                    SEC-07 // SYS-EXEC
                </div>

                <div class="flex items-center gap-3">
                    <span class={`material-symbols-outlined text-2xl ${isSpinning() ? 'animate-spin' : 'group-hover:translate-x-1 transition-transform'}`}>
                        {isSpinning() ? 'sync' : 'east'}
                    </span>
                    <span class="tracking-[0.2em]">
                        {isSpinning() ? 'BUFFERING STREAM...' : 'CMD > INITIATE DISPATCH'}
                    </span>
                </div>

                <div class="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] tracking-[0.3em] font-mono opacity-30 select-none hidden sm:block">
                    V.2.0.4
                </div>
            </button>
        </div>
    );
}

export default FilterSection;
