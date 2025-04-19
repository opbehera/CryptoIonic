// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    initCharts();
    setupEventListeners();
    fetchCryptoData();
    fetchLatestNews();
    startLivePriceUpdates();
    setupMobileNavigation();
    setupScrollAnimations();
});

// Initialize charts
let bitcoinChart, ethereumChart, dogecoinChart;
const MAX_DATA_POINTS = 7;

function initCharts() {
    bitcoinChart = createChart('bitcoinChart', 'Bitcoin Price', '#4e54ff', [42000, 45000, 48000, 51000, 49000, 53000, 58324]);
    ethereumChart = createChart('ethereumChart', 'Ethereum Price', '#6b3eff', [1400, 1600, 1800, 1700, 1900, 2000, 2115]);
    dogecoinChart = createChart('dogecoinChart', 'Dogecoin Price', '#ff8c38', [0.14, 0.15, 0.17, 0.19, 0.18, 0.21, 0.23]);
}

function createChart(id, label, borderColor, data) {
    const ctx = document.getElementById(id).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: generateInitialLabels(data.length),
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

function generateInitialLabels(count) {
    const now = new Date();
    return Array.from({ length: count }, (_, i) => {
        const date = new Date(now.getTime() - (count - i - 1) * 60000); // minute intervals
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            x: { display: false },
            y: { display: false }
        }
    };
}

function setupEventListeners() {
    document.querySelector('.sign-in')?.addEventListener('click', () => {
        alert('Sign in functionality would be implemented here.');
    });

    document.querySelector('.subscribe-form')?.addEventListener('submit', async function(e) {
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
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
    }
}

function updatePriceDisplay(data) {
    document.querySelector('.crypto-card:nth-child(1) .price').textContent = `$${data.bitcoin.usd.toLocaleString()}`;
    document.querySelector('.crypto-card:nth-child(2) .price').textContent = `$${data.ethereum.usd.toLocaleString()}`;
    document.querySelector('.crypto-card:nth-child(3) .price').textContent = `$${data.dogecoin.usd.toLocaleString()}`;
}

function startLivePriceUpdates() {
    setInterval(() => {
        const cards = document.querySelectorAll('.crypto-card .price');
        const prices = Array.from(cards).map(card =>
            parseFloat(card.textContent.replace('$', '').replace(',', ''))
        );

        const changes = prices.map(() => (Math.random() * 2 - 1) * 0.5); // random change between -0.5 and +0.5
        prices.forEach((price, i) => {
            const newPrice = Math.max(price + changes[i], 0); // avoid negative prices
            cards[i].textContent = `$${newPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
        });
        

        updateCharts(changes[0] > 0, changes[1] > 0, changes[2] > 0);
    }, 30000);
}

function updateCharts(btcUp, ethUp, dogeUp) {
    const updateChart = (chart, up) => {
        const dataset = chart.data.datasets[0];
        const labels = chart.data.labels;
        const last = dataset.data[dataset.data.length - 1];
        const newVal = parseFloat((last + ((Math.random() * 2 - 1) * 0.5)).toFixed(2)); // ±0.5 change
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (dataset.data.length >= MAX_DATA_POINTS) {
            dataset.data.shift();
            labels.shift();
        }

        dataset.data.push(parseFloat(newVal.toFixed(2)));
        labels.push(timestamp);
        chart.update();
    };

    updateChart(bitcoinChart, btcUp);
    updateChart(ethereumChart, ethUp);
    updateChart(dogecoinChart, dogeUp);
}

async function fetchLatestNews() {
    try {
        const res = await fetch('/api/news');
        const news = await res.json();
        updateNewsCards(news);
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}
function updateNewsCards(news) {
    const container = document.querySelector('.dynamic-news-container');
    if (!container) return;

    container.innerHTML = ''; // Clear existing cards

    news.forEach(item => {
        const card = document.createElement('div');
        card.className = 'news-card';

        card.innerHTML = `
            <div class="news-icon">
                <img src="${item.image || 'default-news.jpg'}" alt="News">
            </div>
            <div class="tag">${item.source}</div>
            <h3>${item.title}</h3>
            <p>${item.description || 'No description available.'}</p>
            <a href="${item.url}" target="_blank" class="read-more">Read more →</a>
        `;

        container.appendChild(card);
    });
}

function setupMobileNavigation() {
    // Implement toggle logic if needed
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
    link.addEventListener('click', function(e) {
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
