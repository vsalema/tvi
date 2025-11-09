// responsive-flex.js
// Rend #v_player totalement fluide, compatible flex/grid/overlays, sans CORS ni URLs absolues.

(function(){
  function setupResponsive(){
    var v = document.getElementById('v_player');
    if(!v) return;

    // 1) Forcer le mode fluid Video.js si disponible (sans casser l'init)
    try{
      if (window.videojs) {
        var player = window.videojs.getPlayer ? window.videojs.getPlayer('v_player') : window.videojs('v_player');
        if (player && typeof player.fluid === 'function') {
          player.fluid(true);
        }
      }
    }catch(e){ /* silencieux */ }

    // 2) Retirer largeur/hauteur inline si présents (sans obliger l'HTML)
    ['width','height'].forEach(function(attr){
      if (v.hasAttribute(attr)) v.removeAttribute(attr);
      if (v.style && v.style[attr]) v.style[attr] = '';
    });

    // 3) Injecter automatiquement un cadre overlay-safe si pas présent
    //    <div class="player-flex"><div class="player-frame" data-aspect="16/9">[video]</div></div>
    var parent = v.parentElement;
    var hasFrame = parent && parent.classList.contains('player-frame');
    if (!hasFrame) {
      var frame = document.createElement('div');
      frame.className = 'player-frame';
      frame.setAttribute('data-aspect','16/9');  // ratio par défaut (peut être modifié)
      var flex = document.createElement('div');
      flex.className = 'player-flex';
      parent.insertBefore(flex, v);
      flex.appendChild(frame);
      frame.appendChild(v);
    }

    // 4) Overlay API simple (optionnelle)
    //    window.PlayerOverlay.show(html) / hide()
    window.PlayerOverlay = (function(){
      var layer;
      function ensure(){
        if (!layer){
          layer = document.createElement('div');
          layer.className = 'player-overlay';
          var frame = v.closest('.player-frame');
          frame && frame.appendChild(layer);
        }
        return layer;
      }
      return {
        show: function(html){
          var el = ensure();
          el.innerHTML = html || '';
          el.style.display = 'block';
        },
        hide: function(){
          if (!layer) return;
          layer.style.display = 'none';
          layer.innerHTML = '';
        }
      };
    })();

    // 5) ResizeObserver: si le parent change de taille (flex/grid), on laisse Video.js s'adapter.
    if ('ResizeObserver' in window){
      var ro = new ResizeObserver(function(){ /* rien à faire, vjs-fluid gère; hook possible */ });
      ro.observe(v.closest('.player-frame') || v);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupResponsive, {once:true});
  } else {
    setupResponsive();
  }
})();
