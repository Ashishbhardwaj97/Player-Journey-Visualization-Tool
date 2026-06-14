const fs = require('fs'); const data = JSON.parse(fs.readFileSync('public/data/AmbroseValley_February_10.json')); const events = new Set(data.map(d => d.event)); console.log(Array.from(events));
