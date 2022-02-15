export const MINIMUM_DELAY_PER_MESSAGE = 15 * 1000;
export const MAXIMUM_DELAY_PER_MESSAGE = 20 * 1000;

export const wait = (timeout) => new Promise(resolve => {
	setTimeout(() => resolve(), timeout)
});

export const randomValue = (delay = {min: 1000, max: 3000}) => Math.random() * (delay.max - delay.min) + delay.min;

export const randomWait = (delay = {min: 1000, max: 3000}) => {
	const timeout = Math.random() * (delay.max - delay.min) + delay.min;

	return wait(timeout);
}
