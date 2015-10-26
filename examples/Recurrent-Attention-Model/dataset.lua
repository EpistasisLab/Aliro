local mnist = require 'mnist'

-- Load data
local dataset = {}
dataset.train = mnist.traindataset()
dataset.test = mnist.testdataset()
-- Save dataset constants
dataset.height = 28
dataset.width = 28
dataset.channels = 1
dataset.classes = 10

-- Assign tensors
local trainSet = {
  X = torch.zeros(dataset.train.size, dataset.channels, dataset.height, dataset.width),
  Y = torch.zeros(dataset.train.size),
  size = dataset.train.size
}
local testSet = {
  X = torch.zeros(dataset.test.size, dataset.channels, dataset.height, dataset.width),
  Y = torch.zeros(dataset.test.size),
  size = dataset.test.size
}
-- Form training data
for i = 1, dataset.train.size do
  trainSet.X[{{i}, {1}, {}, {}}] = dataset.train[i].x
  trainSet.Y[{{i}}] = dataset.train[i].y
  -- 1-index labels
  if dataset.train[i].y == 0 then
    trainSet.Y[{{i}}] = 10
  end
end
-- Form testing data
for i = 1, dataset.test.size do
  testSet.X[{{i}, {1}, {}, {}}] = dataset.test[i].x
  testSet.Y[{{i}}] = dataset.test[i].y
  -- 1-index labels
  if dataset.test[i].y == 0 then
    testSet.Y[{{i}}] = 10
  end
end
-- Put into dataset object
dataset.train = trainSet
dataset.test = testSet

-- Retrieves a batch
dataset.getBatch = function(setType, dataType, batchIndex, batchSize)
  if dataType == 'X' then
    return dataset[setType][dataType][{{batchIndex, batchIndex + batchSize - 1}, {}, {}, {}}]
  else
    return dataset[setType][dataType][{{batchIndex, batchIndex + batchSize - 1}}]
  end
end

return dataset
