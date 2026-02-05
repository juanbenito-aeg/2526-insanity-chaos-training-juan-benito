const mongoose = require("mongoose");
const warriors = require("../public/warriors.json");
const weapons = require("../public/weapons.json");
const epicMonths = require("../public/epicMonths.json");
const appData = require("./globals");
require("dotenv").config();

start();

async function start() {
  const mongoDbUri = process.env.MONGODB_URI || "";
  await mongoose.connect(mongoDbUri);

  appData.warriors = warriors;
  appData.weapons = weapons;
  appData.epicMonths = epicMonths;

  assignWeapons();

  logWelcomeMessage();
}

function assignWeapons() {
  appData.warriors.forEach((warrior) => {
    warrior.weapon = null;

    let isAssignmentComplete = false;

    while (!isAssignmentComplete) {
      const isEveryWeaponDiscarded = appData.weapons.every(
        (weapon) => weapon.isDiscarded,
      );

      if (isEveryWeaponDiscarded) {
        isAssignmentComplete = true;
      } else {
        const randomWeapon =
          appData.weapons[Math.floor(Math.random() * appData.weapons.length)];

        if (warrior.strength >= randomWeapon.minStrength) {
          warrior.weapon = appData.weapons.splice(
            appData.weapons.indexOf(randomWeapon),
            1,
          )[0];

          isAssignmentComplete = true;
        } else {
          randomWeapon.isDiscarded = true;
        }
      }
    }

    appData.weapons.forEach((weapon) => {
      delete weapon.isDiscarded;
    });
  });
}

function logWelcomeMessage() {
  console.log("WELCOME TO THE TRAINING GROUNDS!");
  console.log("--------------------------------");
  console.log();

  appData.warriors.forEach((warrior) => {
    let textToLog = warrior.name;

    if (warrior.weapon) {
      textToLog += ` has selected the weapon "${warrior.weapon.name}"`;
    } else {
      textToLog += " has no valid weapons to wield!";
    }

    console.log(textToLog);
  });
}
