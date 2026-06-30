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
})();
