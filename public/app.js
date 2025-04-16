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
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label,
                data,
                borderColor,
                backgroundColor: `${borderColor}1A`, // 10% transparent
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
            x: { display: false },
            y: { display: false }
        }
    };
}

function setupEventListeners() {
    document.querySelector('.sign-in').addEventListener('click', () => {
        alert('Sign in functionality would be implemented here.');
    });

    document.querySelector('.subscribe-form').addEventListener('submit', async function(e) {
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

    document.querySelector('.btn.primary').addEventListener('click', () => {
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

        const changes = prices.map(p => p * (Math.random() * 0.04 - 0.02));
        prices.forEach((price, i) => {
            const newPrice = price + changes[i];
            cards[i].textContent = `$${newPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
        });

        updateCharts(changes[0] > 0, changes[1] > 0, changes[2] > 0);
    }, 30000);
}

function updateCharts(btcUp, ethUp, dogeUp) {
    const updateChart = (chart, up) => {
        const data = chart.data.datasets[0].data;
        const last = data[data.length - 1];
        const change = up ? last * (1 + Math.random() * 0.01) : last * (1 - Math.random() * 0.01);
        data.shift();
        data.push(change);
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
    const cards = document.querySelectorAll('.news-card');
    if (cards.length === news.length) {
        news.forEach((item, i) => {
            const card = cards[i];
            card.querySelector('h3').textContent = item.title;
            card.querySelector('p').textContent = item.summary;
            card.querySelector('.tag').textContent = item.category;
            card.className = `news-card ${item.color}`;
        });
    }
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
