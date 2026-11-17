(function () {
  try {
    var root = document.documentElement;
    root.classList.add('js');
    var stored = localStorage.getItem('theme');
    if (stored === 'alexlight' || stored === 'alexdark') {
      root.setAttribute('data-theme', stored);
    }
    var dark =
      stored === 'alexdark' ||
      (stored !== 'alexlight' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('cc--darkmode', dark);
  } catch (err) {
    void err;
  }
})();
