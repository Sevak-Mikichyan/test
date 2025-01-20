class Validator {
    constructor({ username, email, password }) {
        this.invalidData = {};
        this.username = username;
        this.email = email;
        this.password = password;
        this.validate();
    }

    static validateField(text, regExp, fieldName, invalidData) {
        if (text !== undefined) {
            if (text === "") {
                invalidData[fieldName] = `${fieldName} is required`;
            } else if (!regExp.test(text)) {
                invalidData[fieldName] = `${fieldName} is not valid`;
            }
        }
    }

    validate() {
        Validator.validateField(this.username, /^[a-z0-9@#$%^&*()_+!~\-={}[\]:;"'<>,.?/]{4,}$/, "username", this.invalidData);
        Validator.validateField(this.email, /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "email", this.invalidData);
        Validator.validateField(this.password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!()_+~\-=`{}[\]:;"'<>,.?/])[A-Za-z\d@#$%^&*!()_+~\-=`{}[\]:;"'<>,.?/]{8,}$/, "password", this.invalidData);
    }

    isValid() {
        return Object.values(this.invalidData).every(value => value === "");
    }
}

module.exports = { Validator };