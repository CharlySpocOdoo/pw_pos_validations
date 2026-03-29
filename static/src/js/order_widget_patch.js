/** @odoo-module **/

import { OrderWidget } from "@point_of_sale/app/generic_components/order_widget/order_widget";
import { ArticulosVendidos } from "@pw_pos_validations/js/articulos_vendidos";
import { patch } from "@web/core/utils/patch";
import { usePos } from "@point_of_sale/app/store/pos_hook";

/**
 * Patch de OrderWidget para:
 *
 * 1. Registrar ArticulosVendidos como subcomponente.
 * 2. Exponer `totalArticulos` como getter que suma las cantidades
 *    positivas de todas las líneas de la orden activa.
 *
 * Se usa props.lines.length como señal reactiva — cuando cambian
 * las líneas, OWL re-evalúa el getter automáticamente.
 */
patch(OrderWidget.prototype, {
    setup() {
        super.setup();
        this.pos = usePos();
    },

    /**
     * Suma directamente las cantidades de las líneas de la orden activa.
     * Solo cuenta líneas con cantidad positiva (excluye devoluciones).
     * @returns {number}
     */
    get totalArticulos() {
        const order = this.pos.get_order();
        if (!order) return 0;

        // Usamos props.lines.length para que OWL reactive detecte cambios
        // pero calculamos desde la orden real para tener cantidades numéricas
        void this.props.lines?.length;

        const total = order.get_orderlines().reduce((sum, line) => {
            const qty = line.get_quantity();
            return qty > 0 ? sum + qty : sum;
        }, 0);

        return Number.isInteger(total) ? total : parseFloat(total.toFixed(2));
    },
});

// Registrar el subcomponente en la clase estática
OrderWidget.components = {
    ...OrderWidget.components,
    ArticulosVendidos,
};
