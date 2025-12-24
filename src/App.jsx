import { onMount, Show } from 'solid-js';
import { useRouletteStore } from './store/rouletteStore';
import FilterSection from './components/FilterSection';
import RouletteView from './components/RouletteView';

function App() {
    const { loadTunes, tunes, isDispatcherOpen, resetDraw, setIsDispatcherOpen, lastDrawnSet, isSpinning } = useRouletteStore();

    onMount(async () => {
        await loadTunes();
    });

    return (
        <div class="bg-terminal-black text-terminal-white font-display min-h-screen flex flex-col relative overflow-hidden">
            {/* Terminal Background Effect */}
            <div class="absolute inset-0 pointer-events-none opacity-20">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#444,transparent)]"></div>
            </div>

            <header class="sticky top-0 z-50 w-full border-b border-white/5 bg-terminal-black/80 backdrop-blur-xl">
                <div class="max-w-[1800px] mx-auto px-4 sm:px-10">
                    <div class="flex h-20 items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="flex items-center justify-center size-10 rounded bg-terminal-gold text-black shadow-terminal-sm">
                                <span class="material-symbols-outlined text-[28px] font-bold">connecting_airports</span>
                            </div>
                            <div>
                                <h1 class="text-xl font-black uppercase tracking-[0.2em] text-terminal-gold">Tune Terminal</h1>
                                <p class="text-[10px] font-mono text-terminal-dim uppercase tracking-[0.3em]">International Trad Exchange</p>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <Show when={lastDrawnSet().length > 0 && !isSpinning()}>
                                <button
                                    onClick={() => { resetDraw(); setIsDispatcherOpen(true); }}
                                    class="group relative size-10 rounded-full border border-terminal-gold/20 flex items-center justify-center hover:bg-terminal-gold/10 hover:border-terminal-gold transition-all shadow-[0_0_15px_rgba(255,215,0,0.05)]"
                                >
                                    <span class="material-symbols-outlined text-terminal-gold text-xl group-hover:rotate-180 transition-transform duration-500">settings_input_component</span>

                                    {/* Technical Tooltip */}
                                    <div class="absolute top-full mt-2 right-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                                        <div class="bg-black border border-terminal-gold/40 px-3 py-1.5 rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                                            <div class="flex items-center gap-2">
                                                <div class="size-1 bg-terminal-gold animate-pulse"></div>
                                                <span class="text-[9px] font-mono text-terminal-gold uppercase tracking-[0.2em]">Discard set & start new draw</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </Show>
                            <Show when={lastDrawnSet().length === 0 || isSpinning()}>
                                <div class="hidden md:flex flex-col items-end font-mono text-[10px] text-terminal-dim tracking-widest leading-none">
                                    <span>TERMINAL STATUS: ONLINE</span>
                                    <span class="text-terminal-gold/50">DATA LINK: ESTABLISHED</span>
                                </div>
                            </Show>
                        </div>
                    </div>
                </div>
            </header>

            <main class="flex-grow p-2 sm:p-4 lg:p-10 flex flex-col items-center relative">
                <div class="w-full max-w-[1800px] flex flex-col items-center">
                    <Show when={tunes().length > 0} fallback={
                        <div class="flex flex-col items-center py-40 gap-6">
                            <div class="animate-spin size-16 border-4 border-terminal-gold border-t-transparent rounded-full shadow-[0_0_20px_rgba(255,215,0,0.2)]"></div>
                            <p class="font-mono text-terminal-gold animate-pulse tracking-widest uppercase text-sm">Synchronizing Database...</p>
                        </div>
                    }>
                        {/* Main Roulette View (Full Width) - Now contains the multi-row board */}
                        <RouletteView />

                        {/* Dispatcher Popup Overlay */}
                        <Show when={isDispatcherOpen()}>
                            <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-black/60 animate__animated animate__fadeIn">
                                <div class="w-full max-w-lg bg-[#050505] p-6 sm:p-10 border border-terminal-gold/30 shadow-[0_0_100px_rgba(0,0,0,0.9)] animate-grows relative overflow-hidden rounded-sm">
                                    {/* Industrial Corner Accents */}
                                    <div class="absolute top-0 left-0 size-8 border-t-2 border-l-2 border-terminal-gold/40"></div>
                                    <div class="absolute top-0 right-0 size-8 border-t-2 border-r-2 border-terminal-gold/40"></div>
                                    <div class="absolute bottom-0 left-0 size-8 border-b-2 border-l-2 border-terminal-gold/40"></div>
                                    <div class="absolute bottom-0 right-0 size-8 border-b-2 border-r-2 border-terminal-gold/40"></div>

                                    <div class="absolute top-4 right-12 text-[8px] font-mono text-terminal-gold/20 tracking-widest hidden sm:block">
                                        REF-ID: 88-ALPHA-9
                                    </div>

                                    <div class="flex items-center justify-between mb-8 border-b border-terminal-gold/10 pb-6">
                                        <div class="flex flex-col">
                                            <h2 class="text-3xl font-black text-terminal-gold uppercase tracking-[0.1em]">
                                                Flight Dispatch
                                            </h2>
                                            <div class="flex items-center gap-2 mt-1">
                                                <div class="size-1.5 rounded-full bg-terminal-gold animate-pulse"></div>
                                                <span class="text-[9px] font-mono text-terminal-dim uppercase tracking-[0.3em]">Protocol Override Active</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="relative mb-8 pl-4 border-l-2 border-terminal-gold/20">
                                        <p class="text-xs text-terminal-white/50 leading-relaxed font-mono uppercase tracking-wider">
                                            Select categories and harmonic targets to initiate a synchronized set dispatch.
                                        </p>
                                    </div>

                                    <FilterSection />
                                </div>
                            </div>
                        </Show>
                    </Show>
                </div>
            </main>

            <footer class="w-full border-t border-white/5 bg-terminal-black/90 py-8 relative">
                <div class="max-w-[1800px] mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div class="font-mono text-[10px] text-terminal-dim uppercase tracking-[0.2em]">
                        &copy; 2025 TradSystems Inc. // Tune Terminal Beta // Local Time: {new Date().toLocaleTimeString()}
                    </div>

                    <div class="flex gap-8 text-[10px] font-mono text-terminal-dim uppercase tracking-widest">
                        <a href="https://thesession.org" target="_blank" rel="noopener noreferrer" class="hover:text-terminal-gold transition-colors">archives</a>
                        <a href="https://abcjs.net" target="_blank" rel="noopener noreferrer" class="hover:text-terminal-gold transition-colors">decoder</a>
                        <span class="text-terminal-white/20">v2.0.4-release</span>
                    </div>
                </div>

                {/* Visual scanline effect */}
                <div class="absolute top-0 left-0 w-full h-[1px] bg-terminal-gold/10 shadow-[0_0_10px_rgba(255,215,0,0.2)]"></div>
            </footer>
        </div>
    );
}

export default App;
