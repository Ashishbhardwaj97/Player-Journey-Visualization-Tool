# Project Context: Player Journey Visualization Tool

## Background & Problem Statement
At LILA Games, the Level Design team needs a way to understand how players navigate their maps in "LILA BLACK", an extraction shooter game. Currently, they only have raw telemetry data and lack an easy way to visualize player movements, combat locations, deaths to the storm, and map traversal patterns.

## The Task
Build and deploy a web-based visualization tool that allows a Level Designer to explore and analyze player behavior on different maps.

## Requirements
- **Core Features:**
  - Load and parse provided Parquet data.
  - Display player journeys on the correct minimap by mapping world coordinates to 2D minimap images.
  - Visually distinguish between human players and bots.
  - Show different event types (kills, deaths, loot, storm deaths) using distinct markers.
  - Allow filtering by map, date, and/or match.
  - Implement a timeline/playback feature to watch matches unfold over time.
  - Provide heatmap overlays showing kill zones, death zones, or high-traffic areas.
- **Deployment:** The tool must be hosted and accessible via a shareable link.
- **Deliverables:** A GitHub repository containing the code, an `ARCHITECTURE.md` file explaining the tech stack and data flow, and an `INSIGHTS.md` file detailing three things learned from the data.

## The Data (`player_data`)
- **Format:** Apache Parquet format files (without a `.parquet` extension, named as `{user_id}_{match_id}.nakama-0`). Each file represents one player's (or bot's) journey through one match.
- **Scope:** 5 days of production gameplay data (Feb 10 - 14, 2026), comprising ~1,243 files, ~89,000 event rows, 339 unique players, and 796 unique matches.
- **Schema:**
  - `user_id` (string): UUID for humans, numeric ID for bots.
  - `match_id` (string): Match identifier.
  - `map_id` (string): `AmbroseValley`, `GrandRift`, or `Lockdown`.
  - `x`, `y`, `z` (float32): World coordinates (`y` is elevation, `x` and `z` are used for 2D mapping).
  - `ts` (timestamp ms): Time elapsed within the match.
  - `event` (bytes): Event type (needs decoding).
- **Event Types:**
  - *Movement:* `Position`, `BotPosition`
  - *Combat:* `Kill`, `Killed`, `BotKill`, `BotKilled`
  - *Environment:* `KilledByStorm`
  - *Item:* `Loot`

## Map Information & Coordinate Mapping
- **Minimaps:** 1024x1024 pixel images for `AmbroseValley`, `GrandRift`, and `Lockdown`.
- **Coordinate Conversion:** World coordinates `(x, z)` must be mapped to the 2D minimap using specific map configurations:
  - **AmbroseValley:** Scale=900, Origin=(-370, -473)
  - **GrandRift:** Scale=581, Origin=(-290, -290)
  - **Lockdown:** Scale=1000, Origin=(-500, -500)
- **Conversion Formula:**
  - `u = (x - origin_x) / scale`
  - `v = (z - origin_z) / scale`
  - `pixel_x = u * 1024`
  - `pixel_y = (1 - v) * 1024` (Y is flipped)

## Tech Stack & Architecture
- **Tech Stack:** Not prescribed. Use whatever stack allows for fast, polished delivery (e.g., React, Next.js, Vite, Streamlit, etc.).
- **Design:** No mockups provided. Focus on a UX suitable for Level Designers (not data scientists).
- **Constraints:** Timeline is roughly 10-15 hours of focused work. Quality over quantity. Use AI tools as needed.
