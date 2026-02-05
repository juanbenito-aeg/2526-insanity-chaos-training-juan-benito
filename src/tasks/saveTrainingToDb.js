const appData = require("../globals");
const Training = require("../models/training.model");

async function saveTrainingToDb() {
  const epicDate = `${appData.currentDateAndTime.month} ${appData.currentDateAndTime.day}, ${appData.currentDateAndTime.hour} hours`;

  const warriors = appData.warriors.map((warrior) => {
    const state =
      warrior.weapon && warrior.weapon.durability > 0 && hasEnoughGold(warrior)
        ? "training"
        : "finished";

    const warriorData = {
      name: warrior.name,
      weaponName: warrior.weapon?.name || "No weapon assigned",
      durability: warrior.weapon?.durability || -1,
      gold: warrior.gold,
      state,
    };

    return warriorData;
  });

  await Training.create({ epicDate, warriors });

  console.log(`\nTraining state saved in DB at ${epicDate}\n`);
}

function hasEnoughGold(warrior) {
  const hasEnoughGold = warrior.gold >= Math.ceil(warrior.weapon.cost / 10);
  return hasEnoughGold;
}

module.exports = saveTrainingToDb;
