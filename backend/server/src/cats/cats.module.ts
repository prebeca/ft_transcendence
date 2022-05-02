import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';


/*
** If we want access to this module everywhere add @Global()
*/
@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService]
})
export class CatsModule {
    //a module class can inject providers as well (comprend pas)
    //constructor(private catsService: CatsService) {}
}
