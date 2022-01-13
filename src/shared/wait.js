export const wait = (timeout) => new Promise(resolve => {
	setTimeout(() => resolve(), timeout)
});

export const randomWait = (delay = {min: 1000, max: 3000}) => {
	const timeout = Math.random() * (delay.max - delay.min) + delay.min;
	return wait(timeout);
}
