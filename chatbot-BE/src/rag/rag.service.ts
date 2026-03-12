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
            console.log('url of web',url)
            // chunk the content
            const chunks = this.chunkService.chunkText(content);
            console.log('chunks of website',chunks);
            // create embeddings for each chunk
            for (const chunk of chunks) {
                const embeddings = await this.embeddingService.createEmbedding(chunk);
                console.log('embeddings:-',embeddings);
                console.log('ebedding length',embeddings.length)

                const { data, error } = await supabase
                    .from('documents')
                    .insert([
                        {
                            url: url,
                            chunk_text: chunk,
                            embedding: embeddings
                        }
                    ]);

                if (error) {
                    console.error("Supabase insert error:", error);
                } else {
                    console.log("Inserted row:", data);
                }
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