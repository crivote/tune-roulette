import { createSignal, onMount, onCleanup, createEffect, Show } from 'solid-js';
import abcjs from 'abcjs';
import 'abcjs/abcjs-audio.css';
import { useRouletteStore } from '../store/rouletteStore';

// Utility function to preprocess ABC notation for abcjs
function preprocessABC(abc, key, type) {
    if (!abc) return '';

    // Replace ! symbols with proper line breaks
    let processedAbc = abc.replace(/!/g, '\n');

    const headers = [];
    if (type && !processedAbc.includes('R:')) headers.push(`R:${type}`);
    if (key && !processedAbc.includes('K:')) headers.push(`K:${key}`);

    if (headers.length > 0) {
        processedAbc = headers.join('\n') + '\n' + processedAbc;
    }

    return processedAbc;
}

function AudioPlayer(props) {
    const { audioContext, initializeAudio } = useRouletteStore();
    let synthControl;
    let visualObj;

    const instanceId = Math.random().toString(36).substring(7);

    onCleanup(() => {
        if (synthControl) {
            synthControl.pause();
            synthControl.destroy();
        }
    });

    onMount(() => {
        // Initialize controller on mount
        synthControl = new abcjs.synth.SynthController();
        // Load into the DOM element normally
        synthControl.load(`#audio-player-${instanceId}`, null, {
            displayLoop: false,
            displayRestart: false,
            displayPlay: true,
            displayProgress: true,
            displayWarp: false
        });
    });

    createEffect(() => {
        const rawAbc = props.abc;
        if (!rawAbc || !synthControl) return;

        // Clear previous visual content explicitly
        const container = document.getElementById(`abc-music-container-${instanceId}`);
        if (container) container.innerHTML = '';

        // Stop any current playback immediately
        synthControl.pause();

        const processedAbc = preprocessABC(rawAbc, props.tuneKey, props.tuneType);

        if (!container) return;

        // Render visually to the DOM 
        visualObj = abcjs.renderAbc(container, processedAbc, {
            add_classes: true,
            responsive: 'resize'
        })[0];

        if (!visualObj) return;

        // Initialize audio generation
        const setupAudio = async () => {
            const ac = audioContext();

            // Critical check: Don't try to use a closed or missing context
            if (!ac || ac.state === 'closed') return;

            const midiBuffer = new abcjs.synth.CreateSynth();

            try {
                await midiBuffer.init({
                    visualObj: visualObj,
                    audioContext: ac,
                    options: {
                        chordsOff: true
                    }
                });

                await midiBuffer.prime();

                await synthControl.setTune(visualObj, false, {
                    audioContext: ac
                });

                if (props.isPlaying) {
                    synthControl.play();
                }

            } catch (err) {
                console.error("Audio setup error:", err);
            }
        };

        setupAudio();
    });

    // Watch playing state
    createEffect(() => {
        if (synthControl) {
            if (props.isPlaying) {
                // Seek to start to ensure we don't get stuck at the end
                synthControl.seek(0, "percent");
                synthControl.play();
            } else {
                synthControl.pause();
            }
        }
    });

    const togglePlay = async (e) => {
        e.stopPropagation();
        if (props.onToggle) {
            if (!props.isPlaying) {
                await initializeAudio();
            }
            props.onToggle(!props.isPlaying);
        }
    };

    return (
        <div class={`flex flex-col items-center ${props.minimal ? '' : 'gap-4 w-full'}`}>
            {/* Custom Minimal Control */}
            <Show when={props.minimal}>
                <button
                    onClick={togglePlay}
                    class={`size-8 rounded-full flex items-center justify-center transition-all bg-terminal-gold text-black shadow-terminal-sm hover:scale-105 active:scale-95 ${props.isPlaying ? 'animate-pulse ring-4 ring-terminal-gold/20' : ''}`}
                >
                    <span class="material-symbols-outlined text-lg font-bold">
                        {props.isPlaying ? 'stop' : 'play_arrow'}
                    </span>
                </button>
            </Show>

            {/* Default Controls area - Hidden in minimal mode but required for synth */}
            <div
                id={`audio-player-${instanceId}`}
                class={`w-full max-w-md bg-white/5 border border-white/10 rounded-lg p-2 ${props.minimal ? 'hidden' : ''}`}
                style={{ "min-height": "40px" }}
            ></div>

            {/* Sheet music - Hidden but rendered in DOM for internal calculations */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden' }}>
                <div id={`abc-music-container-${instanceId}`}></div>
            </div>
        </div>
    );
}

export default AudioPlayer;
