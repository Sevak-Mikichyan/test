const httpStatusCodes = {
    informational: [100, 101, 102],
    success: [200, 201, 202, 203, 204, 205, 206, 207, 208, 226],
    redirection: [300, 301, 302, 303, 304, 305, 306, 307, 308],
    clientError: [400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, 451],
    serverError: [500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511]
};

class Result {
    #status;

    constructor(status = 200, message = "", data = {}) {
        this.#status = status;
        this.category = this.#getStatusCategory();
        this.message = message;
        this.data = data;
    }

    #getStatusCategory() {
        if (httpStatusCodes.informational.includes(this.#status)) {
            return "informational";
        } else if (httpStatusCodes.success.includes(this.#status)) {
            return "success";
        } else if (httpStatusCodes.redirection.includes(this.#status)) {
            return "redirection";
        } else if (httpStatusCodes.clientError.includes(this.#status)) {
            return "clientError";
        } else if (httpStatusCodes.serverError.includes(this.#status)) {
            return "serverError";
        } else
            return "unknown";
    }

    getStatus() {
        return this.#status;
    }
}

module.exports = { Result };