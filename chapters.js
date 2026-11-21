// Chapter URLs all serve the same static story. Carry its live nodes into the
// incoming container so moving between chapters preserves the experiment state.
(() => {
  const story = document.querySelector('main');
  const chapters = [...story.querySelectorAll('section[id]')];
  const keys = ['start', ...chapters.slice(1).map(section => section.id)];
  // Native anchors also work before the chapter router starts.
  document.querySelectorAll('a[data-chapter-link]').forEach(link => {
    if (link.id === 'challengeInspect') return;
    const url = new URL(location.href);
    url.searchParams.delete('tap');
    url.hash = '';
    url.searchParams.set('chapter', link.dataset.chapterLink);
    link.href = url.href;
  });
  const seen = new WeakSet();
  const animations = new Set();

  function animate(target, from, to) {
    const tween = gsap.fromTo(target, from, { ...to, overwrite: 'auto' });
    animations.add(tween);
    tween.eventCallback('onComplete', () => animations.delete(tween));
    return tween;
  }

  function reveal(element) {
    if (seen.has(element)) return;
    seen.add(element);
    if (reducedMotion.matches) return;
    const targets = element.children.length ? [...element.children] : [element];
    animate(targets, { opacity: 0, scale: .97 }, {
      opacity: 1, scale: 1, duration: .85, stagger: .06,
      ease: springEase, clearProps: 'transform,opacity'
    });
  }

  const observer = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (isIntersecting) { observer.unobserve(target); reveal(target); }
    }
  }, { rootMargin: '0px 0px -5% 0px' });
  story.querySelectorAll('.chapter, .workspace, .tapLesson, .lesson').forEach(el => observer.observe(el));

  function chapterFrom(url) {
    if (url.searchParams.get('chapter') === 'signal' && url.searchParams.has('tap')) return story.querySelector('#samples');
    const key = url.hash.startsWith('#inspect/') ? 'anatomy' : url.hash.slice(1) || url.searchParams.get('chapter');
    return chapters[keys.indexOf(key)] || (url.hash && document.getElementById(url.hash.slice(1))) || chapters[0];
  }

  function positionChapter(url, focus) {
    const section = chapterFrom(url);
    if (section.id === 'samples') {
      const rawTilt = url.searchParams.get('tap');
      if (rawTilt !== null && /^([1-8]?[0-9]|90)$/.test(rawTilt)) {
        takeSignalControl();
        for (const [id, value] of Object.entries({ gap: 1, angle: rawTilt, turns: 5, noise: 0, packet: '1010' })) {
          document.getElementById(id).value = value;
        }
        drawSignal();
      }
      section.open = true;
    }
    if (section === chapters[0]) window.scrollTo(0, 0);
    else section.scrollIntoView({ block: 'start', behavior: 'instant' });
    if (focus) {
      const title = section.querySelector('h1, h2, summary') || section;
      title.tabIndex = -1;
      title.focus({ preventScroll: true });
    }
  }

  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) for (const tween of [...animations]) tween.progress(1);
  });

  // A repeat click on the current URL still needs to return to its chapter
  // after the visitor has scrolled elsewhere.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-chapter-link]');
    if (!link || link.href !== location.href || event.button || event.metaKey ||
        event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    positionChapter(new URL(link.href), true);
  }, true);

  // Browser scroll restoration races chapter alignment during instant transitions.
  history.scrollRestoration = 'manual';
  barba.init({
    preventRunning: true,
    prevent: ({ el }) => !el.hasAttribute('data-chapter-link'),
    transitions: [{
      name: 'chapter',
      leave({ current }) {
        if (!reducedMotion.matches) return animate(current.container, { opacity: 1 }, {
          opacity: 0, duration: .16, ease: 'power1.in'
        });
      },
      beforeEnter({ next }) {
        next.container.replaceChildren(story);
        positionChapter(new URL(location.href), true);
      },
      enter({ next }) {
        if (!reducedMotion.matches) return animate(next.container, { opacity: 0 }, {
          opacity: 1, duration: .85, ease: springEase, clearProps: 'opacity'
        });
      }
    }]
  });
  if (location.hash || new URL(location.href).searchParams.has('chapter')) {
    positionChapter(new URL(location.href), false);
  }
})();
