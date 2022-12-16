
todoForm.title.addEventListener('input', (e) => validateField(e.target));
todoForm.title.addEventListener('blur', (e) => validateField(e.target));

todoForm.description.addEventListener('input', (e) => validateField(e.target));
todoForm.description.addEventListener('blur', (e) => validateField(e.target));

todoForm.dueDate.addEventListener('input', (e) => validateField(e.target));
todoForm.dueDate.addEventListener('blur', (e) => validateField(e.target));

todoForm.addEventListener('submit', onSubmit);

const todoListElement = document.getElementById('todoList');

let titleValid = true;
let descriptionValid = true;
let dueDateValid = true;

const api = new Api('http://localhost:5000/tasks');

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

function onSubmit(e) {
    e.preventDefault();
    
    if (titleValid && descriptionValid && dueDateValid) {
        console.log('Submit');
        saveTask();
    }
}

function saveTask() {
    const task = {
        title: todoForm.title.value, 
        description: todoForm.description.value, 
        dueDate: todoForm.dueDate.value,
        completed: false
    };

    api.create(task).then(task => {
        if (task) {
            renderList();
        }
    });
}

function renderList() {
    console.log('Rendering');

    api.getAll().then(tasks => {
        todoListElement.innerHTML = '';
        
        if (tasks && tasks.length > 0) {
            tasks.forEach(task => {
                todoListElement.insertAdjacentHTML('beforeend', renderTask(task));
            });
        }
    });
}

function renderTask({id, title, description, dueDate}) {
    /* Something something checkbox -> onclick -> anropa funktion
    skriv completed=true if checked=true och false if false för (this.id)
    skicka till backend för write */
    let html = `
        <li class="select-none mt-2 py-2 border-b border-amber-300">
            <div class="flex items-center">
                <input type="checkbox" name="checkbox" class="mr-2 mb-2 w-5 h-5 hover:border-amber-700 checked:accent-amber-700" />
                <h3 class="flex-1 mb-3 text-xl font-bold text-pink-800 uppercase">${title}</h3>
                <div>
                    <span>${dueDate}</span>
                    <button onclick="removeTask(${id})" class="inline-block bg-amber-500 text-xs text-amber-900 border border-white px-3 py-1 rounded-md ml-2">Ta bort</button>
                </div>
            </div>`;
    
    description && (
        html += `
            <p class="ml-8 mt-2 text-xs italic">${description}</p>
    `);

    html += `
        </li>`;
    
    return html;
}

function removeTask(id) {
    api.remove(id).then((result) => {
        renderList();
    });
}

renderList();