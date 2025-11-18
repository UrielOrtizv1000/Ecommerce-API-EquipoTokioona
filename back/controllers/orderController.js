/*Here you will controll the order for clients
Receives: cart, shipping details, payment method, country.
Calculates: subtotal, taxes (by country), shipping (by country), applies coupon.
Generates PDF using generatePDF.js.
Sends email with receipt/note.
Decreases inventory (product.stock -= quantity).

Handles: Order generation, totals, taxes, shipping, PDF, email, inventory.
*/