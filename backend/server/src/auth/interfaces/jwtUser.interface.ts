import { User } from "../../users/entities/user.entity";

export default interface jwtUser {
	jwt: {
		access_token: string
	},
	user: User,
	created: boolean
}
