/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: ${build.time}
*/
KISSY.add("node/anim-plugin",function(d,c,e,f,n){function s(g,w,o,k,j,p,x){if(w==="toggle"){j=c.css(g,b)===h?1:0;w="show"}if(j)c.css(g,b,c.data(g,b)||"");var l={},v={};d.each(z[w],function(q){if(q===m){l[m]=c.css(g,m);c.css(g,m,t)}else if(q===i){l[i]=c.css(g,i);v.opacity=j?1:0;j&&c.css(g,i,0)}else if(q===r){l[r]=c.css(g,r);v.height=j?c.css(g,r)||g.naturalHeight:0;j&&c.css(g,r,0)}else if(q===u){l[u]=c.css(g,u);v.width=j?c.css(g,u)||g.naturalWidth:0;j&&c.css(g,u,0)}});return(new e(g,v,o,p||"easeOut",
function(){if(!j){var q=g.style,y=q[b];if(y!==h){y&&c.data(g,b,y);q[b]=h}l[r]&&c.css(g,{height:l[r]});l[u]&&c.css(g,{width:l[u]});l[i]&&c.css(g,{opacity:l[i]});l[m]&&c.css(g,{overflow:l[m]})}k&&d.isFunction(k)&&k()},x)).run()}f=f.prototype;var a="ksAnims"+d.now(),b="display",h="none",m="overflow",t="hidden",i="opacity",r="height",u="width",z={show:[m,i,r,u],fade:[i],slide:[m,r]};(function(g){function w(o,k){var j=c.data(o,a);j||c.data(o,a,j=[]);k.on("complete",function(){var p=c.data(o,a);if(p){var x=
d.indexOf(k,p);x>=0&&p.splice(x,1);p.length||c.removeData(o,a)}});j.push(k)}g.animate=function(){var o=d.makeArray(arguments);d.each(this,function(k){var j=e.apply(n,[k].concat(o)).run();w(k,j)});return this};g.stop=function(o){d.each(this,function(k){var j=c.data(k,a);if(j){d.each(j,function(p){p.stop(o)});c.removeData(k,a)}})};d.each({show:["show",1],hide:["show",0],toggle:["toggle"],fadeIn:["fade",1],fadeOut:["fade",0],slideDown:["slide",1],slideUp:["slide",0]},function(o,k){g[k]=function(j,p,
x,l){c[k]&&arguments.length===0?c[k](this):d.each(this,function(v){var q=s(v,o[0],j,p,o[1],x,l);w(v,q)});return this}})})(f)},{requires:["dom","anim","./base"]});
KISSY.add("node/attach",function(d,c,e,f,n){var s=f.prototype,a=c._isNodeList;f.addMethod=function(b,h,m,t){s[b]=function(){var i=d.makeArray(arguments);i.unshift(this);i=h.apply(m||this,i);if(i===n)i=this;else if(i===null)i=null;else if(t&&(i.nodeType||a(i)||d.isArray(i)))i=new f(i);return i}};d.each(["equals","contains","scrollTop","scrollLeft","height","width","addStyleSheet","append","appendTo","prepend","prependTo","insertBefore","before","after","insertAfter","filter","test","hasClass","addClass",
"removeClass","replaceClass","toggleClass","removeAttr","attr","hasAttr","prop","hasProp","val","text","css","toggle","offset","scrollIntoView","parent","closest","next","prev","siblings","children","html","remove","removeData","hasData","unselectable"],function(b){f.addMethod(b,c[b],c,true)});f.addMethod("data",c.data,c);d.each(["on","detach","fire","delegate","undelegate"],function(b){s[b]=function(){var h=d.makeArray(arguments);h.unshift(this);return e[b].apply(e,h)}})},{requires:["dom","event",
"./base"]});
KISSY.add("node/base",function(d,c,e){function f(a,b,h){if(!(this instanceof f))return new f(a,b,h);if(a)if(d.isString(a)){a=c.create(a,b,h);if(a.nodeType===11){n.push.apply(this,d.makeArray(a.childNodes));return e}}else if(d.isArray(a)||s(a)){n.push.apply(this,d.makeArray(a));return e}else a=a;else return e;this[0]=a;this.length=1;return e}var n=Array.prototype,s=c._isNodeList;d.augment(f,{length:0,item:function(a){if(d.isNumber(a)){if(a>=this.length)return null;return new f(this[a],e,e)}else return new f(a,
e,e)},add:function(a,b,h){if(d.isNumber(b)){h=b;b=e}a=d.makeArray(f.all(a,b));b=new f(this,e,e);if(h===e)n.push.apply(b,a);else{h=[h,0];h.push.apply(h,a);n.splice.apply(b,h)}return b},slice:function(a,b){return new f(n.slice.call(this,a,b),e,e)},getDOMNodes:function(){return n.slice.call(this)},each:function(a,b){var h=this.length,m=0,t;for(t=new f(this[0],e,e);m<h&&a.call(b||t,t,m,this)!==false;t=new f(this[++m],e,e));return this},getDOMNode:function(){return this[0]},all:function(a){if(this.length>
0)return f.all(a,this[0]);return new f(e,e,e)}});f.prototype.one=function(a){a=this.all(a);return a.length?a:null};f.all=function(a,b){if(d.isString(a)&&(a=d.trim(a))&&a.length>=3&&d.startsWith(a,"<")&&d.endsWith(a,">")){if(b){if(b.getDOMNode)b=b.getDOMNode();if(b.ownerDocument)b=b.ownerDocument}return new f(a,e,b)}return new f(c.query(a,b),e,e)};f.one=function(a,b){var h=f.all(a,b);return h.length?h:null};return f},{requires:["dom"]});
KISSY.add("node/override",function(d,c,e,f){d.each(["append","prepend","before","after"],function(n){f.addMethod(n,function(s,a){var b=a;if(d.isString(b))b=c.create(b);c[n](b,s)},undefined,true)})},{requires:["dom","event","./base","./attach"]});KISSY.add("node",function(d,c){return c},{requires:["node/base","node/attach","node/override","node/anim-plugin"]});
