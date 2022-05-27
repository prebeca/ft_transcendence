export interface JwtPayload {
	id: number
	email: string
	iat?: number
	exp?: number
	isTwoFactorEnable?: boolean
	isTwoFaAuthenticated?: boolean
}
