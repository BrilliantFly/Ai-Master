/* ============================================================
   shared.js — 公共工具函数
   被 schedule.html, checkin.html, form-preview.html 共用
   ============================================================ */

/**
 * XSS 转义：将特殊 HTML 字符转为实体
 * @param {*} str 输入值
 * @returns {string} 转义后的安全字符串
 */
function htmlEscape(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
}

/**
 * 键盘激活辅助：Enter / Space 触发操作
 * @param {Event} e 键盘事件
 * @param {function} fn 回调函数
 */
function onKeyActivate(e, fn) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    if (typeof fn === 'function') fn();
  }
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date} d
 * @returns {string}
 */
function fm(d) {
  return d.getFullYear() + '-' +
         String(d.getMonth() + 1).padStart(2, '0') + '-' +
         String(d.getDate()).padStart(2, '0');
}

/**
 * 生成唯一 ID（时间戳36进制 + 随机数）
 * @returns {string}
 */
function gid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/**
 * localStorage 读取
 * @param {string} key 存储键名
 * @returns {*|null} 解析后的数据，失败返回 null
 */
function ld(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    console.warn('Storage read failed:', e);
    return null;
  }
}

/**
 * localStorage 写入
 * @param {string} key 存储键名
 * @param {*} val 要存储的值（自动 JSON 序列化）
 */
function sd(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('Storage write failed:', e);
  }
}

/**
 * 更新子任务数量显示
 */
function updateSubtaskCount() {
  var list = document.getElementById('subtaskList');
  var cnt = document.getElementById('subtaskCount');
  if (!list || !cnt) return;
  var n = list.querySelectorAll('.subtask-row').length;
  cnt.textContent = n + ' 项';
}

/**
 * 删除子任务行（带动画）
 * @param {HTMLElement} btn 删除按钮元素
 */
function removeSubtask(btn) {
  var row = btn.closest('.subtask-row');
  row.classList.add('removing');
  setTimeout(function () {
    row.remove();
    updateSubtaskCount();
  }, 200);
}

/**
 * 添加子任务行
 * @param {HTMLElement} container 子任务列表容器（#subtaskList）
 */
function addSubtaskRow(container) {
  if (!container) return;
  var wrap = document.createElement('div');
  wrap.className = 'fg-input-wrap';
  wrap.style.flex = '1';
  wrap.innerHTML = '<input type="text" class="fg-input" placeholder="输入子任务…"><span class="focus-bar"></span>';
  var row = document.createElement('div');
  row.className = 'subtask-row';
  var del = document.createElement('button');
  del.type = 'button';
  del.className = 'subtask-del';
  del.textContent = '✕';
  del.onclick = function () { removeSubtask(this); };
  row.append(wrap, del);
  container.appendChild(row);
  updateSubtaskCount();
  row.querySelector('.fg-input').focus();
}

/**
 * Toast 通知
 * @param {string} msg 提示消息
 * @param {string} [type] 类型：'success' | 'warning' | 'error' | 'info'（默认）
 */
function showToast(msg, type) {
  var t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    t.setAttribute('role', 'alert');
    document.body.appendChild(t);
  }
  t.textContent = msg;
  var allowedTypes = ['success', 'warning', 'error', 'info'];
  var safeType = type && allowedTypes.indexOf(type) >= 0 ? type : '';
  t.className = 'toast' + (safeType ? ' ' + safeType : '');
  void t.offsetWidth; /* 强制回流 */
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(function () {
    t.classList.remove('show');
  }, 2600);
}

/**
 * 撤销 Toast — 指尖时光风格操作后撤销
 * @param {string}   msg        操作提示
 * @param {function} onUndo     撤销回调
 * @param {number}   [duration]  自动消失时间 (ms)
 * @returns {object} 返回 { cancel: function } 可手动取消
 */
