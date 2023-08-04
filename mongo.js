const mongoose = require('mongoose');

if (process.argv < 3) {
  console.log('give password as argument');
  process.exit(1);
}
if (process.argv.length === 4) {
  console.log('must provide name and number');
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://fullstack:${password}@cluster0.1frucdv.mongodb.net/people?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);
const [name, number] = [...process.argv].splice(3);

if (process.argv.length === 3) {
  //TODO: print all records in DB then close connection
  Person.find({}).then((result) => {
    console.log('phonebook:');
    result.forEach((person) => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
  });
  return;
}

const clPerson = new Person({
  name,
  number,
});

clPerson.save().then((result) => {
  const { name, number } = result;
  console.log(`saved ${name} ${number} to phonebook`);
  mongoose.connection.close();
});
