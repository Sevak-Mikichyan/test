const createVerificationCode = () => {
    const letters = "abcdefghijklmnopqrstuvwxyz".toUpperCase().split("");

    const random = (n) => Math.floor(Math.random() * n);

    const getRandomLetters = (count = 3) =>
        Array.from({ length: count }, () => letters[random(letters.length)]).join("");

    const getRandomNumbers = (count = 6) =>
        Array.from({ length: count }, () => random(10)).join("");

    return (
        getRandomLetters() +
        getRandomNumbers()
    );
};

module.exports = { createVerificationCode };