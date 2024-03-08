import { checkUpdateUser } from "../utils/validator.js"
import Product from "../product/product.model.js"
import Purchase from '../purchase/purchase.model.js';
import User from '../user/user.model.js'
import jwt from 'jsonwebtoken'
import PDFDocument from 'pdfkit'
import fs from 'fs'

export const test = (req, res) => {
    console.log('Test is running')
    res.send({ message: 'Test is running' })
}

export const register = async (req, res) => {
    try {
        let data = req.body
        let secretKey = process.env.SECRET_KEY
        let { authorization } = req.headers
        let { uid } = jwt.verify(authorization, secretKey)
        data.user = uid
        let product = await Product.findOne({ _id: data.product })
        if (!product) return res.status(404).send({ message: 'Product not found' })
        let user = await User.findOne({ _id: data.user })
        if (!user) return res.status(404).send({ message: 'Client not found' })
        let restaStock = await Product.findById(data.product)
        restaStock.stock -= parseInt(data.amount)
        await restaStock.save()
        let purchase = new Purchase(data)
        await purchase.save()
        return res.send({ message: `Purchase registered correctly ${purchase.date} and the stock is updated`, restaStock })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error registering purchase', err: err })
    }
}

export const update = async (req, res) => {
    try {
        let { id } = req.params
        let data = req.body
        let update = checkUpdateUser(data, id)
        if (!update) return res.status(400).send({ message: 'Some data cannot be updated or missing data' })
        let secretKey = process.env.SECRET_KEY
        let { authorization } = req.headers
        let { uid } = jwt.verify(authorization, secretKey)
        let originalPurchase = await Purchase.findById(id)
        if (!originalPurchase) return res.status(404).send({ message: 'Purchase not found' })
        if (originalPurchase.user.toString() !== uid) return res.status(403).send({ message: 'Unauthorized to update this purchase' })
        let updatedPurchase = await Purchase.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        ).populate('product')
        let product = await Product.findById(originalPurchase.product)
        let updateAmount = originalPurchase.amount - data.amount

        product.stock += updateAmount
        await product.save()

        if (!updatedPurchase) return res.status(401).send({ message: 'Purchase not found and not updated' })
        return res.send({ message: 'Purchase updated', updatedPurchase })
    } catch (err) {
        console.error(err)
        if (err.keyValue.description) return res.status(400).send({ message: `Purchase ${err.keyValue.description} is already taken` })
        return res.status(500).send({ message: 'Error updating purchase' })
    }
}

export const get = async (req, res) => {
    try {
        let secretKey = process.env.SECRET_KEY
        let { authorization } = req.headers
        let { uid } = jwt.verify(authorization, secretKey)

        let purchases = await Purchase.find({ user: uid })

        return res.send({ purchases })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting purchases' })
    }
}


export const generateInvoice = async (req, res) => {
    try {
        const uid = req.user.id
        const currentDate = new Date().toLocaleDateString('en-US', { timeZone: 'UTC' })
        const purchases = await Purchase.find({ user: uid }).populate('product').populate('user')
        const fileName = `factura${uid}.pdf`

        const doc = new PDFDocument()
        doc.pipe(fs.createWriteStream(fileName))
        doc.fontSize(12).text('Factura', { align: 'center' }).moveDown()

        let total = 0
        purchases.forEach((purchase, index) => {
            const totalPurchase = purchase.product.price * purchase.amount
            total += totalPurchase

            if (index === 0) {
                doc.fontSize(10).text('Date: ' + currentDate).moveDown()
                doc.fontSize(10).text('Client: ' + purchase.user.name, { align: 'right' }).moveDown()
            }
            doc.fontSize(10)
                .text('Product: ' + purchase.product.name + '  |  ', { continued: true })
                .text('Price: ' + `Q${purchase.product.price.toFixed(2)}` + '  |  ', { continued: true })
                .text('Amount: ' + purchase.amount + '  |  ', { continued: true })
                .text('Total: ' + `Q${totalPurchase.toFixed(2)}`)
                .moveDown()
                .text('| ----------------------------------------------------------------------------------------------------------- |')
        })

        doc.fontSize(12).text('Total: ' + `Q${total.toFixed(2)}`, { align: 'right' }).moveDown()
        doc.end()
        await Purchase.deleteMany({ user: uid })

        res.download(fileName)
    } catch (error) {
        console.error('Error generating invoices and deleting purchases:', error)
        res.status(500).send('Error generating invoices and deleting purchases')
    }
}