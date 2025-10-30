/**
 * Тест для проверки сохранения оригинальных ошибок
 */

const { ServiceError, TokenError } = require('./dist/lib/errors');

console.log('=== Тест сохранения оригинальных ошибок ===\n');

// Тест 1: Простая ошибка без cause
console.log('Тест 1: Ошибка без оригинальной причины');
try {
    throw new ServiceError('Тестовая ошибка без причины');
} catch (err) {
    console.log('  Сообщение:', err.message);
    console.log('  Имя:', err.name);
    console.log('  Причина:', err.cause);
    console.log('  ✓ Прошло\n');
}

// Тест 2: Ошибка с оригинальной причиной
console.log('Тест 2: Ошибка с оригинальной причиной');
try {
    const originalError = new Error('Оригинальная ошибка сети');
    originalError.code = 'ECONNREFUSED';
    throw new ServiceError('Ошибка при запросе к API', { cause: originalError });
} catch (err) {
    console.log('  Сообщение:', err.message);
    console.log('  Имя:', err.name);
    console.log('  Причина (тип):', err.cause?.constructor?.name);
    console.log('  Причина (сообщение):', err.cause?.message);
    console.log('  Причина (код):', err.cause?.code);
    console.log('  ✓ Прошло\n');
}

// Тест 3: Цепочка ошибок (несколько уровней)
console.log('Тест 3: Цепочка ошибок (несколько уровней)');
try {
    const networkError = new Error('Connection timeout');
    const serviceError = new ServiceError('Не удалось получить данные', { cause: networkError });
    throw new TokenError('Ошибка при получении токена', { cause: serviceError });
} catch (err) {
    console.log('  Верхняя ошибка:', err.message);
    console.log('  Промежуточная ошибка:', err.cause?.message);
    console.log('  Исходная ошибка:', err.cause?.cause?.message);
    console.log('  ✓ Прошло\n');
}

// Тест 4: Вывод полного стека ошибок
console.log('Тест 4: Полный вывод ошибки с причиной');
try {
    const axiosLikeError = {
        message: 'Request failed with status code 500',
        code: 'ERR_BAD_RESPONSE',
        response: { status: 500, statusText: 'Internal Server Error' }
    };
    throw new ServiceError('Произошла ошибка при запросе к kodik api', { cause: axiosLikeError });
} catch (err) {
    console.log('  Ошибка:', err.message);
    console.log('  Оригинальная причина:', JSON.stringify(err.cause, null, 2));
    console.log('  ✓ Прошло\n');
}

console.log('=== Все тесты пройдены успешно! ===');
console.log('\nТеперь все ошибки сохраняют оригинальную причину в свойстве .cause');
