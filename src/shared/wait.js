export const wait = (timeout) => new Promise(resolve => {
	setTimeout(() => resolve(), timeout)
});

export const randomValue = (delay = {min: 1000, max: 3000}) => Math.random() * (delay.max - delay.min + 1) + delay.min;

export const randomWait = (delay = {min: 1000, max: 3000}) => {
	const timeout = Math.random() * (delay.max - delay.min + 1) + delay.min;
	return wait(timeout);
}
