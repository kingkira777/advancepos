'use strict';


var Sales = function(){

    var _search_sales = function(){
        $("#sales-form").submit(function(e){
            var from = e.target[0].value;
            var to = e.target[1].value;
            if(from === "" || to === ""){
                master._message_box('From OR To (Date Field) is Empty','warning');
            }else{
                $(this).ajaxSubmit({
                    success : function(x){
                        console.log(x);
                        _table_sales(x);
                    }
                })
            }
            return false;
        });
    };

    var _get_sales = function(_from,_to){
        axios.get('/sales/table-sales').then(function(e){
            console.log(e.data);
            _table_sales(e.data);
        });
    };

    var _table_sales = function(data){
        $('#table-sales').DataTable({
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
                    data :data,
                    render : function(e){
                        if(e.cover_image === ""){
                            return `<img src="/assets/images/Me.png" alt="qrcode" style="width: 70px; height:70px;" />`;
                        }else{
                            return `<img src="`+e.cover_image+`" alt="qrcode" style="width: 70px; height:70px;" />`;
                        }
                    }
                },
                {
                    targets : [5],
                    data : data,
                    render : function(e){
                        return moment(e.lastupdate).format('M/D/Y');
                    }
                }
            ],
            columns: [
                { data : null,},
                { data : 'name', sTitle : 'Product'},
                { data : 'price', sTitle : 'Price'},
                { data : 'quantity', sTitle : 'Quantity'},
                { data : 'total_price', sTitle : 'Total Price'},
                { data : null, sTitle : 'Date'},
            ],
            bDestroy : true
        })
    };

    return {
        initSales : function(){
            _get_sales();
            _search_sales();
        }
    };

}();



document.addEventListener('DOMContentLoaded',function(){
    Sales.initSales();
});