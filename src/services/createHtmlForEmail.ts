import { FRONT_URL } from "../constants"
export = {
    htmlForgotPassword: (jwt: string): string => {
        const html = `<a href=${FRONT_URL}/change-password/${jwt}>Change password</a>`
        return html
    }
}