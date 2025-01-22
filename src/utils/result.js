class Result {
    #status;

    constructor(status = 200, message = "", data = {}) {
        this.#status = status;
        this.message = message;
        this.data = data;
    }

    getStatus() {
        return this.#status;
    }
}

module.exports = { Result };