import { createSignal, Show, For, createEffect, onCleanup } from 'solid-js';
import { useRouletteStore } from '../store/rouletteStore';
import AudioPlayer from './AudioPlayer';

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -'";

const TUNE_TYPE_MAP = {
    'hornpipe': 'HRNP',
    'reel': 'REEL',
    'jig': 'JIG',
    'slip jig': 'SLPJ',
    'polka': 'POLK',
    'mazurka': 'MZKA',
    'strathspey': 'STRH',
    'barn dance': 'BARN',
    'waltz': 'WALZ',
    'slide': 'SLID',
    'carol': 'CARL',
    'march': 'MRCH',
    'flings': 'FLNG'
};

const KEY_MODE_MAP = {
    'major': 'MAJ',
    'minor': 'MIN',
    'mixolydian': 'MIX',
    'dorian': 'DOR',
    'aeolian': 'AEO',
    'phrygian': 'PHR',
    'lydian': 'LYD'
};

function contractTuneType(type) {
    if (!type) return '----';
    const lowerType = type.toLowerCase();
    return TUNE_TYPE_MAP[lowerType] || type.substring(0, 4).toUpperCase();
}

function contractKey(keyStr) {
    if (!keyStr) return '----';
    let contracted = keyStr;
    Object.entries(KEY_MODE_MAP).forEach(([full, short]) => {
        contracted = contracted.replace(full, short);
    });
    // Ensure one space between note and mode
    return contracted.trim().replace(/\s+/g, ' ');
}

function FlightBoardChar(props) {
    const [char, setChar] = createSignal(' ');

    createEffect(() => {
        if (props.isSpinning) {
            const interval = setInterval(() => {
                setChar(CHARS[Math.floor(Math.random() * CHARS.length)]);
            }, 100);
            onCleanup(() => clearInterval(interval));
        } else {
            setChar(props.targetChar || ' ');
        }
    });

    return (
        <div
            class={`flight-board-char ${props.isSpinning ? 'animate-flap' : ''} ${props.variant === 'eggshell' ? 'variant-eggshell' : ''} ${props.targetChar === ' ' && !props.isSpinning ? 'char-space' : ''}`}
        >
            {char()}
        </div>
    );
}

