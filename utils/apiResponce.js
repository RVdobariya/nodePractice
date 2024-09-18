class ApiResponce {
    constructor(
        status, data, message
    ) { this.status = status, this.message = message, this.success = status < 400, this.data = data }
}

export { ApiResponce }