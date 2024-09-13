// 异步函数1：模拟从服务器获取数据
function fetchDataFromServer() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('Data from server');
        }, 2000);
    });
}

// 异步函数2：模拟从数据库获取数据
function fetchDataFromDatabase() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject('Data from database');
        }, 1500);
    });
}

// 异步函数3：模拟从外部 API 获取数据
function fetchDataFromAPI() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('Data from API');
        }, 1000);
    });
}

/**
 * Promise.myAll
 */
Promise.prototype.myAll = function (requestArr) {
    if (!Array.isArray(requestArr)) {
        return new TypeError('参数必须是数组')
    }
    return new Promise((resolve, reject) => {
        let resArr = [];//响应数组
        fulfilledNum = 0;//已经完成（状态变为fulfilled）的promise数量

        for (let i = 0; i < requestArr.length; i++) {
            //判断请求数组中的元素是否为promise对象，如果不是直接抛出错误
            if (!requestArr[i] instanceof Promise) {
                return new TypeError('数组中存在不是promise对象的内容')
            }
            requestArr[i].then((res) => {
                resArr.push(res);
                fulfilledNum++;
                if (fulfilledNum === requestArr.length) resolve(resArr);//当所有的Promise都变为fulfilled，则执行resolve
            }).catch((err) => {
                reject(err);//遇到错误，则执行reject
            })
        }
    })
}

const promises = () => [fetchDataFromServer(), fetchDataFromDatabase(), fetchDataFromAPI()];

//用Promise原生all来对比
Promise.all(promises).then((data) => {
    console.log('all fulfilled:');
    console.log(data);
}).catch((error) => {
    console.log('all error:');
    console.error(error);
});

//调用手写的all
Promise.prototype.myAll(promises)
    .then((data) => {
        console.log('myall fulfilled:');
        console.log(data);
    })
    .catch((error) => {
        console.log('myall error:');
        console.error(error);
    });