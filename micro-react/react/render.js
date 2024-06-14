/**
 * 
 * @param {*} element 经过createElement包装过的虚拟DOM节点
 * @param {*} container 真实的DOM节点
 */
const render = (element, container) => {
    const dom =
        element.type === "TEXT_ELEMENT"
            ? document.createTextNode("")
            : document.createElement(element.type);
    Object.keys(element.props)
        .filter((key) => key !== "children") // 子节点无需追加
        .forEach((name) => (dom[name] = element.props[name]));
    element.props.children.forEach((child) => render(child, dom));
    container.appendChild(dom);
};

export default render;
