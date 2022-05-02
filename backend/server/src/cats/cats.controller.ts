/*
** Req is the request object (we can access to a lot more information)
*/
import { Body, Controller, Get, Post /*,Req*/, Res, HttpStatus } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';
import { Response } from 'express';

/*
** Nest will map every Requests that has the url /cats to this Controller
*/
@Controller('cats') //it can take a host option to allow access with ({ host: 'admin.example.com' })
export class CatsController {
	constructor(private catsService: CatsService) {}
	/*
	** GET With a Request Object (from express library)
	**
	** @Get()
	** @Redirect('https://nestjs.com', 301) //redirect to another url (another controller)
	** findAll(@Req() request: Request): string {
	** 		return 'this action returns all cats';
	** }
	**
	** GET Without
	*/
	/*@Get()
	findAll(): string {
		return 'This action returns all cats';
	}*/
	/*
	** GET method with parameters (ex: GET localhost:3000/cats/1)
	**
	**	@Get(':id')
	**	findOne(@Param() params): string {
	**		console.log(params.id);
	**		return `This action returns a #${params.id} cat`;
	**	}
	**
	*/
	/*@Post()
	create(@Body() createCatDto: CreateCatDto){
	  return 'This action adds a new cat';
	}*/
	/*
	**
	**	@Post()
	**	@HttpCode(n) //change the status code from response to n
	**	@Header('Cache-Control', 'none') //change a line from the response header
	**	create(): string {
	**		return 'This action adds a new cat';
	**	}
	**
	*/
	/*
	** Other Methods:
	**
	**  @Put(':id')
	**	update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
	**		return `This action updates a #${id} cat`;
	**	}
	**
	**	@Delete(':id')
	**	remove(@Param('id') id: string) {
	**		return `This action removes a #${id} cat`;
	**	}
	*/
	@Post()
	async create(@Body() createCatDto: CreateCatDto) {
		this.catsService.create(createCatDto);
	}
  
	@Get()
	async findAll(): Promise<Cat[]> {
		return this.catsService.findAll();
	}
}
