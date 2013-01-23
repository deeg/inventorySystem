//Client side javascript
if(typeof Item == 'undefined'){
    var Item = {};
}

Item = {
    //Used to create label code for Justin.
    numberToLetterMap:{
        1: "A",
        2: "B",
        3: "C",
        4: "D",
        5: "E",
        6: "F",
        7: "G",
        8: "H",
        9: "I"
    },

    //Build input map for adding an item
    buildInputMap: function(selector){
        var inputMap ={};
        $('.'+ selector + ':visible').each(function(i, e){
            inputMap[this.name] = this.value;

            if(e.type == 'checkbox' && e.name != 'sold'){
                inputMap[this.name] = e.checked;
            }
        });


        return inputMap;
    },

    //Build input map for querying items
    buildInputMapForQuery: function(){
        var inputMap ={};
        $('.itemAttribute:visible').each(function(i, e){
            if(this.value != ''){
                var obj = {$regex: '.*'+this.value+'.*', $options:'i'};
                inputMap[this.name] = obj;
            }

            if(e.type == 'checkbox'){
                if(e.checked){
                    inputMap[this.name] = e.checked;
                }

            }
        })
        return inputMap;
    },

    saveForm: function(inputMap){
        $.ajax({
            type: 'POST',
            url: '/api/item',
            data: JSON.stringify(inputMap),
            success: Item.successfulAdd,
            error:Item.showErrorAdd,
            contentType: 'application/json',
            dataType: 'json'
        });
    },

    query:function(inputMap){
        $.ajax({
            type: 'POST',
            url: '/inventory/query',
            data: JSON.stringify(inputMap),
            success: Item.querySuccess,
            error:Item.showErrorQuery,
            contentType: 'application/json',
            dataType: 'json'
        });
    },

    updateItem:function(inputMap, id){
        $.ajax({
            type: 'POST',
            url: '/api/item/' + id,
            data: JSON.stringify(inputMap),
            success: Item.updateSuccess,
            error:Item.showErrorUpdate,
            contentType: 'application/json',
            dataType: 'json'
        });
    },

    sellItem:function(id){
        var data = {};
        data.unitsSold = $('.itemSellAttribute-'+ id + '[name=unitsSold]').val();
        data.salePrice = $('.itemSellAttribute-'+ id + '[name=salePrice]').val();

        $.ajax({
            type: 'POST',
            url: '/api/item/sell/' + id,
            data: JSON.stringify(data),
            success: Item.updateSuccess,
            error:Item.showErrorUpdate,
            contentType: 'application/json',
            dataType: 'json'
        });
    },

    deleteItem:function(id){
        if(confirm('Delete item?')){
            $.ajax({
                type: 'DELETE',
                url: '/api/item/' + id,
                success: function(){
                    $('#item-' + id).hide('slow');
                },
                error:Item.deleteError
            });
        }
    },

    updateSuccess:function(item){
        window.location = '/inventory/updated/' + item._id;
    },

    querySuccess:function(items){
        $('#queryItemContainer').hide(Item.clearForm);
        $('#addItemContainer').hide(Item.clearForm);
        $('#inventoryWrapper').html(Handlebars.templates.inventoryClientSide(items));
    },

    successfulAdd:function(item){
        window.location = '/inventory/added/' + item._id;
    },

    deleteError:function(){
      //TODO: Handle error on delete
        alert('Could not delete item. Please try again later.');
    },

    toggleEdit:function(id){
        if($('.attributeEdit-'+ id +':visible').size() > 0){
            //Edit is on, turn it off
            $('.attributeEdit-' + id).addClass('hidden');
            $('.attributeContent-' + id).removeClass('hidden');
            $('#editButton-' + id).addClass('btn-warning');
            $('#editButton-' + id).removeClass('btn-danger');
            $('#deleteButton-' + id).removeAttr('disabled');
        }else{
            //Edit is off, turn it on
            $('.attributeEdit-' + id).removeClass('hidden');
            $('.attributeContent-' + id).addClass('hidden');
            $('#editButton-' + id).removeClass('btn-warning');
            $('#editButton-' + id).addClass('btn-danger');
            $('#deleteButton-' + id).attr('disabled', 'disabled');
            $('#collapse-'+ id + ' [type=checkbox]').each(function(i, e){
                if(e.value){
                    e.checked = true;
                }
            });
            var gender = $('.attributeContent-' + id + '[name=gender]').html();
            $('.itemEditAttribute-' + id + '[name=gender] [value=' + gender + ']').attr('selected', 'selected');
        }
    },

    toggleSell:function(id){
        if($('.attributeSell-'+ id +':visible').size() > 0){
            //Sale is on, turn it off
            $('.attributeSell-' + id).addClass('hidden');
            $('#sellButton-' + id).removeClass('btn-danger');
            $('#sellButton-' + id).addClass('btn-success');
        }else{
            //Edit is off, turn it on
            $('.attributeSell-' + id).removeClass('hidden');
            $('#sellButton-' + id).removeClass('btn-success');
            $('#sellButton-' + id).addClass('btn-danger');
        }
    },

    showErrorAdd:function(){
        $('#addItemFailure').removeClass('hidden');

    },
    showErrorQuery:function(){
        $('#queryItemFailure').removeClass('hidden');

    },

    clearForm:function(){
        $('.itemAttribute:enabled').each(function(i, e){
            var $e = $(e);
            //Don't clear the purchseDate or Consigner so it can have a default value.
            if($e.attr('name') != 'purchaseDate' && $e.attr('name') != 'consigner' && $e.attr('name') != 'quantity'){
                $e.val('');
            }

            if(e.type == 'checkbox'){
                $e.attr('checked', false);
            }
        })
    },

    //Generate selected labels
    generateLabels:function(){
        var itemsToGenerate = [];
        $('.generateLabel').each(function(i, e){
            var $e = $(e);
            itemsToGenerate.push({_id: $e.attr('for')});
        });

        var postData = {idsToGenerate: itemsToGenerate};

        $.ajax({
            type: 'POST',
            url: '/labels/generate/',
            data: JSON.stringify(postData),
            success: Item.renderLabels,
            //TODO: Handle error of generating labels better
            error:function(){alert('error rendering labels');},
            contentType: 'application/json',
            dataType: 'json'
        });
    },

    //Render the generated labels
    renderLabels:function(res){
        if(res != null){
            $.each(res, function(i, e){
                e.justinId = Item.generateJustinId(e);
            });
            $('#queryItemContainer').hide(Item.clearForm);
            $('#addItemContainer').hide(Item.clearForm);
            $('#bodyWrapper').html(Handlebars.templates.labels(res));
        }
    },

    //Used to create the ID which Justin wants on labels
    generateJustinId:function(item){
        var justinId = '';
        justinId = justinId + item.itemId;
        justinId = justinId + item.consigner.slice(0, 2).toUpperCase();
        if(item.cost != ''){
            var costArr = item.cost.split('.');
            costArr = costArr[0].split('');
            $.each(costArr, function(i, e){
                justinId = justinId + Item.numberToLetterMap[e];
            });
        }
        if(item.purchaseDate != ''){
            var purchaseDateArr = item.purchaseDate.split('-');
            var month = purchaseDateArr[1];
            justinId = justinId + month;
        }
        return justinId;
    },

    getTodaysDate:function(element){
        $e = $(element);
        if($e.val() === '' || $e.val() == undefined || $e.val() == null){
            var now = new Date();
            var month = (now.getMonth() + 1);
            var day = now.getDate();
            if(month < 10)
                month = "0" + month;
            if(day < 10)
                day = "0" + day;
            var today = now.getFullYear() + '-' + month + '-' + day;
            return today;
        }
    },

    calculateQuantity:function(ammountSoldElement, selector){
        $e = $(ammountSoldElement);
        var quantityElement = $('.' + selector + '[name=quantity]');
        quantityElement.val(+quantityElement.attr('hardValue') - +$e.val());
    }
}