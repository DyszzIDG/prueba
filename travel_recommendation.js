const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const resultsContainer = document.getElementById('results-container');

function renderResults(dataArray) {
    resultsContainer.innerHTML = ''; // Clear previous results
    
    dataArray.forEach(item => {
        let timeString = '';
        if (item.timeZone) {
            try {
                // Formatting Local Time requirement for Coursera grading
                const options = { timeZone: item.timeZone, hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' };
                const currentTime = new Date().toLocaleTimeString('en-US', options);
                timeString = `<div class="time-badge">🕒 Local Time: ${currentTime}</div>`;
            } catch(e) {
                console.error("Invalid timezone", item.timeZone);
            }
        }

        const card = document.createElement('div');
        card.classList.add('destination-card');
        
        card.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}" class="destination-img">
            <div class="destination-info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                ${timeString}
                <button class="btn" style="margin-top: 1rem; width: 100%; font-size: 1rem; padding: 0.5rem;">Visit</button>
            </div>
        `;
        resultsContainer.appendChild(card);
    });
}

function handleSearch() {
    const input = document.getElementById('searchInput').value.toLowerCase().trim();
    if (!input) return;

    fetch('travel_recommendation_api.json')
        .then(response => response.json())
        .then(data => {
            let results = [];

            // Pattern Matching based on keywords
            if (input.includes('beach')) {
                results = data.beaches;
            } else if (input.includes('temple')) {
                results = data.temples;
            } else if (input.includes('countr')) {
                // Consolidate all cities from all countries
                data.countries.forEach(country => {
                    results = results.concat(country.cities);
                });
            } else {
                // Secondary check: Exact country name match (e.g. 'japan' or 'brazil')
                const country = data.countries.find(c => c.name.toLowerCase() === input);
                if (country) {
                    results = country.cities;
                }
            }

            if (results.length > 0) {
                renderResults(results);
            } else {
                resultsContainer.innerHTML = `
                    <p style="color:white; font-size:1.2rem; background:rgba(255,0,0,0.8); padding:10px; border-radius:10px; grid-column: 1 / -1; text-align: center;">
                        No recommendations found. Try: "beaches", "temples", or "countries".
                    </p>`;
            }
        })
        .catch(error => {
            console.error('Error fetching destinations:', error);
            resultsContainer.innerHTML = '<p style="color:red; background:white; padding:10px;">Error loading database.</p>';
        });
}

function clearResults() {
    document.getElementById('searchInput').value = '';
    resultsContainer.innerHTML = '';
}

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
clearBtn.addEventListener('click', clearResults);
