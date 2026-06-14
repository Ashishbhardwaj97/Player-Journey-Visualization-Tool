# Implementation Plan: Player Journey Visualization Tool

This document outlines a phase-wise implementation plan for building the Player Journey Visualization Tool, derived from the project constraints in `context.md` and the technical direction in `ARCHITECTURE.md`.

## Phase 1: Data Pre-processing Pipeline
The first phase focuses on converting the raw telemetry Parquet data into static, web-optimized JSON files that the frontend can easily consume.

- **Objective:** Build a Python script (`pipeline.py`) to process the 5 days of production gameplay data.
- **Tasks:**
  - Read Parquet files from `player_data/February_10` to `February_14` using `pandas` and `pyarrow`.
  - Decode the `event` column from bytes to strings.
  - Distinguish humans from bots (UUIDs vs. numeric IDs).
  - Apply the world-to-minimap coordinate mapping (u/v to pixel_x/pixel_y) for the three maps (`AmbroseValley`, `GrandRift`, `Lockdown`).
  - Group the transformed data by `map_id` and `date`.
  - Export the optimized JSON arrays into the frontend's static assets directory (`public/data/`).

## Phase 2: Frontend Setup & Architecture Foundation
The second phase involves scaffolding the web application with the chosen tech stack.

- **Objective:** Initialize the React application and build the foundational component structure.
- **Tasks:**
  - Initialize a new Vite + React + TypeScript project.
  - Set up Tailwind CSS for styling and `lucide-react` for iconography.
  - Organize the `public` folder to serve the `minimaps/` images and the pre-processed `data/` JSON files.
  - Create the base layout (Sidebar for controls, Main area for the map).
  - Implement a basic state management solution (e.g., React Context or Zustand) to handle current Map, Date, Match, and Event filters.

## Phase 3: Visualization Engine (HTML5 Canvas)
The third phase tackles the core technical challenge: rendering high-performance visualizations on top of the minimap.

- **Objective:** Implement the HTML5 Canvas to render player paths and events accurately.
- **Tasks:**
  - Create a responsive `<canvas>` container that scales while preserving the 1024x1024 coordinate system.
  - Draw player movement paths (lines) using `pixel_x` and `pixel_y`.
  - Draw distinct event markers for `Kill`, `Killed`, `Loot`, and `KilledByStorm`.
  - Implement visual distinctions between humans (e.g., solid lines/icons) and bots (e.g., dashed lines/faded icons).
  - Connect the Canvas renderer to the frontend state so it reactively updates when filters change.

## Phase 4: Advanced Features & UX Polish
The fourth phase introduces the interactive features that make the tool useful for Level Designers.

- **Objective:** Build out timeline playback and heatmaps.
- **Tasks:**
  - Implement a **Timeline Slider** that filters the canvas points based on the `ts` (timestamp) property, allowing designers to scrub back and forth through a match.
  - Implement **Heatmap Overlays** (using Canvas or a lightweight library) to visualize high-traffic areas, kill zones, and death zones.
  - Apply a rich, modern design aesthetic with polished UI components.

## Phase 5: Insights & Deployment
The final phase focuses on delivering the final requirements and deploying the tool.

- **Objective:** Analyze the data, write documentation, and deploy.
- **Tasks:**
  - Use the tool to find 3 interesting level design insights and document them in `INSIGHTS.md`.
  - Ensure the repository contains the code, `ARCHITECTURE.md`, and `INSIGHTS.md`.
  - Deploy the static Vite application to Vercel and generate a shareable link.
