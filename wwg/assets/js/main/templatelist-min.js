KISSY.config({packages:[{name:"taogold",path:"../assets/js/"}]});
KISSY.use("taogold/preview,taogold/dialog",function(e,j,g){var b=e.DOM,h=e.Event,c,k={a:"\u935a\ue21c\u6564\u9225\u6ec5\u90f4\u7f01\u71bb\u569c\u9354\u3126\u5e39\u947d\u6128\ufffd\u6fc7\u0101\u93c9\u5321\u7d1d\u7eef\u8364\u7cba\u59e3\u5fd3\u61c6\u6d7c\u6c2c\ue1ee\u93ae\u3127\u6b91\u59e3\u5fce\u91dc\u7039\u6fca\u7909\u6769\u6d9c\ue511\u6d93\ufffd\u5a06\u2033\u53cf\u95c8\u3220\u578e\u93cb\u6136\u7d1d\u9a9e\u60f0\u569c\u9354\u3126\u6d3f\u93c2\u626e\u6d49\u934f\u51b2\u7582\u7490\u6fc7\u5e39\u947d\u612e\u7ca8\u93cb\u6ed0\u7d19\u6d7c\u6c36\u5056\u6d60\u5815\ufffd\u6c31\u7161\u9352\u7248\u504d\u951b\u5908\ufffd\ufffdbr/>\u7ead\ue1bc\u757e\u7455\u4f78\u60ce\u9422\u3125\u60a7\u951b\ufffd",m:"\u935a\ue21c\u6564\u9225\u6ec0\u6c49\u5bb8\u30e9\ufffd\u590b\u5ae8\u7039\u6fca\u7909\u9225\u6fc7\u0101\u93c9\u5321\u7d1d\u704f\u55d7\u7dda\u93ae\u3127\u6b91\u93b5\ufffd\u93c8\u590a\u7582\u7490\u6fc7\u5f3f\u6769\u4f34\u5677\u93bb\u6391\u53c6\u93ae\u3128\ue195\u7039\u6c31\u6b91\u93ba\u3128\u5d18\u9350\u546d\ue190\u9286\ufffdbr/>\u7ead\ue1bc\u757e\u7455\u4f78\u60ce\u9422\u3125\u60a7\u951b\ufffd"},i=new g({title:"\u93bb\u612e\u305a",width:400,closeBtn:false}),f=new g({type:"confirm",title:"\u93bf\u5d84\u7d94\u7ead\ue1bf\ue17b",width:400,closeBtn:false});f.on("confirm",function(){e.io.get(b.hasClass(c,"S_UseTrigger")?"/newtop/use.html":"/newtop/stop.html",{tempid:c.getAttribute("tempid")},
function(a){a=eval("["+a+"]");i.refreshContent(b.create('<div style="padding:10px;">'+(b.hasClass(c,"S_UseTrigger")?"\u59dd\uff45\u6e6a\u935a\ue21c\u6564":"\u59dd\uff45\u6e6a\u7ec2\u4f7a\u6564")+'\u951b\u5c7e\u66a3\u6d93\ue044\ue629\u941e\u55da\u7e43\u7ecb\u5b2a\u3047\u7efe\ufe42\u6e36\u7455\ufffdspan class="h">'+a[0].ti+'</span>\u9352\u55db\u6313\u9286\ufffdbr/>\u705e\u5a43\u6902\u93b4\u621c\u6ed1\u6d7c\u6c2b\u8d1f\u93ae\u3128\u569c\u9354\u3125\u57db\u93c2\u4f34\u3009\u95c8\u20ac\ufffd\ufffdbr/>\u93ae\u3124\u7bc3\u9359\ue219\u4e92\u9410\u7470\u56ae<a href="/newtop/rechome.html">\u9352\u950b\u67ca\u6924\u7538\u6f70</a>\u6769\u6d9c\ue511\u93b5\u5b2a\u59e9\u9352\u950b\u67ca\u9286\ufffd/div>'));i.show();setTimeout(function(){window.location.reload()},a[0].ti*60*1E3);a=b.parent(c,"td");var d=b.prev(a,"td");a.innerHTML='<a href="/newtop/rechome.html">\u9352\u950b\u67ca\u6924\u7538\u6f70</a>';d.innerHTML=b.hasClass(c,"S_UseTrigger")?
"\u59dd\uff45\u6e6a\u935a\ue21c\u6564...":"\u59dd\uff45\u6e6a\u7ec2\u4f7a\u6564..."})});h.on(".S_PriviewTrigger","click",function(a){a.preventDefault();j(a.target.getAttribute("data-temp-id"))});h.on("#S_TemplateList","click",function(a){var d=a.target;if(b.hasClass(d,"S_UseTrigger")||b.hasClass(d,"S_StopUseTrigger")){a.preventDefault();c=d;f.refreshContent(b.hasClass(d,"S_UseTrigger")?k[c.getAttribute("tempmode")]:"\u5a23\u6a3a\u7582\u95b2\u621e\u67ca\u9417\u581f\u6d3f\u93c5\u9e3f\u5158\u951b\u5c7e\u6d3f\u8e47\ue0a6\ufffd\u71c2\u7d1d\u9357\u51b2\u76a2\u934f\u3129\u6f70\u9359\u6826\u552c\u9470\u4f7a\u5897\u9286\ufffdbr/>\u7ec2\u4f7a\u6564\u7487\u30e6\u0101\u93c9\u57ae\u6097\u951b\u5c7e\u504d\u704f\u55d5\u7b09\u9473\u85c9\u5540\u95b2\u5d86\u67ca\u935a\ue21c\u6564\u7487\u30e6\u0101\u93c9\u88e4\ufffd\u509c\u2018\u7039\u6c33\ue6e6\u7ec2\u4f7a\u6564\u935a\u694b\u7d35");f.show()}})});