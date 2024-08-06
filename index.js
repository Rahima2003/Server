import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import fetch from 'node-fetch';

const app = express();
app.use(bodyParser.json());
app.use(cors());

let data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

const POKE_API_URL = 'https://pokeapi.co/api/v2/pokemon-species/';

// Fetch a list of Pokemon
app.get('/api/pokemon', async (req, res) => {
    try {
        const response = await fetch(`${POKE_API_URL}?limit=151`);
        const data = await response.json();
        res.json(data.results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Pokemon data' });
    }
});

// Fetch abilities for a specific Pokemon
app.get('/api/pokemon/:name/abilities', async (req, res) => {
    const { name } = req.params;
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Pokemon abilities' });
    }
});

// CRUD operations for user data
app.get('/api/users', (req, res) => {
    res.json(data);
});

app.post('/api/users', (req, res) => {
    const newUser = req.body;
    const existingUserIndex = data.findIndex(user => user.ownerName === newUser.ownerName);
    if (existingUserIndex !== -1) {
        data[existingUserIndex] = newUser;  // Update existing user
    } else {
        data.push(newUser);  // Add new user
    }
    fs.writeFileSync('data.json', JSON.stringify(data));
    res.status(201).json(newUser);
});

app.put('/api/users/:ownerName', (req, res) => {
    const { ownerName } = req.params;
    const updatedUser = req.body;
    const userIndex = data.findIndex(user => user.ownerName === ownerName);
    if (userIndex !== -1) {
        data[userIndex] = updatedUser;
        fs.writeFileSync('data.json', JSON.stringify(data));
        res.json(updatedUser);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.delete('/api/users/:ownerName', (req, res) => {
    const { ownerName } = req.params;
    data = data.filter(user => user.ownerName !== ownerName);
    fs.writeFileSync('data.json', JSON.stringify(data));
    res.status(204).end();
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