function showUndoToast(msg, onUndo, duration) {
  var existing = document.getElementById('undoToast');
  if (existing) existing.remove();

  var t = document.createElement('div');
  t.id = 'undoToast';
  t.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--text);color:var(--bg);padding:0;border-radius:var(--radius-sm);font-size:14px;font-weight:500;box-shadow:var(--shadow-lg);z-index:9999;opacity:0;visibility:hidden;transition:opacity .3s var(--ease),transform .3s var(--ease),visibility .3s;max-width:calc(100vw - 40px);display:flex;align-items:center;overflow:hidden';
  t.setAttribute('role', 'alert');

  var msgSpan = document.createElement('span');
  msgSpan.textContent = msg;
  msgSpan.style.cssText = 'padding:12px 0 12px 20px;flex:1';

  var undoBtn = document.createElement('button');
  undoBtn.textContent = '撤销';
  undoBtn.style.cssText = 'padding:12px 18px;border:none;background:transparent;color:var(--primary);font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s,color .2s;white-space:nowrap';
  undoBtn.addEventListener('mouseenter', function () { undoBtn.style.background = 'rgba(255,255,255,0.08)'; });
  undoBtn.addEventListener('mouseleave', function () { undoBtn.style.background = 'transparent'; });

  var dismissed = false;
  undoBtn.onclick = function () {
    dismissed = true;
    t.classList.remove('show');
    if (typeof onUndo === 'function') onUndo();
    setTimeout(function () { if (t && t.parentNode) t.parentNode.removeChild(t); }, 300);
  };

  t.appendChild(msgSpan);
  t.appendChild(undoBtn);
  document.body.appendChild(t);

  void t.offsetWidth;
  t.classList.add('show');

  var dur = duration || 3500;
  var timer = setTimeout(function () {
    if (!dismissed) {
      t.classList.remove('show');
      setTimeout(function () { if (t && t.parentNode) t.parentNode.removeChild(t); }, 300);
    }
  }, dur);

  t._timer = timer;
  return {
    cancel: function () {
      clearTimeout(timer);
      t.classList.remove('show');
      setTimeout(function () { if (t && t.parentNode) t.parentNode.removeChild(t); }, 300);
    }
  };
}

/**
 * 计数器动画（从当前值跳转到目标值）
 * @param {HTMLElement} el 显示数字的元素
 * @param {number} target 目标值
 * @param {number} [duration] 持续时间（ms）
 */
