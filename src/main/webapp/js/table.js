let currentPageSize = 3;
let totalPages = 0;
let currentPage = 0;
let currentTasks = [];

let editMode = false;
let editRow = null;

const Status = {
    IN_PROGRESS: "IN_PROGRESS",
    DONE: "DONE",
    PAUSED: "PAUSED",
}

const Columns = {
    id: "id",
    Description: "description",
    Status: "status",
    Edit: "edit",
    Delete: "delete"
}

const ColumnIndex = {
    1: Columns.Description,
    2: Columns.Status,
}

const fieldConfig = {
    [Columns.Description]: {type: "input", id: "description-input", dataType: "string", minLength: 1, maxLength: 30},
    [Columns.Status]: {type: "select", id: "status-select", options: Object.values(Status)},
}

removeChildren = (parent) => {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

initCountPerPageSelect = () => {
    const container = document.getElementById("count-per-page");

    const label = document.createElement("label");
    label.for = "count-per-page-select";
    label.textContent = "Count per page:";

    const select = useSelect({
        id: "count-per-page-select",
        options: [...Array(18).keys()].map(i => i + 3)
    })

    select.onchange = async (v) => {
        currentPageSize = v.target.value;
        currentPage = 0;
        await renderPages();
        await fetchTasks();
        await renderTasks();
    }

    container.append(label, select);
}

renderPages = async () => {
    const paginationNode = document.getElementById("pagination");

    removeChildren(paginationNode);

    for (let i = 0; i < totalPages / currentPageSize; i++) {
        const link = document.createElement("span");

        if (i === currentPage) {
            link.classList.add('active')
        }

        link.textContent = i + 1;
        link.onclick = async (v) => {
            currentPage = v.target.textContent - 1;
            await fetchTasks();
            await renderTasks();
            await renderPages();
        }
        paginationNode.appendChild(link);
    }
}

initPages = async () => {
    await fetchPages();
    await renderPages();
}

renderTasks = async () => {
    const table = document.getElementById("table");
    const header = document.getElementById("header");

    removeChildren(table);

    table.appendChild(header);

    currentTasks.forEach((task, i) => {
            const row = document.createElement("tr");
            const rowId = `tr${i}`;

            row.id = rowId;

            ([...Object.values(Columns)]).forEach((column, i) => {
                const cell = document.createElement("td")
                cell.id = `${rowId}-td${i}`;
                cell.textContent = task[column];

                if (column === Columns.id) {
                    cell.className = "id";
                }

                if (column === Columns.Edit) {
                    const editImg = document.createElement("img");
                    editImg.src = "/img/edit.png";
                    editImg.alt = "Edit";

                    cell.textContent = "";
                    cell.className = "edit";
                    removeChildren(cell);
                    cell.appendChild(editImg);
                    cell.onclick = async (v) => {
                        const rowId = (v.target.parentElement.id).split("-")[0];

                        if (editRow !== null && editRow !== cell.id.split("-")[0]) {
                            return;
                        }

                        editRow = rowId;

                        if (editMode) {
                            editMode = false;
                            editRow = null;

                            const rowElements = document.querySelectorAll(`[id^=${rowId}`);

                            const id = rowElements[1].textContent;
                            const description = rowElements[2].children[0].value;
                            const status = rowElements[3].children[0].value;

                            await saveTask({id, description, status})
                            await renderPages();
                            await fetchTasks();
                            await renderTasks();

                            return;
                        }

                        editMode = true;

                        removeChildren(cell);

                        const saveImg = document.createElement("img");
                        saveImg.src = "/img/save.png";
                        saveImg.alt = "Save";

                        cell.appendChild(saveImg);
                        cell.className = "save"

                        const rowElements = document.querySelectorAll(`[id^=${rowId}`);

                        rowElements.forEach((e, i) => {
                            const columnName = ColumnIndex[i];

                            if (!columnName) return;

                            const config = fieldConfig[columnName];
                            const cellId = `td${i}`;
                            const currentCellElement = document.getElementById(`${rowId}-${cellId}`)
                            const rowNode = document.getElementById(`${rowId}`)
                            const td = document.createElement("td");

                            td.id = `${rowId}-${cellId}`;

                            const field = useFields({
                                ...config,
                                defaultValue: currentCellElement.textContent
                            })

                            td.appendChild(field);
                            currentCellElement.insertAdjacentElement("beforebegin", td);
                            rowNode.removeChild(currentCellElement);
                        })

                    }
                }

                if (column === Columns.Delete) {
                    const deleteImg = document.createElement("img");
                    deleteImg.src = "/img/delete.png";
                    deleteImg.alt = "Edit";

                    cell.textContent = "";
                    cell.className = "delete";
                    cell.appendChild(deleteImg);
                    cell.onclick = async (v) => {
                        if (editMode) {
                            return;
                        }

                        const rowId = (v.target.parentElement.id).split("-")[0];
                        const row = document.getElementById(rowId);
                        const rowElements = document.querySelectorAll(`[id^=${rowId}`);
                        const id = rowElements[1].textContent;

                        await deleteTask(id);
                        table.removeChild(row);

                        if (table.children.length === 1) {
                            await fetchPages();
                            await fetchTasks();
                            await renderTasks();
                            await renderPages();
                        }
                    }
                }

                row.append(cell);
            })

            table.appendChild(row);
        }
    )
}

saveTask = async (task) => {
    return await fetch(`api/v1/tasks`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
    });
}

