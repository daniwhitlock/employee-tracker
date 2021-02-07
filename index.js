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