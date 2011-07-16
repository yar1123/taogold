KISSY.add("taogold/userlist",function(S, Switchable){
    var D = S.DOM, E = S.Event, doc = document;
    var levelPicPath = 'http://img.taobaocdn.com/newrank/',
        levelPicNames = [
        's_red_1.gif','s_red_2.gif','s_red_3.gif','s_red_4.gif','s_red_5.gif',
        's_blue_1.gif','s_blue_2.gif','s_blue_3.gif','s_blue_4.gif','s_blue_5.gif',
        's_cap_1.gif','s_cap_2.gif','s_cap_3.gif','s_cap_4.gif','s_cap_5.gif',
        's_crown_1.gif','s_crown_2.gif','s_crown_3.gif','s_crown_4.gif','s_crown_5.gif'    
    ],
        templ = '<li class="item"><a href="">{nick}<img src="{level}" /></a> {time} 为 <b>{itemsnum}</b> 个宝贝启用了 "{tempname}" </li>';
    
    function UserList(container){
        var self = this;
        self.container = D.get(container);
        self._init();
    }
    
    S.augment(UserList,S.EventTarget,{
        _init:function(){
            var self = this;
            S.io.get(
                'ushow.html',
                null,
                function(o){
                    var data = eval(o);
                    self._render(data);                  
                }
            );
        },
        _render:function(data){
            var self = this, container = this.container, str = '';
            str += '<div class="userlist" style="position:relative;"><ul class="list">';
            for(var i = 0,len = data.length;i<len;i++){
                data[i].level = levelPicPath + levelPicNames[data[i].level];
                str += S.substitute(templ,data[i]);
            }
            str += '</ul></div>';
            container.innerHTML = str; 

            console.log(Switchable.Slide);
            Switchable.Slide(D.get('.userlist',container), {
                contentCls: 'list',
                hasTriggers: false,
                effect: 'scrolly',
                easing: 'easeOutStrong',
                interval: 3,
                duration: .2
            });
        }
    });
    
    return UserList;
},{requires:['switchable']});
