local optim = require 'optim'

local tester = {}

-- Tests agent
tester.test = function(dataset, agent, opt)
  agent:evaluate()

  -- Testing loop
  batchIndex = 1
  local correct = 0
  for i = 1, dataset.test.size/opt.batchSize do
    local testXBatch = dataset.getBatch('test', 'X', batchIndex, opt.batchSize)
    local testYBatch = dataset.getBatch('test', 'Y', batchIndex, opt.batchSize):byte()
    
    local outputs = agent:forward(testXBatch)
    outputs = nn.SelectTable(1):forward(outputs)
    local __, predictions = torch.max(outputs, 2)
    correct = correct + torch.sum(torch.eq(predictions:byte(), testYBatch))

    batchIndex = batchIndex + opt.batchSize
  end

  -- Return accuracy
  return correct / dataset.test.size
end

return tester
