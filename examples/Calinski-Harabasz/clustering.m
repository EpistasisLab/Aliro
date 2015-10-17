% Requies JSONlab: http://iso2mesh.sourceforge.net/cgi-bin/index.cgi?jsonlab
function y = x(~, algorithm, ~, k, ~, id)
  % Set random seed
  rng('default');

  % Load Iris flower dataset
  load fisheriris;

  % Run Calinski-Harabasz
  eva = evalclusters(meas, algorithm, 'CalinskiHarabasz', 'KList', [k]);
  
  % Save results
  mkdir(id);
  CH = struct('CH', eva.CriterionValues);
  savejson('_scores', CH, fullfile(id, 'scores.json'));
  
  % Exit
  exit;
end
