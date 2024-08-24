async function fetchPerformance(url, id, start_date_id, end_date_id, loading_id) {
    const startDate = document.getElementById(start_date_id).value;
    const endDate = document.getElementById(end_date_id).value;

    if (!startDate || !endDate) {
        showPopup('Veuillez sélectionner les dates de début et de fin');
        return;
    }

    display_hide('loading', loading_id);

    const formData = new FormData();
    formData.append('year_start', new Date(startDate).getFullYear());
    formData.append('month_start', new Date(startDate).getMonth() + 1);
    formData.append('day_start', new Date(startDate).getDate());
    formData.append('year_end', new Date(endDate).getFullYear());
    formData.append('month_end', new Date(endDate).getMonth() + 1);
    formData.append('day_end', new Date(endDate).getDate());

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        document.getElementById(id).textContent = `${responseData.result} ${currency}`;
        display_hide('loading', loading_id);

    } catch (error) {
        alert("Erreur serveur");
    }
}

async function fetchPerformanceChart(url, canvasId, start_date_id, end_date_id,
                                     type_chart_id, labelTypeId, loading_id, chartTitle, isXDate = true,
                                     ...postData) {
    const startDate = document.getElementById(start_date_id).value;
    const endDate = document.getElementById(end_date_id).value;
    const chartType = document.getElementById(type_chart_id).value;

    display_hide('loading', loading_id)

    if (!startDate || !endDate) {
        alert('Veuillez sélectionner les dates de début et de fin');
        return;
    }

    const formData = new FormData();
    formData.append('year_start', new Date(startDate).getFullYear());
    formData.append('month_start', new Date(startDate).getMonth() + 1);
    formData.append('day_start', new Date(startDate).getDate());
    formData.append('year_end', new Date(endDate).getFullYear());
    formData.append('month_end', new Date(endDate).getMonth() + 1);
    formData.append('day_end', new Date(endDate).getDate());
    for (let i = 0; i < postData.length; i += 2) {
        formData.append(postData[i], postData[i + 1]);
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
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
        display_hide('loading', loading_id)
        return responseData

    } catch (error) {
        console.error('Error:', error);
    }
}

async function fetchSalesPerformance() {
    await fetchPerformance('/sales/', 'results-sales', 'start-date-sales', 'end-date-sales', 'main-loading');
}

async function fetchRentPerformance() {
    await fetchPerformance('/revenue/', 'results-rent', 'start-date-revenue', 'end-date-revenue', 'main-loading');
}

async function fetchSalesPerformanceChart() {
    fetchPerformanceChart('/sales_chart/', 'sales-perfs-canvas',
        'start-date-perfs-charts', 'end-date-perfs-charts',
        'type-perfs-charts', 'label-perfs-charts', 'main-loading', 'Chiffre d\'affaires')
}

async function fetchSalesPerMethodPerformanceChart() {
    fetchPerformanceChart('/sales_per_method_chart/', 'sales-perfs-per-method-canvas',
        'start-date-perfs-per-method-charts', 'end-date-perfs-per-method-charts',
        'type-perfs-per-method-charts', 'label-perfs-per-method-charts', 'main-loading', 'Chiffre d\'affaires', false)
}

async function fetchRentsPerformanceChart() {
    fetchPerformanceChart('/revenue_chart/', 'sales-rents-canvas',
        'start-date-rents-charts', 'end-date-rents-charts',
        'type-rents-charts', 'label-rents-charts', 'main-loading', 'Bénéfices')
}

async function fetchProductsSalesChart() {
    fetchPerformanceChart('/products_sales/', 'products-sales-canvas',
        'start-date-products-sales', 'end-date-products-sales',
        'type-products-sales', 'label-products-sales', 'main-loading',
        'Nombre de ventes par produit', isXDate=false)
}

async function fetchProductsTotalChart() {
    fetchPerformanceChart('/products_total/', 'products-total-canvas',
        'start-date-products-total', 'end-date-products-total',
        'type-products-total', 'label-products-total', 'main-loading',
        'Nombre total de produits vendus')
}

async function fetchProductTotalChart() {

    fetchPerformanceChart('/product_total/', 'product-total-canvas',
        'start-date-product-total', 'end-date-product-total',
        'type-product-total', 'label-product-total', 'main-loading',
        'Nombre total de produits vendus', isXDate=true, 'product_id',
        document.getElementById('product-total-code').value)
}