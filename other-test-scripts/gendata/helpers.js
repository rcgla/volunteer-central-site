import faker from 'faker';
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import axios from 'axios';

dayjs.extend(utc);
dayjs.extend(timezone);

let firstlast = () => {
    return {
        first: faker.name.firstName(1),
        last: faker.name.lastName()
    };
}
let address = () => `${faker.address.streetAddress(true)}, ${faker.address.city()}, ${faker.address.stateAbbr()} ${faker.address.zipCode()}`;

let emergencyContact = () => ({
    name: faker.name.findName(),
    phone: faker.phone.phoneNumber(),
    relation: faker.random.arrayElement(['Parent', 'Sibling', 'Friend', 'Partner', 'Relative'])
});

let user = userType => {
    let name = firstlast();
    return {
        name: `${name.first} ${name.last}`,
        address: address(),
        phone: faker.phone.phoneNumber(),
        tShirtSize: faker.random.arrayElement(["X-Small", "Small", "Medium", "Large", "X-Large", "XX-Large"]),
        email: faker.internet.email(name.first, name.last),
        username: faker.internet.userName(name.first, name.last),
        password: faker.internet.password(),
        bio: faker.lorem.sentence(),
        userType,
        emergencyContacts: [emergencyContact(), emergencyContact()]
    }
}

// n random items from array
let randomItemsFromArray = (array, n) => array.sort(() => .5 - Math.random()).slice(0,n);

let morning = date => ({
    start: date.set('hour', 8).set('minute', 0).set('second', 0).format(), 
    end: date.set('hour', 12).set('minute', 0).set('second', 0).format()
});

let afternoon = date => ({
    start: date.set('hour', 12).set('minute', 0).set('second', 0).format(), 
    end: date.set('hour', 17).set('minute', 0).set('second', 0).format()
});
let allDay = date => ({
    start: date.set('hour', 8).set('minute', 0).set('second', 0).format(), 
    end: date.set('hour', 17).set('minute', 0).set('second', 0).format()
});

// every day all day (8-5)
let fullTimeAvailability = (start, end) => {
    let availabilities = [];
    let startDate = dayjs(start);
    let endDate = dayjs(end);
    if (startDate.date() == endDate.date()) {
        availabilities.push(allDay(startDate));
    }
    else {
        // multiday event
        let thisDate = startDate;
        while (!thisDate.isAfter(endDate)) {
            availabilities.push(allDay(thisDate));
            thisDate = thisDate.add(1, 'day');
        }
    }
    return availabilities;
};
// some days, 12-5
let randomAfternoonAvailability = (start, end) => {
    let availabilities = [];
    let startDate = dayjs(start);
    let endDate = dayjs(end);
    // if it's just one day then be available
    if (startDate.date() == endDate.date()) {
        availabilities.push(afternoon(startDate));
    }
    else {
        // some afternoons
        let thisDate = startDate;
        while (!thisDate.isAfter(endDate)) {
            if (Math.random() < 0.5) {
                availabilities.push(afternoon(thisDate));
            }
            thisDate = thisDate.add(1, 'day');
        }
    }
    return availabilities;
};
// some mornings, some afternoons between start and end dates
let randomPartTimeAvailability = (start, end) => {
    let availabilities = [];
    let startDate = dayjs(start);
    let endDate = dayjs(end);
    // if it's just one day then be available
    if (startDate.date() == endDate.date()) {
        if (endDate.isBefore(endDate.set('hour', 12))) {
            // morning event
            availabilities.push(morning(startDate));
        }
        else {
            availabilities.push(afternoon(startDate));
        }
    }
    else {
        // some mornings or afternoons
        let thisDate = startDate;
        while (!thisDate.isAfter(endDate)) {
            if (Math.random() < 0.5) {
                if (Math.random() < 0.5) {
                    // morning
                    availabilities.push(morning(thisDate));
                }
                else {
                    // afternoon
                    availabilities.push(afternoon(thisDate));
                }
            }
            // else nothing for this date
            thisDate = thisDate.add(1, 'day');
        }
    }
    return availabilities;
};
// get an AI-generated photo via fakeface.rest
// https://hankhank10.github.io/fakeface/
async function getPhoto(age, gender) {
    try {
        // the min and max ages can't be the same
        let response = await axios.get(`https://fakeface.rest/face/json?gender=${gender}&minimum_age=${age}&maximum_age=${age+1}`);
        if (!response.data || response.status != 200) {
            throw new Error("Bad response from fakeface.rest");
        }
        return {
            url: response.data.image_url,
            age,
            gender
        };
    }
    catch(err) {
        console.log(err);
    }
}

const sleep = m => new Promise(r => setTimeout(r, m));

// return {index, url} of the random photo
function findRandomPhoto(startAge, endAge, photoPool) {
    let photo = randomItemsFromArray(
        photoPool.filter(p => p.age >= startAge && p.age <= endAge),
        1);
    let index = photoPool.findIndex(item => item == photo[0]);
    return {index, url: photo[0].url};
}
export {
    randomItemsFromArray,
    user,
    emergencyContact,
    address,
    firstlast,
    fullTimeAvailability,
    randomPartTimeAvailability,
    randomAfternoonAvailability,
    getPhoto,
    findRandomPhoto,
    sleep
};