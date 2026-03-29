/** @odoo-module **/

import { OrderWidget } from "@point_of_sale/app/generic_components/order_widget/order_widget";
import { ArticulosVendidos } from "@pw_pos_validations/js/articulos_vendidos";
import { patch } from "@web/core/utils/patch";

/**
 * Patch de OrderWidget únicamente para registrar ArticulosVendidos
 * como subcomponente disponible en el template XML.
 *
 * El cálculo de totalArticulos vive dentro del propio componente
 * ArticulosVendidos via usePos(), sin pasar props desde aquí.
 */
patch(OrderWidget, {
    components: {
        ...OrderWidget.components,
        ArticulosVendidos,
    },
});
