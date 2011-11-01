KISSY.config({
    packages:[
        {
            name:"taogold",
            path:"../assets/2.0/js/"
        }
    ]
});

KISSY.use("taogold/userlist,taogold/preview,taogold/dialog",function(S, UserList, Preview, Dialog){

    var D = S.DOM,
        E = S.Event,
        doc = document;
    
    var USE_CLS = 'op-use',
        USE_CONFIRM_CLS = 'op-use-confirm',
        STOP_CLS = 'op-stop',
        STOP_CONFIRM_CLS = 'op-stop-confirm',
        USE_TXT = '立即启用',
        USE_CONFIRM_TXT = '确定启用',
        STOP_TXT = '我想禁用',
        STOP_CONFIRM_TXT = '确定禁用',
        USING_TIPS = '上次启用操作仍在处理中，请耐心等待，可<a href="index.html">点此刷新</a>查看。',
        STOPPING_TIPS = '上次禁用操作仍在处理中，请耐心等待，可<a href="index.html">点此刷新</a>查看。',
        USED_TIPS = '<b>服务已启用</b>，进入<a href="history.html">操作记录</a>可以查看哪些宝贝已成功插入了相关宝贝推荐。<br/>想删除相关宝贝推荐，请点击“我想禁用”。<br/>',
        STOPPED_TIPS = '<b>服务已禁用</b>。点击“立即启用”后，将在您的所有宝贝详情底部自动插入相关宝贝推荐。<br/>您可以<a class="J_Preview" href="#">点此预览</a>启用效果。',
        USE_CONFIRM_TIPS = '<b>确定要启用吗？</b>确定的话，请点击“确定启用”。',
        STOP_CONFIRM_TIPS = '<b>确定要禁用吗？</b>确定的话，请点击“确定禁用”。',
        USE_REQUEST_TIPS = '<b>服务正在启用</b>，预计 {ti} 分钟后完成，届时请按<a href="index.html">点此刷新</a>查看。<br/>您还可以<a class="J_Preview" href="#">点此预览</a>启用效果。',
        STOP_REQUEST_TIPS = '<b>服务正在禁用</b>，预计 {ti} 分钟后完成，届时请按<a href="index.html">点此刷新</a>查看。';

    var op = D.get('#J_Op'), 
        opBtn = D.get('#J_OpBtn'), 
        opTips = D.get('#J_OpTips'),
        status = op.getAttribute('status'),
        btnCls = '', 
        btnTxt = '', 
        tipsTxt = '';
    
    //修改操作区状态
    function opChange(btnCls,btnTxt,tipsTxt){
        opBtn.className = btnCls;
        opBtn.innerHTML = btnTxt;
        opTips.innerHTML = tipsTxt;
    }
    
    //高亮操作区
    function opHighlight(){
        D.css(op,{border:'1px solid #ffcc7f',background:'#ffffe5'});
        S.Anim(op,{'background-color':'#fff','border-color':"#fff"},2).run();
    }
    
    //初始化操作区
    switch(status){
        case 's':
            btnCls = USE_CLS;
            btnTxt = USE_TXT;
            tipsTxt = STOPPED_TIPS;			
            break;
        case 'S':
        case 'T':
            btnCls = USE_CLS;
            btnTxt = USE_TXT;
            tipsTxt = STOPPING_TIPS;
            break;
        case 'u':
            btnCls = STOP_CLS;
            btnTxt = STOP_TXT;
            tipsTxt = USED_TIPS;			
            break;
        case 'U':
        case 'V':
            btnCls = STOP_CLS;
            btnTxt = STOP_TXT;
            tipsTxt = USING_TIPS;
            break;
        default:
            break;
    }    
    opChange(btnCls,btnTxt,tipsTxt);
    
    //启用/禁用操作
    E.on(opBtn,'click',function(e){
        e.preventDefault(); 
        switch(opBtn.className){
            case USE_CLS:
                //立即启用
                opHighlight();
                opChange(USE_CONFIRM_CLS, USE_CONFIRM_TXT, USE_CONFIRM_TIPS);
                break;
            case USE_CONFIRM_CLS:
                //确认启用
                S.io.get(
                    'use.html',
                    null,
                    function(o){
                        var data = S.JSON.parse(o);
                        opChange(STOP_CLS, STOP_TXT, S.substitute(USE_REQUEST_TIPS, data));
                        setTimeout(function(){window.location.reload();},data.ti*60*1000);
                    }
                );
                break;
            case STOP_CLS:
                //我想禁用
                opChange(STOP_CONFIRM_CLS, STOP_CONFIRM_TXT, STOP_CONFIRM_TIPS);
                break;
            case STOP_CONFIRM_CLS:
                //确认禁用
                S.io.get(
                    'stop.html',
                    null,
                    function(o){
                        var data = S.JSON.parse(o);
                        opChange(USE_CLS, USE_TXT, S.substitute(STOP_REQUEST_TIPS, data));
                        setTimeout(function(){window.location.reload();},data.ti*60*1000);
                    }
                );
                break;
            default:
                break;
        }
    });
    
    //最近订购用户
    new UserList('#J_Users');
    
    //预览
    E.on(doc.body,'click',function(e){
        var t = e.target;
        if(D.hasClass(t,'J_Preview')){
            e.preventDefault();
            new Preview();
        }
    });
    
    //新老版用户状态检查
    S.io.get(
        'old.html',
        null,
        function(o){
            var data = S.JSON.parse(o), olduser = data.olduser;
            console.log(olduser);
            if(olduser){
                var dialog = new Dialog({title:'升级提示',type:'alert',closeBtn:0,width:770});
                dialog.appendContent('您还在使用老版淘金宝的相关宝贝推荐，请返回老版禁用老模板后，再来启用新版。<br/>老版将于近期停止服务，新版淘金宝，推荐更精准，更快速，推荐您尽快切换。<br/><br/>点此<a href="/newtop/rechome.html">返回老版禁用老模板</a>。<br/><br/>');
                dialog.show();
            }
        }
    );
    
});