
/*
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
*/
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	getHello(): string {
		return 'Hello World!';
	}

	getMembers() {
		return [
			{
				name: "name 1",
				location: "location 1",
			},
			{
				name: "name 2",
				location: "location 2",
			},
			{
				name: "name 3",
				location: "location 3",
			},
		];
	}
}