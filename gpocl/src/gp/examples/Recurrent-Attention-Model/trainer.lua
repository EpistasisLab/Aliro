local optim = require 'optim'

local trainer = {}

-- Trains agent
trainer.train = function(dataset, agent, criterion, opt)
  agent:training()

  local params, gradParams = agent:getParameters()
  local batchIndex = 1

  local feval = function(x)
    if x ~= params then
      params:copy(x)
    end
    -- Reset gradients
    gradParams:zero()

    -- Load batch
    local trainXBatch = dataset.getBatch('train', 'X', batchIndex, opt.batchSize)
    local trainYBatch = dataset.getBatch('train', 'Y', batchIndex, opt.batchSize)

    -- Forward and backward propagation
    local outputs = agent:forward(trainXBatch)
    local loss = criterion:forward(outputs, trainYBatch)
    local dLossDOutput = criterion:backward(outputs, trainYBatch)
    agent:backward(trainXBatch, dLossDOutput)

    return loss, gradParams
  end

  local optimState = {
    learningRate = opt.learningRate,
    momentum = opt.momentum,
    dampening = 0,
    nesterov = true
  }

  -- Training loop
  local losses = {}
  local epochs = opt.epochs
  for i = 1, epochs*dataset.train.size/opt.batchSize do
    local __, loss = optim[opt.optimiser](feval, params, optimState)
    table.insert(losses, loss[1]) -- Save training loss

    -- Print loss every 10 iterations
    if (i % 10 == 0) then
      print('Loss @ iteration ' .. i .. ': ' .. loss[1])
    end

    batchIndex = batchIndex + opt.batchSize
    -- Reset batch index after every epoch
    if batchIndex > dataset.train.size then
      batchIndex = 1
      -- Shuffle data in place
      local shuffleIndices = torch.randperm(dataset.train.size):long()
      dataset.train.X:index(dataset.train.X, 1, shuffleIndices)
      dataset.train.Y:index(dataset.train.Y, 1, shuffleIndices)
    end

    collectgarbage() -- Memory management
  end

  -- Return losses
  return losses
end

return trainer
