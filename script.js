// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);

// DOM Elements
const form = document.getElementById('waitlistForm');
const countrySelect = document.getElementById('country');
const citySelect = document.getElementById('city');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const totalCountElement = document.getElementById('totalCount');

// City Progress Elements
const citySearchSelect = document.getElementById('citySearch');
const cityProgressDisplay = document.getElementById('cityProgressDisplay');
const selectedCityName = document.getElementById('selectedCityName');
const currentCount = document.getElementById('currentCount');
const progressBar = document.getElementById('progressBar');
const progressPercentage = document.getElementById('progressPercentage');
const progressMessage = document.getElementById('progressMessage');
const leaderboardList = document.getElementById('leaderboardList');

// State
let countries = [];
let selectedCountryCode = '';

// Utility Functions
function showLoading(show) {
    submitBtn.disabled = show;
    btnText.style.display = show ? 'none' : 'block';
    btnLoader.style.display = show ? 'block' : 'none';
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

function showSuccess(cityName, cityCount) {
    form.style.display = 'none';
    errorMessage.style.display = 'none';
    successMessage.style.display = 'block';
    document.getElementById('userCity').textContent = cityName;
    document.getElementById('cityCount').textContent = cityCount;
}

// API Functions
async function fetchCountries() {
    try {
        const response = await fetch(`${CONFIG.countryStateApi.baseUrl}/countries`, {
            headers: {
                'X-CSCAPI-KEY': CONFIG.countryStateApi.key
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load countries');
        }

        const data = await response.json();
        countries = data.sort((a, b) => a.name.localeCompare(b.name));

        // Populate country dropdown
        countrySelect.innerHTML = '<option value="">Select your country</option>';
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.iso2;
            option.textContent = `${country.emoji} ${country.name}`;
            option.dataset.name = country.name;
            countrySelect.appendChild(option);
        });

        // Set Pakistan as default
        const pakistanOption = Array.from(countrySelect.options).find(opt => opt.value === 'PK');
        if (pakistanOption) {
            countrySelect.value = 'PK';
            selectedCountryCode = 'PK';
            await loadCities('PK');
        }
    } catch (error) {
        console.error('Error loading countries:', error);
        showError('Failed to load countries. Please refresh the page.');
    }
}

async function loadCities(countryCode) {
    citySelect.disabled = true;
    citySelect.innerHTML = '<option value="">Loading cities...</option>';

    try {
        const response = await fetch(
            `${CONFIG.countryStateApi.baseUrl}/countries/${countryCode}/cities`,
            {
                headers: {
                    'X-CSCAPI-KEY': CONFIG.countryStateApi.key
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to load cities');
        }

        const cities = await response.json();
        cities.sort((a, b) => a.name.localeCompare(b.name));

        citySelect.innerHTML = '<option value="">Select your city</option>';
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.name;
            option.textContent = city.name;
            citySelect.appendChild(option);
        });

        citySelect.disabled = false;
    } catch (error) {
        console.error('Error loading cities:', error);
        citySelect.innerHTML = '<option value="">Failed to load cities</option>';
        showError('Failed to load cities. Please try again.');
    }
}

async function getTotalWaitlistCount() {
    try {
        const { count, error } = await supabaseClient
            .from('waitlist')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;

        totalCountElement.textContent = count ? count.toLocaleString() : '0';
    } catch (error) {
        console.error('Error getting count:', error);
        totalCountElement.textContent = '0';
    }
}

async function getCityWaitlistCount(city) {
    try {
        const { count, error } = await supabaseClient
            .from('waitlist')
            .select('*', { count: 'exact', head: true })
            .eq('city', city);

        if (error) throw error;

        return count || 0;
    } catch (error) {
        console.error('Error getting city count:', error);
        return 0;
    }
}

// City Progress Functions
async function loadCitiesWithSignups() {
    try {
        // Get all unique cities with their counts
        const { data, error } = await supabaseClient
            .from('waitlist')
            .select('city, country_name');

        if (error) throw error;

        // Count signups per city
        const cityMap = new Map();
        data.forEach(entry => {
            const key = `${entry.city}, ${entry.country_name}`;
            cityMap.set(key, (cityMap.get(key) || 0) + 1);
        });

        // Convert to array and sort alphabetically
        const cities = Array.from(cityMap.entries())
            .map(([cityCountry, count]) => {
                const [city, country] = cityCountry.split(', ');
                return { city, country, count };
            })
            .sort((a, b) => a.city.localeCompare(b.city));

        // Populate dropdown
        citySearchSelect.innerHTML = '<option value="">Select a city</option>';
        cities.forEach(item => {
            const option = document.createElement('option');
            option.value = JSON.stringify({ city: item.city, country: item.country });
            option.textContent = `${item.city}, ${item.country}`;
            citySearchSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading cities:', error);
        citySearchSelect.innerHTML = '<option value="">Failed to load cities</option>';
    }
}

async function showCityProgress(city, country) {
    try {
        const count = await getCityWaitlistCount(city);
        const percentage = Math.min((count / 1000) * 100, 100);
        const remaining = Math.max(1000 - count, 0);

        // Update display
        selectedCityName.textContent = city;
        currentCount.textContent = count.toLocaleString();

        // Animate progress bar
        setTimeout(() => {
            progressBar.style.width = `${percentage}%`;
            progressPercentage.textContent = `${Math.round(percentage)}%`;
        }, 100);

        // Update message based on progress
        if (count >= 1000) {
            progressMessage.textContent = '🎉 This city is ready to launch!';
            progressMessage.classList.add('close');
        } else if (count >= 900) {
            progressMessage.textContent = `🔥 Only ${remaining.toLocaleString()} more signups to unlock!`;
            progressMessage.classList.add('close');
        } else if (count >= 500) {
            progressMessage.textContent = `Halfway there! ${remaining.toLocaleString()} more to go.`;
            progressMessage.classList.remove('close');
        } else {
            progressMessage.textContent = `${remaining.toLocaleString()} signups needed to unlock this city.`;
            progressMessage.classList.remove('close');
        }

        // Show display
        cityProgressDisplay.style.display = 'block';

    } catch (error) {
        console.error('Error showing city progress:', error);
    }
}

async function loadLeaderboard() {
    try {
        leaderboardList.innerHTML = '<div class="leaderboard-loading">Loading leaderboard...</div>';

        // Get all cities with counts
        const { data, error } = await supabaseClient
            .from('waitlist')
            .select('city, country_name');

        if (error) throw error;

        // Count signups per city
        const cityMap = new Map();
        data.forEach(entry => {
            const key = `${entry.city}|||${entry.country_name}`;
            cityMap.set(key, (cityMap.get(key) || 0) + 1);
        });

        // Convert to array and sort by count
        const cities = Array.from(cityMap.entries())
            .map(([key, count]) => {
                const [city, country] = key.split('|||');
                return { city, country, count };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 3); // Top 3

        if (cities.length === 0) {
            leaderboardList.innerHTML = '<div class="leaderboard-loading">No cities yet. Be the first!</div>';
            return;
        }

        // Render leaderboard
        const medals = ['🥇', '🥈', '🥉'];
        leaderboardList.innerHTML = '';

        cities.forEach((city, index) => {
            const item = document.createElement('div');
            item.className = `leaderboard-item rank-${index + 1}`;
            item.innerHTML = `
                <div class="rank-badge">${medals[index]}</div>
                <div class="city-info">
                    <div class="city-name">${city.city}</div>
                    <div class="city-country">${city.country}</div>
                </div>
                <div class="signup-count">${city.count.toLocaleString()}</div>
            `;
            leaderboardList.appendChild(item);
        });

    } catch (error) {
        console.error('Error loading leaderboard:', error);
        leaderboardList.innerHTML = '<div class="leaderboard-loading">Failed to load leaderboard</div>';
    }
}

async function submitWaitlist(formData) {
    showLoading(true);
    errorMessage.style.display = 'none';

    try {
        // Check if email already exists
        const { data: existingUser, error: checkError } = await supabaseClient
            .from('waitlist')
            .select('email')
            .eq('email', formData.email.toLowerCase())
            .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        if (existingUser) {
            showError('This email is already on the waitlist!');
            showLoading(false);
            return;
        }

        // Insert new waitlist entry
        const { error: insertError } = await supabaseClient
            .from('waitlist')
            .insert([
                {
                    name: formData.name.trim(),
                    email: formData.email.toLowerCase().trim(),
                    whatsapp_number: formData.whatsapp,
                    country: formData.countryCode,
                    country_name: formData.countryName,
                    city: formData.city.trim(),
                    area: formData.area.trim(),
                    created_at: new Date().toISOString()
                }
            ]);

        if (insertError) throw insertError;

        // Get updated city count
        const cityCount = await getCityWaitlistCount(formData.city);

        // Update total count
        await getTotalWaitlistCount();

        // Refresh city progress and leaderboard
        await loadCitiesWithSignups();
        await loadLeaderboard();

        // Show success
        showSuccess(formData.city, cityCount);

    } catch (error) {
        console.error('Error submitting waitlist:', error);
        showError('Something went wrong. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Event Listeners
countrySelect.addEventListener('change', async (e) => {
    selectedCountryCode = e.target.value;
    if (selectedCountryCode) {
        await loadCities(selectedCountryCode);
    } else {
        citySelect.innerHTML = '<option value="">Select a country first</option>';
        citySelect.disabled = true;
    }
});

// City Progress Event Listener
citySearchSelect.addEventListener('change', async (e) => {
    if (!e.target.value) {
        cityProgressDisplay.style.display = 'none';
        return;
    }

    try {
        const { city, country } = JSON.parse(e.target.value);
        await showCityProgress(city, country);
    } catch (error) {
        console.error('Error parsing city selection:', error);
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const whatsappInput = document.getElementById('whatsapp').value.trim();
    const phoneCountryCode = document.getElementById('phoneCountryCode').value;

    // Build WhatsApp number if provided
    let whatsappNumber = null;
    if (whatsappInput) {
        // Remove any non-digit characters
        const cleanNumber = whatsappInput.replace(/\D/g, '');
        if (cleanNumber.length >= 10 && cleanNumber.length <= 15) {
            whatsappNumber = phoneCountryCode + cleanNumber;
        }
    }

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        whatsapp: whatsappNumber,
        countryCode: selectedCountryCode,
        countryName: countrySelect.options[countrySelect.selectedIndex].dataset.name,
        city: document.getElementById('city').value,
        area: document.getElementById('area').value
    };

    // Validation
    if (!formData.name || !formData.email || !formData.countryCode || !formData.city || !formData.area) {
        showError('Please fill in all required fields.');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showError('Please enter a valid email address.');
        return;
    }

    // WhatsApp validation (if provided)
    if (whatsappInput && !whatsappNumber) {
        showError('Please enter a valid phone number (10-15 digits).');
        return;
    }

    await submitWaitlist(formData);
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await fetchCountries();
    await getTotalWaitlistCount();

    // Load city progress section
    await loadCitiesWithSignups();
    await loadLeaderboard();

    // Refresh counts and leaderboard every 30 seconds
    setInterval(async () => {
        await getTotalWaitlistCount();
        await loadLeaderboard();
    }, 30000);
});
