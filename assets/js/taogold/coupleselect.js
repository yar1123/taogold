KISSY.add("taogold/coupleselect",function(S){
    var D = S.DOM, E = S.Event, doc = document;
    
    /*
    config.src
    config.target
    config.itemCls
    config.itemTempl
    */
    function CoupleSelect(config){
        var self = this;
        self._cfg = config || {};
        self.srcEl = D.get(self._cfg.src);
        self.targetEl = D.get(self._cfg.target);
    };
    
    S.augment(CoupleSelect,S.EventTarget, {
        appendSrcItems:function(data){
            var self = this, cfg = self._cfg;
            for(var i = 0, len = data.length; i < len; i ++ ){
                var item = D.create('<div class="'+ cfg.itemCls +'">'+S.substitute(cfg.itemTempl,data[i])+'</div>');
                item['data-item-info'] = data[i];
                self.srcEl.appendChild(item);
            }
        },
        refreshSrcItems:function(data){
            var self = this;
            self.srcEl.innerHTML = '';
            self.appendSrcItems(data);
        },
        add:function(t){
            var self = this;
            self.targetEl.appendChild(self.getItem(t));
            self.fire('add');
        },
        remove:function(t){
            var self = this;
            self.srcEl.appendChild(self.getItem(t));
            self.fire('remove');
        },
        up:function(t){
            var self = this, item = self.getItem(t), prevItem = D.prev(item);
            if(prevItem){
                D.insertBefore(item,prevItem);
                self.fire('up');
            }
        },
        down:function(t){
            var self = this, item = self.getItem(t), nextItem = D.next(item);
            if(nextItem){
                D.insertAfter(item,nextItem);
                self.fire('down');
            }
        },
        getItem:function(t){
            var self = this;
            if(D.hasClass(t,self._cfg.itemCls)){
                return t;
            }else{
                return D.parent(t,'.'+self._cfg.itemCls);
            }
            
        },
        getTargetItems:function(){
            var self = this;
            return D.children(self.targetEl,'.'+self._cfg.itemCls);
        }
    });
    
    return CoupleSelect;
});
