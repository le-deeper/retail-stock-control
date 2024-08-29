async function fetchRentPerformance() {
    await fetchPerformance('/revenue/', 'results-rent', 'start-date-revenue', 'end-date-revenue', 'main-loading');
}

async function fetchRentsPerformanceChart() {
    await fetchPerformanceChart('/revenue_chart/', 'sales-rents-canvas',
        'start-date-rents-charts', 'end-date-rents-charts',
        'type-rents-charts', 'label-rents-charts', 'main-loading', 'Bénéfices')
}