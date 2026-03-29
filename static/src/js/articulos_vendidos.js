/** @odoo-module **/

import { Component } from "@odoo/owl";

/**
 * ArticulosVendidos
 *
 * Componente OWL que muestra el total de unidades (artículos)
 * de todas las líneas con cantidad positiva en la orden activa.
 *
 * Recibe `totalArticulos` como prop calculada desde el padre (OrderWidget patch),
 * lo que garantiza que se actualiza reactivamente con cada cambio en la orden.
 */
export class ArticulosVendidos extends Component {
    static template = "pw_pos_validations.ArticulosVendidos";
    static props = {
        totalArticulos: { type: Number },
    };
}
