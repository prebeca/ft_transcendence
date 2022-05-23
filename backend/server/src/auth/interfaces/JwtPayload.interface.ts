export interface JwtPayload {
	id: number
	username: string
	iat: number
	exp: number
	isTwoFactorEnable?: boolean
	isTwoFaAuthenticated?: boolean
}
