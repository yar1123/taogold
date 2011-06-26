KISSY.config({
    packages:[
        {
            name:"taogold",
            path:"../assets/js/"
        }
    ]
});

KISSY.use("taogold/preview,taogold/dialog",function(S, Preview, Dialog){

    var D = S.DOM, E = S.Event, doc = document, currentTrigger;
    
    var useTips = '启用该模板，将往您的所有宝贝描述里插入您设定的推荐内容。<br/>确定要启用吗？',
        stopTips = '禁用该模板，将从您的所有宝贝描述里删除您设定的推荐内容。<br/>确定要禁用吗？';
           
    var alertDialog = new Dialog({type:'alert', title:'提示', width:400, closeBtn:false}),
        confirmDialog = new Dialog({type:'confirm', title:'操作确认', width:400, closeBtn:false});
    
    //确认后执行启用或禁用操作
    confirmDialog.on('confirm',function(){
        S.io.get(
            D.hasClass(currentTrigger,'S_UseTrigger') ? '/top/use.html':'/top/stop.html',
            {'tempid':currentTrigger.getAttribute('tempid')},
            function(o){
                var data = eval('['+o+']');
                alertDialog.refreshContent(D.create('<div style="padding:10px;">'+ (D.hasClass(currentTrigger,'S_UseTrigger') ? '正在启用' : '正在禁用')+'，整个处理过程大约需要<span class="h">'+data[0].ti+'</span>分钟。<br/>届时我们会为您自动刷新页面。<br/>您也可以点击操作栏的<a href="/top/rechome.html">刷新页面</a>按钮进行手动刷行。</div>'));
                alertDialog.show();
                setTimeout(function(){window.location.reload();},data[0].ti*60*1000);
                var td = D.parent(currentTrigger,'td'), prevTd = D.prev(td,'td');
                td.innerHTML = '<a href="/top/rechome.html">刷新页面</a>';
                prevTd.innerHTML = D.hasClass(currentTrigger,'S_UseTrigger') ? '正在启用...' : '正在禁用...';
            }
        );
    });
    
    //预览模板
    E.on('.S_PriviewTrigger','click',function(e){
        e.preventDefault();
        Preview(e.target.getAttribute('data-temp-id'));
    });
    
    //启用禁用操作
    E.on('#S_TemplateList','click',function(e){
        var t = e.target;
        if(D.hasClass(t,'S_UseTrigger') || D.hasClass(t,'S_StopUseTrigger')){
            e.preventDefault();
            currentTrigger = t;
            confirmDialog.refreshContent(D.hasClass(t,'S_UseTrigger') ? useTips : stopTips);
            confirmDialog.show();                   
        }
    })
    
});