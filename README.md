# Anime Parser TypeScript

TypeScript версия парсера аниме для сервиса Kodik с полной типизацией.

## Установка

### Из npm
```bash
npm install @aerosstube/anime-parser-kodik-ts
```

### Для разработки
```bash
git clone https://github.com/aerosstube/anime-parser-kodik-ts.git
cd anime-parser-kodik-ts
npm install
```

## Сборка

```bash
npm run build
```

## Запуск

### Пример использования
```bash
npm run example
```

## Использование

### Основные классы

```typescript
import { createParser, createSearch, createList, KodikParser } from '@aerosstube/anime-parser-kodik-ts';

// Создание парсера
const parser = await createParser(); // Автоматически получит токен
// или
const parser = new KodikParser('your_token');

// Поиск аниме
const results = await parser.search('Наруто', 10, true, null, false, true);

// Поиск по ID
const resultsById = await parser.searchById('1735', 'shikimori');

// Получение информации
const info = await parser.getInfo('1735', 'shikimori');

// Получение ссылки на серию
const [link, quality] = await parser.getLink('1735', 'shikimori', 1, '609');
```

### API классы

```typescript
// Поиск через API
const search = await createSearch();
const results = await search
    .title('Атака титанов')
    .limit(5)
    .anime_kind('tv')
    .execute_async();

// Список через API
const list = await createList();
const listResults = await list
    .limit(10)
    .sort('year')
    .order('desc')
    .anime_genres(['Экшен'])
    .execute_async();
```

## Типы

### AnimeResult
```typescript
interface AnimeResult {
    title: string;
    title_orig: string;
    other_title: string | null;
    type: string;
    year: number;
    screenshots: string[];
    shikimori_id: string | null;
    kinopoisk_id: string | null;
    imdb_id: string | null;
    worldart_link: string | null;
    additional_data: Record<string, unknown>;
    material_data: Record<string, unknown> | null;
    link: string;
}
```

### Translation
```typescript
interface Translation {
    id: string;
    title: string;
    type: string;
    is_voice: boolean;
}
```

### AnimeInfo
```typescript
interface AnimeInfo {
    translations: Translation[];
    series_count: number;
}
```

### SearchResponse
```typescript
interface SearchResponse {
    total: number;
    time: string;
    results: AnimeResult[];
}
```

## Ошибки

Все ошибки наследуются от общего базового класса `KodikError`:

- `TokenError` — проблемы с токеном
- `ServiceError` — ошибки сервиса
- `PostArgumentsError` — неверные аргументы
- `NoResults` — нет результатов
- `UnexpectedBehavior` — неожиданное поведение
- `QualityNotFound` — качество не найдено
- `AgeRestricted` — возрастные ограничения
- `TooManyRequests` — слишком много запросов
- `ContentBlocked` — контент заблокирован
- `ServiceIsOverloaded` — сервис перегружен
- `DecryptionFailure` — ошибка расшифровки

## Константы (Enums)

### Типы аниме
```typescript
import { AnimeKind } from '@aerosstube/anime-parser-kodik-ts';

AnimeKind.TV    // 'tv'
AnimeKind.MOVIE // 'movie'
AnimeKind.OVA   // 'ova'
AnimeKind.ONA   // 'ona'
// ...
```

### Жанры
```typescript
import { AnimeGenres } from '@aerosstube/anime-parser-kodik-ts';

AnimeGenres.ACTION  // 'Экшен'
AnimeGenres.COMEDY  // 'Комедия'
AnimeGenres.DRAMA   // 'Драма'
// ...
```

### Сортировка
```typescript
import { SortList, OrderList } from '@aerosstube/anime-parser-kodik-ts';

SortList.YEAR       // 'year'
SortList.CREATED_AT // 'created_at'
OrderList.ASC       // 'asc'
OrderList.DESC      // 'desc'
```

## Структура проекта

```
anime-kodik-parser/
├── src/
│   ├── lib/
│   │   ├── errors.ts          # Классы ошибок
│   │   ├── internal_tools.ts  # HTTP-обёртки
│   │   ├── parser_kodik.ts    # Основной парсер
│   │   └── api_kodik.ts       # API классы и enums
│   ├── types/
│   │   └── index.ts           # Интерфейсы и типы
│   ├── index.ts               # Главный экспорт
│   └── example.ts             # Пример использования
├── dist/                      # Скомпилированные файлы
├── package.json
├── tsconfig.json
└── README.md
```

## Требования

- Node.js >= 14
- TypeScript >= 5.0
- Зависимости: axios, cheerio, base-64

## Лицензия

MIT
