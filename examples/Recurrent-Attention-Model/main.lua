require 'dpnn'
require 'rnn'
local image = require 'image'
local cjson = require 'cjson'

-- Command line arguments
local cmd = torch.CmdLine()
cmd:option('-_id', '123456789', 'Experiment ID')
cmd:option('-cuda', 'true', 'Use CUDA') -- Torch CmdLine does not parse booleans properly
cmd:option('-seed', 123, 'Random seed')
cmd:option('-locationHiddenSize', 128, 'Output size of location "sensor"')
cmd:option('-glimpsePatchSize', 8, 'Glimpse patch size')
cmd:option('-glimpseDepth', 3, 'Number of successive glimpses')
cmd:option('-glimpseScale', 2, 'Factor by which to scale up successive glimpses')
cmd:option('-glimpseHiddenSize', 128, 'Output size of glimpse sensor')
cmd:option('-imageHiddenSize', 256, 'Internal size of glimpse network')
cmd:option('-hiddenSize', 256, 'Internal size of (recurrent) core network')
cmd:option('-locatorStd', 0.1, 'Standard deviation of location network\'s Normal distribution')
cmd:option('-unitPixels', 13, 'Max distance from the image centre for the glimpse location')
cmd:option('-rho', 6, 'BPTT limit for RAM')
cmd:option('-rewardScale', 1, 'Scale of positive reward (negative is 0)')
cmd:option('-batchSize', 100, 'Minibatch size')
cmd:option('-learningRate', 1e-3, 'Learning rate')
cmd:option('-optimiser', 'sgd', 'Optimiser: sgd|rmsprop|adagrad|adadelta|adam')
cmd:option('-momentum', 0.9, 'Momentum')
cmd:option('-epochs', 1, 'Number of epochs')
local opt = cmd:parse(arg)
-- Parse CUDA flag from string to boolean
if opt.cuda == 'true' then
  opt.cuda = true
else
  opt.cuda = false
end

-- Make experiment folder
paths.mkdir(opt._id)

-- Set seeds
math.randomseed(opt.seed)
torch.manualSeed(opt.seed)

-- Create dataset
print('Loading dataset')
local dataset = require 'dataset'

-- Create agent and criterion
print('Creating agent')
local model = require 'model'
local agent = model.createAgent(dataset, opt)
local criterion = model.createCriterion(agent, opt)

-- CUDA conversion
if opt.cuda then
  require 'cunn'
  cutorch.manualSeedAll(opt.seed)
  dataset.train.X = dataset.train.X:cuda()
  dataset.train.Y = dataset.train.Y:cuda()
  dataset.test.X = dataset.test.X:cuda()
  dataset.test.Y = dataset.test.Y:cuda()
  agent:cuda()
  criterion:cuda()
end

-- Train agent
print('Training agent')
local trainer = require 'trainer'
local losses = trainer.train(dataset, agent, criterion, opt) -- Train and receive losses

-- Visualise glimpses
print('Visualising glimpses')
local visualiser = require 'visualiser'
local glimpses, patches = visualiser.getGlimpses(dataset, agent, opt)
-- Save glimpses and patches
for j, glimpse in ipairs(glimpses) do
  local g = image.toDisplayTensor{input=glimpse, nrow=5, padding=3}
  local p = image.toDisplayTensor{input=patches[j], nrow=5, padding=3}
  image.save(paths.concat(opt._id, 'glimpse' .. j .. '.png'), g)
  image.save(paths.concat(opt._id, 'patch' .. j .. '.png'), p)
end

-- Test agent
print('Testing agent')
local tester = require 'tester'
local accuracy = tester.test(dataset, agent, opt)
print('Accuracy: ' .. accuracy * 100 .. '%')

-- Create results
local scoresJSON = cjson.encode({_scores = {Accuracy = accuracy}})
local chartsObj = {
  columnNames = {'train', 'x'};
  data = {
    x = 'x',
    columns = {losses, torch.totable(torch.linspace(1, #losses, #losses))},
    axis = {
      x = {
        label = {
          text = 'Iteration'
        }
      },
      y = {
        label = {
          text = 'Loss'
        }
      }
    }
  }
}
local chartsJSON = cjson.encode({_charts = chartsObj})

-- Save results
local file = torch.DiskFile(paths.concat(opt._id, 'score.json'), 'w')
file:writeString(scoresJSON)
file:close()
file = torch.DiskFile(paths.concat(opt._id, 'chart.json'), 'w')
file:writeString(chartsJSON)
file:close()
