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

### Интерактивный режим
```bash
npm run start
```

### Разработка (с автоперезагрузкой)
```bash
npm run dev
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
const results = await list
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
    material_data: unknown;
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

## Ошибки

Все ошибки типизированы:

- `TokenError` - Проблемы с токеном
- `ServiceError` - Ошибки сервиса
- `PostArgumentsError` - Неверные аргументы
- `NoResults` - Нет результатов
- `UnexpectedBehavior` - Неожиданное поведение
- `QualityNotFound` - Качество не найдено
- `AgeRestricted` - Возрастные ограничения
- `TooManyRequests` - Слишком много запросов
- `ContentBlocked` - Контент заблокирован
- `ServiceIsOverloaded` - Сервис перегружен
- `DecryptionFailure` - Ошибка расшифровки

## Константы

### Типы аниме
```typescript
AnimeKind.TV, AnimeKind.MOVIE, AnimeKind.OVA, etc.
```

### Жанры
```typescript
AnimeGenres.ACTION, AnimeGenres.COMEDY, AnimeGenres.DRAMA, etc.
```

### Сортировка
```typescript
SortList.YEAR, SortList.CREATED_AT, SortList.UPDATED_AT, etc.
OrderList.ASC, OrderList.DESC
```

## Отличия от JavaScript версии

1. **Полная типизация** - все функции, классы и интерфейсы типизированы
2. **Отсутствие `any`** - используются конкретные типы везде
3. **Async/await** - синхронные методы заменены на асинхронные
4. **Строгая проверка типов** - TypeScript компилятор проверяет типы
5. **Автодополнение** - IDE предоставляет полное автодополнение
6. **Документация в коде** - JSDoc комментарии для всех публичных методов

## Структура проекта

```
AnimeParsers_Node_Dir_TS/
├── src/
│   ├── lib/
│   │   ├── errors.ts          # Классы ошибок
│   │   ├── internal_tools.ts  # Внутренние инструменты
│   │   ├── parser_kodik.ts    # Основной парсер
│   │   └── api_kodik.ts       # API классы
│   ├── types/
│   │   └── index.ts           # Интерфейсы и типы
│   ├── index.ts               # Главный экспорт
│   ├── example.ts             # Пример использования
│   └── entry.ts               # Интерактивный режим
├── dist/                      # Скомпилированные файлы
├── package.json
├── tsconfig.json
└── README.md
```

## Требования

- Node.js >= 14
- TypeScript >= 4.0
- Зависимости: axios, cheerio, base-64, readline-sync

## Лицензия

MIT 