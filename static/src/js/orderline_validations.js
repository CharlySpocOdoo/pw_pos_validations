/** @odoo-module **/

import { PosOrderline } from "@point_of_sale/app/models/pos_order_line";
import { patch } from "@web/core/utils/patch";

/**
 * Patch de PosOrderline.set_quantity
 *
 * Intercepta el valor ANTES de que entre al flujo original para aplicar
 * la validación de decimales de forma silenciosa.
 *
 * IMPORTANTE: Este patch NO toca la lógica de reembolsos, rounding por UoM,
 * ni combos — todo eso lo sigue manejando el método original.
 *
 * Regla: Si la cantidad ingresada tiene parte decimal, se trunca al entero
 * inferior antes de pasarla al flujo original.
 *
 *   Ejemplos:
 *     3.9  → 3
 *     1.1  → 1
 *     0.7  → 0  (el flujo original lo manejará como 0 o lo rechazará)
 *    -2.5  → -2 (si viene de devolución del sistema, se respeta el negativo)
 *
 * La detección de devolución se hace por `refunded_orderline_id` en la línea,
 * que es la forma correcta en Odoo 18 (no existe is_return_order en la línea).
 */
patch(PosOrderline.prototype, {

    set_quantity(quantity, keep_price) {
        // Convertir a número para poder evaluar
        const rawQty = typeof quantity === "number"
            ? quantity
            : parseFloat("" + (quantity ? quantity : 0));

        // Si no es número válido, dejamos que el original lo maneje
        if (isNaN(rawQty)) {
            return super.set_quantity(quantity, keep_price);
        }

        // Solo aplicar truncado de decimales si la cantidad tiene parte decimal
        if (!Number.isInteger(rawQty)) {
            const truncated = Math.trunc(rawQty);
            // Pasar el valor truncado al flujo original
            // El flujo original aplicará su propio rounding por UoM encima de esto
            return super.set_quantity(truncated, keep_price);
        }

        // Sin decimales: pasar el valor sin modificar
        return super.set_quantity(quantity, keep_price);
    },
});
