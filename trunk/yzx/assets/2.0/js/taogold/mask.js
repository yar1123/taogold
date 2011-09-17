KISSY.add("taogold/mask",function(S){
    var D = S.DOM, E = S.Event, doc = document;
    
    function Mask(){
        var self = this;
        self._render();
    }
    
    S.augment(Mask,{
        show:function(){
            var self = this;
            self._el.style.height = Math.max(window.screen.availHeight,document.body.offsetHeight)+'px';
            self._el.style.display = 'block';
            self._visible = 1;
        },
        hide:function(){
            var self = this;
            self._el.style.display = 'none';
            self._visible = 0;
        },
        _render:function(){
            var self = this;
            self._el = D.create('<div style = "display:none;position:absolute;width:100%;left:0;top:0;font-size:0px;line-height:0px;background:#000;filter:alpha(opacity=20);opacity:0.2;z-index:9999;"></div>');
            S.ready(function(){doc.body.appendChild(self._el);});
            E.on(window,'resize',function(e){
                if(self._visible) self._el.style.height = D.docHeight()+'px';
            });
        }
    });
    
    return Mask;
});
