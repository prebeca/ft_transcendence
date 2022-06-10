import { Response } from 'express';

export default interface cookiePayload {
	userid: number,
	response: Response,
	created: boolean,
	istwofa: boolean
}
