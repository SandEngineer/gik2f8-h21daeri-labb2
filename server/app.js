const express = require('express');
const app = express();
const fs = require('fs/promises');

const PORT = 5000;

app
    .use(express.json())
    .use(express.urlencoded({extended: false}))
    .use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', '*');
        res.header('Access-Control-Allow-Methods', '*');

        next();
    });

/* GET */
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await fs.readFile('./tasks.json');
        res.send(JSON.parse(tasks));
    }
    catch (error) {
        res.status(500).send({error});
    }
});

/* POST */
app.post('/tasks', async (req, res) => {
    try {
        const task = req.body;

        const listBuffer = await fs.readFile('./tasks.json');
        const currentTasks = JSON.parse(listBuffer);
        let maxTaskId = 1;

        if (currentTasks && currentTasks.length > 0) {
            maxTaskId = currentTasks.reduce(
                (maxId, currentElement) => 
                    (currentElement.id > maxId ? currentElement.id : maxId), 
                maxTaskId
            );
        }

        const newTask = {id: maxTaskId + 1, ...task };
        const newList = currentTasks ? [...currentTasks, newTask] : [newTask];

        await fs.writeFile('./tasks.json', 
            JSON.stringify(newList)
        );
        res.send(newTask);
    }
    catch (error) {
        res.status(500).send({error: error.stack});
    }
});

/* PATCH för krysslåda */
app.patch('/tasks/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const listBuffer = await fs.readFile("./tasks.json");
        const currentTasks = JSON.parse(listBuffer);
        
        /* Om lista finns */
        if (currentTasks.length > 0) {
            /* Iterera igenom och hitta rätt id, sätt completed till motsatt värde */
            currentTasks.forEach(task => {
                if (task.id == id && task.completed == false) {
                    task.completed = true;
                } 
                else if (task.id == id && task.completed == true) {
                    task.completed = false;
                }
            })
            /* Skriv till fil */
            await fs.writeFile('./tasks.json',
                JSON.stringify(currentTasks)
            );
            res.send({ message: `Uppgift med id ${id} uppdaterades` });
        }
        else {
            res.status(404).send({ error: 'Ingen uppgift att uppdatera' });
        };
    }
    catch (error) {
        res.status(500).send({error: error.stack});
    }
});

/* DELETE */
app.delete('/tasks/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const listBuffer = await fs.readFile('./tasks.json');
        const currentTasks = JSON.parse(listBuffer);
        /* Skriv till fil alla id som inte matchar input id, dvs delete in reverse */
        if (currentTasks.length > 0) {
            await fs.writeFile('./tasks.json', JSON.stringify(currentTasks.filter((task) => task.id != id)));
            res.send({ message: `Uppgift med id ${id} togs bort` });
        } 
        else {
            res.status(404).send({ error: 'Ingen uppgift att ta bort' });
        }
    } 
    catch (error) {
        res.status(500).send({ error: error.stack });
    }
});

app.listen(PORT, () => console.log('Sever running on http://localhost:5000'));