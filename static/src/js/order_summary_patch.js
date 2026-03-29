/** @odoo-module **/

import { OrderSummary } from "@point_of_sale/app/screens/product_screen/order_summary/order_summary";
import { patch } from "@web/core/utils/patch";

/**
 * Patch de OrderSummary._handleNegationOnFirstInput
 *
 * Este método es llamado EXACTAMENTE cuando el cajero presiona el botón "-"
 * en el numpad mientras el buffer está en "-0", es decir, es el momento
 * preciso en que se intenta negar una cantidad manualmente.
 *
 * Lógica original: convierte el buffer a negativo (cantidad * -1).
 * Nuestra lógica: si la línea seleccionada NO es una línea de devolución
 * (no tiene refunded_orderline_id), bloqueamos la negación silenciosamente
 * devolviendo el buffer sin cambios (queda en "0" o en el valor anterior).
 *
 * Las líneas de devolución generadas por el sistema SÍ tienen
 * refunded_orderline_id, por lo que el negativo se permite normalmente.
 *
 * @param {string} buffer - Estado actual del buffer del numpad
 * @param {string} key    - Tecla presionada (en este caso siempre "-")
 * @param {Object} selectedLine - Línea de orden seleccionada actualmente
 * @returns {string} buffer — modificado o no según la validación
 */
patch(OrderSummary.prototype, {

    _handleNegationOnFirstInput(buffer, key, selectedLine) {
        // Solo actuar cuando se cumple la condición del negativo manual:
        // buffer es "-0" y la tecla presionada es "-"
        if (buffer === "-0" && key === "-") {
            // Si la línea NO es una devolución del sistema, bloquear silenciosamente.
            // Devolvemos "0" para que el buffer quede limpio sin aplicar el negativo.
            if (selectedLine && !selectedLine.refunded_orderline_id) {
                this.numberBuffer.state.buffer = "0";
                return "0";
            }
        }

        // En cualquier otro caso (devoluciones del sistema, otras teclas),
        // llamamos al comportamiento original sin modificar nada.
        return super._handleNegationOnFirstInput(buffer, key, selectedLine);
    },
});
