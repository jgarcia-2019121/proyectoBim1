import { Schema, model } from "mongoose"

const categorySchema = Schema({
    name: {
        type: String,
        required: [true, 'The name of the category is obligatory'],
        unique: true
    },
    status: {
        type: Boolean,
        default: true,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
});


export default model('category', categorySchema)