const createVerificationCode = (lettersCount, numbersCount) => {
    const letters = "abcdefghijklmnopqrstuvwxyz".toUpperCase().split("");

    const random = (n) => Math.floor(Math.random() * n);

    const getRandomLetters = (count) =>
        Array.from({ length: count }, () => letters[random(letters.length)]).join("");

    const getRandomNumbers = (count) =>
        Array.from({ length: count }, () => random(10)).join("");

    return (
        getRandomLetters(lettersCount) +
        getRandomNumbers(numbersCount)
    );
};

module.exports = { createVerificationCode };