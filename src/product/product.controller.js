import Category from '../category/category.model.js'
import Product from '../product/product.model.js'
import { checkUpdateClient } from '../utils/validator.js'
import Invoice from '../invoice/invoice.model.js'
import mongoose from 'mongoose';


export const test = (req, res) => {
    console.log('Test is running')
    res.send({ message: 'test good' })
}

export const register = async (req, res) => {
    try {
        let data = req.body
        let category = await Category.findOne({ _id: data.category })
        if (!category) return res.status(404).send({ message: 'Category not found' })
        let product = new Product(data)
        await product.save()
        return res.send({ message: 'a new product was created' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error register product' })
    }
}

export const update = async (req, res) => {
    try {
        let data = req.body
        let { id } = req.params
        let update = checkUpdateClient(data, false)
        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
        let updatePro = await Product.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        ).populate('category')
        if (!updatePro) return res.status(401).send({ message: 'Product not found and not updated' })
        return res.send({ message: 'Updated product', updatePro })
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'error updating Product' })
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
        let { search } = req.params
        let product = await Product.find({ name: search }).populate('category')
        if (!product) return res.status(404).send({ message: 'product not found' })
        return res.send({ message: 'product found', product })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error searching for products' })
    }
}

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
        if (!data) return res.status(444).send({ message: "Products were sold out" })
        return res.send({ data })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error obtaining information' })
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