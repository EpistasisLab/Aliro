require 'torchx'

local visualiser = {}

-- Draws a white bounding box on an image
local function drawBox(img, bbox, channel)
  channel = channel or 1

  local x1, y1 = torch.round(bbox[1]), torch.round(bbox[2])
  local x2, y2 = torch.round(bbox[1] + bbox[3]), torch.round(bbox[2] + bbox[4])

  x1, y1 = math.max(1, x1), math.max(1, y1)
  x2, y2 = math.min(img:size(3), x2), math.min(img:size(2), y2)

  local max = img:max()

  for i = x1, x2 do
    img[channel][y1][i] = max
    img[channel][y2][i] = max
  end
  for i = y1, y2 do
    img[channel][i][x1] = max
    img[channel][i][x2] = max
  end

  return img
end

-- Extracts glimpses for first 5 test samples
visualiser.getGlimpses = function(dataset, agent, opt)
  -- Get relevent modules
  local ra = agent:findModules('nn.RecurrentAttention')[1]
  local sg = agent:findModules('nn.SpatialGlimpse')[1]

  agent:training() -- Saves intermediate states for extracting glimpses
  -- Set 0 standard deviation for deterministic evaluations
  for i = 1, #ra.actions do
    local rn = ra:getStepModule(i):findModules('nn.ReinforceNormal')[1]
    rn.stdev = 0
  end

  -- Get inputs
  local input = dataset.getBatch('test', 'X', 1, 5)
  -- Perform inference
  local output = agent:forward(input)
  local locations = ra.actions

  -- Glimpses (bounding boxes) and extracted patches
  local glimpses = {}
  local patches = {}

  local params = nil
  for i = 1, input:size(1) do
    local img = input[i]
    local width, height = img:size(2), img:size(3)
    for j, location in ipairs(locations) do
      local glimpse = glimpses[j] or {}
      glimpses[j] = glimpse
      local patch = patches[j] or {}
      patches[j] = patch

      -- Calculate glimpse coordinates
      local xy = location[i]
      local x, y = xy:select(1,1), xy:select(1,2) -- (-1,-1) top left corner, (1,1) bottom right corner of image
      x, y = (x + 1)/2, (y + 1)/2 -- (0,0), (1,1)
      x, y = x*(input:size(3) - 1) + 1, y*(input:size(4) -1) + 1 -- (1,1), (input:size(3), input:size(4))

      -- Draw glimpse bounding boxes
      local gimg = img:clone()
      for d = 1, sg.depth do
        local size = sg.size*(sg.scale^(d - 1))
        local bbox = {y - size/2, x - size/2, size, size}
        drawBox(gimg, bbox, 1)
      end
      glimpse[i] = gimg

      -- Extract patches
      local sg_, ps
      if j == 1 then
        sg_ = ra.rnn.initialModule:findModules('nn.SpatialGlimpse')[1]
      else
        sg_ = ra.rnn.sharedClones[j]:findModules('nn.SpatialGlimpse')[1]
      end
      -- Stack glimpses and resize to input size
      patch[i] = image.scale(torch.concat(torch.chunk(sg_.output[i], opt.glimpseDepth), 2), width, height*opt.glimpseDepth)

      collectgarbage() -- Memory management
    end
  end

  -- Return glimpses and patches
  return glimpses, patches
end

return visualiser