deleteTask = async (id) => {
    return await fetch(`api/v1/tasks/${id}`, {method: "DELETE"});
}

initTasks = async () => {
    await fetchTasks();
    await renderTasks();
}

initCreationForm = async () => {
    const creationForm = document.getElementById("task-creation-form");

    for (const column of Object.keys(Columns)) {
        const fieldContainer = document.createElement("div");
        const config = fieldConfig[Columns[column]];

        if (config) {
            const inputField = useFields({
                ...config,
                id: `create-${config.id}`
            })
            const label = document.createElement("div")
            label.textContent = column;
            fieldContainer.className = "field";

            fieldContainer.appendChild(label);
            fieldContainer.appendChild(inputField);
            creationForm.appendChild(fieldContainer);
        }
    }

    const saveElement = document.getElementById("create-task");
    saveElement.onclick = async () => {
        await createTask();
        await removeChildren(creationForm);
        await initCreationForm();
    }
}

fetchPages = async () => {
    const response = await fetch("api/v1/tasks/count");

    totalPages = await response.json();
}

fetchTasks = async () => {
    const url = new URL('http://localhost:8080/api/v1/tasks');
    const params = {pageNumber: currentPage, pageSize: currentPageSize};

    url.search = new URLSearchParams(params).toString();

    const response = await fetch(url);

    currentTasks = await response.json();
}

createTask = async () => {
    const description = document.getElementById(`create-${fieldConfig[Columns.Description].id}`).value;
    const status = document.getElementById(`create-${fieldConfig[Columns.Status].id}`).value;

    return fetch(`api/v1/tasks`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            description,
            status,
        }),
    }).then((response) => {
        if (!response.ok) {
            alert("Error data");
        }

        return response;
    });
}

const useSelect = ({id, options, defaultValue}) => {
    const select = document.createElement("select");
    select.id = id;

    for (const x of options) {
        const option = document.createElement("option")
        option.value = x;
        option.textContent = x;
        select.appendChild(option)
    }

    if (defaultValue) {
        select.value = defaultValue;
    }

    return select;
}

const useInput = ({id, options, defaultValue, dataType, min, max, maxLength, minLength}) => {
    const input = document.createElement("input");
    input.value = defaultValue || "";
    input.id = id;
    input.type = dataType;
    input.min = min;
    input.max = max;
    input.maxLength = maxLength;
    input.minLength = minLength;

    return input
}

const useFields = (config) => {
    switch (config.type) {
        case 'input':
            return useInput({...config});
        case 'select':
            return useSelect({...config});
    }
};

document.addEventListener('DOMContentLoaded', async function () {
    initCountPerPageSelect();
    await initTasks();
    await initPages();
    await initCreationForm();
});