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
        "SELECT * FROM employee",
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
                choices: [
                    // List out departments
                ]
            }
        ])
        .then(answers => {
            connection.query(
                "INSERT INTO role SET ?",
                {
                    role: answers.role,
                    salary: answers.salary
                    //  department_id: Needs to use the name of what is typed in for the department and then use assign the role id # here
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
                choices: [
                    //list out roles in system
                ]
            },
            {
                type: "list",
                name: "manager",
                message: "Who is the employee's manager?",
                choices: [
                    //list out possible managers make sure to have none as an option
                ]
            }
        ])
        .then (answers => {
            connection.query(
                "INSERT INTO employee SET ?",
                {
                    first_name: answers.firstName,
                    last_name: answers.lastName,
                    role: answers.role,
                    manager_id: answers.manager //make sure that it connects to the manager_id

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
    inquirer
        .prompt([
            {
                type: "list",
                name: "employeeName",
                message: "Which employee's role would you like to update?",
                choices: [
                    //list out possible employee's first and last names
                ]
            },
            {
                type: "list",
                name: "newRole",
                message: "What is their new role?",
                choices: [
                    //list out possible roles to choose from
                ]
            }
        ])
        .then (answers => {
            connection.query(
                "UPDATE employee SET ? WHERE ?",
                {

                }, 
                function (err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + ' employee role was updated\n');
                    mainMenu();
                }
            )
        });
};