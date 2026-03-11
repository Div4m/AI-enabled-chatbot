import * as dotenv from 'dotenv';
// load all the enviroment variables
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      process.env.LOCAL_URL,
      process.env.FRONTEND_URL
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  })
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server is running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
