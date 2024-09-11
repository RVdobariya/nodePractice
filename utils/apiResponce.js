class ApiResponce {
    constructor(
        status_code, data, message
    ) { this.status_code = status_code, this.data = data, this.message = message, this.success = status_code < 400 }
}

export { ApiResponce }