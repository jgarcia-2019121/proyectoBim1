import { Schema, model } from 'mongoose'

const purchaseSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    carrito: {
        type: Schema.Types.ObjectId,
        ref: 'Cart',
        required: true
    },
    items: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: String,
            required: true
        }
    }],
    total: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
})

export default model('purchase', purchaseSchema)