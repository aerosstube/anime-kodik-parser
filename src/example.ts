import { createParser, createSearch, createList, KodikParser } from './index';

async function main() {
    try {
        console.log('Получение токена...');
        const token = await KodikParser.getToken();
        console.log('Токен получен:', token);

        console.log('\n--- Создание парсера ---');
        const parser = await createParser(token);

        console.log('\n--- Поиск аниме ---');
        const searchResults = await parser.search('Наруто', 5, true, null, false, true);
        console.log('Найдено результатов:', searchResults.length);
        
        if (searchResults.length > 0) {
            const firstResult = searchResults[0];
            console.log('Первый результат:', firstResult.title);
            console.log('Тип:', firstResult.type);
            console.log('Год:', firstResult.year);
            
            if (firstResult.shikimori_id) {
                console.log('\n--- Получение информации ---');
                const info = await parser.getInfo(firstResult.shikimori_id, 'shikimori');
                console.log('Количество серий:', info.series_count);
                console.log('Переводы:', info.translations.length);
                
                if (info.translations.length > 0) {
                    console.log('Первый перевод:', info.translations[0].title);
                    
                    if (info.series_count > 0) {
                        console.log('\n--- Получение ссылки ---');
                        const [link, quality] = await parser.getLink(
                            firstResult.shikimori_id, 
                            'shikimori', 
                            1, 
                            info.translations[0].id
                        );
                        console.log('Ссылка на первую серию:', link);
                        console.log('Максимальное качество:', quality);
                    }
                }
            }
        }

        console.log('\n--- Использование API поиска ---');
        const search = await createSearch(token);
        const apiResults = await search
            .title('Атака титанов')
            .limit(3)
            .anime_kind('tv')
            .execute_async();
        
        console.log('API поиск - найдено:', apiResults.total);

        console.log('\n--- Использование API списка ---');
        const list = await createList(token);
        const listResults = await list
            .limit(5)
            .sort('year')
            .order('desc')
            .anime_genres(['Экшен'])
            .execute_async();
        
        console.log('API список - найдено:', listResults.total);

    } catch (error) {
        console.error('Ошибка:', error);
    }
}

if (require.main === module) {
    main();
} 