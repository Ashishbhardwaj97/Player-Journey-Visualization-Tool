# Level Design Insights

Based on the parsed player telemetry data, here are 3 key level design insights:

### 1. The Storm is the Primary Threat to Human Players
Across all maps and matches, there is a striking disparity in player deaths. There were **39 `KilledByStorm` events** compared to only **3 normal `Killed` events** (PvP/PvE deaths) for human players. 
* **Design Implication:** The storm is highly lethal and players are struggling to outrun or navigate out of it. The level designers should consider adjusting the storm's shrink speed, increasing the number of vehicles/mobility items, or making the storm warnings more prominent.

### 2. Map Popularity heavily favors Ambrose Valley
**Ambrose Valley** is overwhelmingly the most active map in the data, accounting for **61,013** (68%) of the total 89,104 tracked events. **Lockdown** accounts for 21,238 events, while **Grand Rift** trails significantly with only 6,853 events.
* **Design Implication:** Players prefer the layout, pacing, or aesthetics of Ambrose Valley. Grand Rift might be suffering from design issues or low matchmaking queue preferences. Developers should investigate what makes Ambrose Valley so successful and apply those learnings to Grand Rift.

### 3. Centralized Looting Hotspots in Ambrose Valley
By dividing Ambrose Valley into a 50x50 coordinate grid, we can identify major looting hotspots. The most active looting zones are located at coordinates **(350, 850)** with 583 events, and **(550, 550)** with 542 events.
* **Design Implication:** These areas are heavily congested with loot spawns and likely serve as early-game drop hotspots. Level designers should ensure these areas have adequate cover and multiple entry/exit points to prevent choke-point frustration, and consider redistributing some high-tier loot to less populated areas to encourage map exploration.
