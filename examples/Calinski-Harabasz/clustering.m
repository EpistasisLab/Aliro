% Requies JSONlab: http://iso2mesh.sourceforge.net/cgi-bin/index.cgi?jsonlab
function y = x(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
  mkdir(p);
  val = struct('score', 0.9, 'losses', [0.9 0.6 0.4 0.3 0.2 0.2 0.1 0.1 0.1 0.1]);
  test = struct('score', 0.8, 'loss', 2.524);
  savejson('_val', val, fullfile(p, 'val.json'));
  savejson('_test', test, fullfile(p, 'test.json'));
  exit;
end
