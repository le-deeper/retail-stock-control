from datetime import datetime


def performances(commands, func):
    """Calculate the total sales of the commands
    :param commands: list of commands
    :param func: function to apply to each command
    :return: the total sales of the commands"""
    sales = 0
    for command in commands:
        sales += func(command)
    return sales


def performances_chart(commands, func):
    """Calculate the total sales of the commands
    :param commands: list of commands
    :param func: function to apply to each command
    :return: a dictionary with the total sales per day, month"""

    perfs = {}
    for command in commands:
        command.date: datetime
        if command.date.year not in perfs:
            perfs[command.date.year] = {}
        if command.date.month not in perfs[command.date.year]:
            perfs[command.date.year][command.date.month] = {}
        if command.date.day not in perfs[command.date.year][command.date.month]:
            perfs[command.date.year][command.date.month][command.date.day] = 0
        perfs[command.date.year][command.date.month][command.date.day] += func(command)
    return perfs


def sales_performance(commands):
    return performances(commands, lambda command: command.total)


def sales_performance_chart(commands):
    return performances_chart(commands, lambda command: command.total)


def sales_performance_per_method_chart(commands):
    perfs = {}
    for command in commands:
        if command.methode_paiement not in perfs:
            perfs[command.methode_paiement] = 0
        perfs[command.methode_paiement] += command.total
    return perfs


def revenue(commands):
    return performances(commands,
                        lambda command: sum([prod.prix * prod.qte for prod in command.products])
                                        - sum([prod.prod.prix_achat * prod.qte for prod in command.products if
                                               prod.prod.prix_achat is not None]), )


def revenue_chart(commands):
    return performances_chart(commands,
                              lambda command: sum([prod.prix * prod.qte for prod in command.products])
                                              - sum([prod.prod.prix_achat * prod.qte for prod in
                                                     command.products if prod.prod.prix_achat is not None]), )


def products_by_sales(commands):
    selled_product = {}
    for command in commands:
        command.date: datetime
        for product in command.products:
            if product.prod.nom not in selled_product:
                selled_product[product.prod.nom] = 0
            selled_product[product.prod.nom] += product.qte
    return selled_product


def total_saled_products(commands):
    return performances_chart(commands, lambda command: sum([prod.qte for prod in command.products]))


def total_saled_product(product, commands):
    return performances_chart(commands, lambda command: sum(
        [prod.qte for prod in command.products if prod.prod.id_prod == product]))