function FlightBoardLine(props) {
    const formatValue = (val, len) => {
        const raw = (val || '').toString().toUpperCase();
        if (raw.length > len) {
            return raw.substring(0, len - 3) + '...';
        }
        return raw.padEnd(len, ' ');
    };

    return (
        <div
            class={`grid grid-cols-[32px_54px_1fr_54px_54px] sm:grid-cols-[40px_60px_1fr_60px_60px] gap-2 sm:gap-8 lg:gap-12 items-center w-full px-2 sm:px-6 lg:px-12 py-1 whitespace-nowrap overflow-hidden transition-colors group ${props.onClick ? 'cursor-pointer hover:bg-terminal-eggshell/5' : ''}`}
            title={props.text && props.text.length > 35 ? props.text : undefined}
            onClick={props.onClick}
        >
            {/* Audio Control Lead / Special Icon */}
            <div class="size-10 flex items-center justify-start relative">
                <Show when={props.isPlusIcon} fallback={
                    <>
                        <Show when={props.tune && !props.isSpinning}>
                            {/* Removal Button (Visible on Hover - to the right of play) */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    props.onRemove?.();
                                }}
                                class="absolute left-12 opacity-0 group-hover:opacity-100 transition-opacity size-8 flex items-center justify-center rounded-full bg-red-600 text-black shadow-lg hover:bg-red-500 hover:scale-110 active:scale-90 z-20"
                                title="Remove Line"
                            >
                                <span class="material-symbols-outlined text-lg font-black">close</span>
                            </button>

                            <AudioPlayer
                                abc={props.tune.abc}
                                tuneKey={props.tune.key}
                                tuneType={props.tune.type}
                                isPlaying={props.isPlaying}
                                onToggle={props.onPlayToggle}
                                minimal={true}
                            />
                        </Show>

                        <Show when={!props.tune && !props.isSpinning}>
                            <div class="size-2 ml-3 rounded-full bg-terminal-dim/20"></div>
                        </Show>
                        <Show when={props.isSpinning}>
                            <div class="size-4 ml-2 animate-spin border-2 border-terminal-gold/30 border-t-terminal-gold rounded-full"></div>
                        </Show>
                    </>
                }>
                    <div class="size-6 ml-1 flex items-center justify-center rounded-full border border-terminal-eggshell/40 text-terminal-eggshell/60 hover:border-terminal-eggshell hover:text-terminal-eggshell transition-all shadow-[0_0_10px_rgba(240,234,214,0.2)]">
                        <span class="material-symbols-outlined text-sm font-bold">add</span>
                    </div>
                </Show>
            </div>

            {/* Rank Column */}
            <div class="flex gap-[1px] justify-start">
                <For each={formatValue(props.rank, 4).split('').slice(0, 4)}>
                    {(char) => <FlightBoardChar targetChar={char} isSpinning={props.isSpinning} variant={props.variant} />}
                </For>
            </div>

            {/* Destination Column */}
            <div class="flex gap-[1px] justify-start overflow-hidden relative group/title">
                <For each={formatValue(props.text, 35).split('').slice(0, 35)}>
                    {(char) => <FlightBoardChar targetChar={char} isSpinning={props.isSpinning} variant={props.variant} />}
                </For>

                {/* External Link to The Session (Visible on Hover) */}
                <Show when={props.tune && !props.isSpinning}>
                    <a
                        href={`https://thesession.org/tunes/${props.tune.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="ml-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center size-8 rounded-full border border-terminal-gold/20 text-terminal-gold/60 hover:bg-terminal-gold/10 hover:text-terminal-gold z-20"
                        title="View on The Session"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span class="material-symbols-outlined text-[18px]">open_in_new</span>
                    </a>
                </Show>
            </div>

            {/* Type Column */}
            <div class="flex gap-[1px] justify-start">
                <For each={formatValue(props.type, 4).split('').slice(0, 4)}>
                    {(char) => <FlightBoardChar targetChar={char} isSpinning={props.isSpinning} variant={props.variant} />}
                </For>
            </div>

            {/* Gate Column */}
            <div class="flex gap-[1px] justify-start">
                <For each={formatValue(props.key, 4).split('').slice(0, 4)}>
                    {(char) => <FlightBoardChar targetChar={char} isSpinning={props.isSpinning} variant={props.variant} />}
                </For>
            </div>
        </div>
    );
}

function FlightBoardHeaderLabel(props) {
    return (
        <div class={`flex items-end pb-1 ${props.className || 'justify-start'}`}>
            <span class="text-[8px] sm:text-[10px] font-black text-white uppercase tracking-[0.1em] sm:tracking-[0.2em] select-none [text-shadow:0_0_8px_rgba(255,255,255,0.6)] font-sans">
                {props.label}
            </span>
        </div>
    );
}

function RouletteView() {
    const { isSpinning, lastDrawnSet, resetDraw, setIsDispatcherOpen, currentSet, removeFromSet, removeFromLastSet, playClickSound, drawOneMore } = useRouletteStore();
    const [playingId, setPlayingId] = createSignal(null);
    const [settledCount, setSettledCount] = createSignal(0);

    // Mechanical Sound Loop
    createEffect(() => {
        if (isSpinning()) {
            const audioInterval = setInterval(() => {
                playClickSound();
            }, 100);
            onCleanup(() => clearInterval(audioInterval));
        }
    });

    // Reset playing state if set is cleared
    createEffect(() => {
        if (lastDrawnSet().length === 0) {
            setPlayingId(null);
        }
    });

    // Precise Staggered Reveal Logic
    createEffect(() => {
        const setLength = lastDrawnSet().length;
        if (isSpinning() && setLength > 0) {
            // Check if this is a fresh set (size 3) or an expansion
            if (setLength === 3 && settledCount() !== 0) {
                // Fresh dispatch: Reset and sequence 1-3
                setSettledCount(0);
                const t1 = setTimeout(() => setSettledCount(1), 1500);
                const t2 = setTimeout(() => setSettledCount(2), 2500);
                const t3 = setTimeout(() => setSettledCount(3), 3500);
                onCleanup(() => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); });
            } else if (setLength > 3 && settledCount() < setLength) {
                // Expanding Dispatch: We are adding row 'setLength'
                // Row setLength-1 is already settled (settledCount was at least setLength-1)
                const t = setTimeout(() => setSettledCount(setLength), 1500);
                onCleanup(() => clearTimeout(t));
            }
        } else if (!isSpinning()) {
            // When terminal shuts down, sync settledCount to total rows
            setSettledCount(setLength);
        }
    });

    const handleOpenDispatcher = () => {
        setPlayingId(null);
        setIsDispatcherOpen(true);
    };

    const historyLines = () => {
        const set = [...currentSet()].reverse();
        return set.slice(0, 4);
    };

    return (
        <div class="w-full flex flex-col items-center p-4 bg-black/90 rounded-lg sm:rounded-2xl">
            <div class="w-full max-w-[1200px] bg-[#080808] p-3 sm:p-6 lg:p-10  shadow-terminal-lg border border-white/5 mb-2 sm:mb-10 overflow-hidden relative">
                {/* Header Labels */}
                <div class="grid grid-cols-[32px_54px_1fr_54px_54px] rounded-md sm:grid-cols-[40px_60px_1fr_60px_60px] gap-2 sm:gap-8 lg:gap-12 px-2 sm:px-6 lg:px-12 border-b border-terminal-gold/20 mt-4">
                    <div class="w-[32px] sm:w-[40px]"></div> {/* AUD Column Space (Matches Row exactly) */}
                    <FlightBoardHeaderLabel label="RANK" />
                    <FlightBoardHeaderLabel label="TUNE" />
                    <FlightBoardHeaderLabel label="RYTHM" />
                    <FlightBoardHeaderLabel label="KEY" />
                </div>


                {/* Logged Dispatches (History) */}
                <For each={historyLines()}>
                    {(tune) => (
                        <div class="group relative opacity-40 hover:opacity-100 transition-opacity">
                            <FlightBoardLine
                                tune={tune}
                                rank={tune.globalRank}
                                text={tune.name}
                                type={contractTuneType(tune.type)}
                                key={contractKey(tune.key)}
                                isSpinning={false}
                                isPlaying={playingId() === tune.id}
                                onPlayToggle={(playing) => setPlayingId(playing ? tune.id : null)}
                                onRemove={() => removeFromSet(tune.id)}
                            />
                        </div>
                    )}
                </For>

                {/* Current Active Draw Set */}
                <div class="pt-4 border-t border-white/5 space-y-1">
                    <Show when={lastDrawnSet().length > 0 || isSpinning()} fallback={
                        <FlightBoardLine
                            text="AWAITING DISPATCH COORDINATES"
                            type=""
                            key=""
                            rank=""
                            isSpinning={false}
                        />
                    }>
                        <For each={lastDrawnSet()}>
                            {(tune, index) => (
                                <FlightBoardLine
                                    tune={tune}
                                    rank={tune.globalRank}
                                    text={tune.name}
                                    type={contractTuneType(tune.type)}
                                    key={contractKey(tune.key)}
                                    isSpinning={isSpinning() && settledCount() < index() + 1}
                                    isPlaying={playingId() === tune.id}
                                    onPlayToggle={(playing) => setPlayingId(playing ? tune.id : null)}
                                    onRemove={() => removeFromLastSet(tune.id)}
                                />
                            )}
                        </For>

                        {/* "Add One More" Row / Spinning Placeholder for Expansion */}
                        <Show when={lastDrawnSet().length > 0}>
                            <Show when={!isSpinning()} fallback={
                                /* Only show spinning placeholder if we are currently expanding (length > previous settled) */
                                <Show when={settledCount() < lastDrawnSet().length}>
                                    <FlightBoardLine
                                        text="INITIALIZING NEXT STREAM..."
                                        rank="----"
                                        type="----"
                                        key="----"
                                        isSpinning={true}
                                    />
                                </Show>
                            }>
                                <FlightBoardLine
                                    text="ADD ONE MORE"
                                    rank="----"
                                    type="----"
                                    key="----"
                                    isSpinning={false}
                                    isPlusIcon={true}
                                    variant="eggshell"
                                    onClick={drawOneMore}
                                />
                            </Show>
                        </Show>

                        {/* Placeholder rows during initial transition if data not yet chosen */}
                        <Show when={isSpinning() && lastDrawnSet().length === 0}>
                            <For each={[...Array(3)]}>
                                {(tune, index) => (
                                    <FlightBoardLine
                                        text=""
                                        type=""
                                        key=""
                                        rank=""
                                        isSpinning={true}
                                    />
                                )}
                            </For>
                        </Show>
                    </Show>
                </div>

                {/* Action Area (Compact) */}
                <div class="min-h-[60px] flex flex-col items-center justify-center mt-4">
                    <Show when={lastDrawnSet().length === 0 && !isSpinning()}>
                        <div class="flex flex-col items-center gap-4 py-4">
                            <span class="text-terminal-dim/40 font-mono text-[9px] animate-pulse tracking-[0.4em] uppercase">
                                Terminal Offline // Awaiting Dispatch Parameters
                            </span>
                            <button
                                onClick={handleOpenDispatcher}
                                class="px-6 py-2 rounded-sm border border-terminal-gold/20 text-terminal-gold/60 font-mono text-[9px] uppercase tracking-[0.3em] hover:bg-terminal-gold/5 transition-all"
                            >
                                [ OPEN DISPATCHER ]
                            </button>
                        </div>
                    </Show>

                    <Show when={isSpinning()}>
                        <div class="py-4">
                            <span class="text-terminal-gold/40 font-mono text-[9px] animate-pulse tracking-[0.6em] uppercase">
                                Synchronizing Regional Streams...
                            </span>
                        </div>
                    </Show>
                </div>

                <div class="absolute bottom-4 right-10 text-[9px] font-mono text-terminal-gold/10 uppercase tracking-[1em]">
                    Terminal Sector 7G // Security Level 4 // Encrypted Link
                </div>
            </div>
        </div>
    );
}

export default RouletteView;
