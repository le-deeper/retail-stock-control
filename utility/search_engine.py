from typing import List, Tuple
from django.db import models


def get_key(key, query, pair_separator=',', key_separator='-'):
    keys = query.split(pair_separator)
    value = None
    for k in keys:
        texts = [x.strip() for x in k.split(key_separator)]
        if len(texts) >= 2:
            if key == texts[0]:
                value = "".join(texts[1])
    return value


def get_date(keys):
    day, month, year, hour, minute = None, None, None, None, None
    for key in keys:
        possible_time = ""
        if '/' in key:
            date = [x.strip() for x in key.split('/')]
            if len(date) == 3:
                # Supprimer les espaces au début et à la fin
                day = int(date[0])
                month = int(date[1])
                if len(date[2].split(" ")) == 2:
                    year = int(date[2].split(" ")[0])
                    possible_time = date[2].split(" ")[1]
                else:
                    year = int(date[2])
        if ':' in possible_time:
            time = [x.strip() for x in possible_time.split(':')]
            if len(time) == 1:
                hour = int(time[0])
            elif len(time) == 2:
                hour = int(time[0])
                minute = int(time[1])
    return year, month, day, hour, minute


def search(model, field, query, exact=False) -> List[models.Model]:
    precision = "" if exact else "__icontains"
    return model.objects.filter(**{field + precision: query})


def search_commands(query: str,
                    by_client, by_date, by_payment, by_manager) -> List[Tuple[str, object]]:
    filters = []
    if by_client:
        client = get_key("client", query)
        if client:
            filters.append(("client__nom__contains", client))
    if by_date:
        keys = query.split(',')
        try:
            year, month, day, hour, minute = get_date(keys)
            if year:
                filters.append(("date__year", year))
            if month:
                filters.append(("date__month", month))
            if day:
                filters.append(("date__day", day))
            if hour:
                filters.append(("date__hour", hour))
            if minute:
                filters.append(("date__minute", minute))
        except:
            pass
    if by_payment:
        paiement = get_key("paiement", query)
        if paiement:
            filters.append(("paiement__nom__contains", paiement))
    if by_manager:
        manager = get_key("gerant", query)
        if manager:
            filters.append(("gerant__nom__contains", manager))
    return filters


def search_supplies(query: str,
                    by_product, by_date, by_four, by_manager) -> List[Tuple[str, object]]:
    filters = []
    if by_date:
        keys = query.split(',')
        try:
            year, month, day, hour, minute = get_date(keys)
            if year:
                filters.append(("date_achat__year", year))
            if month:
                filters.append(("date_achat__month", month))
            if day:
                filters.append(("date_achat__day", day))
            if hour:
                filters.append(("date_achat__hour", hour))
            if minute:
                filters.append(("date_achat__minute", minute))
        except:
            pass
    if by_manager:
        manager = get_key("gerant", query)
        if manager:
            filters.append(("gerant__nom__contains", manager))
    if by_four:
        four = get_key("four", query)
        if four:
            filters.append(("four__contains", four))

    if by_product:
        product = get_key("produit", query)
        if product:
            filters.append(("prod__nom__contains", product))
    return filters
