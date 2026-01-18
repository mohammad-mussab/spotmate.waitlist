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

    // Refresh count every 30 seconds
    setInterval(getTotalWaitlistCount, 30000);
});
