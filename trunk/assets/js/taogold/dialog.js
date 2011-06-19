KISSY.add("taogold/dialog",function(S,Overlay,Mask){
    var D = S.DOM, E = S.Event, doc = document, mask = new Mask();
    
    function Dialog(config){
        var self = this;
        self._config = config || {};
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
        refresh:function(el){
            var self = this;
            self._bdEl.innerHTML = '';
            self.append(el);
        },
        append:function(el){
            var self = this, bdEl = self._bdEl, inner = bdEl.innerHTML;
            if(S.isString(el)){
                bdEl.innerHTML = inner + el;
            }else{
                bdEl.appendChild(el);
            }
        },
        _render:function(){
            var self = this, cfg = self._config,
                str = '<div class="overlay box box-padding" style="display:none;position:absolute;width:'+ ( cfg.width || 900 ) +'px;z-index:10000;">'+
                        '<div class="box-hd"><h3 class="box-title">' + ( cfg.title || '弹出层' ) + '</h3><div class="box-act"><a class="box-close" href="#">\u5173\u95ed</a></div></div>'+
                        '<div class="box-bd"></div>'+
                    '</div>';
            self._el = D.create(str);
            doc.body.appendChild(self._el);
            self._titleEl = D.get('.box-title',self._el);
            self._closeEl = D.get('.box-close',self._el);                      
            E.on(self._closeEl,'click',function(e){
                e.preventDefault();                
                self.hide();
            });
            self._bdEl = D.get('.box-bd',self._el);  
            
            E.on(window,'resize',function(){self._setPosition()});
        },
        _setPosition:function(){
            var self = this;
            var l = (D.viewportWidth() - self._el.offsetWidth)/2,
                t = D.scrollTop() + (D.viewportHeight() - self._el.offsetHeight)/2;
            self._el.style.left =(l>0 ? l : 0) +'px';
            self._el.style.top = (t>0 ? t : 0)+'px';
        }
    });
    
    return Dialog;
},{requires:['overlay','taogold/mask']});
