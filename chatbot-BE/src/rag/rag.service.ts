import { Injectable } from '@nestjs/common';
import { ScraperService } from 'src/scrapper/scrapper.service';
import { ChunkService } from 'src/chunks/chunk.service';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { supabase } from 'src/supabase/supabse.client';

@Injectable()
export class RagService {
    constructor(
        private readonly scraperService: ScraperService,
        private readonly chunkService: ChunkService,
        private readonly embeddingService: EmbeddingService
    ){}

    async ingestWebsite(url: string){
        try{
            // Scrape the website content
            const content = await this.scraperService.scrapWebsite(url);
            // chunk the content
            const chunks = this.chunkService.chunkText(content);
            
            // create embeddings for each chunk
            for(const chunk of chunks){
                const embeddings = await this.embeddingService.createEmbedding(chunk);
                await supabase
                    .from('documents')
                    .insert({
                        url: url,
                        chunk_text: chunk,
                        embedding:embeddings
                    })
            }
            return {
                message: 'data inserted successfully',
            };
        }catch(error){
        console.log('Error ingesting website:', error);
        throw new Error('Failed to ingest the website');
    }
    }
}