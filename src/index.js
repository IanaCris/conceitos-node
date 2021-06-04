const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

app.get("/users",checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user);
});

app.post('/users', (request, response) => {
  // Complete aqui
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists! " });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const { title, deadline } = request.body;

  const todoUser = user.todos.find((todo) => todo.id === id);

  if (!todoUser) {
    return response.status(404).json({ error: "Todo user no exist!"});
  }

  todoUser.title = title;
  todoUser.deadline = new Date(deadline);

  return response.json(todoUser);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoDoneUser = user.todos.find((todo) => todo.id === id);

  if (!todoDoneUser) {
    return response.status(404).json({ error: "Todo user no exist!"});
  }

  todoDoneUser.done = true;

  return response.json(todoDoneUser);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoUser = user.todos.find((todo) => todo.id === id);

  if (!todoUser) {
    return response.status(404).json({ error: "Todo user no exist!"});
  }

  user.todos.splice(todoUser, 1);

  return response.status(204).send();
});

module.exports = app;