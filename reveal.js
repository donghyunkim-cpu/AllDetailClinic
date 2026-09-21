/* All Detail Clinic — subtle scroll reveal.
   Inline-style driven (no CSS classes). Never permanently hides content:
   IO + passive catch-up + safety timeout. Authored inline styles are
   captured before priming and restored verbatim on settle. */
(function () {
  if (typeof window === 'undefined' || window.__adcReveal) return;
  window.__adcReveal = true;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
  var DUR = 760;
  var SKIP_ANCESTOR = 'header, footer, [data-dock], [data-modal], [role="dialog"], [data-lnb], [data-no-reveal]';
  var items = [];
  var io = null;

  function skippable(el) {
    if (el.closest && el.closest(SKIP_ANCESTOR)) return true;
    // never touch elements that own their inline transform/opacity or animate
    if (el.style && (el.style.transform || el.style.opacity || el.style.animation || el.style.animationName)) return true;
    var cs = getComputedStyle(el);
    if (cs.position === 'sticky' || cs.position === 'fixed' || cs.position === 'absolute') return true;
    if (cs.animationName && cs.animationName !== 'none') return true;
    var inner = el.querySelectorAll('*');
    for (var i = 0; i < inner.length; i++) {
      var p = getComputedStyle(inner[i]).position;
      if (p === 'sticky' || p === 'fixed') return true; // a transform here would break them
    }
    return false;
  }

  function collect() {
    var out = [];
    var sections = document.querySelectorAll('section');
    for (var s = 0; s < sections.length; s++) {
      var sec = sections[s];
      if (sec.closest(SKIP_ANCESTOR)) continue;
      var units = [];
      var kids = sec.children;
      for (var k = 0; k < kids.length; k++) {
        var kid = kids[k];
        var gk = kid.children;
        if (gk.length > 1 && gk.length <= 12 && kid.getBoundingClientRect().height > 160) {
          for (var g = 0; g < gk.length; g++) units.push(gk[g]);
        } else {
          units.push(kid);
        }
      }
      for (var u = 0; u < units.length; u++) {
        var el = units[u];
        if (!el || el.nodeType !== 1) continue;
        if (el.getBoundingClientRect().height < 40) continue;
        if (skippable(el)) continue;
        out.push({ el: el, order: u, done: false });
      }
    }
    return out;
  }

  function prime(it) {
    var el = it.el;
    it.orig = {
      transition: el.style.transition,
      transform: el.style.transform,
      opacity: el.style.opacity,
      willChange: el.style.willChange
    };
    el.style.willChange = 'opacity, transform';
    el.style.opacity = '0';
    el.style.transform = 'translate3d(0, 16px, 0)';
    el.style.transition = 'opacity ' + DUR + 'ms ' + EASE + ', transform ' + DUR + 'ms ' + EASE;
  }

  function settle(it) {
    var el = it.el, o = it.orig || {};
    el.style.transition = o.transition || '';
    el.style.transform = o.transform || '';
    el.style.opacity = o.opacity || '';
    el.style.willChange = o.willChange || '';
  }

  function show(it, delay) {
    if (!it || it.done) return;
    it.done = true;
    if (io) { try { io.unobserve(it.el); } catch (e) {} }
    setTimeout(function () {
      it.el.style.opacity = '1';
      it.el.style.transform = 'translate3d(0, 0, 0)';
      setTimeout(function () { settle(it); }, DUR + 60);
    }, delay || 0);
  }

  function revealNow(it) { // no animation — used by catch-up / safety net
    if (!it || it.done) return;
    it.done = true;
    if (io) { try { io.unobserve(it.el); } catch (e) {} }
    settle(it);
  }

  // catch-up: anything at or above the viewport bottom that the observer
  // never sampled (anchor jumps, fast flicks, scroll restoration) is shown
  function catchUp() {
    var vh = window.innerHeight;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.done) continue;
      var r = it.el.getBoundingClientRect();
      if (r.bottom < 0) revealNow(it);           // already scrolled past
      else if (r.top < vh * 0.94) show(it, 0);   // in or entering view
    }
  }

  function run() {
    items = collect();
    if (!items.length) return;

    var els = items.map(function (i) { return i.el; });
    items = items.filter(function (i) {
      for (var j = 0; j < els.length; j++) if (els[j] !== i.el && els[j].contains(i.el)) return false;
      return true;
    });

    items.forEach(prime);

    var vh = window.innerHeight;
    var first = items.filter(function (i) { return i.el.getBoundingClientRect().top < vh * 0.9; });
    requestAnimationFrame(function () {
      first.forEach(function (i, n) { show(i, Math.min(n, 4) * 70); });
    });

    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var it = e.target.__adcItem;
          if (!it || it.done) return;
          if (e.isIntersecting) show(it, Math.min(it.order, 3) * 60);
          else if (e.boundingClientRect.bottom < 0) revealNow(it); // passed while unsampled
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
      items.forEach(function (i) { if (!i.done) { i.el.__adcItem = i; io.observe(i.el); } });
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; catchUp(); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('hashchange', function () { setTimeout(catchUp, 60); });
    setTimeout(catchUp, 400);

    // safety net: nothing stays hidden, whatever happens
    setTimeout(function () { items.forEach(revealNow); }, 12000);
  }

  function boot() {
    var tries = 0;
    (function wait() {
      tries++;
      if (document.querySelectorAll('section').length || tries > 40) setTimeout(run, 120);
      else setTimeout(wait, 120);
    })();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
