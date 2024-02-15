import { model, Schema } from "mongoose"

const productSchema = Schema({
    name: {
        type: String,
        required: [true, 'the product name is obligatory'],
        unique: true
    },
    status: {
        type: Boolean,
        default: true,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
}, {
    description: { type: String },
    avaliable: { type: Boolean, default: true },
});


export default model('product', productSchema)