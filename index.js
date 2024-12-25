const apiKey = "2TN00XQH65OEDDN0";


const elements = {
    searchInput: document.getElementById('stockSearch'),
    searchBtn: document.getElementById('searchButton'),
    stockInfoContainer: document.getElementById('stockDetails'),
    comparisonTable: document.getElementById('stockTable').getElementsByTagName('tbody')[0],
    chartCanvas: document.getElementById('stockChart').getContext('2d'),
    stockSelectDropdown: document.getElementById('stockDropdown'),
    loadStockBtn: document.getElementById('loadStockButton')
};

let stockChartInstance;


const fetchStockData = async (symbol) => {
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`);
        const data = await response.json();
        console.log(data);
        
        return data['Time Series (Daily)'];
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return null;
    }
};


const fetchTrendingStocks = async () => {
    const mockTrendingStocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'FB', 'NFLX', 'NVDA', 'BABA', 'INTC'];
    return mockTrendingStocks;
};


const populateStockDropdown = async () => {
    const trendingStocks = await fetchTrendingStocks();
    trendingStocks.forEach(stock => {
        const option = document.createElement('option');
        option.value = stock;
        option.text = stock;
        elements.stockSelectDropdown.appendChild(option);
    });
};


const displayStockDetails = (stockData, symbol) => {
    const latestDate = Object.keys(stockData)[0];
    const latestData = stockData[latestDate];
    const currentPrice = latestData['4. close'];
    const volume = latestData['5. volume'];
    const previousClose = stockData[Object.keys(stockData)[1]]['4. close'];
    const priceChange = (currentPrice - previousClose).toFixed(2);

    elements.stockInfoContainer.innerHTML = `
        <h3>${symbol}</h3>
        <p>Price: $${currentPrice}</p>
        <p>Change: $${priceChange}</p>
        <p>Volume: ${volume}</p>
    `;

    updateComparisonTable(symbol, currentPrice, priceChange, volume);
};


const updateComparisonTable = (symbol, price, change, volume) => {
    const newRow = elements.comparisonTable.insertRow();
    newRow.innerHTML = `
        <td>${symbol}</td>
        <td>$${price}</td>
        <td>${change}</td>
        <td>${volume}</td>
    `;
};


const renderStockChart = (stockData) => {
    const dates = Object.keys(stockData).slice(0, 30).reverse();
    const prices = dates.map(date => stockData[date]['4. close']);

    if (stockChartInstance) {
        stockChartInstance.destroy();
    }

    stockChartInstance = new Chart(elements.chartCanvas, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Stock Price',
                data: prices,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: { beginAtZero: true },
                y: { beginAtZero: false }
            }
        }
    });
};

const handleSearchClick = async () => {
    const stockSymbol = elements.searchInput.value.toUpperCase();
    const stockData = await fetchStockData(stockSymbol);
    console.log(stockData);
    
    if (stockData) {
        
        displayStockDetails(stockData, stockSymbol);
        renderStockChart(stockData);
    } else {
        elements.stockInfoContainer.innerHTML = `<p>Stock symbol not found.</p>`;
    }
};


const handleDropdownSelection = async () => {
    const selectedStock = elements.stockSelectDropdown.value;
    const stockData = await fetchStockData(selectedStock);
    
    
    if (stockData) {
        displayStockDetails(stockData, selectedStock);
        renderStockChart(stockData);
    } else {
        elements.stockInfoContainer.innerHTML = `<p>Stock data not available for ${selectedStock}.</p>`;
    }
};


elements.searchBtn.addEventListener('click', handleSearchClick);
elements.loadStockBtn.addEventListener('click', handleDropdownSelection);


const initializePage = async () => {
    await populateStockDropdown();
};


initializePage();
