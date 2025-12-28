import { Show } from 'solid-js';

function AboutView() {
    return (
        <div class="w-full max-w-4xl mx-auto px-4 md:px-0 py-8 md:py-20 animate__animated animate__fadeIn">
            <div class="glass-card md:rounded-[40px] rounded-3xl p-8 md:p-16 flex flex-col gap-12 border border-ui-border">
                {/* Header section */}
                <div class="flex flex-col gap-4">
                    <h2 class="text-4xl md:text-5xl font-black tracking-tight uppercase text-ui-text">
                        About <span class="text-brand-green-dark">Tune Roulette</span>
                    </h2>
                    <p class="text-lg text-ui-text-muted font-medium max-w-2xl leading-relaxed">
                        Your companion for building, practicing, and performing authentic Irish traditional music sets.
                    </p>
                </div>

                {/* Workflow Section */}
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="flex flex-col gap-4 p-6 rounded-3xl bg-ui-bg/50 border border-ui-border">
                        <div class="size-12 rounded-2xl bg-brand-green text-black flex items-center justify-center font-black text-xl">1</div>
                        <h3 class="text-xl font-black uppercase text-ui-text">Draw</h3>
                        <p class="text-sm font-medium text-ui-text-muted leading-relaxed">
                            Pick a starting tune or use the filters to generate a new set. Our algorithm ensures musical cohesion between tunes.
                        </p>
                    </div>
                    <div class="flex flex-col gap-4 p-6 rounded-3xl bg-ui-bg/50 border border-ui-border">
                        <div class="size-12 rounded-2xl bg-brand-green text-black flex items-center justify-center font-black text-xl">2</div>
                        <h3 class="text-xl font-black uppercase text-ui-text">Refine</h3>
                        <p class="text-sm font-medium text-ui-text-muted leading-relaxed">
                            Extend your set with matching tunes, reorder them, or discard what doesn't fit your style.
                        </p>
                    </div>
                    <div class="flex flex-col gap-4 p-6 rounded-3xl bg-ui-bg/50 border border-ui-border">
                        <div class="size-12 rounded-2xl bg-brand-green text-black flex items-center justify-center font-black text-xl">3</div>
                        <h3 class="text-xl font-black uppercase text-ui-text">Save</h3>
                        <p class="text-sm font-medium text-ui-text-muted leading-relaxed">
                            Save your perfect sets to your personal collection. Keep them organized and ready for your next session.
                        </p>
                    </div>
                </div>

                {/* Data Source Section */}
                <div class="pt-8 border-t border-ui-border flex flex-col md:flex-row gap-8 items-center">
                    <div class="size-20 rounded-[32px] bg-ui-bg flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-rounded text-4xl text-brand-green-dark">database</span>
                    </div>
                    <div class="flex flex-col gap-2 text-center md:text-left">
                        <h4 class="text-lg font-black uppercase text-ui-text">Authentic Source Data</h4>
                        <p class="text-sm font-medium text-ui-text-muted leading-relaxed">
                            The library powering Tune Roulette is sourced from the <span class="font-bold text-ui-text">top 1,500 tunes</span> indexed by <a href="https://thesession.org" target="_blank" class="text-brand-green-dark underline hover:opacity-80 transition-opacity">TheSession.org</a>, the definitive community database for traditional music.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutView;
