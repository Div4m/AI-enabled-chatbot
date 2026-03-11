import {Controller,Body, Post} from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController{
    constructor(private readonly ragService:RagService){}

    @Post('ingest-website')
    async ingestWebsite(@Body('url') url:string){
        return this.ragService.ingestWebsite(url);
    }
}