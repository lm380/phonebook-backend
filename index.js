const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const Person = require('./models/Person');
const app = express();

app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.static('build'));

morgan.token('postData', (request) => {
  return JSON.stringify(request.body);
});

app.use(morgan(':postData :method :url :response-time'));

let people = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

app.get('/api/persons', (request, response) => {
  Person.find({}).then((people) => {
    response.json(people);
  });
});

app.get('/info', (request, response) => {
  const numOfPeople = people.length;
  const now = new Date();
  response.send(
    `<p>Phonebook has info for ${numOfPeople} people</p><p>${now}</p>`
  );
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = people.find((person) => person.id === id);
  if (!person) {
    response.status(404).end();
    return;
  }
  response.json(person);
});

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;
  Person.findByIdAndRemove(id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body;
  const { name, number } = body;
  if (!name || !number) {
    return response.status(400).json({
      error: 'Person is missing a name or number',
    });
  }
  //  else if (people.some((person) => person.name === name)) {
  //   return response.status(400).json({
  //     error: 'name must be unique',
  //   });
  // }
  const newPerson = new Person({
    name,
    number,
  });
  newPerson
    .save()
    .then((person) => {
      response.json(person);
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;
  const id = request.params.id;
  const { name, number } = body;

  const person = {
    name,
    number,
  };

  Person.findByIdAndUpdate(id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

// this has to be the last loaded middleware.
app.use(errorHandler);

const port = process.env.PORT;

app.listen(port);
console.log(`server is listening on port ${port}`);
