const mysql = require('mysql2');
const inquirer = require('inquirer');
const { listenerCount } = require('events');
const { allowedNodeEnvironmentFlags } = require('process');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    // Your MySQL username
    user: 'root',
    // Your MySQL password
    password: 'C0d!ng4fun',
    database: 'employees_db'
});

connection.connect(err => {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId + '\n');
    mainMenu();
});

// mainMenu function asks user to list options
mainMenu = () => {
    inquirer.prompt(
        {
            type: "list",
            name: "mainMenu",
            message: "What would you like to do?",
            choices: [
                "End Query Connection",
                "View All Departments",
                "View All Roles",
                "View All Employees",
                "Add A Department",
                "Add A Role",
                "Add An Employee",
                "Update An Employee Role",
            ]
        }
    )
        .then(answers => {
            switch (answers.mainMenu) {
                case "End Query Connection":
                    connection.end;
                    break;
                case "View All Departments":
                    viewDepartments();
                    break;
                case "View All Roles":
                    viewRole();
                    break;
                case "View All Employees":
                    viewEmployees();
                    break;
                case "Add A Department":
                    addDepartment();
                    break;
                case "Add A Role":
                    addRole();
                    break;
                case "Add An Employee":
                    addEmployee();
                    break;
                case "Update An Employee Role":
                    updateEmployeeRole();
                    break;    
                default:
                    connection.end;
                    break;
            }
        })
};

viewDepartments = () => {
    connection.query(
        "SELECT * FROM department",
        function (err, res) {
            if (err) throw err;
            console.table(res);
            mainMenu();
        }
    )
};

viewRole = () => {
    connection.query(
        "SELECT * FROM role",
        function (err, res) {
            if (err) throw err;
            console.table(res);
            mainMenu();
        }
    )
};

viewEmployees = () => {
    connection.query(
        // "SELECT * FROM employee INNER JOIN role ON employee.role_id = role.title",
        `SELECT first_name, last_name, title, name, salary, manager_id
        FROM employee
        INNER JOIN role ON employee.role_id = role.id
        INNER JOIN department ON role.department_id = department.id`,
        function (err, res) {
            if (err) throw err;
            console.table(res);
            mainMenu();
        }
    )
};

addDepartment = () => {
    inquirer.prompt({
        type: "input",
        name: "dpt",
        message: "What is the name of your new deparment?"
    })
        .then(answers => {
            connection.query(
                "INSERT INTO department SET ?",
                {
                    name: answers.dpt
                },
                function (err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + ' department was inserted\n');
                    mainMenu();
                }
            )
        })
};

addRole = () => {
    let departmentChoices = [];
    connection.query(
        "SELECT name, id FROM department",
        function (err, res) {
            if (err) throw err;
            for (var i = 0; i < res.length; i++ ) {
                // console.log(res[i]);
                // console.log(res[i].name.id);
                departmentChoices.push({
                    name: res[i].name,
                    value: res[i].id
                });
            }
            addRolePrompt(departmentChoices);
        }
    );
}
addRolePrompt = (departmentChoices) => {   
    inquirer
        .prompt([
            {
                type: "input",
                name: "role",
                message: "What is the new role's name?"
            },
            {
                type: "input",
                name: "salary",
                message: "What is the salary?"
            },
            {
                type: "list",
                name: "dptRole",
                message: "What department is this role in?",
                choices: departmentChoices
            }
        ])
        .then(answers => {
            connection.query(
                "INSERT INTO role SET ?",
                {
                    title: answers.role,
                    salary: answers.salary,
                    department_id: answers.dptRole
                },
                function (err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + ' role was inserted\n');
                    mainMenu();
                }
            );
        });
};

addEmployee = () => {
    let roleChoices = [];
    connection.query(
        //get list of roles
        "SELECT title, id FROM role",
        function (err, res) {
            if (err) throw err;
            for (var i = 0; i < res.length; i++ ) {
                // console.log(res[i]);
                roleChoices.push({
                    name: res[i].title,
                    value: res[i].id
                });
            }

            getManagerNamesForAddEmployee(roleChoices);
            // addEmployeePrompt(roleChoices);
        }
    );
}

getManagerNamesForAddEmployee = (roleChoices) => {
    let managerChoices = [{
        name: "Null",
        value: null
    }];
    connection.query(
        "SELECT first_name, last_name, id FROM employee",
        function (err, res) {
            if (err) throw err;
            for (var i = 0; i < res.length; i++ ) {
                // console.log(res[i].first_name + " " + res[i].last_name);
                let firstName = res[i].first_name;
                let lastName = res[i].last_name;
                let id = res[i].id;
                managerChoices.push({
                    name: firstName + " " + lastName,
                    value: id
                });
            }
            
            addEmployeePrompt(roleChoices, managerChoices);
        }
    )
}

addEmployeePrompt = (roleChoices, managerChoices) => {
    inquirer
        .prompt([
            {
                type: "input",
                name: "firstName",
                message: "What is the employee's first name?"
            },
            {
                type: "input",
                name: "lastName",
                message: "What is the employee's last name?"
            },
            {
                type: "list",
                name: "role",
                message: "What is the employee's role?",
                choices: roleChoices 
            },
            {
                type: "list",
                name: "manager",
                message: "Who is the employee's manager?",
                choices: managerChoices
            }
        ])
        .then(answers => {
            console.log(answers);
            connection.query(
                "INSERT INTO employee SET ?",
                {
                    first_name: answers.firstName,
                    last_name: answers.lastName,
                    role_id: answers.role,
                    manager_id: answers.manager

                },
                function (err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + ' employee was inserted\n');
                    mainMenu();
                }
            )
        });
};

updateEmployeeRole = () => {
    let employeeChoices = [];
    connection.query(
        //get list of employee names
        "SELECT first_name, last_name, id FROM employee",
        function (err, res) {
            if (err) throw err;
            for (var i = 0; i < res.length; i++ ) {
                // console.log(res[i].first_name + " " + res[i].last_name);
                let firstName = res[i].first_name;
                let lastName = res[i].last_name;
                let id = res[i].id;
                employeeChoices.push({
                    name: firstName + " " + lastName,
                    value: id
                });
            }
            employeeRoleForUpdateRole(employeeChoices);
        }
    );
}

employeeRoleForUpdateRole = (employeeChoices) => {
    let roleChoices = [];
    connection.query(
        //get list of roles
        "SELECT title, id FROM role",
        function (err, res) {
            if (err) throw err;
            for (var i = 0; i < res.length; i++ ) {
                // console.log(res[i]);
                roleChoices.push({
                    name: res[i].title,
                    value: res[i].id
                });
            }
            updateEmployeeRolePrompt(employeeChoices, roleChoices);
        }
    );
}

updateEmployeeRolePrompt = (employeeChoices, roleChoices) => {
    inquirer
        .prompt([
            {
                type: "list",
                name: "employeeName",
                message: "Which employee's role would you like to update?",
                choices: employeeChoices
            },
            {
                type: "list",
                name: "newRole",
                message: "What is their new role?",
                choices: roleChoices
            }
        ])
        .then(answers => {
            console.log(answers);
            connection.query(
                "UPDATE employee SET ? WHERE ?",
                [
                    {
                        role_id: answers.newRole
                    },
                    {
                        id: answers.employeeName
                    }
                ],               
                function (err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + ' employee role was updated\n');
                    mainMenu();
                }
            )
        });
};