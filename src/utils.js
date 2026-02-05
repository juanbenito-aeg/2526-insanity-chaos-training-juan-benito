function rollDice(faces) {
  const diceRollResult = Math.floor(Math.random() * (faces - 1 + 1) + 1);
  return diceRollResult;
}

module.exports = {
  rollDice,
};
