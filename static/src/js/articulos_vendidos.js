/** @odoo-module **/

import { Component } from "@odoo/owl";
import { usePos } from "@point_of_sale/app/store/pos_hook";

/**
 * ArticulosVendidos
 *
 * Componente OWL que muestra el total de unidades (artículos)
 * de todas las líneas con cantidad positiva en la orden activa.
 *
 * Accede directamente a la orden via usePos() para ser completamente
 * autónomo y reactivo sin depender de props del padre.
 */
export class ArticulosVendidos extends Component {
    static template = "pw_pos_validations.ArticulosVendidos";
    static props = {};

    setup() {
        this.pos = usePos();
    }

    get totalArticulos() {
        const order = this.pos.get_order();
        if (!order) return 0;

        const total = order.get_orderlines().reduce((sum, line) => {
            const qty = line.get_quantity();
            return qty > 0 ? sum + qty : sum;
        }, 0);

        return Number.isInteger(total) ? total : parseFloat(total.toFixed(2));
    }
}
