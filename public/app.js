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
    bitcoinChart = createChart('bitcoinChart', 'Bitcoin Price', '#a15bfa', []); // Purple
    ethereumChart = createChart('ethereumChart', 'Ethereum Price', '#8a41e8', []); // Darker purple
    dogecoinChart = createChart('dogecoinChart', 'Dogecoin Price', '#c27ff9', []); // Lighter purple
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
        maintainAspectRatio: false,
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
    document.querySelector('.sign-in')?.addEventListener('click', () => {
        alert('Sign in functionality would be implemented here.');
    });

    document.querySelector('.subscribe-form')?.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;

        if (email) {
            try {
                const res = await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await res.json();
                alert(data.message);
                this.reset();
            } catch (error) {
                alert('Subscription failed.');
            }
        } else {
            alert('Please enter a valid email address.');
        }
    });

    document.querySelector('.btn.primary')?.addEventListener('click', () => {
        alert('Get started functionality would be implemented here.');
    });
}

async function fetchCryptoData() {
    try {
        const res = await fetch('/api/prices');
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
    
    // Update charts with the generated static data
    updateStaticChart(bitcoinChart, btcData, hourLabels);
    updateStaticChart(ethereumChart, ethData, hourLabels);
    updateStaticChart(dogecoinChart, dogeData, hourLabels);
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
    const cardElems = document.querySelectorAll('.crypto-card .price');
    
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

    if (cardElems.length >= 3) {
        cardElems[0].textContent = formatINR(data.bitcoin.inr);
        cardElems[1].textContent = formatINR(data.ethereum.inr);
        cardElems[2].textContent = formatINR(data.dogecoin.inr);
    }
}

async function fetchLatestNews() {
    try {
        const res = await fetch('/api/news');
        const newsData = await res.json();
        
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
    }
}

function processCryptoNews(newsItems, cardClass) {
    // Get top 2 news from each cryptocurrency
    return newsItems.slice(0, 2).map(item => {
        return {
            title: item.title,
            description: item.description || 'No description available.',
            source: item.source,
            url: item.url,
            image: item.urlToImage || 'default-news.jpg',
            coinType: item.coinType,
            cardClass: cardClass
        };
    });
}

function updateNewsCards(news) {
    const container = document.querySelector('.news-cards');
    if (!container) return;

    container.innerHTML = ''; // Clear existing cards

    news.forEach(item => {
        const card = document.createElement('div');
        card.className = `news-card ${item.cardClass}`;

        card.innerHTML = `
            <div class="news-icon">
                <img src="${item.image}" alt="News">
            </div>
            <div class="tag">${item.coinType.charAt(0).toUpperCase() + item.coinType.slice(1)}</div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <a href="${item.url}" target="_blank" class="read-more">Read more →</a>
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
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => observer.observe(section));
}

// Smooth scroll
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.getElementById(this.getAttribute('href').substring(1));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});