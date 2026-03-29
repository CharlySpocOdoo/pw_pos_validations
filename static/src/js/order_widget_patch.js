/** @odoo-module **/

import { OrderWidget } from "@point_of_sale/app/generic_components/order_widget/order_widget";
import { ArticulosVendidos } from "@pw_pos_validations/js/articulos_vendidos";
import { patch } from "@web/core/utils/patch";
import { usePos } from "@point_of_sale/app/store/pos_hook";

/**
 * Patch de OrderWidget para:
 *
 * 1. Registrar ArticulosVendidos como subcomponente disponible en el template.
 * 2. Exponer `totalArticulos` como getter reactivo que suma las cantidades
 *    positivas de todas las líneas de la orden activa.
 *
 * El getter se calcula en OrderWidget (no en el subcomponente) porque
 * OrderWidget ya tiene acceso reactivo a `props.lines` que se actualiza
 * automáticamente con cada cambio en la orden.
 */
patch(OrderWidget.prototype, {
    setup() {
        super.setup();
        this.pos = usePos();
    },

    /**
     * Suma las cantidades de todas las líneas con cantidad positiva.
     * Las líneas negativas (devoluciones) no se cuentan.
     * El resultado se muestra como entero si no tiene decimales.
     *
     * @returns {number}
     */
    get totalArticulos() {
        const lines = this.props.lines || [];
        const total = lines.reduce((sum, lineData) => {
            // props.lines contiene los datos display (getDisplayData()),
            // necesitamos la cantidad numérica real de la orden activa
            const order = this.pos.get_order();
            if (!order) return sum;

            // Buscamos la línea real por los datos de display
            const orderlines = order.get_orderlines();
            const matchingLine = orderlines.find(
                (ol) => ol.getDisplayData().productName === lineData.productName &&
                        ol.getDisplayData().qty === lineData.qty
            );

            if (matchingLine) {
                const qty = matchingLine.get_quantity();
                return qty > 0 ? sum + qty : sum;
            }
            return sum;
        }, 0);

        return Number.isInteger(total) ? total : parseFloat(total.toFixed(2));
    },
});

// Registrar el subcomponente en la clase estática
OrderWidget.components = {
    ...OrderWidget.components,
    ArticulosVendidos,
};
