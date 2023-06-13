export const citiesURL =
	'https://run.mocky.io/v3/9fcb58ca-d3dd-424b-873b-dd3c76f000f4';

export const doctorsURL =
	'https://run.mocky.io/v3/3d1c993c-cd8e-44c3-b1cb-585222859c21';

export const doctorTypesURL =
	'https://run.mocky.io/v3/e8897b19-46a0-4124-8454-0938225ee9ca';

export const getAge = (date: string) => {
	const diff = new Date().getTime() - new Date(date).getTime();
	return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
};

export const today = new Date().toISOString().split('T')[0];
