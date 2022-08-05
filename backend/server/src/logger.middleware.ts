import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {

	private logger: Logger = new Logger("Middleware");

	use(req: Request, res: Response, next: NextFunction): void {
		this.logger.log('Request... baseUrl = ' + req.url + ', hostname = ' + req.hostname);
		next();
	}
}
