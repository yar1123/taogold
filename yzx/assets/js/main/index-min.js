KISSY.config({packages:[{name:"taogold",path:"../assets/js/"}]});
KISSY.use("taogold/userlist",function(b,k){function c(f,a,l){d.className=f;d.innerHTML=a;m.innerHTML=l}function n(){e.css(g,{border:"1px solid #ffcc7f",background:"#ffffe5"});b.Anim(g,{"background-color":"#fff","border-color":"#fff"},2).run()}var e=b.DOM,o=b.Event,g=e.get("#J_Op"),d=e.get("#J_OpBtn"),m=e.get("#J_OpTips"),h="",i="",j="";switch(g.getAttribute("status")){case "s":h="op-use";i="\u7ed4\u5b2a\u5d46\u935a\ue21c\u6564";case "S":case "T":j="\u6d93\u5a43\ue0bc\u934b\u6ec5\u6564\u93bf\u5d84\u7d94\u6d60\u5d85\u6e6a\u6fb6\u52ed\u608a\u6d93\ue168\u7d1d\u7487\u75af\ufffd\u612c\u7e3e\u7edb\u590a\u7ddf\u9225\ufffd";break;case "u":h="op-stop";i="\u93b4\u621e\u5142\u934b\u6ec5\u6564";case "U":case "V":j=
"\u6d93\u5a43\ue0bc\u935a\ue21c\u6564\u93bf\u5d84\u7d94\u6d60\u5d85\u6e6a\u6fb6\u52ed\u608a\u6d93\ue168\u7d1d\u7487\u75af\ufffd\u612c\u7e3e\u7edb\u590a\u7ddf\u9225\ufffd";break;default:break}c(h,i,j);o.on(d,"click",function(f){f.preventDefault();switch(d.className){case "op-use":n();c("op-use-confirm","\u7ead\ue1bf\ue17b\u935a\ue21c\u6564","\u935a\ue21c\u6564\u59af\u2103\u6f98\u951b\u5c7d\u76a2\u935a\u621e\u504d\u9428\u52ec\u588d\u93c8\u590a\u7582\u7490\u6fc7\u5f3f\u6769\u4f34\u5677\u9354\u72b2\u53c6\u7f01\u5fda\u7e43\u93c5\u9e3f\u5158\u7481\uff04\u757b\u6942\u6a3a\u5bb3\u9356\u5f52\u53a4\u9428\u52ec\u5e39\u947d\u612c\u5534\u7039\u5e7f\ufffd\ufffdbr/>\u7ead\ue1bc\u757e\u7455\u4f78\u60ce\u9422\u3125\u60a7\u951b\ufffd");break;case "op-use-confirm":b.io.get("/top/use.html",null,function(a){a=b.JSON.parse(a);console.log(a);c("op-stop","\u93b4\u621e\u5142\u934b\u6ec5\u6564",b.substitute("\u59af\u2103\u6f98\u935a\ue21c\u6564\u6d93\ue168\u7d1d\u93c8\ue101\ue0bc\u93bf\u5d84\u7d94\u68f0\u52ee\ue178 {ti} \u9352\u55db\u6313\u935a\u5ea3\u6553\u93c1\u581b\ufffd\ufffdbr/>\u705e\u5a43\u6902\u93b4\u621c\u6ed1\u6d7c\u6c2b\u8d1f\u93ae\u3128\u569c\u9354\u3125\u57db\u93c2\u4f34\u3009\u95c8\ue76e\u7d1d\u93ae\u3124\u7bc3\u9359\ue219\u4e92\u93b5\u5b2a\u59e9\u9352\u950b\u67ca\u6924\u7538\u6f70\u9286\ufffd",a));setTimeout(function(){window.location.reload()},
a.ti*60*1E3)});break;case "op-stop":c("op-stop-confirm","\u7ead\ue1bf\ue17b\u934b\u6ec5\u6564","\u934b\u6ec5\u6564\u59af\u2103\u6f98\u951b\u5c7d\u76a2\u6d60\u5ea2\u504d\u9428\u52ec\u588d\u93c8\u590a\u7582\u7490\u6fc7\u5f3f\u6769\u4f34\u5677\u9352\u72bb\u6ace\u93bb\u6391\u53c6\u9428\u52ec\u5e39\u947d\u612c\u5534\u7039\u5e7f\ufffd\ufffdbr/>\u7ead\ue1bc\u757e\u7455\u4f78\u4ee0\u9422\u3125\u60a7\u951b\ufffd");break;case "op-stop-confirm":b.io.get("/top/stop.html",null,function(a){a=b.JSON.parse(a);console.log(a);c("op-use","\u7ed4\u5b2a\u5d46\u935a\ue21c\u6564",b.substitute("\u59af\u2103\u6f98\u934b\u6ec5\u6564\u951b\u5c7e\u6e70\u5a06\u2103\u6437\u6d63\u6ec8\ue569\u7481\ufffd {ti} \u9352\u55db\u6313\u935a\u5ea3\u6553\u93c1\u581b\ufffd\ufffdbr/>\u705e\u5a43\u6902\u93b4\u621c\u6ed1\u6d7c\u6c2b\u8d1f\u93ae\u3128\u569c\u9354\u3125\u57db\u93c2\u4f34\u3009\u95c8\ue76e\u7d1d\u93ae\u3124\u7bc3\u9359\ue219\u4e92\u93b5\u5b2a\u59e9\u9352\u950b\u67ca\u6924\u7538\u6f70\u9286\ufffd",a));setTimeout(function(){window.location.reload()},a.ti*60*1E3)});break;default:break}});new k("#J_Users")});
