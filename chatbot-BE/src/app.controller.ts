import { Controller, Get,Post,Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  
  @Post('chat')
  chat(@Body() body: {message:string}){
    return {
      reply : `you said : ${body.message}`
    }
  }
}
