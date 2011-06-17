

KISSY.ready(function(S){

	var D = S.DOM, E = S.Event, doc = document;
	
	/**
	 * 	对话框
	 */
	var Dialogue = {		
		show:function(title,width,height){
			var self = this;
			self._init();
			self._show(title,width,height);
			self.show = self._show;
		},
		_show:function(title,width,height){
			var self = this;
			self._el.style.display = 'block';
			self._titleEl.innerHTML = title || '对话框';
			if (width) {
				self._el.style.width = width + 'px';
			}else{
				self._el.style.width = 'auto';
			}
			if(height){
				self._el.style.height = height + 'px';
			}else{
				self._el.style.height = 'auto';
			}				
			setTimeout(function(){
				var  l = (D.viewportWidth() - self._el.offsetWidth)/2, t = D.scrollTop() + (D.viewportHeight() - self._el.offsetHeight)/2;
				self._el.style.left =(l>0 ? l : 0) +'px';
				self._el.style.top = (t>0 ? t : 0)+'px';
			},0);
			
			_Mask.show();
		},
		hide:function(){
			var self = this;
			self._el.style.display = 'none';
			_Mask.hide();
		},
		append:function(el){
			var self = this;
			self._bdEl.innerHTML = '';
			self._bdEl.appendChild(el);
		},
		_init:function(){
			var self = this;
			self._render();
		},
		_render:function(){
			var self = this, fragment = '';
			fragment += '<div class="box" style="display:none;position:absolute;width:944px;border:3px solid #ccc;z-index:100;">'
			fragment += '<div class="box-hd"><h3 class="box-title">选择宝贝</h3><div class="box-act"><a class="box-close" href="#">关闭</a></div></div>'
			fragment += '<div class="box-bd"></div>'
			fragment += '</div>'
			self._el = D.create(fragment);
			doc.body.appendChild(self._el);
			self._titleEl = D.get('.box-title',self._el);
			self._closeBtnEl = D.get('.box-close',self._el);
			self._bdEl = D.get('.box-bd',self._el);			
			E.on(self._closeBtnEl,'click',function(e){
				e.preventDefault();				
				self.hide();
			});
		},		
	}	
	
	var _Mask = {
		show:function(){
			var self = this;
			self._init();
			self._show();
			self.show = self._show;
		},
		_show:function(){
			var self = this;
			self._el.style.display = 'block';
			self._el.style.height = D.docHeight()+'px';			
		},
		hide:function(){
			var self = this;
			self._el.style.display = 'none';
		},
		_init:function(){
			var self = this;
			self._render();
		},
		_render:function(){
			var self = this;
			self._el = D.create('<div style = "display:none;position:absolute;width:100%;left:0;top:0;font-size:0px;line-height:0px;background:#000;filter:alpha(opacity=10);opacity:0.1;z-index:10;"></div>');
			doc.body.appendChild(self._el);			
		}
	}
	
	/**
	 * 模板预览
	 */
	var previewTemp = function(tempid){
		S.IO({
			type: 'GET',
			url: 'preview.html',
			data:{'tempid':tempid},
			success: function(data, textStatus, xhr) {
				var c = D.create('<div></div>');
				c.innerHTML = data;
				Dialogue.show("模板预览",770);
				Dialogue.append(c);	
			},
			dataType:'text'
		});
	}
	
	/**
	 * 选择框
	 */
	var CoupleSelect = function(src,target,itemCls,itemTemplate){
		var self = this;
		self.srcEl = D.get(src);
		self.targetEl = D.get(target);
		self.itemCls = itemCls;
		self.itemTemplate = itemTemplate;
	};
	
	S.augment(CoupleSelect,S.EventTarget, {
		render:function(data,isAppend){
			var self = this, itemTemplate = self.itemTemplate;
			if(S.isUndefined(isAppend)) isAppend = 1;
			if(!isAppend) self.srcEl.innerHTML = '';			
			for(var i = 0, len = data.length; i < len; i ++ ){
				var item = D.create(S.substitute(itemTemplate,data[i]));
				item['data-item-info'] = data[i];
				self.srcEl.appendChild(item);
			}
		},
		add:function(item){
			var self = this;
			self.targetEl.appendChild(item);
			var children = self.getTargetItems();
			if(children.length > 3) self.remove(children[0]);
		},
		remove:function(item){
			var self = this;
			self.srcEl.appendChild(item);
		},
		up:function(item){
			var self = this, prevItem = D.prev(item);
			if(prevItem) D.insertBefore(item,prevItem);
		},
		down:function(item){
			var self = this, nextItem = D.next(item);
			if(nextItem) D.insertAfter(item,nextItem);
		},
		getItem:function(t){
			var self = this;
			return D.parent(t,'.item')
		},
		getTargetItems:function(){
			var self = this;
			return D.children(self.targetEl,'.'+self.itemCls);
		}
	});
	
	var loadingEl = D.create('<div style="padding:20px;text-align:center;color:#888;">数据加载中，请稍候…</div>');
	
	/*************************************************************************************
	 * 预览（全站统一js钩子 class="S_PreviewTrigger", 模板id属性 data-temp-id）
	 *************************************************************************************/
	E.on(doc.body,'click',function(e){
		var t = e.target;
		if(D.hasClass(t,'S_PriviewTrigger')){
			e.preventDefault();
			previewTemp(t.getAttribute('data-temp-id'));
		}
	});
	/*************************************************************************************
	 * 新建、编辑模板
	 *************************************************************************************/
	(function(){
		var trigger = D.get('#S_SelectItemTrigger');
		if(trigger){
			
			//渲染外框架
			var fragment = '<div class="couple-select" style="display:none;">';
			fragment += '<div class="couple-select-src">';
			fragment += '<div class="bar">出售中的宝贝</div>';
			fragment += '<div class="bar"><form class="form"><select id="S_ItemCat"><option value="">所有类目…</option></select> <input id="S_ItemKw" type="text" /> <button id="S_ItemSchTrigger" class="button" type="button">搜索</button></form></div>';
			fragment += '<ul id="S_CoupleSelectSrc" class="item-list"></ul>';
			fragment += '</div>';
			fragment += '<div class="couple-select-target">';
			fragment += '<div class="bar">已推荐的宝贝（一共可推荐3个）</div>';
			fragment += '<ul id="S_CoupleSelectTarget" class="item-list"></ul>';
			fragment += '<div class="bar"><form class="form"><button id="S_CoupleSelectSubmit" class="button finish-select" disabled="disabled" type="button">我选好了</button></form></div>';
			fragment += '</div>';
			var selectWrapper = D.create(fragment);
			doc.body.appendChild(selectWrapper);
			
			//item模板
			var itemTemplate = '<li class="item"><div class="img"><image src="{pic_url}"/></div><a class="title" href="http://item.taobao.com/item.htm?id={num_iid}" target="_blank">{title}</a><span class="price">￥{price}</span><div class="operation"><a class="add" href="#">推荐</a><a class="moveup" href="#">上移</a><a class="movedown" href="#">下移</a><a class="remove" href="#">删除</a></div></li>';
			//实例化选择item
			var coupleSelect = new CoupleSelect('#S_CoupleSelectSrc','#S_CoupleSelectTarget','item',itemTemplate);
			

			//异步加载数据并渲染
			var getItems = (function(){				
				var amount = 0;
				return function(param){
					coupleSelect.srcEl.appendChild(loadingEl);
					param = param || {};
					S.mix(param,{start:0,len:40});
					//如果指定类目或关键字搜索，则新渲染item
					if (param.cat || param.kw) {
						var isAppend = 0;
					}else{
						var isAppend = 1;
					}
					//获取item数据
					S.io.get(
						'onsales.html',
						param,
						function(o){
							coupleSelect.srcEl.removeChild(loadingEl);
							var data = eval(o);
							if(isAppend){
								amount = data.length;
							}else{
								amount = amount + data.length;
							}
							coupleSelect.render(data, isAppend);
						}
					);
				}	
			})();
			
			//校验按钮是否可点
			var checkSubmitBtn = function(){
				var btn = D.get('#S_CoupleSelectSubmit');
				if(coupleSelect.getTargetItems().length == 3){
					btn.disabled = false;
				}else{
					btn.disabled = true;
				}
			}

			//推荐
			E.on('#S_CoupleSelectSrc','click',function(e){
				var t = e.target;
				if(D.hasClass(t,'add')){
					coupleSelect.add(coupleSelect.getItem(t));
					checkSubmitBtn();
					e.preventDefault();
				}
			});	
			
			//上移，下移，移除
			E.on('#S_CoupleSelectTarget','click',function(e){
				var t = e.target;
				if(D.hasClass(t,'moveup')){
					coupleSelect.up(coupleSelect.getItem(t));
					e.preventDefault();
				}else if(D.hasClass(t,'movedown')){
					coupleSelect.down(coupleSelect.getItem(t));
					e.preventDefault();
				}else if(D.hasClass(t,'remove')){
					coupleSelect.remove(coupleSelect.getItem(t));
					checkSubmitBtn();
					e.preventDefault();
				}
			});
				
			//搜索
			E.on('#S_ItemSchTrigger','click',function(e){
				e.preventDefault();
				var param = {};
				param.cat = D.get('#S_ItemCat').value;
				param.kw = D.get('#S_ItemKw').value;
				getItems(param);
			})
			
			//提交数据
			E.on('#S_SaveSetting','click',function(e){
				e.preventDefault();
				var postInfo = {};
				if(D.get('#S_TemplateId')){postInfo.tempid = D.get('#S_TemplateId').value}
				postInfo.name = D.get('#S_TemplateName').value;
				postInfo.position = D.get('#S_TemplatePosition').checked ? 't' : 'b';
				postInfo.mode = D.get('#S_SelectItemTrigger').checked ? 'm' : 'a';
				if(postInfo.mode == 'm'){
					var selectItems = D.get('#S_SelectItems').value;
					if(selectItems.split(',').length < 3){
						Dialogue.show("提示",400);
						Dialogue.append(D.create('<div>人工选择推荐宝贝模式下请选择3个要推荐的宝贝。</div>'));	
						D.get('#S_SelectAuto').checked = true;
						return;
					}
					postInfo.iid = selectItems;
				};
				S.io.post(
					'saveedit.html',
					postInfo,
					function(o){
						var c = D.create('<div></div>');
						c.innerHTML = '<div class="msg"><div class="msg-default msg-tips"><i class="msg-icon"></i><div class="msg-content">模板保存成功，以下为预览效果。您可以去<a href="rechome.html">模板列表</a>页面进行相关操作。</div></div></div>'+ o;
						Dialogue.show("模板预览",770);
						Dialogue.append(c);		
					}
				);
				
			});
			
			//绑定radio单击事件
			E.on(trigger,'click',function(e){
				Dialogue.show("选择宝贝",942);
				Dialogue.append(selectWrapper);	
				selectWrapper.style.display='block';
				if(S.trim(coupleSelect.srcEl.innerHTML) == '') getItems();				
			});

			
			//确认手工选择类目
			E.on('#S_CoupleSelectSubmit','click',function(e){
				var targetItems = coupleSelect.getTargetItems(), iidArr = [];
				for(var i = 0,len = targetItems.length;i<len;i++){
					var data = targetItems[i]['data-item-info'];
					iidArr.push(data['num_iid']);
				}
				D.get('#S_SelectItems').value = iidArr.toString();
				Dialogue.hide();
			});
				
			//获取类目
			(function(){
				S.io.get(
					'cats.html',
					null,
					function(o){
						var data = eval('['+o+']');
						var cats = data[0].sellercats_list_get_response.seller_cats.seller_cat;
						var catSelect = S.get('#S_ItemCat');
						for(var i = 0,len = cats.length;i<len;i++){
							catSelect.appendChild(D.create('<option value="'+cats[i].cid+'">'+cats[i].name+'</option>'))
						}
						catSelect.value = '';				
					}
				);
			})();
		}	
	})();
	/*************************************************************************************
	 * 模板列表操作
	 *************************************************************************************/
	(function(){
		if(D.get('#S_TemplateList')){
			E.on('#S_TemplateList','click',function(e){
				var t = e.target;
				if(D.hasClass(t,'S_UseTrigger') || D.hasClass(t,'S_StopUseTrigger')){
					e.preventDefault();
					S.io.get(
						D.hasClass(t,'S_UseTrigger') ? '/top/use.html':'/top/stop.html',
						{'tempid':t.getAttribute('tempid')},
						function(o){
							var data = eval('['+o+']');
							Dialogue.show('提示');
							Dialogue.append(D.create('<div style="padding:10px;">'+ (D.hasClass(t,'S_UseTrigger') ? '正在启用' : '正在禁用')+'，整个处理过程大约需要<span class="h">'+data[0].ti+'</span>分钟。<br/>届时我们会为您自动刷新页面。<br/>您也可以点击操作栏的<a href="/top/rechome.html">刷新页面</a>按钮进行手动刷行。</div>'));
							setTimeout(function(){window.location.reload();},data[0].ti*60*1000);
							var td = D.parent(t,'td'), prevTd = D.prev(td,'td');
							td.innerHTML = '<a href="/top/rechome.html">刷新页面</a>';
							prevTd.innerHTML = D.hasClass(t,'S_UseTrigger') ? '正在启用...' : '正在禁用...';
						}
					);					
				}
			})
		}
	})();
});
