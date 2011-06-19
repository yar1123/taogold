KISSY.config({
    packages:[
        {
            name:"taogold",
            path:"../assets/js/"
        }
    ]
});

KISSY.use("taogold/preview,taogold/dialog",function(S, Preview, Dialog){
    var D = S.DOM, E = S.Event, doc = document;
    //预览模板
    E.on('.S_PriviewTrigger','click',function(e){
        e.preventDefault();
        Preview(e.target.getAttribute('data-temp-id'));
    });
    //启用禁用操作
    var dialog = new Dialog({'title':'提示','width':400});
    E.on('#S_TemplateList','click',function(e){
        var t = e.target;
        if(D.hasClass(t,'S_UseTrigger') || D.hasClass(t,'S_StopUseTrigger')){
            e.preventDefault();
            S.io.get(
                D.hasClass(t,'S_UseTrigger') ? '/top/use.html':'/top/stop.html',
                {'tempid':t.getAttribute('tempid')},
                function(o){
                    var data = eval('['+o+']');
                    dialog.append(D.create('<div style="padding:10px;">'+ (D.hasClass(t,'S_UseTrigger') ? '正在启用' : '正在禁用')+'，整个处理过程大约需要<span class="h">'+data[0].ti+'</span>分钟。<br/>届时我们会为您自动刷新页面。<br/>您也可以点击操作栏的<a href="/top/rechome.html">刷新页面</a>按钮进行手动刷行。</div>'));
                    dialog.show();
                    setTimeout(function(){window.location.reload();},data[0].ti*60*1000);
                    var td = D.parent(t,'td'), prevTd = D.prev(td,'td');
                    td.innerHTML = '<a href="/top/rechome.html">刷新页面</a>';
                    prevTd.innerHTML = D.hasClass(t,'S_UseTrigger') ? '正在启用...' : '正在禁用...';
                }
            );                    
        }
    })
});
