import axios from 'axios';
import * as cheerio from 'cheerio';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ScraperService {
    async scrapWebsite(url:string){
        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            let content = $('article').text();
            if(!content){
                content = $('main').text();
            }
            if(!content){
                content = $('body').text();
            }
            const cleandText = content.replace(/\s+/g, ' ').trim();
            return cleandText;
        }catch (error){
            console.log('scrapping error',error);
            throw new Error('Failed to scrap the website');
        }
    }   
}