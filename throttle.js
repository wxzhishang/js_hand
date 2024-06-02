/**
 * 函数节流器。
 * 用于限制函数调用的频率，确保在给定的时间间隔内只调用一次。
 * @param {Function} fn 要节流的函数。
 * @param {number} wait 节流的时间间隔，以毫秒为单位。
 * @returns {Function} 返回一个新的节流函数。
 */
function throttle(fn, wait) {
    // 用于存储定时器的ID，以便于取消定时器。
    let timeoutId = null;
    // 记录上一次函数执行的时间。
    let lastExec = 0;

    // 返回一个新的函数，该函数负责节流。
    return function () {
        // 获取当前时间。
        const now = Date.now();

        // 计算距离上一次执行还有多少时间。
        const remaining = wait - (now - lastExec);

        // 如果已经过了等待时间，或者剩余时间大于等待时间（防止最后一次延迟执行），则执行原函数。
        if (remaining <= 0 || remaining > wait) {
            // 清除任何存在的定时器。
            clearTimeout(timeoutId);
            lastExec = now;
            // 执行原函数，应用当前的上下文和参数。
            fn.apply(this, arguments);
        } else if (!timeoutId) {
            // 如果定时器尚未设置，则设置一个定时器。
            timeoutId = setTimeout(function () {
                lastExec = Date.now();
                // 在延迟后执行原函数。
                fn.apply(this, arguments);
            }, wait);
        }
    };
}

//测试样例
// 初始化计数器和值
count.calls = 0;

// 定义一个简单的计数器函数
function count() {
    console.log('Count called:', count.calls);
    count.calls++;
}

// 将计数器函数节流化，设置节流时间为200毫秒
const throttledCount = throttle(count, 200);

// 测试样例1：正常调用，应打印两次
throttledCount();
setTimeout(throttledCount, 100);
setTimeout(throttledCount, 300);

// 测试样例2：在节流时间内多次调用，应打印两次，实际上因为setTimeout是异步的，所以打印次数是不确定的
let i = 0;
while (i < 5) {
    setTimeout(throttledCount, 100 * i);
    i++;
}

// 测试样例3：传递参数到节流函数
function logValue(value) {
    console.log('Value:', value);
}

const throttledLogValue = throttle(logValue, 200);
throttledLogValue(1);
setTimeout(() => throttledLogValue(2), 150);
setTimeout(() => throttledLogValue(3), 250);