KISSY.config({
    packages:[
        {
            name:"taogold",
            path:"../assets/js/"
        }
    ]
});

KISSY.use("taogold/userlist",function(S, UserList){

    var D = S.DOM,
        E = S.Event,
        doc = document;
    
    var USE_CLS = 'op-use',
        USE_CONFIRM_CLS = 'op-use-confirm',
        STOP_CLS = 'op-stop',
        STOP_CONFIRM_CLS = 'op-stop-confirm',
        USE_TXT = '立即启用',
        USE_CONFIRM_TXT = '确认启用',
        STOP_TXT = '我想停用',
        STOP_CONFIRM_TXT = '确认停用',
        USING_TIPS = '上次启用操作仍在处理中，请耐心等待…',
        STOPPING_TIPS = '上次停用操作仍在处理中，请耐心等待…',
        USE_CONFIRM_TIPS = '启用模板，将向您的所有宝贝描述里加入经过智能计算高度匹配的推荐内容。<br/>确定要启用吗？',
        STOP_CONFIRM_TIPS = '停用模板，将从您的所有宝贝描述里删除插入的推荐内容。<br/>确定要停用吗？',
        USE_REQUEST_TIPS = '模板启用中，本次操作预计 {ti} 分钟后生效。<br/>届时我们会为您自动刷新页面，您也可以手动刷新页面。',
        STOP_REQUEST_TIPS = '模板停用，本次操作预计 {ti} 分钟后生效。<br/>届时我们会为您自动刷新页面，您也可以手动刷新页面。';

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
        case 'S':
        case 'T':
            tipsTxt = STOPPING_TIPS;
            break;
        case 'u':
            btnCls = STOP_CLS;
            btnTxt = STOP_TXT;
        case 'U':
        case 'V':
            tipsTxt = USING_TIPS;
            break;
        default:
            break;
    }    
    opChange(btnCls,btnTxt,tipsTxt);
    
    //启用/停用操作
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
                        console.log(data);
                        opChange(STOP_CLS, STOP_TXT, S.substitute(USE_REQUEST_TIPS, data));
                        setTimeout(function(){window.location.reload();},data.ti*60*1000);
                    }
                );
                break;
            case STOP_CLS:
                //我想停用
                opChange(STOP_CONFIRM_CLS, STOP_CONFIRM_TXT, STOP_CONFIRM_TIPS);
                break;
            case STOP_CONFIRM_CLS:
                //确认停用
                S.io.get(
                    'stop.html',
                    null,
                    function(o){
                        var data = S.JSON.parse(o);
                        console.log(data);
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
    
});