'use strict';


var Products = function(){



    window._delete_product = function(_this){
        var no = $(_this).attr('data-no');
        master._delete_data(function(e){
        
            if(e.value === true){
                axios.get('/products/delete-product?no='+no)
                .then(function(e){
                    // console.log(e);
                    if(e.data.message === "deleted"){
                        master._message_box('Successfuly Deleted', 'success');
                    }
                    _get_product_list('');
                });
            }
        });
    };

    var _select_category = function(){
        $('#select-cat').on('change',function(){
            var cat = $(this).val();
            _get_product_list(cat);
        });
    }

    var _get_product_list = function(_cat){
        axios.get('/products/table-products?cat='+_cat)
        .then(function(e){
            _table_products(e.data);
        });
    };


    var _save_update_products = function(){
        $('#product-form').submit(function(e){

            var name = e.target[0].value;
            var cat = e.target[1].value;
            var price = e.target[2].value;
            var qty = e.target[3].value;
            var status = e.target[4].value;

            if(name === ""){
                master._message_box('Name is Empty!', 'warning');
            }else if(cat === ""){
                master._message_box('Catergory is Empty!', 'warning');
            }else if(price === ""){
                master._message_box('Price is Empty!', 'warning');
            }else if(qty === ""){
                master._message_box('Quantity is Empty!', 'warning');
            }else if(status === ""){
                master._message_box('Status is Empty!', 'warning');
            }else{
                $(this).ajaxSubmit({
                    success: function(x){
                        console.log(x.message);
                        if(x.message === 'saved'){
                            master._message_box('Successfuly Saved', 'success');
                            $('#product-form').clearForm();
                        }
                        if(x.message === 'updated'){
                            master._message_box('Successfuly Updated', 'success');
                        }
                        if(x.message === 'existed'){
                            master._message_box('Product Name is Already Exist!', 'warning');
                        }
                    },
                });
            }
            return false;
        });
    };
    

    var _table_products = function(data){
        $('#product-table').DataTable({
            data : data,
            dom: '<"datatable-header"fBl><"datatable-scroll-wrap"t><"datatable-footer"ip>',
            buttons: {            
                buttons: [
                    {
                        extend: 'copyHtml5',
                        className: 'btn btn-light',
                        exportOptions: {
                            columns: [ 0, ':visible' ]
                        }
                    },
                    {
                        extend: 'excelHtml5',
                        className: 'btn btn-light',
                        exportOptions: {
                            columns: ':visible'
                        }
                    },
                    {
                        extend: 'pdfHtml5',
                        className: 'btn btn-light',
                        exportOptions: {
                            columns: [0, 1, 2, 5]
                        }
                    },
                    {
                        extend: 'colvis',
                        text: '<i class="icon-three-bars"></i>',
                        className: 'btn bg-blue btn-icon dropdown-toggle'
                    }
                ]
            },
            columnDefs :[
                {
                    targets : [0],
                    data : data,
                    render : function(e){
                        if(e.cover_image === ""){
                            return `<img src="/assets/images/Me.png" alt="qrcode" style="width: 70px; height:70px;" />`;
                        }else{
                            return `<img src="`+e.cover_image+`" alt="qrcode" style="width: 70px; height:70px;" />`;
                        }
                    }
                },
                {
                    targets : [6],
                    data : data,
                    render :function(e){
                        return `
                            <a class="list-icons-item text-primary-600" href="/products/gallery/`+e.no+`">
                                <i class="fa fa-images"></i>
                            </a>                
                            <a class="list-icons-item text-primary-600" href="/products/add-update?no=`+e.no+`">
                                <i class="fa fa-edit"></i>
                            </a>
                            <a data-no="`+e.no+`" class="list-icons-item text-danger-600" href="#" onclick="_delete_product(this);">
                                <i class="fa fa-trash"></i>
                            </a>
                        `;
                    }
                }
            ],
            columns : [
                { data : null},
                { data : 'name', sTitle : 'Product'},
                { data : 'category', sTitle : 'Category'},
                { data : 'price', sTitle : 'Price'},
                { data : 'quantity', sTitle : 'Quantity'},
                { data : 'status', sTitle : 'status'},
                { data : null, sTitle : 'Option(s)'}
            ],
            bDestroy : true
        });
    };

    return {
        initProducts : function(){
            _get_product_list('');
            _save_update_products();
            _select_category();
        }
    }

}();


document.addEventListener('DOMContentLoaded',function(){
    Products.initProducts();
});