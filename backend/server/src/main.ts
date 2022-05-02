import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/*
** Uses NestFactory class that exposes a few static methodsfor creating application instances
** .create() -> returns an application object
**
** This piece of code simpy starts an HTTP listener (it is waiting for HTTP Request)
*/
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
