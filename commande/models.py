from django.db import models

from direction.models import Parametre
from utility.search_engine import search
from reportlab.lib import colors
from reportlab.lib.pagesizes import A5
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer


class CommandeTotale(models.Model):
    """Model for the total command"""
    id_commande = models.AutoField(primary_key=True)
    gerant = models.ForeignKey('direction.Gerant', on_delete=models.CASCADE)
    client = models.ForeignKey('direction.Client', on_delete=models.CASCADE, null=True)
    date = models.DateTimeField(auto_now_add=True)
    methode_paiement = models.ForeignKey('gestion.MethodePaiement', on_delete=models.CASCADE, null=True)
    commentaire = models.TextField(null=True)

    def __str__(self):
        return (f"{self.id_commande} - Validé par {self.gerant.nom} - pour {self.client.nom if self.client else 'Inconnu'} "
                f"- Date: {self.date} - Méthode: {self.methode_paiement}")


class CommandeProduit(models.Model):
    """Model for the command product"""
    prod = models.ForeignKey('gestion.Produit', on_delete=models.CASCADE)
    commande = models.ForeignKey('CommandeTotale', on_delete=models.CASCADE)
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    est_cadeau = models.BooleanField(default=False)
    qte = models.IntegerField()

    def __str__(self):
        return f"{self.prod.nom} - {self.qte} - {self.prix} ({self.commande})"


class Commande:
    """Class for the command with the products"""
    def __init__(self, command_total: CommandeTotale):
        self.id = command_total.id_commande
        self.gerant = command_total.gerant.nom
        self.site = command_total.gerant.site.nom if command_total.gerant.site else "Inconnu"
        self.client = command_total.client.nom if command_total.client else 'Inconnu'
        self.date = command_total.date
        self.formated_date = self.date.strftime('%d/%m/%Y %H:%M')
        self.methode_paiement = command_total.methode_paiement.nom
        self.products = search(CommandeProduit, 'commande', command_total, True)
        self.comment = command_total.commentaire
        self.total = sum([product.prix * product.qte for product in self.products if not product.est_cadeau])

    def receipt(self, response):
        """Generate a receipt for the command
        :param response: The response to write the pdf to
        """
        doc = SimpleDocTemplate(response, pagesize=A5, rightMargin=20, leftMargin=20, topMargin=20, bottomMargin=20)
        styles = getSampleStyleSheet()

        arial = ParagraphStyle(
            name="Arial",
            fontName="Helvetica",
            fontSize=10,
            leading=12,
        )
        arial_bold_right = ParagraphStyle(
            name="ArialBoldRight",
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=12,
            alignment=2  # 2 is for right alignment
        )
        elements = [Paragraph("Facture Client", styles['Title']), Spacer(1, 24)]
        details = [
            f"Numéro commande: {self.id}",
            f"Validé par: {self.gerant}",
            f"Client: {self.client}",
            f"Date: {self.formated_date}",
            f"Site: {self.site}",
        ]
        phone_number = Parametre.get_value(Parametre.PHONE_NUMBER)
        if phone_number:
            details.append(f"Numéro de Téléphone: {phone_number.valeur}")

        for detail in details:
            elements.append(Paragraph(detail, arial))
            elements.append(Spacer(1, 3))

        elements.append(Spacer(1, 12))
        data = [["Produit", "P.U.", "Qte", "P.T."]]
        currency = Parametre.get_value(Parametre.CURRENCY).valeur
        if not currency:
            currency = ""
        for product in self.products:
            data.append([
                product.prod.nom,
                f"{product.prix:.0f} {currency}",
                product.qte,
                f"{(product.prix * product.qte):.0f} {currency}" if not product.est_cadeau else f"0 {currency} (Offert)",
            ])
        left_margin = 20
        right_margin = 20
        table_width = A5[0] - (left_margin + right_margin)
        col_widths = [
            0.4 * table_width,
            0.2 * table_width,
            0.1 * table_width,
            0.3 * table_width
        ]
        table = Table(data, colWidths=col_widths)
        table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f2f2f2')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 12))
        elements.append(Paragraph(f"Total: {self.total} {currency}", arial_bold_right))
        if self.comment:
            elements.append(Spacer(1, 12))
            elements.append(Paragraph(f"Commentaire: {self.comment}", ParagraphStyle(name="Italic", parent=arial,
                                                                                        fontName="Helvetica-Oblique")))
        doc.build(elements)
