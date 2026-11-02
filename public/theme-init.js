(function () {
  try {
    document.documentElement.classList.add('js');
    var stored = localStorage.getItem('theme');
    if (stored === 'alexlight' || stored === 'alexdark') {
      document.documentElement.setAttribute('data-theme', stored);
      var color = stored === 'alexdark' ? '#0a1224' : '#f6f8fc';
      var metas = document.querySelectorAll('meta[name="theme-color"]');
      for (var i = 0; i < metas.length; i += 1) metas[i].setAttribute('content', color);
    }
  } catch (err) {
    void err;
  }
})();
