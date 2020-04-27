'use strict';


var References = function(){

    window._delete_category = function(_this){
        master._delete_data(function(e){
            var id = $(_this).attr('data-id');
            if(e.value === true){
                axios.get('/references/category/delete?id='+id)
                .then(function(e){
                    master._message_box('Successfuly Deleted','success');
                    _cegory_list();
                });
            }
        });
    };

    var _save_category = function(){

        $('#category-form').submit(function(e){
            var cat = e.target[0].value;
            if(cat === ""){
                master._message_box('Category name is Empty!', 'warning');
            }else{
                $('#category-form').ajaxSubmit({
                    success : function(x){
                        if(x.message === "saved"){
                            master._message_box('Successfuly Saved', 'success');
                        }
                        if(x.message === "exist"){
                            master._message_box('Category Already Exist', 'warning');
                        }
                        _cegory_list();
                    }
                });
            }
            return false;
        });
    };

    var _cegory_list = function(){
        axios('/references/table-category')
        .then(function(e){
            _table_category(e.data);
        });
    };


    var _table_category = function(data){
        $('#table-categories').DataTable({
            data : data,
            columnDefs : [
                {
                    targets : [1],
                    data : data,
                    width : '100px',
                    align: 'right',
                    render : function(e){
                        return `
                            <a class="text-danger" href='#' onclick="_delete_category(this);" data-id="`+e.id+`">
                                <i class="fa fa-trash"></i> DELETE 
                            </a>
                        `;
                    }
                }
            ],
            columns :[
                { data : 'name', sTitle : 'Name'},
                { data : null, sTitle : 'Option(s)'}
            ],
            bDestroy : true
        });
    };




    return {
        initRef : function(){
            _table_category();
            _cegory_list();
            _save_category();
        }
    }

}();


document.addEventListener('DOMContentLoaded',function(){
    References.initRef();
});