export function longpress(node, threshold = 750) {
    const handle_touchstart = () => {
        const timeout = setTimeout(() => {
            node.dispatchEvent(new CustomEvent('longpress'));
        }, threshold);

        const cancel = () => {
            clearTimeout(timeout);
            node.removeEventListener('touchend', cancel);
        };

        node.addEventListener('touchend', cancel);
    }

    node.addEventListener('touchstart', handle_touchstart);

    return {
        destroy() {
            node.removeEventListener('touchstart', handle_touchstart);
        }
    };
}
