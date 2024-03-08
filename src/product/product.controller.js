import Product from '../product/product.model.js'
import { checkUpdateProduct } from '../utils/validator.js'
import Invoice from '../cart/cart.model.js'
import mongoose from 'mongoose'


export const test = (req, res) => {
    console.log('Test is running')
    res.send({ message: 'Test is running' })
}

export const register = async (req, res) => {
    try {
        let data = req.body
        const existingProduct = await Product.findOne({ name: data.name });
        if (existingProduct) {
            return res.status(400).send({ message: 'Products already exists' });
        }
        let product = new Product(data)
        await product.save()
        return res.send({ message: `Registered succesfully, can be logged with name ${product.name}` })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error registering product', err: err })
    }
}

export const update = async (req, res) => {
    try {
        let { id } = req.params
        let data = req.body
        let update = checkUpdateProduct(data, id)
        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated' })
        let updatedProducts = await Product.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        )
        if (!updatedProducts) return res.status(404).send({ message: 'Product not found and not updated' })
        return res.send({ message: 'Product updated', updatedProducts })
    } catch (err) {
        console.error(err)
        if (err.keyValue && err.keyValue.name) return res.status(400).send({ message: `Product ${err.keyValue.name} is already taken` })
        return res.status(500).send({ message: 'Error updating product' })
    }
}

export const deleteP = async (req, res) => {
    try {
        let { id } = req.params
        let deleteProduct = await Product.findOneAndDelete({ _id: id })
        if (!deleteProduct) return res.status(404).send({ message: 'the product does not exist' })
        return res.send({ message: `product with name ${deleteProduct.name} deleted successfully` })
    } catch (error) {
        console.error(error)
        return res.status(404).send({ message: 'error deleting Product' })
    }
}

export const search = async (req, res) => {
    try {
        let { search } = req.body
        let products = await Product.find({ name: search })
        if (!products) return res.status(404).send({ message: 'Product not found' })
        return res.send({ message: 'Product found', products })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error searching products' })
    }
}

//Lista de las categorias existentes
export const list = async (req, res) => {
    try {
        let data = await Product.find().populate('category')
        return res.send({ data })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error obtaining information' })
    }
}

//Revisa si no hay productos en stock
export const spent = async (req, res) => {
    try {
        let data = await Product.findOne({ stock: 0 }).populate('category')
        if (!data) return res.status(444).send({ message: "there are no products out of stock" })
        return res.send({ data })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'the information cannot be brought' })
    }
}

//Los mejores porductos mas vendidos
export const bestProductsPurchased = async (req, res) => {
    try {
        const bestProductsPurchased = await Invoice.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    totalQuantity: { $sum: "$items.quantity" }
                }
            }, { $sort: { totalQuantity: -1 } },
            { $limit: 10 }
        ]);
        const productsDetails = await Product.find({ _id: { $in: bestProductsPurchased.map(item => item._id) } });
        const SellingProductsDetails = bestProductsPurchased.map(item => {
            const productDetail = productsDetails.find(product => product._id.toString() === item._id.toString());
            return {
                product: productDetail,
                totalQuantity: item.totalQuantity
            };
        });

        return res.status(200).send(SellingProductsDetails);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error retrieving best selling products', error: error });
    }
}

//buscamos su categoria por el ID / se filtra por su ID
export const searchID = async (req, res) => {
    try {
        let { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ message: 'Invalid category ID' });
        }
        let products = await Product.find({ category: id });

        return res.status(200).send(products);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error retrieving products by category', error: error });
    }
};