function animateNum(el, target, duration) {
  if (!el) return;
  duration = duration || 400;
  var start = parseInt(el.textContent) || 0;
  var range = target - start;
  if (range === 0) return;
  var startTime = Date.now();
  function tick() {
    var elapsed = Date.now() - startTime;
    var progress = Math.min(elapsed / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
    el.textContent = Math.round(start + range * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  tick();
}

/**
 * 关闭遮罩层（带退场动画）
 * @param {HTMLElement} overlay 遮罩层元素
 */
function closeOverlay(overlay) {
  if (!overlay) return;
  overlay.classList.remove('open');
}

/**
 * 自定义确认弹窗（替代 confirm）
 * @param {string}   msg      确认消息
 * @param {function} callback 回调 function(confirmed:boolean)
 */
function showConfirm(msg, callback) {
  var existing = document.getElementById('confirmDialog');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'confirmDialog';
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  var sheet = document.createElement('div');
  sheet.className = 'modal-sheet';
  sheet.style.padding = '24px 20px';
  sheet.style.textAlign = 'center';

  var text = document.createElement('p');
  text.textContent = msg;
  text.style.cssText = 'font-size:15px;margin:0 0 20px;color:var(--text);line-height:1.5';

  var btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:12px';

  var cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.textContent = '取消';
  cancelBtn.style.cssText = 'flex:1;padding:12px 0;border:none;border-radius:var(--radius-sm);font-size:14px;font-weight:500;cursor:pointer;background:var(--surface-soft);color:var(--text-secondary);font-family:inherit;transition:all .25s ease';
  cancelBtn.onclick = function () {
    overlay.classList.remove('open');
    setTimeout(function () { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); if (callback) callback(false); }, 250);
  };
  cancelBtn.addEventListener('mouseenter', function () {
    cancelBtn.style.background = 'var(--border-light)';
    cancelBtn.style.color = 'var(--text)';
  });
  cancelBtn.addEventListener('mouseleave', function () {
    cancelBtn.style.background = 'var(--surface-soft)';
    cancelBtn.style.color = 'var(--text-secondary)';
  });

  var confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.textContent = '确认';
  confirmBtn.style.cssText = 'flex:1;padding:12px 0;border:none;border-radius:var(--radius-sm);font-size:14px;font-weight:600;cursor:pointer;background:var(--accent-gradient);color:#fff;font-family:inherit;box-shadow:var(--shadow-glow);transition:all .25s ease';
  confirmBtn.onclick = function () {
    overlay.classList.remove('open');
    setTimeout(function () { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); if (callback) callback(true); }, 250);
  };

  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(confirmBtn);
  sheet.appendChild(text);
  sheet.appendChild(btnRow);
  overlay.appendChild(sheet);
  document.body.appendChild(overlay);

  void overlay.offsetWidth;
  overlay.classList.add('open');

  setTimeout(function () { cancelBtn.focus(); }, 50);
}

/* ============================================================
   指尖时光风格 — 左滑交互引擎
   ============================================================ */

/**
 * 初始化左滑交互（指尖时光风格 · 增强版）
 * - 卡片 1:1 跟手位移 + 渐进阻力（拉得越远越费力）
 * - 超过 50% 阈值弹簧展开（带 overshoot），不足弹性回弹
 * - 互斥展开（一次只展开一项）
 * - 展开时触感反馈 (navigator.vibrate)
 * - 防滚动冲突（|deltaY| > |deltaX| 视为垂直滚动）
 * - 触屏 + 鼠标双支持
 * - 点击非卡片区域自动关闭
 * - 自动检测操作区宽度：支持 .swipe-actions 多按钮 / .swipe-action 单按钮
 *
 * @param {string} selector 卡片容器 CSS 选择器
 * @param {Object} options
 * @param {number}  [options.actionWidth='auto'] 操作区露出宽度 (px)，不传则自动检测
 * @param {function} [options.onAction]          操作按钮点击回调（已弃用，改用按钮行内 onclick）
 * @param {function} [options.onClick]           卡片点击回调（非滑动时触发），接收容器元素
 * @param {boolean} [options.haptic=true]        启用触感反馈
 * @returns {{ close: function }} 返回控制对象
 */
function initSwipe(selector, options) {
  var opt = options || {};
  var explicitWidth = typeof opt.actionWidth === 'number' ? opt.actionWidth : null;
  var onClick = opt.onClick || function () {};
  var haptic = opt.haptic !== false;
  var openCard = null;   // 当前展开的容器
  var targetWrap = null; // 拖拽中的容器
  var startX = 0, startY = 0, currentX = 0;
  var moved = false, isScrolling = false;
  var touchTarget = null; // 点击开始时的原始目标

  /**
   * 获取容器内的可滑动卡片元素
   */
  function getCard(wrap) {
    var c = wrap ? wrap.querySelector('.s-card') : null;
    if (!c && wrap) c = wrap.querySelector('.goal-card');
    return c;
  }

  /**
   * 触感反馈（根据用户偏好强度调整）
   */
  function getHapticStrength() {
    try { return parseInt(localStorage.getItem('hapticStrength')) || 12; } catch(e) { return 12; }
  }
  function vibrate(ms) {
    if (haptic && navigator.vibrate) {
      try { navigator.vibrate(ms || getHapticStrength()); } catch(e) {}
    }
  }

  /**
   * 自动检测此容器的操作区实际宽度
   */
  function getActionWidth(wrap) {
    if (explicitWidth) return explicitWidth;
    /* 优先检测 .swipe-actions 多按钮容器总宽 */
    var multi = wrap.querySelector('.swipe-actions');
    if (multi) {
      var w = multi.offsetWidth;
      if (w > 0) return w;
      /* offsetWidth 可能为 0（未渲染），fallback 按子按钮数估算 */
      var       btns = multi.querySelectorAll('.swipe-action');
      return btns.length * 72 || 72;
    }
    /* 单按钮 */
    var single = wrap.querySelector('.swipe-action');
    if (single) return single.offsetWidth || 72;
    return 72;
  }

  /**
   * 弹簧展开 — 指尖时光风格：轻快 overshoot + 稳定回弹
   */
  function snapOpen(wrap) {
    var card = getCard(wrap);
    if (!card) return;
    var w = getActionWidth(wrap);
    /* 两步弹簧：先轻微越过目标位（overshoot 6px），再回弹到目标位 */
    card.style.transition = 'none';
    card.style.transform = 'translateX(-' + (w + 6) + 'px)';
    void card.offsetWidth;
    card.style.transition = 'transform .32s cubic-bezier(.34, 1.56, .64, 1)';
    card.style.transform = 'translateX(-' + w + 'px)';
    wrap.classList.remove('swiping');
    wrap.classList.add('swipe-open');
    openCard = wrap;
    vibrate(12);
  }

  /**
   * 弹性回弹复位 — 指尖时光风格：轻盈回弹 + 微量 overshoot
   */
  function snapReset(wrap) {
    var card = getCard(wrap);
    if (!card) return;
    var isCurrentlyOpen = wrap.classList.contains('swipe-open');
    if (isCurrentlyOpen) {
      /* 两步回弹：先越过 0 位（6px）再弹回 */
      card.style.transition = 'none';
      card.style.transform = 'translateX(6px)';
      void card.offsetWidth;
      card.style.transition = 'transform .3s cubic-bezier(.34, 1.56, .64, 1)';
      card.style.transform = 'translateX(0)';
    } else {
      card.style.transition = 'transform .3s cubic-bezier(.22,1,.36,1)';
      card.style.transform = 'translateX(0)';
    }
    wrap.classList.remove('swiping', 'swipe-open');
    if (openCard === wrap) openCard = null;
  }

  /**
   * 关闭所有展开卡片
   */
  function closeAll() {
    if (openCard) {
      snapReset(openCard);
    }
  }

  /**
   * 应用渐进阻力 — 指尖时光风格 v2：更自然的非线性曲线
   * - 前 50% 完全跟手（线性）
   * - 超过阈值后使用平方衰减（越拉越费力，但不生硬）
   * - 最大位移限制为操作区宽度的 120%
   */
  function applyResistance(raw, wrap) {
    if (raw <= 0) return 0;
    var w = getActionWidth(wrap);
    var threshold = w * 0.50;
    if (raw <= threshold) return raw;
    /* 超过阈值后：平方衰减，物理感更强 */
    var excess = raw - threshold;
    var maxExcess = w * 0.70;
    var progress = Math.min(excess / maxExcess, 1);
    var eased = progress * progress; /* 平方曲线 */
    return threshold + eased * maxExcess * 0.45;
  }

  /* ---- Touch events ---- */
  function isInteractive(el) {
    if (!el) return false;
    var tag = el.tagName;
    if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return true;
    if (el.hasAttribute && el.hasAttribute('onclick')) return true;
    if (el.closest) {
      if (el.closest('button')) return true;
      if (el.closest('.swipe-action')) return true;
      if (el.closest('.swipe-actions')) return true;
    }
    return false;
  }

  document.addEventListener('touchstart', function (e) {
    var wrap = e.target.closest(selector);
    if (!wrap) { closeAll(); return; }
    targetWrap = wrap;
    touchTarget = e.target;
    var t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    currentX = 0;
    moved = false;
    isScrolling = false;
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (!targetWrap) return;
    var t = e.touches[0];
    var rawX = startX - t.clientX;
    var deltaY = startY - t.clientY;

    /* 防滚动冲突 */
    if (!isScrolling && !moved) {
      if (Math.abs(deltaY) > Math.abs(rawX)) {
        isScrolling = true;
        return;
      }
    }
    if (isScrolling) return;

    moved = true;
    /* 应用渐进阻力 */
    var resisted = applyResistance(rawX, targetWrap);
    var maxW = getActionWidth(targetWrap) + 4;
    currentX = Math.max(0, Math.min(resisted, maxW));

    var card = getCard(targetWrap);
    if (card) {
      card.style.transition = 'none';
      card.style.transform = 'translateX(-' + currentX + 'px)';
      targetWrap.classList.add('swiping');
    }

    /* 互斥：关闭其他展开的卡片 */
    if (openCard && openCard !== targetWrap) {
      snapReset(openCard);
    }

    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchend', function () {
    if (!targetWrap) return;
    if (!isScrolling && moved) {
      var w = getActionWidth(targetWrap);
      if (currentX > w * 0.4) {
        snapOpen(targetWrap);
      } else {
        snapReset(targetWrap);
      }
    } else if (!moved && !isScrolling) {
      /* 纯点击（无滑动）→ 触发 onClick（跳过交互元素） */
      if (!isInteractive(touchTarget)) {
        onClick(targetWrap);
      }
    }
    targetWrap = null;
    moved = false;
    touchTarget = null;
  }, { passive: true });

  /* ---- Mouse events (桌面端) ---- */
  document.addEventListener('mousedown', function (e) {
    var wrap = e.target.closest(selector);
    if (!wrap) { closeAll(); return; }
    /* 忽略操作按钮上的 mousedown */
    if (e.target.closest('.swipe-action')) return;
    if (e.target.closest('.swipe-actions')) return;
    targetWrap = wrap;
    touchTarget = e.target;
    startX = e.clientX;
    startY = e.clientY;
    currentX = 0;
    moved = false;
    isScrolling = false;
  });

  document.addEventListener('mousemove', function (e) {
    if (!targetWrap) return;
    var rawX = startX - e.clientX;
    var deltaY = startY - e.clientY;

    if (!isScrolling && !moved) {
      if (Math.abs(deltaY) > Math.abs(rawX)) {
        isScrolling = true;
        return;
      }
    }
    if (isScrolling) return;

    moved = true;
    /* 应用渐进阻力 */
    var resisted = applyResistance(rawX, targetWrap);
    var maxW = getActionWidth(targetWrap) + 4;
    currentX = Math.max(0, Math.min(resisted, maxW));

    var card = getCard(targetWrap);
    if (card) {
      card.style.transition = 'none';
      card.style.transform = 'translateX(-' + currentX + 'px)';
      targetWrap.classList.add('swiping');
    }

    if (openCard && openCard !== targetWrap) {
      snapReset(openCard);
    }
  });

  document.addEventListener('mouseup', function () {
    if (!targetWrap) return;
    if (!isScrolling && moved) {
      var w = getActionWidth(targetWrap);
      if (currentX > w * 0.5) {
        snapOpen(targetWrap);
      } else {
        snapReset(targetWrap);
      }
    } else if (!moved && !isScrolling) {
      if (!isInteractive(touchTarget)) {
        onClick(targetWrap);
      }
    }
    targetWrap = null;
    moved = false;
    touchTarget = null;
  });

  /* ---- 键盘支持 (Enter/Space 激活卡片) ---- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var wrap = e.target.closest(selector);
    if (!wrap) return;
    e.preventDefault();
    /* 如果卡片处于展开状态，操作按钮优先 */
    if (wrap.classList.contains('swipe-open')) {
      var btn = wrap.querySelector('.swipe-action');
      if (btn) { btn.click(); return; }
    }
    /* 否则视为点击 */
    if (!isInteractive(e.target)) {
      onClick(wrap);
    }
  });

  /* ---- 点击非卡片区域自动关闭 ---- */
  document.addEventListener('click', function (e) {
    if (openCard && !e.target.closest(selector) && !e.target.closest('.modal-overlay')) {
      snapReset(openCard);
    }
  });

  return { close: closeAll };
}

