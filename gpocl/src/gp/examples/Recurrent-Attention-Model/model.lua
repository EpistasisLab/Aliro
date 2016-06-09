require 'dpnn'
require 'rnn'

local model = {}

-- Creates Recurrent Attention Model
model.createAgent = function(dataset, opt)
  -- Location "sensor": q(l_t-1) (non-standard notation)
  local locationSensor = nn.Sequential()
  locationSensor:add(nn.SelectTable(2))
  locationSensor:add(nn.Linear(2, opt.locationHiddenSize))
  locationSensor:add(nn.ReLU())

  -- Glimpse sensor: p(x_t, l_t-1)
  local glimpseSensor = nn.Sequential()
  -- Note: SpatialGlimpse has internal modules that require floats
  glimpseSensor:add(nn.DontCast(nn.SpatialGlimpse(opt.glimpsePatchSize, opt.glimpseDepth, opt.glimpseScale):float(), true))
  glimpseSensor:add(nn.Collapse(3))
  glimpseSensor:add(nn.Linear(dataset.channels*(opt.glimpsePatchSize^2)*opt.glimpseDepth, opt.glimpseHiddenSize))
  glimpseSensor:add(nn.ReLU())

  -- Glimpse network: g_t = f_g(p(x_t, l_t-1), q(l_t-1))
  local glimpse = nn.Sequential()
  glimpse:add(nn.ConcatTable():add(locationSensor):add(glimpseSensor))
  glimpse:add(nn.JoinTable(1, 1))
  glimpse:add(nn.Linear(opt.glimpseHiddenSize + opt.locationHiddenSize, opt.imageHiddenSize))
  glimpse:add(nn.ReLU())
  glimpse:add(nn.Linear(opt.imageHiddenSize, opt.hiddenSize))

  -- Core network: h_t = f_h(g_t, h_t-1)
  local recurrent = nn.Linear(opt.hiddenSize, opt.hiddenSize)
  -- Recurrent(input size, input module, recurrent module, transfer function, BPTT limit)
  local rnn = nn.Recurrent(opt.hiddenSize, glimpse, recurrent, nn.ReLU(), 99999)

  -- Location network: l_t = f_l(h_t)
  local locator = nn.Sequential()
  locator:add(nn.Linear(opt.hiddenSize, 2))
  locator:add(nn.HardTanh()) -- Bounds mean between -1 and 1
  locator:add(nn.ReinforceNormal(2*opt.locatorStd)) -- Sample from Normal distribution using REINFORCE rule
  locator:add(nn.HardTanh()) -- Bounds sample between -1 and 1
  locator:add(nn.MulConstant(opt.unitPixels*2/dataset.height)) -- Choose location within bounds of image

  -- Put together input -> REINFORCE output
  local attention = nn.RecurrentAttention(rnn, locator, opt.rho, {opt.hiddenSize})

  -- Create whole reinforcement learning agent
  local agent = nn.Sequential()
  --agent:add(nn.Convert(ds:ioShapes(), 'bchw'))
  agent:add(attention)
  -- Add classifier
  agent:add(nn.SelectTable(-1))
  agent:add(nn.Linear(opt.hiddenSize, dataset.classes))
  agent:add(nn.LogSoftMax())
  -- Add the baseline reward predictor
  seq = nn.Sequential()
  seq:add(nn.Constant(1, 1))
  seq:add(nn.Add(1))
  concat = nn.ConcatTable():add(nn.Identity()):add(seq)
  concat2 = nn.ConcatTable():add(nn.Identity()):add(concat)
  -- Output will be : {classpred, {classpred, basereward}}
  agent:add(concat2)

  return agent
end

-- Creates criterion for agent
model.createCriterion = function(agent, opt)
  local criterion = nn.ParallelCriterion(true) -- Repeats outputs across criteria
  criterion:add(nn.ModuleCriterion(nn.ClassNLLCriterion(), nil, nn.Convert())) -- Backprop
  criterion:add(nn.ModuleCriterion(nn.VRClassReward(agent, opt.rewardScale), nil, nn.Convert())) -- REINFORCE

  return criterion
end

return model
