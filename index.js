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
            "View Departments",
            "View Employees",
            "View Employee Roles",
            "Add Department",
            "Add Employee Role",
            "Add Employee",
            "Update Employee Role",
            ]
        }
    )
    .then(answers => {
        switch (answers.mainMenu) {
            case "View Departments":
                viewDepartments();
                break;
            case "View Employees":
                viewEmployees();
                break;
            case "View Employee Roles":
                viewRole();
                break;
            case "Add Department":
                addDepartment();
                break;
            case "Add Employee Role":
                addRole();
                break;
            case "Add Employee":
                addEmployee();
                break;
            case "Update Employee Role":
                updateRole();
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

addDepartment = () => {
    inquirer.prompt({
        type:  "input",
        name: "dpt",
        message:"What is the name of your new deparment?"
    }) 
    .then (answers => {
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
}