/**
 * Test script to demonstrate error handling with preserved original error
 */

const { ServiceError, TokenError } = require('./dist/lib/errors');

console.log('=== Testing Error Handling with Original Error Preservation ===\n');

// Test 1: Error without cause
console.log('Test 1: Error without cause');
try {
    throw new ServiceError('Простая ошибка без причины');
} catch (error) {
    console.log('Error name:', error.name);
    console.log('Error message:', error.message);
    console.log('Error cause:', error.cause);
    console.log('Stack trace present:', !!error.stack);
    console.log('');
}

// Test 2: Error with cause
console.log('Test 2: Error with cause (preserving original error)');
try {
    const originalError = new Error('Оригинальная ошибка с подробностями');
    originalError.code = 'NETWORK_ERROR';
    originalError.details = { host: 'kodikapi.com', port: 443 };
    
    throw new ServiceError('Ошибка при запросе к API', { cause: originalError });
} catch (error) {
    console.log('Error name:', error.name);
    console.log('Error message:', error.message);
    console.log('Error cause:', error.cause);
    
    if (error.cause) {
        console.log('Original error message:', error.cause.message);
        console.log('Original error code:', error.cause.code);
        console.log('Original error details:', error.cause.details);
        console.log('Original error stack present:', !!error.cause.stack);
    }
    console.log('');
}

// Test 3: Nested error chain
console.log('Test 3: Nested error chain');
try {
    const rootError = new Error('Корневая причина: сеть недоступна');
    rootError.errno = -3008;
    
    const middleError = new ServiceError('Не удалось подключиться к серверу', { cause: rootError });
    
    throw new TokenError('Не удалось получить токен', { cause: middleError });
} catch (error) {
    console.log('Top-level error:', error.name, '-', error.message);
    
    if (error.cause) {
        console.log('  └─ Cause:', error.cause.name, '-', error.cause.message);
        
        if (error.cause.cause) {
            console.log('     └─ Root cause:', error.cause.cause.message);
            console.log('        └─ Error code:', error.cause.cause.errno);
        }
    }
    console.log('');
}

// Test 4: Axios-like error simulation
console.log('Test 4: Axios-like error (simulating real API error)');
try {
    const axiosError = new Error('Request failed with status code 500');
    axiosError.response = {
        status: 500,
        statusText: 'Internal Server Error',
        data: { error: 'Server overloaded' }
    };
    axiosError.config = { url: 'https://kodikapi.com/search' };
    
    throw new ServiceError('Произошла ошибка при запросе к kodik api. Ожидался код "200", получен: "500"', { cause: axiosError });
} catch (error) {
    console.log('Error message:', error.message);
    
    if (error.cause) {
        console.log('Original error message:', error.cause.message);
        console.log('Response status:', error.cause.response?.status);
        console.log('Response data:', error.cause.response?.data);
        console.log('Request URL:', error.cause.config?.url);
    }
    console.log('');
}

console.log('=== All tests completed ===');
console.log('\nВывод: Теперь ошибки сохраняются в оригинальном виде через свойство cause,');
console.log('что позволяет получить полную информацию об исходной ошибке, включая');
console.log('stack trace, дополнительные свойства и вложенные причины.');
