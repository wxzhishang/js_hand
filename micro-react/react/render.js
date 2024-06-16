/**
 * 创建一个DOM元素。
 * 根据fiber对象的type属性决定是创建一个文本节点还是一个元素节点。
 * @param {Object} fiber - React元素的fiber对象，包含type、props等信息。
 * @returns {Node} - 创建的DOM节点。
 */
const createDom = (fiber) => {
    const dom =
        fiber.type === "TEXT_ELEMENT"
            ? document.createTextNode("")
            : document.createElement(fiber.type);
    // 设置除children以外的props属性到DOM节点上
    Object.keys(fiber.props)
        .filter((key) => key !== "children")
        .forEach((name) => (dom[name] = fiber.props[name]));
    // 设置默认样式属性
    // 设置默认样式属性
    const defaultStyle = fiber.props.style || {};
    Object.keys(defaultStyle).forEach((name) => (dom.style[name] = defaultStyle[name]));
    return dom;
};

/**
 * 判断一个键是否是事件属性。
 * 事件属性的键通常以"on"开头。
 * @param {string} key - 要检查的属性键。
 * @returns {boolean} - 如果键是事件属性，则返回true；否则返回false。
 */
const isEvent = (key) => key.startsWith("on");

/**
 * 判断一个键是否是样式属性。
 * 样式属性的键固定为"style"。
 * @param {string} key - 要检查的属性键。
 * @returns {boolean} - 如果键是样式属性，则返回true；否则返回false。
 */
const isStyle = (key) => key === "style";

/**
 * 判断一个键是否是普通属性。
 * 普通属性不是事件属性也不是样式属性，并且不包括children。
 * @param {string} key - 要检查的属性键。
 * @returns {boolean} - 如果键是普通属性，则返回true；否则返回false。
 */
const isProperty = (key) =>
    key !== "children" && !isEvent(key) && !isStyle(key);

/**
 * 判断一个属性是否在新的props中不存在或者被修改。
 * 使用这个函数来找出需要更新的属性。
 * @param {Object} prev - 前一组属性。
 * @param {Object} next - 新一组属性。
 * @returns {function} - 一个返回比较结果的函数。
 */
const isNew = (prev, next) => (key) => prev[key] !== next[key];

/**
 * 判断一个属性是否在新的props中不存在。
 * 使用这个函数来找出需要删除的属性。
 * @param {Object} next - 新一组属性。
 * @returns {function} - 一个返回比较结果的函数。
 */
const isGone = (next) => (key) => !(key in next);

/**
 * 更新一个DOM元素的属性。
 * 根据前后props的差异，更新DOM元素的属性、事件监听器和样式。
 * @param {Node} dom - 要更新的DOM元素。
 * @param {Object} prevProps - 前一组属性。
 * @param {Object} nextProps - 新一组属性。
 */
const updateDom = (dom, prevProps, nextProps) => {
    const prevStyle = prevProps.style || {};
    const nextStyle = nextProps.style || {};
    // 删除已经不存在的props
    // 删除已经不存在的 props
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(nextProps))
        .forEach((name) => (dom[name] = ""));
    // 添加新的或者改变的props
    // 添加新的或者改变的 props
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach((name) => (dom[name] = nextProps[name]));
    // 删除没有的或者改变的事件监听器
    // 删除没有的或者改变的 events
    Object.keys(prevProps)
        .filter(isEvent)
        .filter(isGone(nextProps) || isNew(prevProps, nextProps))
        .forEach((name) => {
            const eventType = name.toLowerCase().substring(2);
            dom.removeEventListener(eventType, prevProps[name]);
        });
    // 添加新的事件监听器
    // 添加新的 events
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach((name) => {
            const eventType = name.toLowerCase().substring(2);
            dom.addEventListener(eventType, nextProps[name]);
        });
    // 删除已经不存在的样式
    // 删除已经不存在的 style
    Object.keys(prevStyle)
        .filter(isGone(nextStyle))
        .forEach((name) => (dom.style[name] = ""));
    // 添加新的样式
    // 添加新的 style
    Object.keys(nextStyle).forEach((name) => (dom.style[name] = nextStyle[name]));
};

