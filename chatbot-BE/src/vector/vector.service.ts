import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase/supabse.client';

@Injectable()
export class VectorSearchService {

  async searchSimilar(embedding: number[]) {

    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_count: 5
    });

    if (error) {
      console.error('Vector search error:', error);
      throw new Error('Vector search failed');
    }

    return data;
  }

}