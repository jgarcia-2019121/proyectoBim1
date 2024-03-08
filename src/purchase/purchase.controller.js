import Cart from '../cart/cart.model.js'
import Purchase from '../purchase/purchase.model.js';
import jwt from 'jsonwebtoken';
import PDFdocument from 'pdfkit';
import fs from 'fs'
import path from 'path';

export const test = (req, res) => {
    console.log('Test is running')
    res.send({ message: 'Test is running' })
}

export const register = async (req, res) => {
    try {
        // Obtener el ID del usuario desde el token
        let token = req.headers.authorization;
        let decodeToken = jwt.verify(token, process.env.SECRET_KEY);
        let id = decodeToken.id;
        // Obtener los productos en el carrito del usuario
        let purchase = await Purchase.findOne({ user: id })
        // Verificar si el carrito está vacío
        if (!purchase || purchase.items.length === 0) {
            return res.status(400).send({ message: 'There are no products in the cart' });
        }
        // Calcular el total de la compra
        let totalCart = 0;
        for (let item of purchase.items) {
            totalCart += parseInt(item.price) * parseInt(item.quantity);
        }
        console.log(totalCart)
        // Verificar disponibilidad de stock para cada producto en el carrito
        for (let item of purchase.items) {
            if (item.product.stock < item.quantity) {
                return res.status(400).send({ message: 'There is not enough stock for the product' });
            }

        }
        let carrito = new Carrito({
            user: id,
            purchase: purchase._id,
            items: purchase.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.price
            })),
            total: totalCart
        })
        await cart.save();
        // Limpiar el carrito del usuario
        await Purchase.findOneAndDelete({ user: id });
        return res.status(200).send({ message: 'Payment processed successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error processing payment' });
    }
};

//Generar la factura
export const generarFactura = async (req, res) => {
    try {
        //Sacar id del token
        let token = req.headers.authorization;
        let decodeToken = jwt.verify(token, process.env.SECRET_KEY);
        let id = decodeToken.id;
        //Buscar la compra asociada al usuario
        let carrito = await Cart.findOne({ user: id }).populate('user').populate('items.product')
        if (!carrito) {
            return res.status(404).send({ message: 'Purchase not found check if it is correct' })
        }
        //Crear el documento pdf
        let doc = new PDFdocument();
        const filePath = path.resolve('factura.pdf');
        doc.pipe(fs.createWriteStream(filePath));
        //Agregar contenido al PDF
        doc.fontSize(14)
        doc.text('Factura de la compra', { aling: 'center' });
        doc.moveDown();
        doc.text(`Fecha: ${cart.fecha}`, { align: 'right' })
        doc.text(`Usuario: ${cart.user.name}`, { align: 'left' })
        doc.moveDown();
        doc.text('Products');
        doc.moveDown()
        cart.items.forEach((item, index) => {
            doc.text(`${index + 1}, ${item.product.name} - Cantidad: ${item.quantity} - Precio Unitario: ${item.price}`)
        });
        doc.moveDown();
        doc.text(`Total a pagar: ${cart.total}`);
        //Cerrar el PDF
        doc.end();
        //Enviar el pdf como respuesta
        res.sendFile(filePath);
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error generating invoice' });
    }
}