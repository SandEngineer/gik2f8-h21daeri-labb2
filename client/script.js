
todoForm.title.addEventListener('input', (e) => validateField(e.target));
todoForm.title.addEventListener('blur', (e) => validateField(e.target));

todoForm.description.addEventListener('input', (e) => validateField(e.target));
todoForm.description.addEventListener('blur', (e) => validateField(e.target));

todoForm.dueDate.addEventListener('input', (e) => validateField(e.target));
todoForm.dueDate.addEventListener('blur', (e) => validateField(e.target));

todoForm.addEventListener('submit', onSubmit);

/* Trigger för att rita listan när sidan laddas */
window.addEventListener('load', renderList);

const todoListElement = document.getElementById('todoList');

let titleValid = true;
let descriptionValid = true;
let dueDateValid = true;

const api = new Api('http://localhost:5000/tasks');

/* Kolla så alla fält uppfyller inputkrav, annars ge errormeddelande */
function validateField(field) {
    const {name, value} = field;

    let validationMessage = '';
    switch(name) {
        case 'title': {
            if (value.length < 2) {
                titleValid = false;
                validationMessage = "Fältet 'Uppgift' måste innehålla minst 2 tecken";
            }
            else if (value.length > 100) {
                titleValid = false;
                validationMessage = "Fältet 'Uppgift' får ej innehålla fler än 100 tecken";
            }
            else {
                titleValid = true;
            }
            break;
        }
        case 'description': {
            if (value.length > 500) {
                descriptionValid = false;
                validationMessage = "Fältet 'Uppgift' får ej innehålla fler än 500 tecken";
            }
            else {
                descriptionValid = true;
            }
            break;
        }
        case 'dueDate': {
            if (value.length == 0) {
                dueDateValid = false;
                validationMessage = "Fältet 'Klart senast' måste innehålla ett datum";
            }
            else {
                dueDateValid = true;
            }
            break;
        }
    }

    field.previousElementSibling.innerText = validationMessage;
    field.previousElementSibling.classList.remove('hidden');
}

/* Skicka ny uppgift att bli spara vid knapptryck */
function onSubmit(e) {
    /* Ladda inte om sidan vid tryck */
    e.preventDefault();
    /* Om alla data finns, spara och rensa fält */
    if (titleValid && descriptionValid && dueDateValid) {
        console.log('Submit');
        saveTask();
        resetFields();
    }
}

/* Spara ny uppgift */
function saveTask() {
    /* Lägg inputfältens värden i variabler, spara som const och skicka */
    const task = {
        title: todoForm.title.value, 
        description: todoForm.description.value, 
        dueDate: todoForm.dueDate.value,
        completed: false
    };
    /* Skicka för POST sen skicka resultat till rendering */
    api.create(task).then(task => {
        if (task) {
            renderList();
        }
    });
}

/* Rita lista */
function renderList() {
    console.log('Rendering');
    /* Hämta nuvarande lista */
    api.getAll().then(tasks => {
        todoListElement.innerHTML = '';
        /* Om det finns en lista */
        if (tasks && tasks.length > 0) {
            /* Sortera efter datum med tidigast först */
            tasks.sort(
                (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
            );
            /* Lägg in listitem för varje objekt */
            tasks.forEach(task => {
                todoListElement.insertAdjacentHTML('beforeend', renderTask(task));
            });
        }
    });
}

/* Rita listitems */
function renderTask({id, title, description, dueDate, completed}) {
    let html = `
        <li id="item${id}" class="select-none mt-2 py-2 border-b border-amber-300">
            <div class="flex items-center">`;
    /* Om uppgiften inte är markerad som klar, skriv ut utan ikryssad låda och utan strikethrough*/
    !completed && (html += `
            <input type="checkbox" id="${id}" name="checkbox${id}" onclick="completeTask(${id})" value="false" class="mr-2 mb-2 w-5 h-5 hover:border-amber-700 checked:accent-amber-700" />
            <h3 class="flex-1 mb-3 text-xl font-bold text-pink-800 uppercase">${title}</h3>`);
    /* Om uppgiften är markerad som klar, skriv ut med ikryssad låda och strikethrough*/
    completed && (html += `
            <input type="checkbox" id="${id}" name="checkbox${id}" onclick="completeTask(${id})" checked value="true" class="mr-2 mb-2 w-5 h-5 hover:border-amber-700 checked:accent-amber-700" />
            <h3 class="flex-1 mb-3 text-xl font-bold text-pink-800 uppercase line-through decoration-from-font">${title}</h3>`);
    
    html += `
                <div>
                    <span>${dueDate}</span>
                    <button onclick="removeTask(${id})" class="inline-block bg-amber-500 text-xs text-amber-900 border border-white px-3 py-1 rounded-md ml-2">Ta bort</button>
                </div>
            </div>
            <p class="ml-8 mt-2 text-xs italic">${description}</p>
        </li>`;

    return html;
}

/* Uppdatera krysslåda */
function completeTask(id) {
    api.update(id).then((result) => {
        renderList();
    });
}

/* Ta bort berört id */
function removeTask(id) {
    api.remove(id).then((result) => {
        renderList();
    });
}

/* Nollställ inpufälten */
function resetFields() {
    todoForm.title.value = "";
    todoForm.description.value = "";
    todoForm.dueDate.value = "";
}