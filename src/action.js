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

export const laPause = t => new Promise(resolve => setTimeout(resolve, t))

export const lePulse = (t, amount, callback) => new Promise(resolve => {
    let counter = 0;
    const interval = setInterval(() => {
        if (counter <= amount) {
            counter++
            callback()
        } else {
            clearInterval(interval)
            resolve()
        }
    }, t)
})

export const unique = (value, index, self) => self.indexOf(value) === index

export const saveToLocalStorage = (key, value) => {localStorage.setItem(key, JSON.stringify(value))}
