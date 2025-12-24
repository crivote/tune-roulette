# 🛫 Tune Terminal: International Trad Exchange

**Tune Terminal** is a high-performance "Airport Flight Board" for traditional folk music. Designed with a dark, industrial aesthetic, it transforms the process of choosing tunes into a cinematic "Triple Dispatch" experience.

---

## �️ Core Architecture: The Flight Board

The heart of the application is a full-width, high-density **Flight Board** that utilizes split-flap animations and a procedural mechanical soundscape to mimic a real airport departures screen.

### 1. Triple Dispatch Protocol
Instead of drawing single tunes, the terminal generates **3-tune sets** per interaction.
*   **The Primary Draw**: The first tune respects all user-defined filters (Type, Popularity, Key).
*   **Automated Set Building**: The 2nd and 3rd tunes are chosen automatically to match the primary's **Tune Type**.
*   **Musical Intelligence**: A specialized algorithm ensures musical coherence by prioritizing matching keys, modal shifts (e.g., G Major to G Mixolydian), and neighboring keys on the circle of fifths.

### 2. High-Density Technical Metadata
The board provides a strictly single-line, professional data grid:
*   **Global Rank**: Every tune displays its 4-digit zero-padded popularity index (e.g., `0042`) calculated from the entire database.
*   **Contracted Gate Codes**: Keys and types are displayed using standardized technical abbreviations (e.g., `REEL`, `JIG`, `A MAJ`, `D MIN`).
*   **Automated History**: Dispatches are automatically archived to the history rows whenever a new spin is initiated, creating a fluid, nonstop terminal experience.

### 3. Integrated Audio Stream
*   **Row-Level Controls**: Every row (History and Active) features a compact, high-tech circular play button.
*   **Procedural Soundscape**: A Web Audio API synthesizer generates a rhythmic "clack-clack-clack" sound effect that synchronizes perfectly with the split-flap character reveal.

---

## 🛠️ Technical Stack

*   **Engine**: [SolidJS](https://www.solidjs.com/) for zero-overhead reactivity.
*   **Audio Architecture**: Web Audio API for procedural mechanical sounds and [abcjs](https://www.abcjs.net/) for MIDI synthesis.
*   **Styling**: Vanilla CSS with a custom "Industrial Terminal" design system.
*   **Data Source**: Comprehensive tune archives from **[TheSession.org](https://thesession.org)**.

---

## 🚀 Terminal Operations

1.  **Initiate Dispatch**: Select your arrival coordinates (Filters) and click `INITIATE DISPATCH` in the popup overlay.
2.  **Staggered Reveal**: Watch the board resolve rhythmic updates row-by-row.
3.  **Broadcast**: Click the play button on any row to preview the tune.
4.  **Archive/Discard**: New dispatches automatically archive the old ones. Use `Discard Set & Redraw` to purge a draw without logging it.

---

*Safe travels through the tradition!* 🍻🛫
