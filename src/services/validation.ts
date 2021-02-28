import { User } from "src/etities/User"
import { UsernameAndPassInput } from "src/resolvers/UsernameAndPassInput"

export const validateRegister = (options: UsernameAndPassInput, userbyEmail: User | null, userbyUsername: User | null): any => {
    if(userbyUsername){
        return [{
            field:"username",
            message: "Username already is taken"
        }]
    }

    if(userbyEmail){
        return [{
            field:"email",
            message: "Email already is taken"
        }]
    }

    if(options.username.length <=2 ){
        return [{
            field: "username",
            message: "Username is too short > 2 s"
        }]
    }

    if(!options.email.includes("@")){
        return [{
            field: "email",
            message: "Email is not correct"
        }]
    }

    if(options.password.length <=5 ){
        return [{
            field: "password",
            message: "Psw is too short > 6 s" 
        }]
    }
}