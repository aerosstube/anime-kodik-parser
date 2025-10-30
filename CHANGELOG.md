# Changelog

## [Unreleased]

### Changed
- **BREAKING**: Все ошибки теперь сохраняют оригинальные ошибки через свойство `cause`
  - При обработке ошибок теперь можно получить доступ к полной информации об исходной ошибке
  - Доступны stack traces, дополнительные свойства и вложенные цепочки ошибок
  - Пример использования:
    ```javascript
    try {
        await parser.search('аниме');
    } catch (error) {
        console.error('Ошибка:', error.message);
        
        // Доступ к оригинальной ошибке
        if (error.cause) {
            console.error('Оригинальная ошибка:', error.cause);
            console.error('Stack trace:', error.cause.stack);
            
            // Для axios ошибок
            if (error.cause.response) {
                console.error('Статус:', error.cause.response.status);
                console.error('Данные:', error.cause.response.data);
            }
        }
    }
    ```

### Fixed
- Исправлена потеря информации при повторном выбросе ошибок
- Теперь ошибки выводятся в оригинальном виде с сохранением всех свойств

## [1.0.0] - Previous version
- Начальный релиз TypeScript версии библиотеки
