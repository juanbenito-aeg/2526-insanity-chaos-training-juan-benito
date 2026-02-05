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

    fastForward();
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
      appData.currentWarrior.gold >=
      Math.ceil(appData.currentWarrior.weapon.cost / 10);

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
  const trainingCost = Math.ceil(appData.currentWarrior.weapon.cost / 10);
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
      durabilityToTake = Math.floor(weapon.durability * (0.1 * qualityToAdd));
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
  } else {
    weapon.durability += Math.floor(Math.random() * 2) === 0 ? 1 : 0;
  }

  console.log(`Durability: ${weapon.durability}`);
}

function fastForward() {
  const currentHourAsNumber = +appData.currentDateAndTime.hour.split(":")[0];

  let newHour = currentHourAsNumber + 2;

  if (newHour >= 24) {
    newHour = newHour - 24;

    let newDay = appData.currentDateAndTime.day + 1;

    if (newDay > 30) {
      newDay = 1;

      const currentMonthIndex = appData.epicMonths.indexOf(
        appData.currentDateAndTime.month,
      );

      const newMonth =
        currentMonthIndex === appData.epicMonths.length - 1
          ? appData.epicMonths[0]
          : appData.epicMonths[currentMonthIndex + 1];

      appData.currentDateAndTime.month = newMonth;
    }

    appData.currentDateAndTime.day = newDay;
  }

  if (newHour < 10) {
    newHourAsString = "0" + newHour;
  } else {
    newHourAsString = "" + newHour;
  }

  newHourAsString += ":00";

  appData.currentDateAndTime.hour = newHourAsString;
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
