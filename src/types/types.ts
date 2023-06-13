export type Form = {
	firstName: string;
	lastName: string;
	birthdayDate: Date;
	sex: string;
	city: string;
	doctorType: string;
	doctor: string;
	email: string;
	phone: string
};

export type City = {
	id: string;
	name: string;
};

export type Doctor = {
	id: string;
	name: string;
	surname: string;
	specialityId: string;
	isPediatrician: boolean;
	cityId: string;
};

export type DoctorType = {
	id: string;
	name: string;
	params?: Record<string, string | number>;
};

export type Filter = {
	city: String;
	age: number;
	type: String;
	sex: String;
};