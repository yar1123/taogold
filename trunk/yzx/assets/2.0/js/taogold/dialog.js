KISSY.add("taogold/dialog",function(S,Overlay,Mask){
    var D = S.DOM, E = S.Event, doc = document, mask = new Mask();
    
    /**
     * config.width
     * config.title
     * config.type 对话框类型，可选'alert','confirm'，默认为null
     * config.closeBtn true
     */
    function Dialog(config){
        var self = this;
        self._config = S.merge({width:900,title:'弹出层',closeBtn:1}, config);
        self._render();
    }
    
    S.augment(Dialog,S.EventTarget,{
        show:function(){
            var self = this;
            self._el.style.display = 'block';
            setTimeout(function(){self._setPosition()},0);
            mask.show();
            self._visible = 1;
            self.fire('show');
        },
        hide:function(){
            var self = this;
            self._el.style.display = 'none';
            mask.hide();
            self._visible = 0;
            self.fire('hide');
        },
        refreshContent:function(el){
            var self = this;
            self._bdEl.innerHTML = '';
            self.appendContent(el);
        },
        appendContent:function(el){
            var self = this, bdEl = self._bdEl, inner = bdEl.innerHTML;
            if(S.isString(el)){
                bdEl.innerHTML = inner + el;
            }else{
                bdEl.appendChild(el);
            }
        },
        _render:function(){
            var self = this, cfg = self._config, type = cfg.type, str, footstr = '';
            
            //为alert或confirm类型的对话框增加按钮
            if(type == 'alert' || type == 'confirm'){
                footstr = '<div class="box-ft"><button class="confirm-btn" type="button">确 定</button>';
                if(type == 'confirm') footstr += '<button class="cancel-btn" type="button">取 消</button>';
                footstr += '</div>';
            }
            str = '<div class="overlay box box-padding" style="display:none;position:absolute;width:'+ cfg.width +'px;z-index:9999;">'+
                        '<div class="box-hd">'+
                            '<h3 class="box-title">' + cfg.title + '</h3>'+
                            (cfg.closeBtn ? '<div class="box-act"><a class="box-close" href="#">\u5173\u95ed</a></div>': '')+
                        '</div>'+
                        '<div class="box-bd"></div>'+
                        footstr +
                    '</div>';
            self._el = D.create(str);
            S.ready(function(){doc.body.appendChild(self._el);});
            self._titleEl = D.get('.box-title',self._el);
            
            if(cfg.closeBtn){
                self._closeEl = D.get('.box-close',self._el);                      
                E.on(self._closeEl,'click',function(e){
                    e.preventDefault();                
                    self.hide();
                });
            }
            
            self._bdEl = D.get('.box-bd',self._el); 
            
            //为alert或confirm类型的对话框的按钮添加事件
            if(type == 'alert' || type == 'confirm'){
                self._confirmBtnEl = D.get('.confirm-btn', self._el);                
                E.on(self._confirmBtnEl,'click',function(e){
                    self.hide();
                    self.fire('confirm');
                    
                });
                if(type == 'confirm'){
                    self._cancelBtnEl = D.get('.cancel-btn',self._el);
                    E.on(self._cancelBtnEl,'click',function(e){
                        self.hide();
                        self.fire('cancel');                        
                    });
                }
            }
            
            E.on(window,'resize',function(){self._setPosition()});
        },
        _setPosition:function(){
            var self = this;
            var l = (D.viewportWidth() - self._config.width)/2,
                t = D.scrollTop() + (D.viewportHeight() - self._el.offsetHeight)/2;
            self._el.style.left =(l>0 ? l : 0) +'px';
            self._el.style.top = (t>0 ? t : 0)+'px';
        }
    });
    
    return Dialog;
},{requires:['overlay','taogold/mask']});
