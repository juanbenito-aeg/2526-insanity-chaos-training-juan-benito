const appData = require("../globals");
const { rollDice } = require("../utils");
const cron = require("node-cron");

function executeRound() {
  console.log(
    `\n=== ROUND ${appData.round} - ${appData.currentDateAndTime.month} ${appData.currentDateAndTime.day}, ${appData.currentDateAndTime.hour} hours ===`,
  );

  const canCurrentWarriorTrain = getCanCurrentWarriorTrain();

  if (canCurrentWarriorTrain) {
    logWarriorAndWeaponAttributes();
    takeTrainingCostFromWarrior();

    console.log("After training:");
    updateWeaponQualityAndDurability();
    console.log(`Gold remaining: ${appData.currentWarrior.gold}`);
  } else {
    appData.currentWarrior.state = "finished";

    const areWarriorsFinishedTraining = appData.warriors.every(
      (warrior) => warrior.state === "finished",
    );

    if (areWarriorsFinishedTraining) {
      console.log("\nAll warriors have finished training. Stopping all crons");

      stopCronTasks();
    }
  }

  appData.round++;
  setNextWarrior();
  // TODO: Fast forward
}

function getCanCurrentWarriorTrain() {
  let canCurrentWarriorTrain = false;

  if (!appData.currentWarrior.weapon) {
    console.log(
      `${appData.currentWarrior.name} has no weapon assigned and cannot train.`,
    );
  } else if (appData.currentWarrior.weapon.durability <= 0) {
    console.log(
      `${appData.currentWarrior.name}'s weapon is broken and cannot train.`,
    );
  } else {
    const hasEnoughGold =
      appData.currentWarrior.gold >= appData.currentWarrior.weapon.cost / 10;

    if (!hasEnoughGold) {
      console.log(
        `${appData.currentWarrior.name} cannot train because they have no gold left.`,
      );
    } else {
      canCurrentWarriorTrain = true;
    }
  }

  return canCurrentWarriorTrain;
}

function logWarriorAndWeaponAttributes() {
  console.log(`Warrior: ${appData.currentWarrior.name}`);
  console.log(`Strength: ${appData.currentWarrior.strength}`);
  console.log(`Gold: ${appData.currentWarrior.gold}`);

  console.log(`Weapon: ${appData.currentWarrior.weapon.name}`);
  console.log(`Type: ${appData.currentWarrior.weapon.type}`);
  console.log(`Quality: ${appData.currentWarrior.weapon.quality}`);
  console.log(`Durability: ${appData.currentWarrior.weapon.durability}`);
}

function takeTrainingCostFromWarrior() {
  const trainingCost = appData.currentWarrior.weapon.cost / 10;
  appData.currentWarrior.gold -= trainingCost;
  console.log(`Cost of training this round: ${trainingCost}\n`);
}

function updateWeaponQualityAndDurability() {
  const weapon = appData.currentWarrior.weapon;

  const currentQuality = weapon.quality;
  const qualityToAdd = rollDice(5) - 2;
  weapon.quality += qualityToAdd;
  console.log(`Quality: ${currentQuality} -> ${weapon.quality}`);

  if (qualityToAdd < 3) {
    let durabilityToTake;

    if (qualityToAdd < 0) {
      durabilityToTake = Math.floor(weapon.durability * 0.2);
    } else {
      durabilityToTake = Math.floor(weapon.durability * 0.1) * qualityToAdd;
    }

    if (durabilityToTake < 1) {
      durabilityToTake = 1;
    }

    if (weapon.quality < 0) {
      durabilityToTake += weapon.quality * -1;
    }

    weapon.durability -= durabilityToTake;

    if (weapon.durability < 0) {
      weapon.durability = 0;
    }
  } else if (qualityToAdd === 3) {
    weapon.durability += Math.floor(Math.random() * 2) === 0 ? 1 : 0;
  }

  console.log(`Durability: ${weapon.durability}`);
}

function stopCronTasks() {
  const tasks = cron.getTasks();

  tasks.forEach((task) => {
    task.stop();
  });
}

function setNextWarrior() {
  const currentWarriorIndex = appData.warriors.indexOf(appData.currentWarrior);

  if (currentWarriorIndex === appData.warriors.length - 1) {
    appData.currentWarrior = appData.warriors[0];
  } else {
    appData.currentWarrior = appData.warriors[currentWarriorIndex + 1];
  }
}

module.exports = executeRound;
