KISSY.config({
    packages:[
        {
            name:"taogold",
            path:"../assets/js/"
        }
    ]
});

KISSY.use("anim,taogold/userlist",function(S, Anim, UserList){

    var D = S.DOM, E = S.Event, doc = document, currentTrigger;
    
    var useTips = '启用模板提示。<br/>确定要启用吗？',
        stopUseTips = '禁用该模板，将从您的所有宝贝描述里删除您设定的推荐内容。<br/>确定要禁用吗？';
    
    if(D.get('#J_UseBtn')){
        var opBox = D.get('#J_OpBox'), useBtn = D.get('#J_UseBtn'), msgBox = D.get('#J_MsgBox');
        E.on(useBtn,'click',function(e){
            e.preventDefault();
            //如果是确认启用
            if(D.hasClass('use-confirm')){
                
            }else{
            //如果是立即启用
                D.css(opBox,{border:'1px solid #ffcc7f',background:'#ffffe5'});
                D.addClass(useBtn,'use-confirm');
                msgBox.innerHTML = '<p>'+useTips+'</p>';
                Anim(opBox,{'background-color':'#fff','border-color':"#fff"},3).run();
            }
            
        });
    }
    
    var userlist = new UserList('#S_UserList');
    
});