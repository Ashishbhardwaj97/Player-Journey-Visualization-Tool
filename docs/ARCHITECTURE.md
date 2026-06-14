# Architecture Document: Player Journey Visualization Tool

## 1. Tech Stack & Why It Was Chosen

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | React (Vite) + TypeScript | Vite provides a blazing-fast development environment. React is excellent for building interactive, component-driven UIs. TypeScript ensures type safety, especially useful when dealing with structured telemetry data. |
| **Data Processing** | Python (Pandas / PyArrow) | Parquet files are native to the Python data ecosystem. A pre-processing step is used to clean, combine, and pre-calculate coordinates, outputting web-optimized JSON/CSV files. This avoids complex browser-side Parquet parsing (like DuckDB-WASM) and reduces client payload. |
| **Visualization** | HTML5 `<canvas>` | While SVG is easier to style, Canvas is necessary for performance. Rendering thousands of movement paths and event markers in SVG creates too many DOM nodes and causes lag. Canvas easily handles ~100k points at 60FPS. |
| **Styling & UI** | Tailwind CSS + Lucide Icons | Tailwind allows for rapid, consistent styling without leaving the component. Lucide provides clean, modern icons for the UI and event markers. |
| **Hosting** | Vercel (Static Site) | Since the data is static and pre-processed into JSON assets, the entire application can be hosted as a blazing-fast static site on Vercel without needing a dedicated backend server. |

## 2. Data Flow

1. **Raw Telemetry (Parquet):** Data is stored in daily folders containing Parquet files.
2. **Build-Time Pre-processing (Python Pipeline):** 
   - A Python script (`pipeline.py`) loads all Parquet files.
   - Decodes the `event` byte strings.
   - Separates humans (UUID) from bots (numeric IDs).
   - Applies the coordinate mapping formula to compute `pixel_x` and `pixel_y` upfront, saving client CPU cycles.
   - Groups data by Map and Date, exporting optimized static assets (e.g., `data/AmbroseValley_Feb10.json`).
3. **Client-Side Data Fetching:** When the user selects a Map and Date in the UI, the React app fetches the corresponding static JSON file.
4. **State Management:** React state (or a lightweight store like Zustand) manages active filters: Match ID, Player/Bot visibility, Event type toggles, and the current Timeline slider value.
5. **Rendering Layer:** 
   - **Base:** The 1024x1024 minimap image is rendered.
   - **Canvas Overlay:** The Canvas reads the filtered state and draws player paths (lines) and events (distinct markers/colors) on top of the minimap, mapped precisely to the computed pixel coordinates.

## 3. Coordinate Mapping

Mapping the in-game 3D world coordinates to the 2D minimap image is the most critical part of the rendering pipeline. The minimap images are exactly `1024x1024` pixels. The `y` coordinate (elevation) is ignored for the 2D top-down view.

For a given world coordinate `(x, z)`, the transformation is calculated as follows:

```javascript
// Step 1: Normalize world coordinates to a 0.0 - 1.0 (UV) range using the map's specific scale and origin.
const u = (world_x - map_origin_x) / map_scale;
const v = (world_z - map_origin_z) / map_scale;

// Step 2: Scale up to the 1024x1024 pixel canvas.
const pixel_x = u * 1024;
// Note: Y-axis is inverted because canvas origin (0,0) is top-left, while 3D world Z increases upwards.
const pixel_y = (1 - v) * 1024; 
```

**Map Configurations & Assets (Located in `player_data/minimaps/`):**
- **AmbroseValley:** `origin_x`: -370, `origin_z`: -473, `scale`: 900 (File: `AmbroseValley_Minimap.png`)
- **GrandRift:** `origin_x`: -290, `origin_z`: -290, `scale`: 581 (File: `GrandRift_Minimap.png`)
- **Lockdown:** `origin_x`: -500, `origin_z`: -500, `scale`: 1000 (File: `Lockdown_Minimap.jpg`)

*This calculation is performed during the Python pre-processing step so the frontend only needs to render `(pixel_x, pixel_y)` directly.*

## 4. Assumptions & Handling Ambiguity

- **Static Data Applicability:** I assumed that since the dataset represents a fixed 5-day historical period, dynamically querying a backend API/database is overkill. Serving pre-processed JSON files statically is much faster and simpler.
- **Bot Detection:** The prompt mentions that human `user_id`s are UUIDs and bots are short numeric IDs. I assumed a simple regex or string length check (e.g., length < 10) is sufficient to categorize a player as a bot during pre-processing.
- **Match Timestamps:** The `ts` field represents elapsed time within a match in milliseconds, not wall-clock time. I assumed the timeline slider in the UI should range from `0` to `max(ts)` for the selected match, allowing playback from match start to finish.
- **Canvas Scaling:** The coordinate system yields `pixel_x` and `pixel_y` on a 1024x1024 grid. I assumed the UI will use CSS to scale the `1024x1024` canvas to fit the user's viewport while preserving the aspect ratio, ensuring markers stay perfectly aligned with the map regardless of screen size.

## 5. Major Tradeoffs

| Decision | Alternative Considered | Why This Tradeoff Was Made |
| :--- | :--- | :--- |
| **Pre-processing to JSON** | Using DuckDB-WASM to parse Parquet directly in the browser. | **Speed & Simplicity.** WASM parsing is highly flexible but increases initial bundle size and load time. Pre-processing to JSON makes the web app instantly interactive and simpler to deploy. |
| **HTML5 Canvas** | SVG overlay for paths and markers. | **Performance.** SVG creates a DOM node for every line and point. With up to tens of thousands of points per match, SVG would cause severe lag. Canvas draws pixels directly, allowing smooth 60FPS playback and rendering. |
| **No Dedicated Backend** | FastAPI or Node.js server. | **Hosting Simplicity.** Since there is no live data ingestion required for this 5-day snapshot, a backend server introduces unnecessary deployment complexity and cost. Static hosting (Vercel) is free, fast, and globally distributed. |
| **Filtering by Map/Date vs Full Dataset** | Loading all 5 days at once into memory. | **Memory Management.** To prevent browser crashes on lower-end devices, data is chunked by Map and Date. The user must select a specific date/map to explore, keeping the browser memory footprint small. |
