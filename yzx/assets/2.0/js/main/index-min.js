KISSY.config({packages:[{name:"taogold",path:"../assets/2.0/js/"}]});
KISSY.use("taogold/userlist,taogold/preview,taogold/dialog",function(b,l,m,n){function d(a,c,o){h.className=a;h.innerHTML=c;p.innerHTML=o}function q(){e.css(i,{border:"1px solid #ffcc7f",background:"#ffffe5"});b.Anim(i,{"background-color":"#fff","border-color":"#fff"},2).run()}var e=b.DOM,k=b.Event,r=document,i=e.get("#J_Op"),h=e.get("#J_OpBtn"),p=e.get("#J_OpTips"),f="",g="",j="";switch(i.getAttribute("status")){case "s":f="op-use";g="\u7ed4\u5b2a\u5d46\u935a\ue21c\u6564";break;case "S":case "T":f="op-use";g="\u7ed4\u5b2a\u5d46\u935a\ue21c\u6564";j="\u6d93\u5a43\ue0bc\u7ec2\u4f7a\u6564\u93bf\u5d84\u7d94\u6d60\u5d85\u6e6a\u6fb6\u52ed\u608a\u6d93\ue168\u7d1d\u7487\u75af\ufffd\u612c\u7e3e\u7edb\u590a\u7ddf\u9225\ufffd";
break;case "u":f="op-stop";g="\u93b4\u621e\u5142\u7ec2\u4f7a\u6564";break;case "U":case "V":f="op-stop";g="\u93b4\u621e\u5142\u7ec2\u4f7a\u6564";j="\u6d93\u5a43\ue0bc\u935a\ue21c\u6564\u93bf\u5d84\u7d94\u6d60\u5d85\u6e6a\u6fb6\u52ed\u608a\u6d93\ue168\u7d1d\u7487\u75af\ufffd\u612c\u7e3e\u7edb\u590a\u7ddf\u9225\ufffd";break;default:break}d(f,g,j);k.on(h,"click",function(a){a.preventDefault();switch(h.className){case "op-use":q();d("op-use-confirm","\u7ead\ue1bf\ue17b\u935a\ue21c\u6564",'\u935a\ue21c\u6564\u7487\u30e6\u0101\u93c9\u5321\u7d1d\u7eef\u8364\u7cba\u6d7c\u6c2c\ue1ee\u93ae\u3127\u6b91\u59e3\u5fce\u91dc\u7039\u6fca\u7909\u6769\u6d9c\ue511\u6d93\ufffd\u5a06\u2033\u53cf\u95c8\u3220\u578e\u93cb\u6136\u7d1d\u9412\u8dfa\u6097\u9366\u3125\u53fe\u7039\u6fca\u7909\u7487\ufe3d\u510f\u95b2\u5c83\u569c\u9354\u3126\u5f43\u934f\u30e7\u6d49\u934f\u51b2\u7582\u7490\u6fc7\u5e39\u947d\u6129\ufffd\ufffdbr/>\u93ae\u3125\u5f72\u6d60\ufffda class="J_Preview" href="#">\u9410\u89c4\ue11d\u68f0\u52ee\ue74d</a>\u935a\ue21c\u6564\u93c1\u581f\u7049\u9286\u509c\u2018\u7039\u6c33\ue6e6\u935a\ue21c\u6564\u935a\u694b\u7d35');break;case "op-use-confirm":b.io.get("use.html",null,function(c){c=b.JSON.parse(c);d("op-stop","\u93b4\u621e\u5142\u7ec2\u4f7a\u6564",
b.substitute('\u59af\u2103\u6f98\u935a\ue21c\u6564\u6d93\ue168\u7d1d\u93c8\ue101\ue0bc\u93bf\u5d84\u7d94\u68f0\u52ee\ue178 {ti} \u9352\u55db\u6313\u935a\u5ea3\u6553\u93c1\u581b\ufffd\ufffdbr/>\u93ae\u3125\u5f72\u6d60\ufffda class="J_Preview" href="#">\u9410\u89c4\ue11d\u68f0\u52ee\ue74d</a>\u935a\ue21c\u6564\u93c1\u581f\u7049\u9286\ufffd',c));setTimeout(function(){window.location.reload()},c.ti*60*1E3)});break;case "op-stop":d("op-stop-confirm","\u7ead\ue1bf\ue17b\u7ec2\u4f7a\u6564","\u7ec2\u4f7a\u6564\u7487\u30e6\u0101\u93c9\u5321\u7d1d\u704f\u55d5\u7ca0\u93ae\u3127\u6b91\u93b5\ufffd\u93c8\u590a\u7582\u7490\u6fc7\u5f3f\u6769\u4f34\u5677\u9352\u72bb\u6ace\u9429\u7a3f\u53e7\u7039\u6fca\u7909\u93ba\u3128\u5d18\u9286\ufffdbr/>\u7ead\ue1bc\u757e\u7455\u4f7a\ue6e6\u9422\u3125\u60a7\u951b\ufffd");break;case "op-stop-confirm":b.io.get("stop.html",null,function(c){c=b.JSON.parse(c);d("op-use","\u7ed4\u5b2a\u5d46\u935a\ue21c\u6564",b.substitute("\u59af\u2103\u6f98\u7ec2\u4f7a\u6564\u6d93\ue168\u7d1d\u93c8\ue101\ue0bc\u93bf\u5d84\u7d94\u68f0\u52ee\ue178 {ti} \u9352\u55db\u6313\u935a\u5ea3\u6553\u93c1\u581b\ufffd\ufffd",c));setTimeout(function(){window.location.reload()},c.ti*60*1E3)});
break;default:break}});new l("#J_Users");k.on(r.body,"click",function(a){if(e.hasClass(a.target,"J_Preview")){a.preventDefault();new m}});b.io.get("old.html",null,function(a){a=b.JSON.parse(a).olduser;console.log(a);if(a){a=new n({title:"\u9357\u56e9\u9a87\u93bb\u612e\u305a",type:"alert",closeBtn:0,width:770});a.appendContent('\u93ae\u3128\u7e55\u9366\u3124\u5a07\u9422\u3128\ufffd\u4f7a\u5897\u5a23\u6a40\u567e\u7039\u6fc8\u6b91\u9429\u7a3f\u53e7\u7039\u6fca\u7909\u93ba\u3128\u5d18\u951b\u5c83\ue1ec\u9410\u89c4\ue11d\u6769\u65bf\u6d16\u9470\u4f7a\u5897\u951b\u5c80\ue6e6\u9422\u3128\ufffd\u4f79\u0101\u93c9\u57ae\u6097\u951b\u5c7d\u5540\u93c9\u30e5\u60ce\u9422\u3126\u67ca\u9417\u581b\ufffd\ufffdbr/>\u9470\u4f7a\u5897\u704f\u55d5\u7c2c\u6769\u621e\u6e61\u934b\u6ec4\ue11b\u93c8\u5d85\u59df\u951b\u5c7e\u67ca\u9417\u581f\u7a90\u95b2\u621d\u7582\u951b\u5c7e\u5e39\u947d\u612d\u6d3f\u7eee\u60e7\u566f\u951b\u5c7e\u6d3f\u8e47\ue0a6\ufffd\u71c2\u7d1d\u93ba\u3128\u5d18\u93ae\u3125\u6556\u8e47\ue0a2\u578f\u93b9\u20ac\ufffd\ufffdbr/><br/>\u9410\u89c4\ue11d<a href="/oldtop/index.html">\u6769\u65bf\u6d16\u9470\u4f7a\u5897</a>\u9286\ufffdbr/><br/>');a.show()}})});