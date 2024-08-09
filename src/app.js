const express = require("express");
const path = require("path");
const collections = require("./mongodb");
const app = express();
const bodyParser = require("body-parser");
const multer = require('multer');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../static')));
app.use(bodyParser.json()); // Ensure body-parser is used to parse JSON
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../templates'));

app.get('/login', (req, res) => {
    res.render("login", { accountCreated: req.query.accountCreated});
});

app.get('/signup', (req, res) => {
    res.render("signup");
});
app.get('/entry', (req, res) => {
    res.render("entry");
});

app.get('/about', (req, res) => {
    res.render("about",{fileSaved:req.query.fileSaved});
});

app.get('/contact', (req, res) => {
    res.render("contact");
});

app.get('/', (req, res) => {
    res.render("home",{name:req.body.name});
});

app.post('/signup', async (req, res) => {
    const checking = await collections.collections.findOne({ name: req.body.name });
    let mydata = new collections.collections(req.body);
    let name=req.body.name;
    try {
        await mydata.save();
        // document.getElementById("logspan").innerHTML = name;
        res.status(201).redirect('/login?accountCreated=true');

    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            res.status(400).send("User already exists");
        } else {
            res.status(500).send("Internal Server Error");
        }
    }
});

app.post('/login', async (req, res) => {
    try {
        const check = await collections.collections.findOne({ name: req.body.name });
        const name = req.body.name || 'login';
        if (check.password === req.body.password) {
            res.status(201).render("home", { name: name });
        } else {
            res.send("Incorrect password");
        }
    } catch (e) {
        res.send("Wrong details");
    }
});


app.get('/logout', (req, res) => {
    // Clear session data, authentication tokens, etc.
    // Redirect to the login page or any other appropriate page
    res.redirect('/');
});

app.post('/contact', (req, res) => {
    var mydata = new collections.contacts(req.body);
    mydata.save().then(() => {
        res.render("contact");
    }).catch((err) => {
        console.error("Item not saved to database", err);
        res.sendStatus(400);
    });
});

// Route to fetch items from the database and render the shop page
app.get('/shop', async (req, res) => {
    try {
        const items = await collections.Item.find();
        res.render("shop", { items: items });
    } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Route to fetch items in the cart from the database and render the cart page
app.get('/cart', async (req, res) => {
    try {
        const cartItems = await collections.CartItem.find().populate('itemId');
        res.render("cart", { cartItems: cartItems });
    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Route to add an item to the cart
app.post('/cart/add', async (req, res) => {
    try {
        const { itemId, quantity } = req.body;
        console.log(`Received request to add item to cart: itemId=${itemId}, quantity=${quantity}`); // Added logging

        const existingCartItem = await collections.CartItem.findOne({ itemId: itemId });
        if (existingCartItem) {
            // If item already exists in the cart, update the quantity
            existingCartItem.quantity += parseInt(quantity, 10);
            await existingCartItem.save();
            console.log(`Updated existing cart item: ${existingCartItem}`); // Added logging
        } else {
            // If item doesn't exist in the cart, create a new cart item
            const newCartItem = new collections.CartItem({ itemId: itemId, quantity: parseInt(quantity, 10) });
            await newCartItem.save();
            console.log(`Created new cart item: ${newCartItem}`); // Added logging
        }
        res.status(200).send("Item added to cart successfully");
    } catch (error) {
        console.error("Error adding item to cart:", error); // Added logging
        res.status(500).send("Internal Server Error");
    }
});

// Route to remove an item from the cart
app.post('/cart/remove', async (req, res) => {
    try {
        const { cartItemId } = req.body;
        await collections.CartItem.findByIdAndRemove(cartItemId);
        res.status(200).send("Item removed from cart successfully");
    } catch (error) {
        console.error("Error removing item from cart:", error);
        res.status(500).send("Internal Server Error");
    }
});

// app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'in.html')));

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});


const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // Limit file size to 1MB
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).array('files', 10);

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images and PDFs Only!');
    }
}


app.post('/about', async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            upload(req, res, (err) => {
                if (err) {
                    reject(err);
                } else if (req.files === undefined) {
                    reject(new Error('No files selected!'));
                } else {
                    resolve();
                }
            });
        });

        const uploadedFiles = req.files.map(file => file.filename);
        const mydata = new collections.customerupload(req.body);
        
        console.log(req.body);
        await mydata.save();
        
        res.status(201).redirect('/about?fileSaved=true');
    } catch (err) {
        console.error("Error:", err);
        
        if (err.message === 'No files selected!') {
            res.status(400).send(err.message);
        } else if (err.name === 'ValidationError') {
            res.status(400).send('Validation Error: ' + err.message);
        } else {
            res.status(500).send('Internal Server Error');
        }
    }
});

// app.post('/about', async (req, res) => {
   
// });

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
