async function fetchPerformance(url, id, start_date_id, end_date_id, loading_id) {
    const startDate = document.getElementById(start_date_id).value;
    const endDate = document.getElementById(end_date_id).value;

    if (!checkInputs(startDate, endDate)) return
    const data = {
        year_start: new Date(startDate).getFullYear(),
        month_start: new Date(startDate).getMonth() + 1,
        day_start: new Date(startDate).getDate(),
        year_end: new Date(endDate).getFullYear(),
        month_end: new Date(endDate).getMonth() + 1,
        day_end: new Date(endDate).getDate()
    }
    sendRequest(url, data, loading_id, 'POST').then(responseData => {
        document.getElementById(id).textContent = `${responseData.result} ${currency}`;
    })
}

async function fetchPerformanceChart(url, canvasId, start_date_id, end_date_id,
                                     type_chart_id, labelTypeId, loading_id, chartTitle, isXDate = true,
                                     ...postData) {
    const startDate = document.getElementById(start_date_id).value;
    const endDate = document.getElementById(end_date_id).value;
    const chartType = document.getElementById(type_chart_id).value;
    if (!checkInputs(startDate, endDate)) return;

    const data = {
        year_start: new Date(startDate).getFullYear(),
        month_start: new Date(startDate).getMonth() + 1,
        day_start: new Date(startDate).getDate(),
        year_end: new Date(endDate).getFullYear(),
        month_end: new Date(endDate).getMonth() + 1,
        day_end: new Date(endDate).getDate()
    }

    for (let i = 0; i < postData.length; i += 2) {
        data[postData[i]] = postData[i + 1];
    }

    sendRequest(url, data, loading_id, 'POST').then(responseData => {
        showPopup('Chargement des données...', false)
        display_hide(loading_id, 'main-loading')
        const salesData = responseData.result;

        const labels = [];
        const groupedData = {};
        const data = [];


        if (isXDate) {
            const labelGroup = document.getElementById(labelTypeId).value;
            for (const year of Object.keys(salesData).sort()) {
                for (const month of Object.keys(salesData[year]).sort()) {
                    for (const day of Object.keys(salesData[year][month]).sort()) {
                        if (labelGroup === 'day') {
                            labels.push(`${day}/${month}/${year}`);
                            data.push(salesData[year][month][day]);
                        }
                        else if (labelGroup === 'month') {
                            // labels.push(`${months[month - 1]} ${year}`);
                            // data.push(salesData[year][month][day]);
                            groupedData[`${months[month - 1]} ${year}`] =
                                groupedData[`${months[month - 1]} ${year}`] ?
                                    groupedData[`${months[month - 1]} ${year}`] + parseFloat(salesData[year][month][day])
                                    : parseFloat(salesData[year][month][day]);
                        }
                        else if (labelGroup === 'year') {
                            // labels.push(year);
                            // data.push(salesData[year][month][day]);
                            groupedData[year] =
                                groupedData[year] ?
                                    groupedData[year] + parseFloat(salesData[year][month][day])
                                    : parseFloat(salesData[year][month][day]);
                        }
                    }
                }
            }
            if (labelGroup === 'month' || labelGroup === 'year') {
                sortedDataKeys = []
                if (labelGroup === 'month') {
                    sortedDataKeys = Object.keys(groupedData).sort((a, b) => {
                        const dateA = a.split(" ")
                        const dateB = b.split(" ")
                        const monthA = months.indexOf(dateA[0])
                        const monthB = months.indexOf(dateB[0])

                        return parseInt(dateA[1]) - parseInt(dateB[1]) || monthA - monthB
                    })
                }
                else {
                    sortedDataKeys = Object.keys(groupedData).sort()
                }
                for (const key of sortedDataKeys) {
                    labels.push(key);
                    data.push(groupedData[key]);
                }
            }
        }
        else {
            for (const key of Object.keys(salesData).sort()) {
                labels.push(key);
                data.push(salesData[key]);
            }
        }

        displayChart(canvasId, data, labels, chartTitle, chartType);
        display_hide(loading_id, 'main-loading')
        return responseData
    })
}

async function fetchSalesPerformance() {
    await fetchPerformance('/sales/', 'results-sales', 'start-date-sales', 'end-date-sales', 'main-loading');
}

async function fetchSalesPerformanceChart() {
    await fetchPerformanceChart('/sales_chart/', 'sales-perfs-canvas',
        'start-date-perfs-charts', 'end-date-perfs-charts',
        'type-perfs-charts', 'label-perfs-charts', 'main-loading', 'Chiffre d\'affaires')
}

async function fetchSalesPerMethodPerformanceChart() {
    await fetchPerformanceChart('/sales_per_method_chart/', 'sales-perfs-per-method-canvas',
        'start-date-perfs-per-method-charts', 'end-date-perfs-per-method-charts',
        'type-perfs-per-method-charts', 'label-perfs-per-method-charts', 'main-loading', 'Chiffre d\'affaires', false)
}

async function fetchProductsSalesChart() {
    await fetchPerformanceChart('/products_sales/', 'products-sales-canvas',
        'start-date-products-sales', 'end-date-products-sales',
        'type-products-sales', 'label-products-sales', 'main-loading',
        'Nombre de ventes par produit', isXDate=false)
}

async function fetchProductsTotalChart() {
    await fetchPerformanceChart('/products_total/', 'products-total-canvas',
        'start-date-products-total', 'end-date-products-total',
        'type-products-total', 'label-products-total', 'main-loading',
        'Nombre total de produits vendus')
}

async function fetchProductTotalChart() {

    await fetchPerformanceChart('/product_total/', 'product-total-canvas',
        'start-date-product-total', 'end-date-product-total',
        'type-product-total', 'label-product-total', 'main-loading',
        'Nombre total de produits vendus', isXDate=true, 'product_id',
        document.getElementById('product-total-code').value)
}