class apiError extends Error {
    constructor(message, statusCode , error=[] , stack=""){
        super(message)
        this.statusCode = statusCode
        this.error = error
        this.message = message
        this.data = null
        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { apiError }