'user strict';
let POS = function(){
    var cart_no;
    var sub_total, discount, payable, money, change;
    var product_qty = [];

    //Get DOM input value
    sub_total = $('#subtotal');
    discount = $('#discount');
    money = $('#money');
    change = $('#change');
    payable = $('#payable');
  

    //Clear Cart Calculation
    let _clear_cart_calculation = function(){
        sub_total.val(0);
        discount.val(0);
        money.val(0);
        change.val(0);
        payable.val(0);
    }

    //Caculate Cart Items 
    let _caculate_cart_items = function(){
        var total;
        discount.on('change',function(){
            if(Number(sub_total.val()) <= 0){
                master._message_box('Subtotal is Zero pls add new item or quantity','warning');
                $(this).val(0);
                payable.val(0);
            }else{
                if(Number(discount.val()) < 0){
                    master._message_box('Discount has a negative value','warning');
                    $(this).val(0);
                }else if(Number(discount.val()) > 100){
                    master._message_box('Discount is over 100%','warning');
                    $(this).val(0);
                }else{
                    total = (Number(discount.val()) / 100) * Number(sub_total.val());
                    var nsubtotal = Number(sub_total.val()) - total;
                    payable.val(nsubtotal.toFixed(2));
                }
            }
        });
        

        money.on('change',function(){
            if(Number(money.val()) < Number(payable.val())){
                master._message_box('Not Enougth Money','warning');
                $(this).val(0);
                change.val(0);
            }else{
                var _change
                if(Number(payable.val()) > 0){
                    _change = Number(money.val()) - Number(payable.val());
                }else{
                    _change = Number(money.val()) - Number(sub_total.val());
                }
                change.val(_change.toFixed(2));
            }
        });

    };


    //Get Cart Items Subtotal
    let _cart_items_subtotal = function(){
        axios.get('/pos/cart-items-subtotal?cartno='+cart_no)
        .then(function(e){
            var total = (e.data[0].total == null)? 0 : e.data[0].total;
            sub_total.val(total);
        });
    };

    //Update Quanity From Cart List
    window._update_quantity = function(_this){
        let quantity = $(_this);
        let id = quantity.attr('id');
        let price = quantity.attr('data-price');
        let prno = quantity.attr('data-prno');
        let qty = quantity.val();
        let total_price = Number(price) * Number(qty);

        if(Number(qty) <= 0 ){
            master._message_box('Quantity must be greater zero(0)','warning');
            quantity.val(1);
        }else{
            axios.post('/pos/update-quantity',{
                id : id,
                prno : prno,
                quantity :qty,
                total_price : total_price 
            }).then(function(e){
                console.log(e.data);
                if(e.data.message === "zero"){
                    master._message_box('There is not Enought Stock for this Item', 'warning');
                    quantity.val(1);
                }
                _cart_items();
            });
        }
    };

    // To Kitchen
    let _to_kitchen = function(){
        $('#to-kitchen').on('click',function(){
            axios.post('/pos/to-kitchen',{
                cartno : cart_no
            }).then(function(e){
                console.log(e.data);
                if(e.data.message === "existed"){
                    master._message_box('Order is already added to the kitchen','info');
                }
                if(e.data.message === "added"){
                    master._message_box('Successfuly Added to the Kitchen','success');
                }
                _paid_cartno();
            });
        });
    };

    // Payment (Paid)
    let _payment_order = function(){
        $('#payment').on('click',function(){
            _paid_cartno();   
        });
    };  


    //New Order ===========================================
    let _new_order = function(){
        $('#new-order').on('click',function(){
            if(Number(change.val()) <= 0){
                master._message_box('Payment has not made yet','warning');
            }else{
                _clear_cart_calculation();
                _generate_cart_no();
            }
        });
    }
    
    //Cancel Cart Items
    let _cancel_cart_items  = function(){
        $('#cancel-cart-items').on('click',function(){
            axios.post('/pos/cancel-cart-items',{
                cartno : cart_no
            }).then(function(e){
                console.log(e); 
                _cart_items();
                _clear_cart_calculation();
            });
        });
    };
    
    //Delete Item From Cart
    window._delete_item = function(_this){
        _clear_cart_calculation();
        let item = $(_this);
        let id = item.attr('id');
        axios.post('/pos/delete-item',{
            id : id,
        }).then(function(e){
            console.log(e.data);
            _cart_items(); 
        });
    };

    //CART ITEMS
    let _cart_items = function(){
        product_qty = [];
        axios.get('/pos/cart-items?cartno='+cart_no).then(function(e){
            var items = e.data;
            var htm = ``;
            for(var i=0; i < items.length; i++){
                var pr_qty = {};
                pr_qty['product_no'] = items[i].product_no;
                pr_qty['quantity'] = items[i].quantity;
                product_qty.push(pr_qty);
                htm +=`
                    <tr>
                        <td>`+items[i].name+`</td>
                        <td>P`+items[i].price+`</td>
                        <td>
                            <input onchange="_update_quantity(this);" id="`+items[i].id+`" data-price="`+items[i].price+`" data-prno="`+items[i].product_no+`" type="number" value="`+items[i].quantity+`" min="0" style="width:50px;" />
                        </td>
                        <td>P`+items[i].total_price+`</td>
                        <td>
                            <div class="list-icons">
                                <a href="#" onclick="_delete_item(this);" id="`+items[i].id+`" class="list-icons-item text-danger-600"><i class="icon-trash"></i></a>
                            </div>
                        </td>
                    </tr>`;
            }
            $('#item-list').html(htm);
            _cart_items_subtotal();
        });
    };

    //Add Item to POS Carrt
    window._add_item_to_cart = function(_no){
        axios.post('/pos/add-item-to-cart',{
            cartno : cart_no,
            productno : _no
        }).then(function(e){
            if(e.data.message === "exist"){
                master._message_box('Item is Already on the Cart','info');
            }
            if(e.data.message === "zero"){
                master._message_box('Item is out of Stock','warning');
            }
            if(e.data.message === "notavail"){
                master._message_box('Item is not Available','warning');
            }
            _cart_items();
        });
    };

    // Paid the Item
    let _paid_cartno = function(){
        if(Number(change.val()) <= 0){
            master._message_box('Cart Items is Empty','warning');
        }else{
            axios.post('/pos/paid-cart',{
                cartno : cart_no,
                subtotal : sub_total.val(),
                discount : discount.val(),
                payable : payable.val(),
                money : money.val(),
                change : change.val(),
                pr_qty : JSON.stringify(product_qty)
            }).then(function(e){
                console.log(e.data);
                var xvarurl = "/pos/cart-receipt?cartno="+cart_no;
                var left = (screen.width - 390) / 2;
                var top = (screen.height - 600) / 4;
                window.open(xvarurl,'Cart Receipt','width=390,height=600, top='+top+', left='+left);  
            });
        }
    }

    //Selec Category From  POS
    let _select_category = function(){
        $('#category').on('change',function(){
            var category = $(this).val();
            axios.post('/pos/select-category',{
                name : category,
            }).then(function(e){
                let products = e.data;
                let htm = ``;
                for(var i=0; i<products.length; i++){
                    var cover = (products[i].cover_image != "")?products[i].cover_image : '/assets/images/Me.png';

                    htm += `
                    <div class="col-sm-6 col-xl-3">
                        <div class="card">
                            <div class="card-img-actions mx-1 mt-1"><img class="card-img img-fluid" src="`+cover+`" alt="" />
                                <div class="card-img-actions-overlay card-img">
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="d-flex align-items-start flex-nowrap">
                                    <div>
                                        <div class="font-weight-semibold mr-2">
                                        `+products[i].name+`
                                        </div>
                                        <span class="font-size-sm text-muted">Price: `+products[i].price+`</span> <br />
                                        <span class="font-size-sm text-muted">Stock: `+products[i].quantity+`</span>
                                    </div>
                                    <div class="list-icons list-icons-extended ml-auto">
                                        <a class="list-icons-item add-item" onclick="_add_item_to_cart('`+products[i].no+`');">
                                            <i class="fa fa-plus"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                }
                $('#product-list').html(htm);
            });
        });
    }

    //Generate new Cart Order Number
    _generate_cart_no = function(){
        axios.get('/pos/cart-no')
        .then(function(e){
            var _cartno = e.data.message;
            cart_no = _cartno;
            $('#cartno').html(cart_no);
            _cart_items();
        });
    };


    return{
        initPOS : function(){
            _new_order();
            _to_kitchen();
            _payment_order();
            _select_category();
            _generate_cart_no();
            _cancel_cart_items();
            _caculate_cart_items();
            _clear_cart_calculation();
        }
    }

}();







// Load HTMl Documents
document.addEventListener('DOMContentLoaded',function(){
    POS.initPOS();    
});


