import { createParser, createSearch, createList } from './index';

async function main() {
    try {
        const token = '8ebf915587af48d001d33127ae55dcb3';
        const parser = await createParser(token);

        const searchResults = await parser.search('Наруто', 5, true, null, false, true);

        if (searchResults.length > 0) {
            const firstResult = searchResults[0];

            if (firstResult.shikimori_id) {
                const info = await parser.getInfo(firstResult.shikimori_id, 'shikimori');

                if (info.translations.length > 0 && info.series_count > 0) {
                    await parser.getLink(
                        firstResult.shikimori_id,
                        'shikimori',
                        1,
                        info.translations[0].id,
                    );
                }
            }
        }

        const search = await createSearch(token);
        await search
            .title('Атака титанов')
            .limit(3)
            .anime_kind('tv')
            .execute_async();

        const list = await createList(token);
        await list
            .limit(5)
            .sort('year')
            .order('desc')
            .anime_genres(['Экшен'])
            .execute_async();
    } catch (error) {
        console.log(error)
    }
}

if (require.main === module) {
    main();
}