/* ============================================================
   长按菜单（通用）
   ============================================================ */
var longPressTimer=null,longPressTarget=null;

/**
 * 初始化长按菜单
 * @param {string} selector 容器 CSS 选择器
 * @param {function} getMenuItems 返回菜单项数组 [{label,icon,action}]
 */
function initLongPress(selector, getMenuItems) {
  function cancelLongPress() {
    clearTimeout(longPressTimer);
    longPressTimer = null;
    longPressTarget = null;
  }

  function triggerLongPress(wrap) {
    var items = getMenuItems(wrap);
    if (!items || !items.length) return;
    /* 创建菜单弹窗 */
    var existing = document.getElementById('longPressMenu');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.id = 'longPressMenu';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.25);opacity:0;transition:opacity .2s ease';
    var menu = document.createElement('div');
    menu.style.cssText = 'position:fixed;bottom:0;left:50%;transform:translateX(-50%) translateY(100%);width:100%;max-width:420px;background:var(--bg-app);border-radius:var(--radius-lg) var(--radius-lg) 0 0;z-index:9999;padding:20px 20px max(20px,env(safe-area-inset-bottom));transition:transform .3s cubic-bezier(.22,1,.36,1);box-shadow:0 -4px 24px rgba(0,0,0,.12)';
    var handle = document.createElement('div');
    handle.style.cssText = 'width:36px;height:4px;border-radius:2px;background:var(--border);margin:0 auto 16px';
    menu.appendChild(handle);
    items.forEach(function(item) {
      var btn = document.createElement('button');
      btn.style.cssText = 'display:flex;align-items:center;gap:10px;width:100%;padding:12px 14px;border:none;border-radius:var(--radius-sm);background:transparent;color:var(--text);font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;transition:background .2s;text-align:left';
      btn.innerHTML = '<span style="font-size:18px">' + (item.icon || '•') + '</span><span>' + item.label + '</span>';
      btn.onmouseenter = function() { btn.style.background = 'var(--surface-soft)'; };
      btn.onmouseleave = function() { btn.style.background = 'transparent'; };
      btn.onclick = function() {
        overlay.click();
        if (item.action) item.action();
      };
      menu.appendChild(btn);
    });
    overlay.appendChild(menu);
    document.body.appendChild(overlay);
    void overlay.offsetWidth;
    overlay.style.opacity = '1';
    menu.style.transform = 'translateX(-50%) translateY(0)';
    overlay.onclick = function(e) {
      if (e.target === overlay) {
        menu.style.transform = 'translateX(-50%) translateY(100%)';
        overlay.style.opacity = '0';
        setTimeout(function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
      }
    };
    /* 触感反馈 */
    try { navigator.vibrate(10); } catch(e) {}
  }

  document.addEventListener('touchstart', function(e) {
    var wrap = e.target.closest(selector);
    if (!wrap) return;
    longPressTarget = wrap;
    longPressTimer = setTimeout(function() {
      if (longPressTarget) {
        triggerLongPress(longPressTarget);
        longPressTimer = null;
      }
    }, 500);
  }, { passive: true });

  document.addEventListener('touchmove', function() { cancelLongPress(); }, { passive: true });
  document.addEventListener('touchend', function() { cancelLongPress(); }, { passive: true });

  /* 桌面端：使用 contextmenu 事件 */
  document.addEventListener('contextmenu', function(e) {
    var wrap = e.target.closest(selector);
    if (wrap) { e.preventDefault(); triggerLongPress(wrap); }
  });
}

/* ============================================================
   触感强度设置（全局）
   ============================================================ */
var hapticLevels=[{key:'light',val:6,label:'弱'},{key:'medium',val:12,label:'中'},{key:'heavy',val:25,label:'强'}];
function cycleHaptic(){
  var cur=parseInt(localStorage.getItem('hapticStrength'))||12;
  var idx=0;for(var i=0;i<hapticLevels.length;i++){if(hapticLevels[i].val===cur){idx=(i+1)%hapticLevels.length;break}}
  localStorage.setItem('hapticStrength',hapticLevels[idx].val);
  var label=document.getElementById('hapticLabel');
  if(label)label.textContent=hapticLevels[idx].label;
  try{navigator.vibrate(hapticLevels[idx].val)}catch(e){}
}
window.cycleHaptic=cycleHaptic;
