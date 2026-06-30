/* ============================================
   Know UniApp × Theme System (shared)
   ============================================ */
(function(){
  var K='know-theme',h=document.documentElement,s=localStorage.getItem(K);
  if(s) h.setAttribute('data-theme',s);
  window.setTheme=function(t){
    h.setAttribute('data-theme',t);
    localStorage.setItem(K,t);
    document.querySelectorAll('.theme-option').forEach(function(o){
      o.classList.toggle('active',o.getAttribute('data-theme')===t)
    });
    var tp=document.getElementById('themePanel');if(tp) tp.classList.remove('open');
  };
  window.toggleThemePanel=function(e){
    e&&e.stopPropagation();
    var tp=document.getElementById('themePanel');if(tp) tp.classList.toggle('open');
  };
  window.closeThemePanel=function(){
    var tp=document.getElementById('themePanel');if(tp) tp.classList.remove('open');
  };
  var c=s||'white';
  document.querySelectorAll('.theme-option').forEach(function(o){
    o.classList.toggle('active',o.getAttribute('data-theme')===c)
  });
  document.addEventListener('click',function(e){
    if(!e.target.closest('.theme-trigger')&&!e.target.closest('.theme-panel'))
      closeThemePanel();
  });
  /* 自定义主题色 */
  window.setCustomColor=function(color){
    /* 校验：必须是 #RRGGBB 格式 */
    if(!/^#[0-9a-fA-F]{6}$/.test(color)){closeThemePanel();return}
    document.documentElement.style.setProperty('--primary',color);
    /* 计算 RGB 值 */
    var r=parseInt(color.slice(1,3),16),g=parseInt(color.slice(3,5),16),b=parseInt(color.slice(5,7),16);
    document.documentElement.style.setProperty('--primary-rgb',r+','+g+','+b);
    document.documentElement.style.setProperty('--primary-soft','rgba('+r+','+g+','+b+',.12)');
    document.documentElement.style.setProperty('--primary-mist','rgba('+r+','+g+','+b+',.08)');
    document.documentElement.style.setProperty('--accent-gradient','linear-gradient(135deg,'+color+','+'rgba('+r+','+g+','+b+',.8))');
    document.documentElement.style.setProperty('--shadow-glow','0 8px 32px rgba('+r+','+g+','+b+',.2)');
    document.documentElement.style.setProperty('--primary-alpha','rgba('+r+','+g+','+b+',.12)');
    localStorage.setItem('know-custom-color',color);
    closeThemePanel();
  };
  /* 恢复自定义颜色 */
  var cc=localStorage.getItem('know-custom-color');
  if(cc&&!s)setCustomColor(cc);
  /* 背景图 */
  window.setBgImage=function(e){
    var file=e.target.files[0];
    if(!file)return;
    var reader=new FileReader();
    reader.onload=function(ev){
      var url=ev.target.result;
      document.body.style.backgroundImage='url('+url+')';
      document.body.style.backgroundSize='cover';
      document.body.style.backgroundAttachment='fixed';
      document.body.style.backgroundPosition='center';
      document.getElementById('bgImageLabel').textContent='✓';
      localStorage.setItem('know-bg-image',url);
      closeThemePanel();
    };
    reader.readAsDataURL(file);
  };
  window.clearBgImage=function(){
    document.body.style.backgroundImage='';
    document.body.style.backgroundSize='';
    document.body.style.backgroundAttachment='';
    document.body.style.backgroundPosition='';
    localStorage.removeItem('know-bg-image');
    document.getElementById('bgImageLabel').textContent='无';
    closeThemePanel();
  };
  /* 恢复背景图 */
  var bg=localStorage.getItem('know-bg-image');
  if(bg){document.body.style.backgroundImage='url('+bg+')';document.body.style.backgroundSize='cover';document.body.style.backgroundAttachment='fixed';document.body.style.backgroundPosition='center'}
})();
