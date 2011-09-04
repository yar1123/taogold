KISSY.add("taogold/userlist",function(S, Switchable){
    var D = S.DOM, E = S.Event, doc = document;
    var levelPicPath = 'http://img.taobaocdn.com/newrank/',
        levelPicNames = [
        's_red_1.gif','s_red_2.gif','s_red_3.gif','s_red_4.gif','s_red_5.gif',
        's_blue_1.gif','s_blue_2.gif','s_blue_3.gif','s_blue_4.gif','s_blue_5.gif',
        's_cap_1.gif','s_cap_2.gif','s_cap_3.gif','s_cap_4.gif','s_cap_5.gif',
        's_crown_1.gif','s_crown_2.gif','s_crown_3.gif','s_crown_4.gif','s_crown_5.gif'    
    ],
        templ = '<div class="item"><a href="http://shop{sid}.taobao.com" target="_blank">{nick} <img src="{level}" /> </a> {time} 为 <b>{itemsnum}</b> 个宝贝启用了我们的服务。 </div>';
    
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
            str += '<div class="userlist"><ul class="list">';
            for(var i = 0,len = Math.floor(data.length/3);i<len;i++){
                str += '<li>';
                for(var j = 0; j < 3 ;j++){
                    var idx = i*3+j;
                    data[idx].level = levelPicPath + levelPicNames[data[idx].level];
                    str += S.substitute(templ,data[idx]);
                }
                str += '</li>';
            }
            str += '</div>';
            container.innerHTML = str; 

            Switchable.Slide(D.get('.userlist',container), {
                contentCls: 'list',
                hasTriggers: false,
                effect: 'scrolly',
                easing: 'easeOutStrong',
                interval: 3,
                duration: .5
            });
            
        }
    });
    
    return UserList;
},{requires:['switchable']});
