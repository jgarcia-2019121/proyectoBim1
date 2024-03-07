import Invoice from './invoice.model.js'
import Product from '../product/product.model.js'

export const update = async (req, res) => {
    try {
        const { id, itemId } = req.params;
        const { product, quantity } = req.body;
        // Validar si se proporcionó el producto y la cantidad
        if (!product && !quantity) {
            return res.status(400).send({ message: 'Product and quantity are required' });
        }
        // Encontrar la factura
        const search = await Invoice.findById(id);
        if (!search) {
            return res.status(404).send({ message: 'Invoice not found' });
        }
        // Encontrar el ítem de la factura que se va a actualizar
        const updateItem = invoice.items.find(item => item._id.toString() === itemId);
        if (!updateItem) {
            return res.status(404).send({ message: 'Item not found in the invoice' });
        }
        // Actualizar el producto y/o la cantidad
        if (product) {
            updateItem.product = product;

            // Obtener el precio del producto y actualizar el unitPrice del ítem
            const productInfo = await Product.findById(product);
            if (!productInfo) {
                return res.status(404).send({ message: 'Product not found' });
            }
            const oldUnitPrice = updateItem.unitPrice;
            updateItem.unitPrice = productInfo.price;

            // Recalcular el totalAmount basado en el cambio en el unitPrice
            invoice.totalAmount += (updateItem.unitPrice - oldUnitPrice) * updateItem.quantity;

            // Actualizar el stock del producto en base a la diferencia en la cantidad
            if (quantity !== undefined) {
                const oldQuantity = updateItem.quantity;
                const quantityDifference = quantity - oldQuantity;
                productInfo.stock -= quantityDifference;
                await productInfo.save();
            }
        }
        if (quantity !== undefined) {
            const oldQuantity = updateItem.quantity;
            const quantityDifference = quantity - oldQuantity;
            updateItem.quantity = quantity;
            // Recalcular el totalAmount basado en la diferencia en la cantidad
            invoice.totalAmount += quantityDifference * updateItem.unitPrice;
            // Actualizar el stock del producto en base a la diferencia en la cantidad
            const productInfo = await Product.findById(updateItem.product);
            if (!productInfo) {
                return res.status(404).send({ message: 'Product not found' });
            }
            productInfo.stock -= quantityDifference; // Aquí restamos la diferencia
            await productInfo.save();
        }
        // Guardar la factura actualizada
        await invoice.save();
        return res.send({ message: 'Item updated successfully', invoice });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error updating item' });
    }
}