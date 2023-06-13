'use client';

import React, { useEffect, useRef } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import './page.css';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import {
	citiesURL,
	doctorsURL,
	doctorTypesURL,
	today,
	getAge
} from '../modules/modules';
import { Form, City, Doctor, DoctorType, Filter } from '../types/types';
import PhoneInput from 'react-phone-input-2';

export default function Home() {
	// @ts-expect-error
	const [filterData, setFilterData] = React.useState<Filter>({});
	const [citiesData, setCitiesData] = React.useState<City[]>([]);
	const [doctorsData, setDoctorsData] = React.useState<Doctor[]>([]);
	const [doctorTypesData, setDoctorTypesData] = React.useState<DoctorType[]>(
		[]
	);
	const [doctors, setDoctors] = React.useState<Doctor[]>([]);
	const [doctorTypes, setDoctorTypes] = React.useState<DoctorType[]>([]);

	const {
		register,
		handleSubmit,
		resetField,
		setValue,
		reset,
		control,
		formState: { errors }
	} = useForm<Form>();
	const onSubmit: SubmitHandler<Form> = data => {
		console.log(data);
		toast.success('Successfully form sent!');
		reset()
	};

	const handleDoctorUpdate = (
		event: React.ChangeEvent<HTMLSelectElement>
	) => {
		const option = event.target.selectedOptions[0];
		const city = option.dataset.cityId || '';
		const type = option.dataset.specialityId || '';
		setValue('city', city);
		setValue('doctorType', type);
		setFilterData({ ...filterData, city, type });
	};

	const handleAgeUpdate = (event: React.FormEvent<HTMLInputElement>) => {
		const age = getAge(event.currentTarget.value);
		setFilterData({ ...filterData, age });
	};

	const handleFieldUpdate = (event: React.FormEvent<HTMLSelectElement>) => {
		const { dataset: {field : name}, value } = event.currentTarget; //prettier-ignore
		setFilterData({ ...filterData, [name as string]: value });
	};

	const updateInputsData = () => {
		const { age, city, type, sex } = filterData;
		const types = doctorTypesData.filter(type => {
			let isValid = true;
			const p = type?.params;
			if (sex && p?.gender) {
				isValid = isValid && p?.gender === sex;
			}
			if ((age || age === 0) && (p?.maxAge || p?.minAge)) {
				const isMax = p?.maxAge ? age <= +p?.maxAge : true;
				const isMin = p?.minAge ? age >= +p?.minAge : true;
				isValid = isValid && isMax && isMin;
			}
			return isValid;
		});

		const filteredDoctors = doctorsData.filter(doctor => {
			let isValid = types.some(i => i.id === doctor.specialityId);
			if (age || age == 0) {
				const isAge =
					age <= 16 ? doctor.isPediatrician : !doctor.isPediatrician;
				isValid = isValid && isAge;
			}
			if (city) {
				isValid = isValid && doctor.cityId === city;
			}
			if (type) {
				isValid = isValid && doctor.specialityId === type;
			}
			return isValid;
		});
		setDoctors(filteredDoctors);
		setDoctorTypes(types);

		const cityIds = filteredDoctors.map(doctor => doctor.cityId);
		const filteredCities = citiesData.filter(c => cityIds.includes(c.id));
		if (filteredCities.length === 1) {
			setValue('city', filteredCities[0].id);
		}
		const filteredByDoctorTypes = types.filter(({ id }) =>
			filteredDoctors.some(({ specialityId }) => specialityId === id)
		);
		if (filteredByDoctorTypes.length === 1) {
			setValue('doctorType', filteredByDoctorTypes[0].id);
		}
	};

	useEffect(() => {
		try {
			axios.get(citiesURL).then(({ data }) => setCitiesData(data));
			axios.get(doctorsURL).then(({ data }) => setDoctorsData(data));
			axios.get(doctorTypesURL).then(({ data }) => setDoctorTypesData(data)); //prettier-ignore
		} catch (error) {
			console.log(error);
		}
	}, []);

	useEffect(() => setDoctors([...doctorsData]), [doctorsData]);

	useEffect(() => {
		if (doctors.length === 1) {
			setValue('doctor', doctors[0].id);
		} else {
			resetField('doctor');
		}
	}, [doctors, resetField, setValue]);

	useEffect(() => updateInputsData(), [filterData]);

	return (
		<div className="App">
			<Toaster position="top-right" />
			<h1>React Hook Form</h1>
			<form onSubmit={handleSubmit(onSubmit)}>
				<label>
					First name:
					<input
						{...register('firstName', {
							required: 'First name is required',
							pattern: {
								value: /^[A-Za-zА-Яа-я]+$/i,
								message: 'Enter only letters'
							},
							maxLength: {
								value: 40,
								message: 'Too long name'
							}
						})}
					/>
				</label>
				{errors?.firstName && (
					<div className="error-wrapper">
						<p>{errors?.firstName?.message || 'Error!'}</p>
					</div>
				)}
				<label>
					Birthday Date:
					<input
						type="date"
						max={today}
						onInput={e => handleAgeUpdate(e)}
						{...register('birthdayDate', {
							required: 'Birthday Date is required'
						})}
					/>
				</label>
				{errors?.birthdayDate && (
					<div className="error-wrapper">
						<p>{errors?.birthdayDate?.message || 'Error!'}</p>
					</div>
				)}
				<label>
					Sex:
					<select
						data-field="sex"
						onInput={e => handleFieldUpdate(e)}
						{...register('sex', {
							required: 'Sex is required'
						})}>
						<option value="">Select a sex</option>
						<option value="Male">Male</option>
						<option value="Female">Female</option>
					</select>
				</label>
				{errors?.sex && (
					<div className="error-wrapper">
						<p>{errors?.sex?.message || 'Error!'}</p>
					</div>
				)}
				<label>
					City:
					<select
						data-field="city"
						onInput={e => handleFieldUpdate(e)}
						{...register('city', {
							required: 'City is required'
						})}>
						<option value="">Select a city</option>
						{citiesData?.map(item => {
							return (
								<option value={item?.id} key={item.id}>
									{item?.name}
								</option>
							);
						})}
					</select>
				</label>
				{errors?.city && (
					<div className="error-wrapper">
						<p>{errors?.city?.message || 'Error!'}</p>
					</div>
				)}
				<label>
					Doctor Specialty:
					<select
						{...register('doctorType')}
						data-field="type"
						onInput={e => handleFieldUpdate(e)}>
						<option value="">Select a Doctor Specialty</option>
						{doctorTypes.length
							? doctorTypes?.map(item => {
									return (
										<option value={item.id} key={item.id}>
											{item?.name}
										</option>
									);
							  })
							: doctorTypesData?.map(item => {
									return (
										<option value={item.id} key={item.id}>
											{item?.name}
										</option>
									);
							  })}
					</select>
				</label>
				{errors?.doctorType && (
					<div className="error-wrapper">
						<p>{errors?.doctorType?.message || 'Error!'}</p>
					</div>
				)}
				<label>
					Doctor:
					<select
						{...register('doctor', {
							required: 'Doctor is required'
						})}
						onChange={e => handleDoctorUpdate(e)}>
						<option value="">Select a Doctor</option>
						{doctors.map(item => (
							<option
								value={item.id}
								data-speciality-id={item.specialityId}
								data-city-id={item.cityId}
								key={item.id}>
								{item.name} {item.surname}
							</option>
						))}
					</select>
				</label>
				{errors?.doctor && (
					<div className="error-wrapper">
						<p>{errors?.doctor?.message || 'Error!'}</p>
					</div>
				)}
				<label>
					Email:
					<input
						{...register('email', {
							required: 'Email name is required',
							pattern: {
								value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
								message: 'Invalid email address'
							},
							maxLength: {
								value: 40,
								message: 'Too long name'
							}
						})}
					/>
				</label>
				{errors?.email && (
					<div className="error-wrapper">
						<p>{errors?.email?.message || 'Error!'}</p>
					</div>
				)}
				{/* <Controller
						render={props => (
							<PhoneInput
								placeholder="Numéro de téléphone"
								inputRef={register}
								
								inputProps={{
									name: 'phone',
									autoFocus: true
								}}
								id="phone"
								specialLabel="Telephone"
								name="phone"
								autoComplete="phone"
								onChange={value => props.onChange(value)}
							/>
						)}
						defaultValue=""
						name="phone"
						control={control}
						rules={{ required: true }}
					/> */}
				<Controller
					control={control}
					name="phone"
					
					render={({ field: { ref, ...field } }) => (
						<PhoneInput
							{...field}
							inputProps={{
								ref,
							}}
							country={'ua'}
							onlyCountries={['ua']}
							specialLabel={'Phone number: '}
						/>
					)}
				/>

				<input type="submit" defaultValue="Submit" />
			</form>
		</div>
	);
}
