# Before & After Demonstration

## Проблема: Потеря информации об ошибке

### До изменений (BEFORE) ❌

```javascript
// Код:
} catch (ex) {
    throw new ServiceError(`Ошибка: ${ex}`);
}

// Результат при ошибке:
Error: ServiceError: Ошибка: Error: getaddrinfo ENOTFOUND kodikapi.com
    at KodikParser.apiRequest (parser_kodik.ts:69)
    ...

// Проблемы:
// ❌ Потерян оригинальный stack trace
// ❌ Потеряны свойства axios ошибки (response.status, response.data)
// ❌ Нет доступа к деталям сетевой ошибки (errno, code)
// ❌ Невозможно построить цепочку ошибок
```

### После изменений (AFTER) ✅

```javascript
// Код:
} catch (ex) {
    throw new ServiceError('Ошибка при запросе', { cause: ex });
}

// Результат при ошибке:
Error: ServiceError: Ошибка при запросе
    at KodikParser.apiRequest (parser_kodik.ts:69)
    ...
    
// Доступ к оригинальной ошибке:
error.cause = {
    message: "getaddrinfo ENOTFOUND kodikapi.com",
    code: "ENOTFOUND",
    errno: -3008,
    syscall: "getaddrinfo",
    hostname: "kodikapi.com",
    stack: "Error: getaddrinfo ENOTFOUND kodikapi.com\n    at GetAddrInfoReqWrap...",
    config: { url: "https://kodikapi.com/search", ... },
    response: { status: 500, data: {...}, ... }
}

// Преимущества:
// ✅ Сохранен полный оригинальный stack trace
// ✅ Доступны все свойства axios ошибки
// ✅ Доступны детали сетевой ошибки
// ✅ Возможность построить цепочку ошибок
```

## Примеры использования

### Пример 1: Простая ошибка

#### До:
```javascript
try {
    await parser.search('аниме');
} catch (error) {
    console.log(error.message);
    // Вывод: "Произошла ошибка при запросе к kodik api. Ожидался код "200", получен: "500""
    
    // ❌ Нет способа узнать больше деталей
}
```

#### После:
```javascript
try {
    await parser.search('аниме');
} catch (error) {
    console.log(error.message);
    // Вывод: "Произошла ошибка при запросе к kodik api. Ожидался код "200", получен: "500""
    
    // ✅ Теперь можно получить детали:
    if (error.cause) {
        console.log('Оригинальная ошибка:', error.cause.message);
        console.log('Stack trace:', error.cause.stack);
        
        if (error.cause.response) {
            console.log('HTTP статус:', error.cause.response.status);
            console.log('Заголовки:', error.cause.response.headers);
            console.log('Тело ответа:', error.cause.response.data);
            console.log('URL запроса:', error.cause.config.url);
        }
    }
}
```

### Пример 2: Вложенные ошибки

#### До:
```javascript
try {
    await parser.getToken();
} catch (error) {
    console.log(error.message);
    // Вывод: "Произошла ошибка при попытке автоматического получения токена kodik. Ошибка: ServiceError: Ошибка при запросе: Error: ECONNREFUSED"
    
    // ❌ Всё слито в одну строку, stack trace потерян
}
```

#### После:
```javascript
try {
    await parser.getToken();
} catch (error) {
    console.log(error.message);
    // Вывод: "Произошла ошибка при попытке автоматического получения токена kodik"
    
    // ✅ Цепочка ошибок сохранена:
    console.log('Уровень 1:', error.message);
    console.log('Уровень 2:', error.cause.message);
    console.log('Уровень 3:', error.cause.cause.message);
    
    // Можно пройтись по всей цепочке:
    let currentError = error;
    let level = 1;
    while (currentError) {
        console.log(`Уровень ${level}:`, currentError.message);
        if (currentError.stack) {
            console.log('  Stack:', currentError.stack.split('\n')[1]);
        }
        currentError = currentError.cause;
        level++;
    }
}
```

### Пример 3: Отладка в production

#### До:
```javascript
// Логирование ошибки:
logger.error('Error occurred', { error: error.message });
// Результат: { error: "Ошибка: Error: Connection timeout" }

// ❌ Недостаточно информации для отладки
```

#### После:
```javascript
// Логирование ошибки с полным контекстом:
logger.error('Error occurred', {
    message: error.message,
    name: error.name,
    stack: error.stack,
    cause: error.cause ? {
        message: error.cause.message,
        code: error.cause.code,
        errno: error.cause.errno,
        stack: error.cause.stack,
        response: error.cause.response ? {
            status: error.cause.response.status,
            statusText: error.cause.response.statusText,
            data: error.cause.response.data
        } : undefined
    } : undefined
});

// ✅ Полная информация для отладки в production
```

## Сравнение вывода

### До (console.error):
```
ServiceError: Произошла ошибка при запросе к kodik api. Ожидался код "200", получен: "500"
    at KodikParser.apiRequest (parser_kodik.ts:69:19)
    at async KodikParser.search (parser_kodik.ts:103:20)
```

### После (console.error):
```
ServiceError: Произошла ошибка при запросе к kodik api. Ожидался код "200", получен: "500"
    at KodikParser.apiRequest (parser_kodik.ts:69:19)
    at async KodikParser.search (parser_kodik.ts:103:20)
    
[cause]: AxiosError: Request failed with status code 500
    at settle (axios/lib/core/settle.js:19:12)
    at IncomingMessage.handleStreamEnd (axios/lib/adapters/http.js:505:11)
    ... {
      code: 'ERR_BAD_RESPONSE',
      status: 500,
      response: {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {...},
        data: { error: 'Database connection failed' },
        config: {
          url: 'https://kodikapi.com/search',
          method: 'post',
          ...
        }
      }
    }
```

## Вывод

✅ **Полная информация** сохраняется и доступна для анализа  
✅ **Обратная совместимость** - существующий код продолжает работать  
✅ **Улучшенная отладка** - быстрое выявление причин ошибок  
✅ **Production-ready** - полные логи для мониторинга  
✅ **Стандартный подход** - использование ECMAScript Error.cause  
