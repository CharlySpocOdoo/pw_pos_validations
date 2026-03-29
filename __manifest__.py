# -*- coding: utf-8 -*-
{
    'name': 'POS Validations',
    'version': '1.0',
    'author': 'Preway IT Solutions',
    'category': 'Point of Sale',
    'depends': ['point_of_sale'],
    'summary': 'Validaciones en POS: contador de artículos vendidos, bloqueo de decimales y negativos manuales.',
    'description': """
        - Muestra el total de artículos vendidos (unidades) en la pantalla del POS.
        - Bloquea el ingreso de cantidades decimales (se trunca al entero inferior silenciosamente).
        - Bloquea el ingreso manual de cantidades negativas via teclado/numpad.
          Las devoluciones generadas por el sistema sí permiten cantidades negativas.
    """,
    'data': [],
    'assets': {
        'point_of_sale._assets_pos': [
            # CSS
            'pw_pos_validations/static/src/css/pw_pos_validations.css',
            # XML templates (antes que los JS que los referencian)
            'pw_pos_validations/static/src/xml/articulos_vendidos.xml',
            # JS: componente primero, luego patches
            'pw_pos_validations/static/src/js/articulos_vendidos.js',
            'pw_pos_validations/static/src/js/order_widget_patch.js',
            'pw_pos_validations/static/src/js/orderline_validations.js',
            'pw_pos_validations/static/src/js/order_summary_patch.js',
        ],
    },
    'application': False,
    'installable': True,
    'license': 'LGPL-3',
}
