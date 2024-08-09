const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/eOnline")
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.log("MongoDB connection failed", err);
    });

const customerSchema=new mongoose.Schema({
    weightkg:Number,
    weightg:Number,
    brand:String,
    model:String,
    choose:String,
    desp:String
});
const customerupload  = mongoose.model('CustomerUpload',customerSchema);


const itemSchema = new mongoose.Schema({
    name: String,
    price: Number,
    imageUrl: String,
});
  
const cartItemSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    quantity: Number
});

const Item = mongoose.model('Item', itemSchema);

const CartItem = mongoose.model('CartItem', cartItemSchema);


let contactschema = new mongoose.Schema({
    name: String,
    mail: String,
    phone: String,
    more: String
});
var contacts = mongoose.model('contact', contactschema);

let loginSchema = new mongoose.Schema({
    name: { required: true, type: String, unique: true },
    password: { required: true, type: String }
});

let collections = new mongoose.model("collection", loginSchema);

module.exports = {
    collections: collections,
    contacts: contacts,Item,CartItem,customerupload
};
