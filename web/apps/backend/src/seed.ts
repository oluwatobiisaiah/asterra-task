import { db } from './db';
import { users, hobbies } from './db/schema';

const firstNames = [
  'John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
  'Ivy', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peter', 'Quinn', 'Ryan',
  'Sophia', 'Tyler', 'Uma', 'Victor', 'Wendy', 'Xander', 'Yara', 'Zane', 'Aaron', 'Bella',
  'Caleb', 'Daisy', 'Ethan', 'Fiona', 'Gavin', 'Hannah', 'Isaac', 'Julia', 'Kevin', 'Luna',
  'Mason', 'Nora', 'Owen', 'Piper', 'Quincy', 'Riley', 'Samuel', 'Tessa', 'Ulysses', 'Violet'
];

const lastNames = [
  'Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez',
  'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson',
  'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis',
  'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill',
  'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter'
];

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Boston',
  'El Paso', 'Detroit', 'Nashville', 'Portland', 'Memphis', 'Oklahoma City', 'Las Vegas', 'Louisville', 'Baltimore', 'Milwaukee',
  'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Mesa', 'Kansas City', 'Atlanta', 'Long Beach', 'Colorado Springs', 'Raleigh',
  'Miami', 'Virginia Beach', 'Omaha', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Tampa', 'New Orleans', 'Wichita'
];

const hobbiesList = [
  'Reading', 'Swimming', 'Cooking', 'Hiking', 'Painting', 'Photography', 'Gardening', 'Cycling', 'Dancing', 'Singing',
  'Writing', 'Drawing', 'Knitting', 'Fishing', 'Camping', 'Traveling', 'Yoga', 'Meditation', 'Chess', 'Board Games',
  'Video Games', 'Music', 'Theater', 'Movies', 'Sports', 'Running', 'Basketball', 'Soccer', 'Tennis', 'Golf',
  'Skiing', 'Snowboarding', 'Surfing', 'Rock Climbing', 'Martial Arts', 'Boxing', 'Gymnastics', 'Bowling', 'Billiards', 'Poker',
  'Collecting', 'Antiques', 'Astronomy', 'Bird Watching', 'Volunteering', 'Teaching', 'Learning Languages', 'Programming', 'Woodworking', 'Sculpting'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generatePhone(): string {
  const area = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `${area}-${exchange}-${number}`;
}

function generateAddress(): string {
  const streetNumber = Math.floor(Math.random() * 9999) + 1;
  const streetName = getRandomElement(['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Maple Dr', 'Cedar Ln', 'Birch Blvd', 'Willow Way']);
  const city = getRandomElement(cities);
  return `${streetNumber} ${streetName}, ${city}`;
}

async function seed() {
  console.log('Seeding database with 500 users and their hobbies...');

  const userInserts = [];
  for (let i = 0; i < 500; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const address = generateAddress();
    const phone = generatePhone();

    userInserts.push({
      firstName,
      lastName,
      address,
      phone,
    });
  }

  // Insert users in batches to avoid overwhelming the DB
  const batchSize = 50;
  const userIds: number[] = [];
  for (let i = 0; i < userInserts.length; i += batchSize) {
    const batch = userInserts.slice(i, i + batchSize);
    const inserted = await db.insert(users).values(batch).returning({ id: users.id });
    userIds.push(...inserted.map(u => u.id));
  }

  console.log(`Inserted ${userIds.length} users`);

  const hobbyInserts = [];
  for (const userId of userIds) {
    const numHobbies = Math.floor(Math.random() * 5) + 1; // 1 to 5 hobbies
    const userHobbies = new Set<string>();
    while (userHobbies.size < numHobbies) {
      userHobbies.add(getRandomElement(hobbiesList));
    }
    for (const hobby of userHobbies) {
      hobbyInserts.push({
        userId,
        hobby,
      });
    }
  }

  // Insert hobbies in batches
  for (let i = 0; i < hobbyInserts.length; i += batchSize) {
    const batch = hobbyInserts.slice(i, i + batchSize);
    await db.insert(hobbies).values(batch);
  }

  console.log(`Inserted ${hobbyInserts.length} hobbies`);
  console.log('Seeding complete!');
}

seed().catch(console.error);