'user strict';
let POS = function(){
    var cart_no;
    var  sub_total, discount, payable, money, change;
    
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
                alert('Subtotal is Zero pls add new item or quantity');
                $(this).val(0);
                payable.val(0);
            }else{
                if(Number(discount.val()) < 0){
                    alert('Discount has a negative value');
                    $(this).val(0);
                }else if(Number(discount.val()) > 100){
                    alert('Discount is over 100%');
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
                alert('Not Enougth Money');
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
            console.log(e.data);
            var total = (e.data[0].total == null)? 0 : e.data[0].total;
            sub_total.val(total);
        });
    };

    //Update Quanity From Cart List
    window._update_quantity = function(_this){
        let quantity = $(_this);
        let id = quantity.attr('id');
        let price = quantity.attr('data-price');
        let qty = quantity.val();
        let total_price = Number(price) * Number(qty);

        if(Number(qty) <= 0 ){
            alert('Quantity must be greater zero(0)');
            quantity.val(1);
        }else{
            axios.post('/pos/update-quantity',{
                id : id,
                quantity :qty,
                total_price : total_price 
            }).then(function(e){
                console.log(e.data);
                _cart_items();
            });
        }
    };


    let _payment_order = function(){
        $('#payment').on('click',function(){
            if(Number(change.val()) <= 0){
                alert('Cart Items is Empty');
            }else{
                axios.post('/pos/paid-cart',{
                    cartno : cart_no,
                    subtotal : sub_total.val(),
                    discount : discount.val(),
                    payable : payable.val(),
                    money : money.val(),
                    change : change.val()
                }).then(function(e){
                    console.log(e.data);
                    var xvarurl = "/pos/cart-receipt?cartno="+cart_no;
                    var left = (screen.width - 390) / 2;
                    var top = (screen.height - 600) / 4;
                    window.open(xvarurl,'Cart Receipt','width=390,height=600, top='+top+', left='+left);  

                });
            }
            
        });
    };  


    //New Order ===========================================
    let _new_order = function(){
        $('#new-order').on('click',function(){
            if(Number(change.val()) <= 0){
                alert('Payment has not made yet');
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
        axios.get('/pos/cart-items?cartno='+cart_no).then(function(e){
            var items = e.data;
            console.log(items);
            var htm = ``;
            for(var i=0; i < items.length; i++){
                console.log(items[i]);
                htm +=`
                    <tr>
                        <td>`+items[i].name+`</td>
                        <td>P`+items[i].price+`</td>
                        <td>
                            <input onchange="_update_quantity(this);" id="`+items[i].id+`" data-price="`+items[i].price+`" type="number" value="`+items[i].quantity+`" min="0" style="width:50px;" />
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
            _cart_items();
        });
    };


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
                                        <span class="font-size-sm text-muted">P`+products[i].price+`</span>
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

    // NOTIFICATIONS==============================================================================


    _notifications_alert = function(){

        $('.sweet_success').on('click',function(){
            swalInit({
                title : 'Successfuly Done!',
                text : 'Operation successfuly done',
                type : 'success'
            }); 
        });

        $('.sweet_warning').on('clcik')

    }


    return{
        initPOS : function(){
            _new_order();
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


