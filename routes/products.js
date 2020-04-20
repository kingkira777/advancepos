const express = require('express');
const router = express.Router();
const con = require('./modules/connection');
const master = require('./modules/master');
const fs = require('fs');

var categor_arr = [], product_arr;




router.use((req, res, next) => {
    var cno = req.session.no;
    async function initProducts() {
        product_arr = await master.product_list(cno);
        categor_arr = await master.category_list(cno);


        next();
    }
    initProducts();
});


router.get('/', (req, res, next) => {
    if(!req.session.no){
        res.redirect('/auth/login');
        res.end();
    }


    res.render('pages/products/product-list', {
        title: 'Product List',
        products: product_arr
    });
    res.end();

}).get('/add-update?', (req, res, next) => {
    if(!req.session.no){
        res.redirect('/auth/login');
        res.end();
    }

    var cno = req.session.no;
    var no = (req.query.no) ? req.query.no : master.unique_id();
    var q = `SELECT * FROM products WHERE no = ? AND client_no = ?`;
    var qVal = [no,cno];

    con.query(q, qVal, (err, rs) => {
        if (err) throw err;
        res.render('pages/products/add-update-product', {
            title: 'Add/Update Product',
            category: categor_arr,
            no: no,
            pinfo: rs[0]
        });
        res.end();
    });

}).post('/save-update/(:no)', (req, res, next) => {
    if(!req.session.no){
        res.redirect('/auth/login');
        res.end();
    }

    var cno = req.session.no;
    var no = req.params.no;
    var name = req.body.name;
    var category = req.body.category;
    var price = req.body.price;
    var quantity = req.body.quantity;
    var status = req.body.status;
    var description = req.body.description;

    var exist = false;

    async function check_product_name(_name) {
        exist = await chkname(_name);

        var c = `SELECT * FROM products WHERE no =? AND client_no = ?`;
        var cVal = [no,cno];
        con.query(c, cVal, (err, rs) => {
            if (err) throw err;
            if (rs.length != 0) {
                var u = `UPDATE products SET name = ?, category = ?, price = ?, quantity= ?,
                status = ?, description = ? WHERE no = ? AND client_no = ?`;
                var uVal = [name, category, price, quantity, status, description, no,cno];
                con.query(u, uVal, (err3, rs3) => {
                    if (err3) throw err3;
                    res.redirect('/products');
                    res.end();
                });
            } else {
                if (exist) {
                    res.redirect('/products/add-update?exist=1');
                    res.end();
                } else {
                    var s = `INSERT INTO products(client_no,no,name,category,price,quantity,status,description)
                    VALUES ?`;
                    var sVal = [
                        [cno,no, name, category, price, quantity, status, description]
                    ];
                    con.query(s, [sVal], (err2, rs2) => {
                        if (err2) throw err2;
                        res.redirect('/products');
                        res.end();
                    });
                }
            }
        });
    }
    check_product_name(name);

}).get('/delete-product?', (req, res, next) => {
    if(!req.session.no){
        res.redirect('/auth/login');
        res.end();
    }



    var no = req.query.no;
    var path = 'clients/gallery/' + no;

    var q = `DELETE FROM products WHERE no = ?`;
    var qVal = [no];
    con.query(q, qVal, (err, rs) => {
        if (err) throw err;
        master.delete_folder(path);
        res.redirect('/products');
        res.end();
    });
});

// Products Gallery==============================================================
router.get('/gallery/(:no)', (req, res, next) => {
    if(!req.session.no){
        res.redirect('/auth/login');
        res.end();
    }


    var no = req.params.no;
    var q = `SELECT * FROM gallery WHERE product_no = ?`;
    var qVal = [no];
    con.query(q, qVal, (err, rs) => {
        if (err) throw err;
        res.render('pages/products/gallery', {
            title: 'Gallery',
            no: no,
            images: rs
        });
        res.end();
    });


}).post('/gallery/(:no)/upload', (req, res, next) => {
    if(!req.session.no){
        res.redirect('/auth/login');
        res.end();
    }


    var no = req.params.no; // Product No.

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let imageFile = req.files.imageFile;
    let name = imageFile.name;
    let size = imageFile.size;
    let path = "clients/gallery/" + no;
    let savePath = "/gallery/" + no;
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
    imageFile.mv(path + "/" + name, (err) => {
        if (err)
            return res.status(500).send(err);

        var s = `INSERT INTO gallery(product_no, name,size, path) VALUES ?`;
        var sVal = [
            [no, name, size, savePath]
        ];
        con.query(s, [sVal], (err1, rs1) => {
            if (err1) throw err1;
            res.redirect('/products/gallery/' + no);
            res.end();
        });
    });

}).get('/gallery/(:no)/delete?', (req, res, next) => {
    if(!req.session.no){
        res.redirect('/auth/login');
        res.end();
    }


    var no = req.params.no;
    var id = req.query.id;
    var q = `SELECT * FROM gallery WHERE id = ?`;
    var qVal = [id];
    con.query(q, qVal, (err, rs) => {
        if (err) throw err;
        var name = rs[0].name;
        var path = "clients/gallery/" + no + "/" + name;
        if (fs.existsSync(path)) {
            fs.unlinkSync(path);
        }

        var d = `DELETE FROM gallery WHERE id = ?`;
        var dVal = [id];
        con.query(d, dVal, (derr, drs) => {
            if (derr) throw derr;
            res.redirect('/products/gallery/' + no);
            res.end();
        });
    });
}).get('/gallery/(:no)/cover-image?', (req, res, next) => {
    if(!req.session.no){
        res.redirect('/auth/login');
        res.end();
    }


    var no = req.params.no;
    var id = req.query.id;

    var q = `SELECT * FROM gallery WHERE id = ?`;
    var qVal = [id];
    con.query(q, qVal, (err, rs) => {
        if (err) throw err;
        var cover = rs[0].path + "/" + rs[0].name;
        var u = `UPDATE gallery SET iscover = 'true' WHERE id = ?`;
        var uVal = [id];
        con.query(u, uVal, (err1, rs1) => {
            if (err1) throw err1;
            var uq = `UPDATE gallery SET iscover = 'false' WHERE id != ? AND product_no = ?`;
            var uqVal = [id, no];
            con.query(uq, uqVal, (err2, rs2) => {
                if (err2) throw err2;
                var up = `UPDATE products SET cover_image = ? WHERE no = ?`;
                var upVal = [cover, no];
                con.query(up, upVal, (err3, rs3) => {
                    if (err3) throw err3;
                    res.redirect('/products/gallery/' + no);
                    res.end();
                });
            });
        });
    });



});



//FUNCTIONS =============================================================
function chkname(_name) {
    return new Promise((resolve) => {
        var c = `SELECT * FROM products WHERE name = ?`;
        var cVal = [_name];
        con.query(c, cVal, (err, rs) => {
            if (err) throw err;
            if (rs.length == 0) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}





module.exports = router;