const crypto = require('crypto');
const con = require('./connection');
const fs = require('fs');
const qrcode = require('qrcode');
const mailer = require('nodemailer');


let master = {


    //Update Product Quantity
    update_product_qty  : function(pr_no,qty){
        var q = `SELECT * FROM products WHERE no = ?`;
        var qVal = [pr_no];
        return new Promise(resolve => {
            con.query(q,qVal,(err,rs)=>{
                if(err) throw err;
                if(rs.length != 0){
                    var quantity = Number(rs[0].quantity) - Number(qty);
                    var u = `UPDATE products SET quantity = ? WHERE no = ?`;
                    var uVal = [quantity,pr_no];
                    con.query(u,uVal,(err1,rs1)=>{
                        if(err1) throw err1;
                        resolve('updated');
                    });
                }
            });
        });
    },

    //Cart List 
    cart_list: function (_cartno) {
        var q = `SELECT a.price, a.quantity, a.total_price, b.name FROM pos_cart a
        LEFT JOIN products b on a.product_no = b.no
        WHERE a.no = ?`;
        var qVal = [_cartno];
        return new Promise((resolve) => {
            con.query(q, qVal, (err, rs) => {
                if (err) throw err;
                resolve(rs);
            });
        });
    },


    //Product List
    product_list: function (cno,cat) {
        var products = [];
        if(cat === ""){
            var q = 'SELECT * FROM products WHERE client_no = ?';
            var qVal = [cno];
        }else{
            var q = 'SELECT * FROM products WHERE client_no = ? AND category = ?';
            var qVal = [cno,cat];
        }
        
        return new Promise((resolve) => {
            con.query(q, qVal, (err, rs) => {
                if (err) throw err;
                for (var i = 0; i < rs.length; i++) {
                    var pr = {};
                    pr['id'] = rs[i].id;
                    pr['no'] = rs[i].no;
                    pr['name'] = rs[i].name;
                    pr['category'] = rs[i].category;
                    pr['price'] = rs[i].price;
                    pr['quantity'] = rs[i].quantity;
                    pr['status'] = rs[i].status;
                    pr['description'] = rs[i].description;
                    pr['cover_image'] =rs[i].cover_image;
                    products.push(pr);
                }
                resolve(products);
            });
        });
    },

    //Category List
    category_list: function (cno) {
        var q = `SELECT * FROM category WHERE client_no = ?`;
        var qVal = [cno];
        return new Promise((resolve) => {
            con.query(q, qVal, (err, rs) => {
                if (err) throw err;
                resolve(rs);
            });
        });
    },

    //Unique ID
    unique_id: function () {
        var no = crypto.randomBytes(6).toString('hex');
        return no;
    },

    //Store Information
    store_information : function(_cno){
        var q = `SELECT * FROM store_information WHERE client_no = ?`;
        var qVal = [_cno];
        return new Promise(resolve =>{
            con.query(q,qVal,(err,rs)=>{
            if(err) throw err;
            resolve(rs);
            })
        });
    },

    // Qrcode to DataUrl
    qrocde_dataurl: function (_str) {
        return new Promise(resolve => {
            qrcode.toDataURL(_str, {
                errorCorrectionLevel: 'H'
            }, (err, url) => {
                resolve(url);
            });
        });
    },

    // Delete Folder & Files
    delete_folder: function (_path) {
        if (fs.existsSync(_path)) {
            fs.readdirSync(_path).forEach((file, index) => {
                var filePath = _path + "/" + file;
                if (fs.lstatSync(filePath).isDirectory()) {
                    delete_folder(filePath);
                } else {
                    fs.unlinkSync(filePath);
                }
            });
            fs.rmdirSync(_path);
        }
    },

    // Delete file 
    delete_file: function (_path) {
        if (fs.existsSync(_path)) {
            fs.unlinkSync(_path);
        }
    },


    //Send Mail
    send_mail : async function(_to){
        let testAccount = await mailer.createTestAccount();
        let trasnporter = mailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass // generated ethereal password
                }
        });
        let send = trasnporter.sendMail({
            from: '"Advnace POS" <evilgod777@protonmail.com>', // sender address
            to: _to, // list of receivers
            subject: "Advance POS", // Subject line
            html: "Thank you for singning APOS! Enjoy you're Free Account" // html body
        });
        return new Promise(resolve=>{
            resolve(send);
        });
    }


};


module.exports = master;