/**
 * 执行根节点的提交操作。
 * 这个函数处理当前工作周期中的DOM更新，包括插入、删除和更新操作。
 */
const commitRoot = () => {
    deletions.forEach(commitWork);
    commitWork(wipRoot.child);
    currentRoot = wipRoot; // 上一个 fiber
    wipRoot = null;
};

/**
 * 对一个fiber节点执行提交操作。
 * 根据fiber节点的效果标记（effectFlag）来执行相应的DOM操作：插入、删除或更新。
 * @param {Object} fiber - 要提交的fiber节点。
 */
const commitWork = (fiber) => {
    if (!fiber) return;
    let domParentFiber = fiber.parent;
    while (!domParentFiber.dom) {
        domParentFiber = domParentFiber.parent;
    }
    const domParent = domParentFiber.dom;
    if (fiber.effectFlag === "PLACEMENT" && fiber.dom !== null) {
        domParent.appendChild(fiber.dom);
    } else if (fiber.effectFlag === "DElETION") {
        commitDeletion(fiber, domParent);
    } else if (fiber.effectFlag === "UPDATE" && fiber.dom !== null) {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    }
    if (fiber.child) commitWork(fiber.child);
    if (fiber.sibling) commitWork(fiber.sibling);
};

/**
 * 删除一个fiber节点及其对应的DOM元素。
 * 如果fiber节点有子节点，则递归删除子节点。
 * @param {Object} fiber - 要删除的fiber节点。
 * @param {Node} domParent - 父DOM节点。
 */
const commitDeletion = (fiber, domParent) => {
    if (fiber.dom) {
        domParent.removeChild(fiber.dom);
    } else {
        commitDeletion(fiber.child, domParent);
    }
};

/**
 * 初始化渲染过程。
 * 设置初始的工作单元（work-in-progress root，wipRoot）和空的删除列表。
 * @param {ReactElement} element - 要渲染的React元素。
 * @param {Node} container - 要将渲染结果插入的DOM容器。
 */
const render = (element, container) => {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        sibling: null,
        child: null,
        parent: null,
        alternate: currentRoot, // 上一次fiber
    };
    deletions = [];
    nextUnitOfWork = wipRoot;
};

// 工作循环变量
/**
 * 设定下一个要执行的工作单元对象。这个变量用于在React的虚拟DOM算法中，
 * 指向下一个需要进行渲染或更新的 Fiber 对象。
 */
let nextUnitOfWork = null;

/**
 * 当前正在处理的根 Fiber 对象。在React的渲染过程中，
 * 这个变量用于跟踪当前正在构建或更新的最顶层组件。
 */
let wipRoot = null;

/**
 * 保存当前渲染或更新完成的根 Fiber 对象。这个变量用于区分
 * 正在进行的工作和已经完成的工作，以便在渲染完成后能够正确地展示UI。
 */
let currentRoot = null;

/**
 * 用于存储在当前渲染周期中需要被删除的 Fiber 对象列表。
 * 这个列表在React的垃圾回收机制中起到关键作用，帮助识别并清理不再需要的组件。
 */
let deletions = null;

/**
 * 当前正在处理的 Fiber 对象。在React的虚拟DOM算法中，
 * 这个变量用于跟踪当前正在构建或更新的组件。
 */
let wipFiber = null;

/**
 * 用于追踪当前操作的 Hook 指针。在React的 Hook 模型中，
 * 这个变量用于在组件内部管理状态和副作用。
 */
let hookIndex = null;

/**
 * 主工作循环。
 * 此循环负责执行所有待处理的工作单元，直到没有更多工作单元或应该暂停执行。
 * @param {Object} deadline - 表示当前帧剩余时间的对象。
 */
const workLoop = (deadline) => {
    // 不应该交出控制权或不应该停止
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        // 执行工作单元
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        // 检测浏览器是否还有空余时间
        shouldYield = deadline.timeRemaining() < 1;
    }
    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }
    // 没有空余时间，将工作放到浏览器下一次空闲时执行
    requestIdleCallback(workLoop);
};

