const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function dating(arg) {
    const result = []
    const dateParts = arg.split("-");
    const date = new Date(arg);
    for (const line of getAllTodo()) {
        const splitted = line.split(';')
        if (splitted.length !== 3) {
            continue;
        }
        const lineDate = new Date(splitted[1].trim());
        if (dateParts.length === 1 && date.getFullYear() >= lineDate.getFullYear()) {
            continue;
        }
        if (dateParts.length === 2 && (date.getFullYear() > lineDate.getFullYear() 
            || date.getMonth() >= lineDate.getMonth())) {
            continue;
        }
        if (dateParts.length === 3 && (date.getFullYear() > lineDate.getFullYear() 
            || date.getMonth() > lineDate.getMonth() 
            || date.getDay() >= lineDate.getDay())) {
            continue;
        }
        result.push(line);
    }
    return result;
}

function sortBy(arg) {
    const todos = getAllTodo();
    const result = [];
    switch (arg) {
        case "importance":
            const important = getImportant();
            const others = todos.filter(x => !important.includes(x));
            return important.concat(others);
        case "user":
            const haveUsers = [];
            for (const line of todos) {
                const splitted = line.split(';')
                if (splitted.length === 3) {
                    haveUsers.push(line);
                }
            }
            const noUsers = todos.filter(x => !haveUsers.includes(x));
            return haveUsers.concat(noUsers);
        case "date":
            const haveDate = []
            for (const line of todos) {
                const splitted = line.split(';')
                if (splitted.length !== 3) {
                    continue;
                }
                const date = new Date(splitted[1].trim());
                haveDate.push([line, date]);
            }
            haveDate.sort((a, b) => {
                return a[1] - b[1];
            });
            const onlyDated = haveDate.map(item => item[0]);
            const noDate = todos.filter(x => !onlyDated.includes(x));
            return onlyDated.concat(noDate);
    }
}

function getAllTodo() {
    const result = [];
    for (const file of files) {
        const lines = file.split("\n");
        for (const line of lines) {
            const startOfTodo = line.indexOf("// TODO");
            if (startOfTodo === -1) {
                continue;
            }
            result.push(line.substring(startOfTodo));
        }
    }
    return result;
}

function getByUser(user) {
    const result = []
    for (const line of getAllTodo()) {
        const splitted = line.split(';')
        if (splitted.length !== 3) {
            continue;
        }
        const newUser = splitted[0].substring(8).toLowerCase();
        if (user === newUser) {
            result.push(line);
        }
    }
    return result;
}

function printTodos(todos) {
    let userMax = 0;
    let messageMax = 0;
    for (const line of todos) {
        const splitted = line.split(';')
        if (splitted.lenght !== 3) {
            userMax = Math.max(userMax, 9);
            messageMax = Math.max(messageMax, line.substring(8).length);
            continue;
        }
        const user = splitted[0].substring(8);
        const message = splitted[2].trim();
        userMax = Math.max(userMax, user.lenght);
        messageMax = messageMax = Math.max(messageMax, message.length);
        if (userMax >= 10) {
            userMax = 10;
        }
        if (messageMax >= 50) {
            messageMax = 50
        }
    }
    const top = `  !  |  ${'user'.padEnd(userMax, " ")}  |  date        |  ${'comment'.padEnd(messageMax, " ")}`
    console.log(top);
    console.log('-'.repeat(top.length));
    for (const line of todos) {
        const splitted = line.split(';')
        const important = line.includes('!') ? '!' : ' ';
        const user = splitted.length === 3 ? splitted[0].substring(8).padEnd(userMax, " ") : 'undefined'.padEnd(userMax, " ");
        const date = splitted.length === 3 ? splitted[1].trim().padEnd(10, " ") : 'undefined ';
        const message = splitted.length === 3 ? splitted[2].trim().padEnd(messageMax, " ") : line.substring(8).padEnd(messageMax, " ");
        console.log(`  ${important}  |  ${user}  |  ${date}  |  ${message}`);
    }
}

function getImportant() {
    const result = [];
    for (const line of getAllTodo()) {
        if (line.includes('!')) {
            result.push(line);
        }
    }

    return result;
}

function processCommand(command) {
    switch (command) {
        case 'exit':
            process.exit(0);
        case 'show':
            printTodos(getAllTodo());
            break;
        case 'important':
            printTodos(getImportant());
            break;
        default:
            if (command.substring(0, 4) == 'user') {
                const username = command.substring(5).toLowerCase();
                printTodos(getByUser(username));
            }
            else if (command.substring(0, 4) == 'sort') {
                const arg = command.substring(5);
                printTodos(sortBy(arg));
            }
            else if (command.substring(0, 4) == 'date') {
                const arg = command.substring(5);
                printTodos(dating(arg));
            }
            else {
                console.log('wrong command');
            }
            break;
    }
}

// TODO you can do it!
