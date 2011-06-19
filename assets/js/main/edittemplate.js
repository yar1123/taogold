KISSY.config({
    packages:[
        {
            name:"taogold",
            path:"../assets/js/"
        }
    ]
});

KISSY.use("taogold/preview,taogold/dialog,taogold/coupleselect",function(S, Preview, Dialog, CoupleSelect){
    var D = S.DOM, E = S.Event, doc = document;
    
    var selectTrigger = D.get('#S_SelectTrigger'), dialog, itemTempl, coupleSelect, getItems;
    
    //获取模板设置信息
    function getTemplInfo(){
        var info = {};
        //模板id
        if(D.get('#S_TemplateId')){
            info.tempid = D.get('#S_TemplateId').value;
        }
        //模板名
        info.name = D.get('#S_TemplateName').value;
        //模板位置
        info.position = D.get('#S_PositionTop').checked ? 't' : 'b';
        info.mode = D.get('#S_SelectManual').checked ? 'm' : 'a';
        if(info.mode == 'm'){
            info.iid = D.get('#S_SelectItems').value;
        };
        return info;
    }
    
    //获取模板初始信息
    var initTemplInfo = getTemplInfo();
    
    //模板信息是否和初始设置相等
    function isEqualsInitInfo(info){
        var rt = true, k = ['name','position','mode'] ;
        for(var i = 0;i < 3;i++){
            if(info[k[i]] != initTemplInfo[k[i]]) rt = false;
        }
        if((info.mode == 'm') && (initTemplInfo.mode == 'm') ){
            if(info.iid != initTemplInfo.iid) rt = false;
        }
        return rt;
    }
    
    //检查提交并预览按钮的激活状态
    function checkSavePreviewBtn(){
        var btn = D.get('#S_SavePreview'), info = getTemplInfo();
        //如果手工模式下选择不满3个则disable
        if(info.mode == 'm' && (info.iid.split(',').length < 3)){
            btn.disabled = true;
        }else if(initTemplInfo.tempid && isEqualsInitInfo(info)){//是修改模板，且同初始值，则disable
            btn.disabled = true;
        }else{
            btn.disabled = false;
        }
    }
    
    E.on('#S_TemplateName','blur',function(){checkSavePreviewBtn();});
    E.on('#S_PositionTop','click',function(){checkSavePreviewBtn();});
    E.on('#S_PositionBottom','click',function(){checkSavePreviewBtn();});
    E.on('#S_SelectAuto','click',function(){checkSavePreviewBtn();});
    E.on('#S_SelectManual','click',function(){checkSavePreviewBtn();});
    
    //选择手工推荐宝贝，显示编辑链接
    E.on('#S_SelectManual','click',function(e){
        selectTrigger.style.display = '';
    });
    //选择自动推荐宝贝，隐藏编辑链接
    E.on('#S_SelectAuto','click',function(e){
        selectTrigger.style.display = 'none';
    });
    
    //编辑推荐item链接
    E.on(selectTrigger,'click',function(e){
    
        //第一次点点击人工选择宝贝初始化
        if(!dialog){
        
            //实例化对话框
            dialog = new Dialog({title:'选择宝贝',width:960});
            
            //创建item选择框
            var str = '<div class="couple-select">'+
                            '<div class="couple-select-src">'+
                                '<div class="bar">出售中的宝贝</div>'+
                                '<div class="bar"><form class="form"><select id="S_ItemCat"><option value="">所有类目…</option></select> <input id="S_ItemKw" type="text" /> <button id="S_ItemSchTrigger" class="button" type="button">搜索</button></form></div>'+
                                '<div id="S_CoupleSelectSrc" class="item-list"></div>'+
                            '</div>'+
                            '<div class="couple-select-target">'+
                                '<div class="bar">已推荐的宝贝（一共可推荐3个）</div>'+
                                '<div id="S_CoupleSelectTarget" class="item-list"></div>'+
                                '<div class="bar"><form class="form"><button id="S_CoupleSelectSubmit" class="button finish-select" disabled="disabled" type="button">我选好了</button></form></div>'+
                            '</div>'+
                        '</div>';
            
            dialog.appendContent(D.create(str));
            
            //item模板
            itemTempl = '<div><div class="img"><image src="{pic_url}"/></div><a class="title" href="http://item.taobao.com/item.htm?id={num_iid}" target="_blank">{title}</a><span class="price">￥{price}</span><div class="operation"><a class="add" href="#">推荐</a><a class="moveup" href="#">上移</a><a class="movedown" href="#">下移</a><a class="remove" href="#">删除</a></div></div>';   
            
            //实例化选择item
            coupleSelect = new CoupleSelect({src:'#S_CoupleSelectSrc',target:'#S_CoupleSelectTarget',itemCls:'item',itemTempl:itemTempl});
            
            //每次选择item后，移除多余3个的前面的item
            coupleSelect.on('add',function(){
                var selectItems = coupleSelect.getTargetItems();
                if(selectItems.length>3){
                    for(var i=0,len=selectItems.length;i<len-3;i++){
                        coupleSelect.remove(selectItems[i]);
                    }
                }
            });
            
            //校验按钮是否可点
            var checkCoupleSelectSubmit = function(){
                var btn = D.get('#S_CoupleSelectSubmit');
                if(coupleSelect.getTargetItems().length == 3){
                    btn.disabled = false;
                }else{
                    btn.disabled = true;
                }
            }
            coupleSelect.on('add',function(){checkCoupleSelectSubmit();});
            coupleSelect.on('remove',function(){checkCoupleSelectSubmit();});
            
            //选择推荐的item
            E.on('#S_CoupleSelectSrc','click',function(e){
                var t = e.target;
                if(D.hasClass(t,'add')){
                    e.preventDefault();
                    coupleSelect.add(t);
                }
            });    
            
            //上移，下移，移除
            E.on('#S_CoupleSelectTarget','click',function(e){
                var t = e.target;
                if(D.hasClass(t,'moveup')){
                    e.preventDefault();
                    coupleSelect.up(t);
                }else if(D.hasClass(t,'movedown')){
                    e.preventDefault();
                    coupleSelect.down(t);
                }else if(D.hasClass(t,'remove')){
                    e.preventDefault();
                    coupleSelect.remove(t);
                }
            });
            
            //异步加载数据并渲染
            getItems = (function(){
                var amount = 0, lastParam = {start:0,len:40};
                /*
                param.start
                param.len
                param.cat 分类
                param.kw 关键字
                */
                return function(param){
                    param = param || {};
                    S.mix(param,lastParam,false);
                    //获取item数据
                    S.io.get(
                        'onsales.html',
                        param,
                        function(o){
                            var data = eval(o);
                            //如果更换了分类或关键词，则重新加载备选项，否则鼠标在coupleSelect源滚动时，增加备选项
                            if((param.cat != lastParam.cat)||(param.kw != lastParam.kw)){
                                coupleSelect.refreshSrcItems(data);
                                amount = 0;
                            }else{
                                coupleSelect.appendSrcItems(data);
                                amount += data.length;
                            }
                            lastParam = param;
                        }
                    );
                }    
            })();
            
            //初始化获取item
            getItems();
            
            //获取类目
            S.io.get(
                'cats.html',
                null,
                function(o){
                    var data = eval('['+o+']');
                    var cats = data[0].seller_cat;
                    var catSelect = S.get('#S_ItemCat');
                    for(var i = 0,len = cats.length;i<len;i++){
                        catSelect.appendChild(D.create('<option value="'+cats[i].cid+'">'+cats[i].name+'</option>'))
                    }
                    catSelect.value = '';
                    //改变类目时重新获取item
                    E.on(catSelect,'change',function(e){
                        getItems({cat:catSelect.value});
                    });
                }
            );
            
            
            //搜索
            E.on('#S_ItemSchTrigger','click',function(e){
                e.preventDefault();
                var param = {};
                param.cat = D.get('#S_ItemCat').value;
                param.kw = D.get('#S_ItemKw').value;
                getItems(param);
            })
            
            //确认手工选择类目
            E.on('#S_CoupleSelectSubmit','click',function(e){
                var targetItems = coupleSelect.getTargetItems(), iidArr = [];
                for(var i = 0,len = targetItems.length;i<len;i++){
                    var data = targetItems[i]['data-item-info'];
                    iidArr.push(data['num_iid']);
                }
                D.get('#S_SelectItems').value = iidArr.toString();
                dialog.hide();
                checkSavePreviewBtn();
            });
            
        }
        
        dialog.show();
        
    });
    
    
    //提交数据
    E.on('#S_SavePreview','click',function(e){
        e.preventDefault();
        var param = getTemplInfo();
        S.io.post(
            'saveedit.html',
            param,
            function(o){
                var c = D.create('<div></div>');
                c.innerHTML = '<div class="msg"><div class="msg-default msg-tips"><i class="msg-icon"></i><div class="msg-content">模板保存成功，以下为预览效果。您可以去<a href="rechome.html">模板列表</a>页面进行相关操作。</div></div></div>'+ o;
                var previewDialog = new Dialog({title:'模板预览',width:770});
                previewDialog.on('hide',function(){
                    window.location = 'rechome.html';
                });
                previewDialog.refreshContent(c);
                previewDialog.show();     
            }
        );
        
    });
    
});
