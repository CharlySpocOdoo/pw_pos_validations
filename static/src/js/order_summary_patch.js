/** @odoo-module **/

import { OrderSummary } from "@point_of_sale/app/screens/product_screen/order_summary/order_summary";
import { patch } from "@web/core/utils/patch";
import { AlertDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { _t } from "@web/core/l10n/translation";

/**
 * Patch de OrderSummary para validaciones de cantidad en el numpad.
 *
 * Se interviene en dos métodos:
 *
 * 1. updateSelectedOrderline — punto central donde llegan TODAS las
 *    teclas del numpad antes de aplicarse a la línea. Aquí validamos:
 *
 *    a) DECIMALES: Si el buffer contiene "." bloqueamos la tecla,
 *       reseteamos el buffer al valor entero actual de la línea
 *       y mostramos un diálogo de error. Esto evita el estado
 *       inconsistente donde el buffer queda bloqueado.
 *
 *    b) NEGATIVOS MANUALES: Si el buffer resultante es negativo y la
 *       línea no es una devolución del sistema, bloqueamos, reseteamos
 *       el buffer al valor actual y mostramos diálogo de error.
 *
 * 2. _handleNegationOnFirstInput — intercepta el caso específico donde
 *    el cajero presiona +/- en una línea que ya tiene cantidad (ej: 25).
 *    En ese caso el buffer se convierte directamente a -25 sin pasar
 *    por updateSelectedOrderline, así que lo bloqueamos aquí también.
 */
patch(OrderSummary.prototype, {

    /**
     * Muestra un diálogo de error con un solo botón OK.
     * @param {string} title
     * @param {string} body
     */
    _mostrarErrorValidacion(title, body) {
        this.dialog.add(AlertDialog, { title, body });
    },

    /**
     * Resetea el buffer del numpad al valor entero actual de la línea seleccionada.
     * Esto evita que el buffer quede en estado inconsistente tras un rechazo.
     */
    _resetBufferAlValorActual() {
        const selectedLine = this.currentOrder?.get_selected_orderline();
        if (selectedLine) {
            const cantidadActual = Math.trunc(Math.abs(selectedLine.get_quantity()));
            this.numberBuffer.state.buffer = cantidadActual > 0
                ? cantidadActual.toString()
                : "1";
        } else {
            this.numberBuffer.reset();
        }
    },

    /**
     * Punto central de entrada del numpad.
     * Validamos aquí porque tenemos acceso a dialog, numberBuffer y la línea.
     */
    async updateSelectedOrderline({ buffer, key }) {
        const order = this.pos.get_order();
        const selectedLine = order?.get_selected_orderline();

        // Solo validar cuando el modo es "quantity"
        if (selectedLine && this.pos.numpadMode === "quantity") {
            const esDevolucion = Boolean(selectedLine.refunded_orderline_id);

            // ── Validación 1: Bloquear punto decimal ──────────────────────────
            // Si la tecla presionada es "." o el buffer contiene ".",
            // rechazamos y reseteamos al valor entero actual.
            if (key === "." || (buffer && buffer.includes("."))) {
                this._resetBufferAlValorActual();
                this._mostrarErrorValidacion(
                    _t("Cantidad no permitida"),
                    _t("No se permiten cantidades decimales. Solo se pueden vender piezas enteras.")
                );
                return;
            }

            // ── Validación 2: Bloquear negativos manuales ─────────────────────
            // Si el buffer resultante es un número negativo y NO es devolución.
            if (!esDevolucion && buffer !== null) {
                const valorBuffer = parseFloat(buffer);
                if (!isNaN(valorBuffer) && valorBuffer < 0) {
                    this._resetBufferAlValorActual();
                    this._mostrarErrorValidacion(
                        _t("Cantidad no permitida"),
                        _t("No se permiten cantidades negativas. Para hacer una devolución utiliza la función de devolución del sistema.")
                    );
                    return;
                }
            }
        }

        // Sin validaciones que bloquear: flujo original
        return super.updateSelectedOrderline({ buffer, key });
    },

    /**
     * Intercepta el caso donde el cajero presiona +/- sobre una línea
     * que ya tiene cantidad (ej: 25 → intenta convertir a -25).
     * Este caso NO pasa por updateSelectedOrderline, tiene su propio flujo.
     */
    _handleNegationOnFirstInput(buffer, key, selectedLine) {
        if (key === "-" && selectedLine && !selectedLine.refunded_orderline_id) {
            // Resetear buffer al valor entero actual y mostrar error
            const cantidadActual = Math.trunc(Math.abs(selectedLine.get_quantity()));
            this.numberBuffer.state.buffer = cantidadActual > 0
                ? cantidadActual.toString()
                : "1";
            this._mostrarErrorValidacion(
                _t("Cantidad no permitida"),
                _t("No se permiten cantidades negativas. Para hacer una devolución utiliza la función de devolución del sistema.")
            );
            return this.numberBuffer.state.buffer;
        }

        // Si es devolución del sistema, permitir el negativo normalmente
        return super._handleNegationOnFirstInput(buffer, key, selectedLine);
    },
});
