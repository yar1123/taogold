KISSY.add("taogold/preview",function(S, Dialog){
    var D = S.DOM, E = S.Event, doc = document;
    var dialog = new Dialog({'title':'效果预览',width:770, type:'alert'});
    var tips = '<div class="msg"><div class="msg-default msg-tips"><i class="msg-icon"></i><div class="msg-content">3个宝贝为随机选择，仅供您预览样式实际会推荐哪些宝贝需要等您启用淘金宝后，我们用智能算法帮您分析后得出</div></div></div>'

    function Preview(tempid){        
        S.IO({
            type: 'GET',
            url: 'preview.html',
            data:{'tempid':tempid},
            success: function(data, textStatus, xhr) {
                var c = D.create('<div></div>');
                c.innerHTML = tips + data;
                dialog.refreshContent(c);
                dialog.show();
            },
            dataType:'text'
        });
    }
    
    return Preview;
},{requires:['taogold/dialog']});
