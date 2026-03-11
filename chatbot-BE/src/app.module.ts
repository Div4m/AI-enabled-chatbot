import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ChatGateway } from './gateway/chat.gateway';
import { ChatService } from './service/chat.service';
import { ScraperService } from './scrapper/scrapper.service';
import { ChunkService } from './chunks/chunk.service';
import { EmbeddingService } from './embedding/embedding.service';
import { RagService } from './rag/rag.service';
import { RagController } from './rag/rag.controller';
import { VectorSearchService } from './vector/vector.service';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  })],
  controllers: [AppController,RagController],
  providers: [
    AppService, 
    ChatService, 
    ChatGateway,
    ScraperService,
    ChunkService,
    EmbeddingService,
    RagService,
    VectorSearchService
  ],
})
export class AppModule {}
  
