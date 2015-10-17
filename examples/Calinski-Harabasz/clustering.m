% Requies JSONlab: http://iso2mesh.sourceforge.net/cgi-bin/index.cgi?jsonlab
function clustering(~, algorithm, ~, k, ~, id)
  % Set random seed
  rng('default');

  % Load Iris flower dataset
  load fisheriris;

  % Run algorithm
  if strcmp('kmeans', algorithm)
    clust = kmeans(meas, k);
  elseif strcmp('linkage', algorithm)
    clust = clusterdata(meas, 'maxclust', k, 'linkage', 'ward');
  end

  % Run Calinski-Harabasz criterion
  eva = evalclusters(meas, clust, 'CalinskiHarabasz');

  % Create structures for scatter plot
  columnNames = {};
  
  xs = struct();
  columns1 = cell([1, 2*k]);
  columns2 = cell([1, 2*k]);
  
  axis1 = struct('x', struct('label', 'Sepal length'), 'y', struct('label', 'Sepal width'));
  axis2 = struct('x', struct('label', 'Petal length'), 'y', struct('label', 'Petal width'));

  for i = 1:k
    % Link x and y axes for different clusters
    xs.(strcat('cluster', num2str(i))) = strcat('y', num2str(i));

    % Extract coordinates
    indexes = clust == i;
    columns1{2*i - 1} = meas(indexes, 1);
    columns1{2*i} = meas(indexes, 2);
    columns2{2*i - 1} = meas(indexes, 3);
    columns2{2*i} = meas(indexes, 4);
    % Double plot scalars to prevent MATLAB collapsing 1D arrays
    if isscalar(columns1{2*i - 1})
      columns1{2*i - 1} = [columns1{2*i - 1}; columns1{2*i - 1}];
      columns1{2*i} = [columns1{2*i}; columns1{2*i}];
      columns2{2*i - 1} = [columns2{2*i - 1}; columns2{2*i - 1}];
      columns2{2*i} = [columns2{2*i}; columns2{2*i}];
    end

    % List axes names in order
    columnNames{end+1} = strcat('cluster', num2str(i));
    columnNames{end+1} = strcat('y', num2str(i));
  end
  
  % Save score
  mkdir(id);
  CH = struct('CH', eva.CriterionValues);
  savejson('_scores', CH, fullfile(id, 'scores.json'));
  
  % Save scatter plot
  data1 = struct('xs', xs, 'columns', {columns1}, 'type', 'scatter');
  data2 = struct('xs', xs, 'columns', {columns2}, 'type', 'scatter');
  savejson('_charts', [struct('columnNames', {columnNames}, 'data', data1, 'axis', axis1), struct('columnNames', {columnNames}, 'data', data2, 'axis', axis2)], fullfile(id, 'charts.json'));
  
  % Exit normally
  exit;
end
