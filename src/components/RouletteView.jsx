import { createSignal, Show, For, createMemo, createEffect } from 'solid-js';
import { useRouletteStore } from '../store/rouletteStore';
import AudioPlayer from './AudioPlayer';

function PopularityBadge(props) {
    const config = [
        { label: 'Very Popular', class: 'bg-brand-green/20 text-brand-green-dark border-brand-green/30' },
        { label: 'Common', class: 'bg-blue-50 text-blue-600 border-blue-100' },
        { label: 'Rare', class: 'bg-amber-50 text-amber-600 border-amber-100' },
        { label: 'Obscure', class: 'bg-gray-100 text-gray-600 border-gray-200' }
    ];

    const tier = () => props.tier ?? 0;

    return (
        <span class={`text-[8px] md:text-[10px] font-black uppercase tracking-widest px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full border ${config[tier()].class}`}>
            {config[tier()].label}
        </span>
    );
}

function TuneListItem(props) {
    const { getTuneTier, moveTuneInLastSet, removeFromLastSet } = useRouletteStore();
    const tier = createMemo(() => getTuneTier(props.tune));

    return (
        <div class="group flex items-center gap-3 md:gap-6 p-3 md:p-4 rounded-2xl md:rounded-3xl hover:bg-black/5 transition-all animate__animated animate__fadeInUp">
            {/* Play Button */}
            <div class="flex-shrink-0">
                <AudioPlayer
                    abc={props.tune.abc}
                    tuneKey={props.tune.key}
                    tuneType={props.tune.type}
                    isPlaying={props.isPlaying}
                    onToggle={props.onPlayToggle}
                    variant="compact"
                />
            </div>

            {/* Title & Metadata */}
            <div class="flex-grow flex items-center justify-between min-w-0 gap-4">
                <div class="flex flex-col min-w-0">
                    <h4 class="text-base md:text-lg font-bold text-ui-text leading-tight">
                        <a
                            href={`https://thesession.org/tunes/${props.tune.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="hover:text-brand-green-dark transition-colors flex items-center gap-2 group/link max-w-full"
                        >
                            <span class="truncate">{props.tune.name}</span>
                            <span class="material-symbols-rounded text-base transition-opacity translate-y-[1px] flex-shrink-0">open_in_new</span>
                        </a>
                    </h4>
                    <span class="text-[9px] md:text-xs font-black text-ui-text/40 uppercase tracking-widest whitespace-nowrap">
                        {props.tune.type} • {props.tune.key}
                    </span>
                </div>

                <div class="flex-shrink-0 flex flex-col items-end gap-1">
                    <PopularityBadge tier={tier()} />
                    <span class="text-[8px] md:text-[9px] font-black text-ui-text-muted/30 uppercase tracking-widest whitespace-nowrap hidden sm:inline">
                        #{props.tune.globalRank || '????'}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div class="flex items-center gap-1 transition-opacity">
                <div class="flex items-center gap-0.5">
                    <button
                        onClick={() => moveTuneInLastSet(props.index, -1)}
                        class="size-8 rounded-lg hover:bg-ui-bg flex items-center justify-center text-ui-text-muted hover:text-ui-text disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="Move Up"
                        disabled={props.index === 0}
                    >
                        <span class="material-symbols-rounded text-lg">keyboard_arrow_up</span>
                    </button>
                    <button
                        onClick={() => moveTuneInLastSet(props.index, 1)}
                        class="size-8 rounded-lg hover:bg-ui-bg flex items-center justify-center text-ui-text-muted hover:text-ui-text disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="Move Down"
                        disabled={props.isLast}
                    >
                        <span class="material-symbols-rounded text-lg">keyboard_arrow_down</span>
                    </button>
                </div>

                <button
                    onClick={() => removeFromLastSet(props.tune.id)}
                    class="size-9 rounded-full hover:bg-red-50 flex items-center justify-center text-ui-text-muted hover:text-red-500 transition-all ml-1"
                    title="Remove from Set"
                >
                    <span class="material-symbols-rounded text-lg">delete</span>
                </button>
            </div>
        </div>
    );
}

function RouletteView() {
    const {
        isSpinning, lastDrawnSet, drawOneMore, resetDraw,
        currentSetTitle, setCurrentSetTitle, saveCurrentSet, updateCurrentSet, activeSetId
    } = useRouletteStore();
    let titleRef;

    const [playingId, setPlayingId] = createSignal(null);

    createEffect(() => {
        const title = currentSetTitle();
        if (titleRef && titleRef.textContent !== title) {
            titleRef.textContent = title;
        }
    });

    return (
        <div class="w-full flex flex-col gap-8 md:gap-12">
            <Show when={lastDrawnSet().length > 0 || isSpinning()}>
                <div class="flex flex-col gap-4 md:gap-6">
                    <div class="flex items-center justify-between px-2">
                        <div class="flex items-center gap-2 group/title">
                            <span class="material-symbols-rounded text-ui-text/20 text-lg flex-shrink-0">edit</span>
                            <span
                                ref={titleRef}
                                contenteditable
                                onInput={(e) => setCurrentSetTitle(e.currentTarget.textContent)}
                                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                class="text-lg font-black tracking-tight uppercase focus:outline-none focus:border-b-2 border-brand-green/30 px-1 min-w-[1ch] transition-all outline-none cursor-text whitespace-nowrap"
                            />
                            <Show when={lastDrawnSet().length > 0}>
                                <button
                                    onClick={activeSetId() ? updateCurrentSet : saveCurrentSet}
                                    class="size-7 rounded-full bg-brand-green text-white hover:bg-brand-green-dark transition-all flex items-center justify-center flex-shrink-0"
                                    title={activeSetId() ? 'Update set' : 'Save to collection'}
                                >
                                    <span class="material-symbols-rounded text-xl font-black">
                                        {activeSetId() ? 'sync' : 'add'}
                                    </span>
                                </button>
                            </Show>
                        </div>

                        <div class="flex items-center gap-4 animate__animated animate__fadeInUp">
                            <button
                                onClick={resetDraw}
                                disabled={isSpinning()}
                                class="text-xs font-black uppercase tracking-widest text-ui-text/40 hover:text-red-500 transition-colors flex items-center gap-1"
                            >
                                <span class="material-symbols-rounded text-lg">restart_alt</span>
                                <span>Start over</span>
                            </button>
                        </div>
                    </div>

                    <div class="flex flex-col bg-ui-surface/40 p-2 rounded-[32px]">
                        <For each={lastDrawnSet()}>
                            {(tune, index) => (
                                <TuneListItem
                                    tune={tune}
                                    index={index()}
                                    isLast={index() === lastDrawnSet().length - 1}
                                    isPlaying={playingId() === tune.id}
                                    onPlayToggle={(playing) => setPlayingId(playing ? tune.id : null)}
                                />
                            )}
                        </For>



                        <Show when={lastDrawnSet().length > 0}>
                            <div class="p-4 flex justify-center mt-2 animate__animated animate__fadeInUp">
                                <button
                                    onClick={drawOneMore}
                                    disabled={isSpinning()}
                                    class="text-xs font-black uppercase tracking-widest text-brand-green-dark hover:text-black transition-colors flex items-center gap-2 px-6 py-3 rounded-2xl hover:bg-brand-green"
                                >
                                    <span class="material-symbols-rounded text-lg">add</span>
                                    <span>Extend Set</span>
                                </button>
                            </div>
                        </Show>
                    </div>
                </div>
            </Show>

        </div>
    );
}

export default RouletteView;
