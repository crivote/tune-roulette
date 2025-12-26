import { onMount, Show, For } from 'solid-js';
import { useRouletteStore } from './store/rouletteStore';
import FilterSection from './components/FilterSection';
import RouletteView from './components/RouletteView';

function App() {
    const {
        loadTunes, tunes, currentSet, lastDrawnSet, isSpinning,
        seedAndSpin, removeFromSet, initializeAudio, isResultsClosing,
        isFavorite, toggleFavorite
    } = useRouletteStore();

    onMount(async () => {
        await loadTunes();
    });

    const handleSeedFromHistory = async (tune) => {
        await initializeAudio();
        await seedAndSpin(tune);
    };

    return (
        <div class="bg-ui-bg text-ui-text font-display min-h-screen flex flex-col relative">
            <header class="sticky top-0 z-50 w-full bg-ui-bg/80 backdrop-blur-md">
                <div class="max-w-7xl mx-auto px-6">
                    <div class="flex h-24 items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="flex items-center justify-center size-10 rounded-xl bg-brand-green text-black">
                                <span class="material-symbols-rounded text-2xl font-black">music_note</span>
                            </div>
                            <h1 class="text-xl font-bold tracking-tight">Folk Sets Generator</h1>
                        </div>

                        <nav class="hidden md:flex items-center gap-10">
                            <a href="#" class="text-sm font-bold hover:text-brand-green-dark transition-colors">Home</a>
                            <a href="#" class="text-sm font-bold hover:text-brand-green-dark transition-colors">About</a>
                            <a href="#" class="text-sm font-bold hover:text-brand-green-dark transition-colors">Collections</a>
                            <button class="bg-brand-green text-black px-6 py-2.5 rounded-full font-black text-sm hover:shadow-brand-glow transition-all">Log In</button>
                        </nav>
                    </div>
                </div>
            </header>

            <main class="flex-grow flex flex-col items-center">
                <section class="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center w-full">
                    <h2 class="hero-title text-center">Let's build a set</h2>
                    <p class="hero-subtitle">
                        Pick a <span class="font-bold">starting tune</span> or set the <span class="font-bold">filters</span> to get your set rolling!
                    </p>

                    <Show when={tunes().length > 0} fallback={
                        <div class="flex flex-col items-center py-40 gap-6">
                            <div class="animate-spin size-12 border-4 border-brand-green border-t-transparent rounded-full shadow-brand-glow"></div>
                            <p class="font-bold text-brand-green-dark animate-pulse tracking-tight text-lg">Waking up the library...</p>
                        </div>
                    }>
                        <div class="w-full max-w-4xl glass-card flex flex-col">
                            <div class={`roll-up-transition ${lastDrawnSet().length > 0 || isSpinning() || isResultsClosing() ? 'roll-up-hidden' : 'roll-up-visible'}`}>
                                <div class="p-10 md:p-16 flex flex-col gap-10">
                                    <FilterSection />
                                </div>
                            </div>

                            <Show when={lastDrawnSet().length > 0 || isSpinning() || isResultsClosing()}>
                                <div class={`border-t border-ui-border bg-ui-bg/30 roll-up-transition ${isResultsClosing() ? 'roll-up-hidden' : 'roll-up-visible'}`}>
                                    <div class="p-10 md:p-16">
                                        <RouletteView />
                                    </div>
                                </div>
                            </Show>
                        </div>
                    </Show>
                </section>

                <Show when={currentSet().length > 0}>
                    <section class="w-full max-w-7xl mx-auto px-6 pb-20 animate__animated animate__fadeIn">
                        <div class="flex flex-col gap-8">
                            <div class="flex items-center justify-between border-b border-ui-border pb-4">
                                <h3 class="text-2xl font-black tracking-tight uppercase text-ui-text/20">Previous Tunes</h3>
                                <span class="text-xs font-bold text-ui-text-muted/40 uppercase tracking-widest hidden sm:inline">Click a tune to start a new set from it</span>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <For each={[...currentSet()].reverse()}>
                                    {(tune) => (
                                        <div
                                            onClick={() => handleSeedFromHistory(tune)}
                                            class="bg-ui-surface p-5 rounded-[24px] border border-ui-border hover:border-brand-green hover:shadow-modern-md transition-all cursor-pointer group relative overflow-hidden"
                                        >
                                            <div class="flex flex-col gap-1 min-w-0 pr-12">
                                                <div class="flex items-center gap-2">
                                                    <span class="text-[10px] font-black text-brand-green-dark uppercase tracking-widest truncate">{tune.type} • {tune.key}</span>
                                                    <span class="text-[9px] font-black text-ui-text-muted/30 uppercase tracking-widest whitespace-nowrap">#{tune.globalRank}</span>
                                                </div>
                                                <a
                                                    href={`https://thesession.org/tunes/${tune.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    class="text-sm font-bold text-ui-text hover:text-brand-green-dark transition-colors truncate flex items-center gap-1.5"
                                                >
                                                    {tune.name}
                                                    <span class="material-symbols-rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                                                </a>
                                            </div>

                                            <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(tune.id);
                                                    }}
                                                    class={`size-8 rounded-full flex items-center justify-center transition-all ${isFavorite(tune.id) ? 'text-red-500 bg-red-50' : 'text-ui-text-muted/40 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100'}`}
                                                >
                                                    <span class={`material-symbols-rounded text-xl ${isFavorite(tune.id) ? 'fill-1' : ''}`}>
                                                        favorite
                                                    </span>
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeFromSet(tune.id);
                                                    }}
                                                    class="size-8 rounded-full hover:bg-red-50 text-ui-text-muted/40 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                                                >
                                                    <span class="material-symbols-rounded text-lg">close</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </div>
                    </section>
                </Show>
            </main>

            <footer class="w-full bg-ui-bg py-12">
                <div class="max-w-7xl mx-auto px-6 flex flex-col items-center gap-4">
                    <p class="text-sm text-ui-text-muted font-medium">
                        Need inspiration? <span class="text-brand-green-dark underline cursor-pointer">Browse the full library</span> of over 5,000 tunes.
                    </p>
                    <div class="text-[10px] text-ui-text-muted/50 font-bold uppercase tracking-widest mt-8">
                        &copy; 2025 TradSystems Inc. // Tune Roulette V3.0
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
