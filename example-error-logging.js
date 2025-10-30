/**
 * Пример использования новой функциональности сохранения оригинальных ошибок
 * 
 * Теперь все пользовательские ошибки сохраняют оригинальную причину
 * в свойстве .cause, что позволяет отслеживать полную цепочку ошибок
 */

const { ServiceError, NoResults } = require('./dist/lib/errors');

console.log('=== Пример использования сохранения оригинальных ошибок ===\n');

// Пример 1: Имитация сетевой ошибки
console.log('Пример 1: Сетевая ошибка с полным контекстом');
console.log('-------------------------------------------');
try {
    // Симулируем ошибку типа той, что может прийти от axios
    const axiosError = new Error('getaddrinfo ENOTFOUND kodikapi.com');
    axiosError.code = 'ENOTFOUND';
    axiosError.config = { url: 'https://kodikapi.com/search' };
    
    // Библиотека оборачивает эту ошибку в ServiceError
    throw new ServiceError(
        'Произошла ошибка при запросе к kodik api. Ожидался код "200", получен: "нет ответа"',
        { cause: axiosError }
    );
} catch (error) {
    console.log('Сообщение для пользователя:', error.message);
    console.log('Имя ошибки:', error.name);
    console.log('\nОригинальная ошибка (для логирования):');
    console.log('  Тип:', error.cause?.constructor?.name);
    console.log('  Сообщение:', error.cause?.message);
    console.log('  Код:', error.cause?.code);
    console.log('  URL:', error.cause?.config?.url);
    console.log();
}

// Пример 2: Ошибка с цепочкой
console.log('Пример 2: Полная цепочка ошибок');
console.log('--------------------------------');
try {
    // Низкоуровневая ошибка
    const networkError = new Error('ETIMEDOUT');
    networkError.syscall = 'connect';
    networkError.address = '192.168.1.1';
    networkError.port = 443;
    
    // Промежуточная ошибка
    const httpError = new ServiceError(
        'HTTP request timeout after 30 seconds',
        { cause: networkError }
    );
    
    // Высокоуровневая ошибка приложения
    throw new NoResults(
        'По запросу "Наруто" ничего не найдено',
        { cause: httpError }
    );
} catch (error) {
    console.log('Сообщение пользователю:', error.message);
    console.log('Тип верхнего уровня:', error.name);
    
    console.log('\nЦепочка ошибок:');
    let currentError = error;
    let level = 1;
    
    while (currentError) {
        console.log(`  Уровень ${level}:`);
        console.log(`    Тип: ${currentError.constructor.name}`);
        console.log(`    Сообщение: ${currentError.message}`);
        
        if (currentError.cause) {
            currentError = currentError.cause;
            level++;
        } else {
            break;
        }
    }
    console.log();
}

// Пример 3: Логирование для мониторинга
console.log('Пример 3: Структурированное логирование');
console.log('---------------------------------------');
try {
    const originalError = new Error('Connection refused');
    originalError.errno = -111;
    originalError.code = 'ECONNREFUSED';
    
    throw new ServiceError(
        'Ошибка при получении ссылки на видео',
        { cause: originalError }
    );
} catch (error) {
    // Такой формат удобен для отправки в системы логирования (Sentry, LogRocket и т.д.)
    const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'error',
        message: error.message,
        errorType: error.name,
        cause: error.cause ? {
            message: error.cause.message,
            code: error.cause.code,
            errno: error.cause.errno,
            stack: error.cause.stack?.split('\n').slice(0, 3).join('\n')
        } : null,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
    };
    
    console.log('Структурированный лог:');
    console.log(JSON.stringify(logEntry, null, 2));
    console.log();
}

console.log('=== Преимущества нового подхода ===\n');
console.log('✓ Сохранение полного контекста ошибки');
console.log('✓ Возможность отслеживать цепочку ошибок');
console.log('✓ Удобство для отладки и логирования');
console.log('✓ Совместимость с инструментами мониторинга');
console.log('✓ Не теряется информация из оригинальных ошибок (коды, статусы и т.д.)');
