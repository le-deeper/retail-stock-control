const downloadOrder = (order_id) => {
    // Ouvrir dans un nouvel onglet la page de téléchargement de la commande
    window.open(`/download-order-${order_id}/`, '_blank');
}