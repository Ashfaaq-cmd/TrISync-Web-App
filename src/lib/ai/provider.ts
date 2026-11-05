export type JsonRequest = {
    system: string
    prompt: string
    jsonSchema: object
    deadline: number
}

export type JsonResult = { text: string; model: string }
// Any AI service just has to provide this
export interface AiProvider {
    generateJson(request: JsonRequest): Promise<JsonResult>
}
//Thrown when service is unavailable or the request times out
export class AiUnavailableError extends Error {
    constructor(){
        super("AI service is unavailable, please try again later")
        this.name = "AiUnavailableError"
    }
}