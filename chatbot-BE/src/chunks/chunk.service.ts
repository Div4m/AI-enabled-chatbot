import { Injectable } from '@nestjs/common';

@Injectable()
export class ChunkService {
    chunkText(text: string, chunkSize:number = 500,overlap:number=50): string[]{
        const chunks: string[] = [];
        for(let i = 0; i < text.length; i+= chunkSize){
            chunks.push(text.slice(i, i + chunkSize-overlap));
        }
        return chunks;
    }
}