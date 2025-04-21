// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function () {
    initCharts();
    setupEventListeners();
    fetchCryptoData();
    fetchLatestNews();
    setupMobileNavigation();
    setupScrollAnimations();
});

// Initialize charts
let bitcoinChart, ethereumChart, dogecoinChart;
const MAX_DATA_POINTS = 12; // Reasonable number of data points for a static chart

function initCharts() {
    const bitcoinCanvas = document.getElementById('bitcoinChart');
    const ethereumCanvas = document.getElementById('ethereumChart');
    const dogecoinCanvas = document.getElementById('dogecoinChart');
    
    if (bitcoinCanvas && ethereumCanvas && dogecoinCanvas) {
        bitcoinChart = createChart('bitcoinChart', 'Bitcoin Price', '#a15bfa', []); // Purple
        ethereumChart = createChart('ethereumChart', 'Ethereum Price', '#8a41e8', []); // Darker purple
        dogecoinChart = createChart('dogecoinChart', 'Dogecoin Price', '#c27ff9', []); // Lighter purple
    } else {
        console.warn('One or more chart canvases not found');
    }
}

function createChart(id, label, borderColor, data) {
    const ctx = document.getElementById(id).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label,
                data,
                borderColor,
                backgroundColor: `${borderColor}1A`,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: getChartOptions()
    });
}

function getChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: true, // Ensure the chart maintains a square aspect ratio
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: '#141b2d',
                titleColor: '#fff',
                bodyColor: '#8b8fa3',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 10,
                displayColors: false
            }
        },
        layout: {
            padding: 10 // Add padding to ensure the chart fits within the page
        },
        scales: {
            x: { 
                display: false,
                grid: {
                    display: true
                },
                ticks: {
                    color: '#8b8fa3',
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 5
                }
            },
            y: {
                display: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: '#8b8fa3',
                    callback: function (value) {
                        return '₹' + value.toLocaleString('en-IN');
                    }
                }
            }
        }
    };
}

function setupEventListeners() {
    // Optional chaining for sign-in button
    const signInButton = document.querySelector('.sign-in');
    if (signInButton) {
        signInButton.addEventListener('click', () => {
            alert('Sign in functionality would be implemented here.');
        });
    }

    // Optional chaining for subscribe form
    const subscribeForm = document.querySelector('.subscribe-form');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;

            if (email) {
                try {
                    // In this demo, we'll just show a success message
                    // In a real implementation, this would be connected to your server
                    alert(`Subscription successful for ${email}!`);
                    this.reset();
                } catch (error) {
                    alert('Subscription failed. Please try again later.');
                }
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }

    // Optional chaining for primary button
    const primaryButton = document.querySelector('.btn.primary');
    if (primaryButton) {
        primaryButton.addEventListener('click', () => {
            alert('Get started functionality would be implemented here.');
        });
    }
}

async function fetchCryptoData() {
    try {
        // Get the API base URL relative to the current page
        const apiBaseUrl = window.location.origin;
        const res = await fetch(`${apiBaseUrl}/api/prices`);
        
        if (!res.ok) {
            throw new Error(`Failed to fetch prices: ${res.status}`);
        }
        
        const data = await res.json();
        updatePriceDisplay(data);
        
        // Load static chart data based on current prices
        loadStaticChartData(data);
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
        // Use fallback data if API fails
        const fallbackData = {
            bitcoin: { inr: 5000000 }, // Example values
            ethereum: { inr: 300000 },
            dogecoin: { inr: 5000 }
        };
        
        updatePriceDisplay(fallbackData);
        loadStaticChartData(fallbackData);
    }
}