// 第一次请求
requestIdleCallback(workLoop);

/**
 * 执行一个单位的工作。
 * 根据fiber节点的类型决定是更新函数组件还是主机组件。
 * @param {Object} fiber - 当前的工作单元。
 * @returns {Object|null} - 下一个要处理的fiber节点。
 */
const performUnitOfWork = (fiber) => {
    const isFunctionComponent = fiber.type instanceof Function;
    isFunctionComponent
        ? updateFunctionComponent(fiber)
        : updateHostComponent(fiber);
    // 返回下一个fiber
    if (fiber.child) {
        return fiber.child;
    }
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
};

/**
 * 更新主机组件。
 * 如果fiber节点没有对应的DOM节点，则创建一个新的DOM节点；
 * 然后调用reconcileChildren来处理子节点。
 * @param {Object} fiber - 要更新的主机组件的fiber节点。
 */
const updateHostComponent = (fiber) => {
    // 创建 DOM 元素
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }
    // 新建newFiber
    reconcileChildren(fiber, fiber.props.children);
};

/**
 * 更新函数组件。
 * 设置wipFiber和hookIndex，然后调用reconcileChildren来处理子节点。
 * @param {Object} fiber - 要更新的函数组件的fiber节点。
 */
const updateFunctionComponent = (fiber) => {
    wipFiber = fiber;
    hookIndex = 0;
    wipFiber.hooks = [];
    const children = [fiber.type(fiber.props)];
    reconcileChildren(fiber, children);
};

/**
 * 使用Hooks的状态更新函数组件。
 * @param {any} init - 初始化状态的值。
 * @returns {[any, function]} - 当前状态和更新状态的函数。
 */
export const useState = (init) => {
    const oldHook =
        wipFiber.alternate &&
        wipFiber.alternate.hooks &&
        wipFiber.alternate.hooks[hookIndex];
    const hook = {
        state: oldHook ? oldHook.state : init,
        queue: [],
    };
    const actions = oldHook ? oldHook.queue : [];
    actions.forEach((action) => (hook.state = action(hook.state)));
    const setState = (action) => {
        hook.queue.push(action);
        wipRoot = {
            dom: currentRoot.dom,
            props: currentRoot.props,
            alternate: currentRoot,
        };
        nextUnitOfWork = wipRoot;
        deletions = [];
    };

    wipFiber.hooks.push(hook);
    hookIndex++;
    return [hook.state, setState];
};

/**
 * 处理子节点的匹配和更新。
 * 根据当前fiber节点的子节点和前一个fiber节点的子节点的类型和属性来决定如何更新DOM。
 * @param {Object} wipFiber - 当前的工作单元。
 * @param {Array} elements - 当前fiber节点的子节点数组。
 */
const reconcileChildren = (wipFiber, elements) => {
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    let prevSibling = null;
    let newFiber = null;
    // 遍历新元素数组，与老fiber节点的孩子们进行对比和处理
    for (let i = 0; i < elements.length; i++) {
        const sameType =
            oldFiber &&
            elements[i] &&
            elements[i].type === oldFiber.type;

        // 如果类型相同，复用老fiber并更新其props，设置更新标志
        if (sameType) {
            newFiber = {
                type: oldFiber.type,
                props: elements[i].props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectFlag: "UPDATE",
            };
        }
        // 类型不同或新元素无对应老fiber，创建新DOM节点，标记为插入
        else if (!sameType && elements[i]) {
            newFiber = {
                type: elements[i].type,
                props: elements[i].props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectFlag: "PLACEMENT",
            };
        }
        // 如果老fiber类型与新元素不匹配，标记老fiber为删除
        if (!sameType && oldFiber) {
            oldFiber.effectFlag = "DELETION";
            deletions.push(oldFiber);
        }

        // 移动到老fiber的下一个sibling
        if (oldFiber) oldFiber = oldFiber.sibling;

        // 构建fiber树结构
        if (i === 0) {
            wipFiber.child = newFiber;
        } else {
            prevSibling.sibling = newFiber;
        }
        prevSibling = newFiber;
    }
};

export default render;