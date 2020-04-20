export default function todaysDate() {
	const MONTHS_OF_THE_YEAR = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const date = new Date();
  return `${date.getDate()} ${MONTHS_OF_THE_YEAR[date.getMonth()]} ${date.getFullYear()}`;
}