function loadStaticChartData(priceData) {
    // Create static data points that represent recent historical data
    const now = new Date();
    const hourLabels = [];
    
    // Create labels for the last MAX_DATA_POINTS hours
    for (let i = MAX_DATA_POINTS - 1; i >= 0; i--) {
        const time = new Date(now);
        time.setHours(time.getHours() - i);
        hourLabels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
    
    // Generate realistic static data for Bitcoin
    const btcBasePrice = priceData.bitcoin.inr;
    const btcData = generateStaticPriceData(btcBasePrice);
    
    // Generate realistic static data for Ethereum
    const ethBasePrice = priceData.ethereum.inr;
    const ethData = generateStaticPriceData(ethBasePrice);
    
    // Generate realistic static data for Dogecoin
    const dogeBasePrice = priceData.dogecoin.inr;
    const dogeData = generateStaticPriceData(dogeBasePrice);
    
    // Update charts with the generated static data if they exist
    if (bitcoinChart) updateStaticChart(bitcoinChart, btcData, hourLabels);
    if (ethereumChart) updateStaticChart(ethereumChart, ethData, hourLabels);
    if (dogecoinChart) updateStaticChart(dogecoinChart, dogeData, hourLabels);
}

function generateStaticPriceData(basePrice) {
    const data = [];
    let currentPrice = basePrice;
    
    // Generate prices that fluctuate around the base price
    for (let i = 0; i < MAX_DATA_POINTS; i++) {
        // Create realistic price fluctuations (both up and down)
        const volatility = basePrice < 1000 ? 0.03 : (basePrice < 100000 ? 0.02 : 0.01);
        const changePercent = (Math.random() - 0.5) * volatility * 2;
        
        // Apply the change percentage
        currentPrice = currentPrice * (1 + changePercent);
        
        // Ensure we don't get too far from the base price
        if (i > 0 && Math.abs(currentPrice - basePrice) / basePrice > 0.1) {
            // Reset closer to base price if we've drifted too far
            currentPrice = basePrice * (1 + (currentPrice > basePrice ? 0.08 : -0.08));
        }
        
        data.push(parseFloat(currentPrice.toFixed(2)));
    }
    
    return data;
}

function updateStaticChart(chart, priceData, labels) {
    // Set the complete static data to the chart
    chart.data.labels = labels;
    chart.data.datasets[0].data = priceData;
    chart.update();
}

function updatePriceDisplay(data) {
    // Check if data contains the required properties
    if (!data || !data.bitcoin || !data.ethereum || !data.dogecoin) {
        console.error('Invalid price data format');
        return;
    }

    const bitcoinPrice = document.getElementById('bitcoin-price');
    const ethereumPrice = document.getElementById('ethereum-price');
    const dogecoinPrice = document.getElementById('dogecoin-price');
    
    // Format changes for INR
    const formatINR = (value) => {
        // Format with Indian thousand/lakh/crore system
        if (value >= 10000000) { // 1 crore = 10,000,000
            return `₹${(value / 10000000).toFixed(2)} Cr`;
        } else if (value >= 100000) { // 1 lakh = 100,000
            return `₹${(value / 100000).toFixed(2)} L`;
        } else {
            return `₹${value.toLocaleString('en-IN')}`;
        }
    };

    // Update price elements if they exist
    if (bitcoinPrice) bitcoinPrice.textContent = formatINR(data.bitcoin.inr);
    if (ethereumPrice) ethereumPrice.textContent = formatINR(data.ethereum.inr);
    if (dogecoinPrice) dogecoinPrice.textContent = formatINR(data.dogecoin.inr);
}

async function fetchLatestNews() {
    try {
        const apiBaseUrl = window.location.origin;
        const res = await fetch(`${apiBaseUrl}/api/news`);
        
        if (!res.ok) {
            throw new Error(`Failed to fetch news: ${res.status}`);
        }
        
        const newsData = await res.json();
        
        // Check if all required properties exist
        if (!newsData.bitcoin || !newsData.ethereum || !newsData.dogecoin) {
            throw new Error('Invalid news data format');
        }
        
        // Process all three cryptocurrency news categories
        const allNews = [
            ...processCryptoNews(newsData.bitcoin, 'blue'),
            ...processCryptoNews(newsData.ethereum, 'purple'),
            ...processCryptoNews(newsData.dogecoin, 'orange')
        ];
        
        // Limit to 6 news total for display
        updateNewsCards(allNews.slice(0, 6));
    } catch (error) {
        console.error('Error fetching news:', error);
        // Display fallback message in news container
        const container = document.querySelector('.dynamic-news-container');
        if (container) {
            container.innerHTML = '<p class="news-error">Unable to load news. Please try again later.</p>';
        }
    }
}

function processCryptoNews(newsItems, cardClass) {
    if (!Array.isArray(newsItems)) {
        return [];
    }
    
    // Get top 2 news from each cryptocurrency
    return newsItems.slice(0, 2).map(item => {
        return {
            title: item.title || 'No title available',
            description: item.description || 'No description available.',
            source: item.source || 'Unknown Source',
            url: item.url || '#',
            image: item.urlToImage || './assets/news-placeholder.jpg',
            coinType: item.coinType || 'cryptocurrency',
            cardClass: cardClass
        };
    });
}

function updateNewsCards(news) {
    const container = document.querySelector('.dynamic-news-container');
    if (!container) return;

    container.innerHTML = ''; // Clear existing cards

    if (news.length === 0) {
        container.innerHTML = '<p class="no-news">No news available at the moment.</p>';
        return;
    }

    news.forEach(item => {
        // Truncate long titles and descriptions
        const truncatedTitle = item.title.length > 60 ? 
            item.title.substring(0, 60) + '...' : 
            item.title;
            
        const truncatedDesc = item.description && item.description.length > 120 ? 
            item.description.substring(0, 120) + '...' : 
            item.description;

        const card = document.createElement('div');
        card.className = 'news-card';
        card.innerHTML = `
            <div class="news-image">
                <img src="${item.image}" alt="${truncatedTitle}" onerror="this.src='./assets/news-placeholder.jpg';">
                <span class="news-tag ${item.cardClass}">${item.coinType.charAt(0).toUpperCase() + item.coinType.slice(1)}</span>
            </div>
            <div class="news-content">
                <h3 class="news-title">${truncatedTitle}</h3>
                <p class="news-description">${truncatedDesc}</p>
                <a href="${item.url}" target="_blank" class="read-more">Read more →</a>
            </div>
        `;

        container.appendChild(card);
    });
}

function setupMobileNavigation() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('nav ul');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
}

function setupScrollAnimations() {
    if ('IntersectionObserver' in window) {
        const sections = document.querySelectorAll('section');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(section => observer.observe(section));
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('animate');
        });
    }
}

// Improve smooth scroll functionality
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for header height
                    behavior: 'smooth'
                });
                
                // Update URL without page reload
                history.pushState(null, null, `#${targetId}`);
                
                // Close mobile menu if open
                const navMenu = document.querySelector('nav ul');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
                    if (mobileMenuToggle) {
                        mobileMenuToggle.classList.remove('active');
                    }
                }
            }
        });
    });
});