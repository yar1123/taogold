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
    
    var useTips = {
            'a':'启用“系统自动推荐”模板，系统每周会对您的每个宝贝进行一次全面分析，并自动更新相关宝贝推荐结果（会邮件通知到您）。<br/>确定要启用吗？',
            'm':'启用“人工选择宝贝”模板，将往您的所有宝贝描述里插入您设定的推荐内容。<br/>确定要启用吗？'
        },
        topTips = '禁用该模板，将从您的所有宝贝描述里删除您设定的推荐内容。<br/>确定要禁用吗？';
           
    var alertDialog = new Dialog({title:'提示', width:400, closeBtn:false}),
        confirmDialog = new Dialog({type:'confirm', title:'操作确认', width:400, closeBtn:false});
    
    //确认后执行启用或禁用操作
    confirmDialog.on('confirm',function(){
        
        S.io.get(
            D.hasClass(currentTrigger,'S_UseTrigger') ? '/newtop/use.html':'/newtop/stop.html',
            {'tempid':currentTrigger.getAttribute('tempid')},
            function(o){
                var data = eval('['+o+']');
                alertDialog.refreshContent(D.create('<div style="padding:10px;">'+ (D.hasClass(currentTrigger,'S_UseTrigger') ? '正在启用' : '正在禁用')+'，整个处理过程大约需要<span class="h">'+data[0].ti+'</span>分钟。<br/>届时我们会为您自动刷新页面。<br/>您也可以点击<a href="/newtop/rechome.html">刷新页面</a>进行手动刷新。</div>'));
                alertDialog.show();
                setTimeout(function(){window.location.reload();},data[0].ti*60*1000);
                var td = D.parent(currentTrigger,'td'), prevTd = D.prev(td,'td');
                td.innerHTML = '<a href="/newtop/rechome.html">刷新页面</a>';
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
            confirmDialog.refreshContent(D.hasClass(t,'S_UseTrigger') ? useTips[currentTrigger.getAttribute('tempmode')] : stopTips);
            confirmDialog.show();                   
        }
    })
    
});
