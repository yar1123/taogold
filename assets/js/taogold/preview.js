KISSY.add("taogold/preview",function(S, Dialog){
    var D = S.DOM, E = S.Event, doc = document;
    var dialog = new Dialog({'title':'\u6a21\u677f\u9884\u89c8',width:744});
    function Preview(tempid){        
        S.IO({
            type: 'GET',
            url: 'preview.html',
            data:{'tempid':tempid},
            success: function(data, textStatus, xhr) {
                var c = D.create('<div></div>');
                c.innerHTML = data;
                dialog.refresh(c);
                dialog.show();
            },
            dataType:'text'
        });
    }
    
    return Preview;
},{requires:['taogold/dialog']});
