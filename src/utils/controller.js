class Controller {
    constructor(method, path, serviceMethod, middlewares) {
        this.method = method;
        this.path = path;
        this.serviceMethod = serviceMethod;
        this.middlewares = middlewares;
    }

    static init(controller, service, requests) {
        requests.forEach((request) => {
            let { method, path, serviceMethod, middlewares } = request;
            controller[method](path, ...(middlewares || []), async (req, res) => {
                const response = await service[serviceMethod](req);
                res.status(response.getStatus()).json(response);
            });
        });
    }
}

module.exports = { Controller };