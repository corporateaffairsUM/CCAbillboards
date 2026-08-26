const fs = require('fs');
const path = require('path');

const apiKey = process.env.IQAIR_KEY;
const lat = 3.1209;
const lon = 101.6534;

async function fetchAQI() {
    try {
        console.log('🔄 Fetching IQAir AQI data...');
        const url = `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error(`❌ HTTP error! status: ${response.status}`);
            // If we get a 429, we'll still try to keep the old file, but we'll log.
            return;
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            const aqi = data.data.current.pollution.aqius;
            const timestamp = data.data.current.pollution.ts;
            
            const result = {
                aqi: aqi,
                timestamp: timestamp,
                updatedAt: new Date().toISOString()
            };
            
            const filePath = path.join(process.env.GITHUB_WORKSPACE || '.', 'aqi.json');
            fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
            console.log(`✅ AQI data updated! AQI: ${aqi}, Timestamp: ${timestamp}`);
        } else {
            console.error('❌ API returned error:', data.data?.message || 'Unknown error');
        }
    } catch (error) {
        console.error('❌ Failed to fetch AQI:', error.message);
    }
}

fetchAQI();