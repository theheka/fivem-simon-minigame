local display = false
local outputEvent = nil 

function startGame(level, difficulty)
  local targetLvl = level
  local gameDifficulty = difficulty

  if targetLvl == nil then
    targetLvl = 5
  end
  if gameDifficulty == nil then
    gameDifficulty = 0.5
  end

  SetDisplay(true, targetLvl, gameDifficulty)
end

function SetDisplay(bool, level, difficulty)
  display = bool
  SetNuiFocus(bool, bool)
  SendNUIMessage({
      type = "ui",
      status = bool,
      target = level,
      diff = difficulty
  })
end

RegisterNUICallback("failed", function(data)
  SetDisplay(false)
  triggerOutputEvent(false)
end)

RegisterNUICallback("success", function(data)
  SetDisplay(false)
  triggerOutputEvent(true)
end)

function triggerOutputEvent(completedGame)
  if outputEvent ~= nil then
    TriggerEvent(outputEvent, completedGame)
  end
end

RegisterNetEvent('theheka:startSimonGame')
AddEventHandler('theheka:startSimonGame', function(targetLevel, difficulty, output)
  outputEvent = output
  startGame(targetLevel, difficulty)
end)

-- Difficulties:
-- Insane - 0.25
-- Hard - 0.5   DEFAULT
-- Normal 1
-- Easy 2
