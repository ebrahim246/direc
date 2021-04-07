const mysql = require('mysql');
const Enquirer = require('inquirer');
const cTable = require('console.table');
const chalk = require('chalk');

let listdepartments = [];
let listemployeeids = [];
let listemployeefirstname = [];

class department {
	constructor(name) {
		this.name = name;
	}
}
class employee {
	constructor(first_name, last_name, role_id, manager_id) {
		this.first_name = first_name;
		this.last_name = last_name;
		this.role_id = role_id;
		this.manager_id = manager_id;
	}
}
class role {
	constructor(title, salary, department_id) {
		this.title = title;
		this.salary = salary;
		this.department_id = department_id;
	}
}

let listmanagerids = [];
let listrolesids = [];

const connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'root',
	database: 'employeetrackerdb',
});
let listroles = [];
let listManagers = [];
connection.connect(function (err) {
	if (err) throw err;
	init();
	const query = `
    SELECT DISTINCT x.id, CONCAT(x.first_name, " ", x.last_name) 
    AS manager_name 
    FROM employee e 
    INNER JOIN employee x 
    ON e.manager_id = x.id`;
	connection.query(query, function (err, res) {
		if (err) throw err;
		for (let i = 0; i < res.length; i++) {
			listManagers.push(res[i].manager_name);
		}
		listManagers.push('null');
	});
	const query = `
    SELECT id, title 
    FROM role;`;

	connection.query(query, function (err, res) {
		if (err) throw err;
		for (let i = 0; i < res.length; i++) {
			listroles.push(res[i].title);
		}
	});
	const query = `
    SELECT id, name 
    FROM department;`;

	connection.query(query, function (err, res) {
		if (err) throw err;
		for (let i = 0; i < res.length; i++) {
			listdepartments.push(res[i].name);
		}
	});
	const query = `
    SELECT id
    FROM employee;`;

	connection.query(query, function (err, res) {
		if (err) throw err;
		for (let i = 0; i < res.length; i++) {
			listemployeeids.push(res[i].id);
		}
	});
	const query = `
    SELECT first_name
    FROM employee;`;

	connection.query(query, function (err, res) {
		if (err) throw err;
		for (let i = 0; i < res.length; i++) {
			listemployeefirstname.push(res[i].first_name);
		}
	});
	const query = `
    SELECT DISTINCT CONCAT(x.first_name, " ", x.last_name) AS manager_name, x.id AS manager_id 
    FROM employee e
    LEFT JOIN employee x
    ON e.manager_id = x.id`;

	connection.query(query, function (err, res) {
		if (err) throw err;
		for (let i = 0; i < res.length; i++) {
			listmanagerids.push(res[i]);
		}
	});
	const query = `
    SELECT id, title 
    FROM role;`;

	connection.query(query, function (err, res) {
		if (err) throw err;
		for (let i = 0; i < res.length; i++) {
			listrolesids.push(res[i]);
		}
	});
});
const parameters = [{
	type: 'rawlist',
	message: 'What Would You Like To Do?',
	name: 'queryInto',
	choices: [
		'View All Employees',
		'View All Employees By Department',
		'View All Employees By Manager',
		'Add Employee',
		'Remove Employee',
		'Update Employee Role',
		'Update Employee Manager',
		'View All Roles',
		'Add Role',
		'Remove Role',
		'View All Departments',
		'Add Department',
		'Remove Department',
		'View Total Utalized Budget Of A Department',
		'Exit Application',
	],
}, ];

function init() {
	inquirer.prompt(parameters).then(function (data) {
		const options = data.queryInto;
		if (options === 'View All Employees') { viewAllEmployees();
		} else if (options === 'View All Employees By Department') { viewAllEmployeesDept();
		} else if (options === 'View All Employees By Manager') { viewAllEmployeesManager();
		} else if (options === 'Add Employee') { addEmployee();
		} else if (options === 'Remove Employee') { removeEmployee();
		} else if (options === 'Update Employee Role') { updateEmployeeRole();
		} else if (options === 'Update Employee Manager') { updateEmployeeManager();
		} else if (options === 'View All Roles') { viewAllRoles();
		} else if (options === 'Add Role') { addRole();
		} else if (options === 'Remove Role') { removeRole();
		} else if (options === 'View All Departments') { viewAllDept();
		} else if (options === 'Add Department') { addDept();
		} else if (options === 'Remove Department') { removeDept();
		} else if (options === 'View Total Utilized Budget Of A Department') { viewTotalBudget();
		} else { restOfFunctions(); }
	});
}

function viewAllEmployees() {
	const query = `
    SELECT e.id AS employee_id, e.first_name, e.last_name, d.name AS department_name, r.title AS job_title, r.salary, CONCAT(x.first_name, " ", x.last_name) AS manager_name 
    FROM employee e
    LEFT JOIN role r
    ON e.role_id = r.id
    LEFT JOIN department d
    ON d.id = r.department_id
    LEFT JOIN employee x
    ON e.manager_id = x.id`;

	connection.query(query, function (err, res) {
		if (err) throw err;
		console.log(`
		Invalid Entry
		`);
		console.table(res);
		restartApplication();
	});
}

function viewAllEmployeesDept() {
	const query = 'SELECT name FROM department';
	connection.query(query, function (err, res) {
		if (err) throw err;
		inquirer
			.prompt({
				name: 'deptChoice',
				type: 'list',
				message: 'What Department Would You Like To View All Employees Within?',
				choices: listdepartments,
			})
			.then(function (answer) {
				const query2 = `
                    SELECT e.id AS employee_id, e.first_name, e.last_name, d.name AS department_name, r.title AS job_title, r.salary, CONCAT(x.first_name, " ", x.last_name) AS manager_name 
                    FROM employee e
                    LEFT JOIN role r
                    ON e.role_id = r.id
                    LEFT JOIN department d
                    ON d.id = r.department_id
                    LEFT JOIN employee x
                    ON e.manager_id = x.id
                    WHERE name = ?`;
				connection.query(query2, [answer.deptChoice], function (err, res) {
					if (err) throw err;
					console.log(`
					Invalid Entry
					`);
					console.table(res);
					restartApplication();
				});
			});
	});
}

function viewAllEmployeesManager() {
	const query = `
    SELECT DISTINCT CONCAT(x.first_name, " ", x.last_name) AS manager_name 
    FROM employee e
    INNER JOIN employee x
    ON e.manager_id = x.id
    `;
	connection.query(query, function (err, res) {
		if (err) throw err;
		inquirer
			.prompt({
				name: 'managerChoices',
				type: 'list',
				message: 'Who Is The Manager You Want To View All Employees Who Work Under?',
				choices: listManagers,
			})
			.then(function (answer) {
				const query2 = `
                    SELECT e.id AS employee_id, e.first_name, e.last_name, d.name AS department_name, r.title AS job_title, r.salary, CONCAT(x.first_name, " ", x.last_name) AS manager_name 
                    FROM employee e
                    LEFT JOIN role r
                    ON e.role_id = r.id
                    LEFT JOIN department d
                    ON d.id = r.department_id
                    LEFT JOIN employee x
                    ON e.manager_id = x.id
                    HAVING manager_name = ?`;
				connection.query(query2, [answer.managerChoices], function (err, res) {
					if (err) throw err;
					console.table(res);
					restartApplication();
				});
			});
	});
}

function addEmployee() {
	//
	inquirer
		.prompt([{
				name: 'first_name',
				type: 'input',
				message: 'What Is The First Name Of The New Employee?',
				validate: function (valLet) {
					letters = /^[A-Za-z]+$/.test(valLet);
					if (letters) {
						return true;
					} else {
						console.log(
							chalk.redBright(`
							Invalid Entry`)
						);
						return false;
					}
				},
			},
			{
				name: 'last_name',
				type: 'input',
				message: 'What Is The Last Name Of The New Employee?',
				validate: function (valLet) {
					letters = /^[A-Za-z]+$/.test(valLet);
					if (letters) {
						return true;
					} else {
						console.log(
							chalk.redBright(`
                      Invalid Entry`)
						);
						return false;
					}
				},
			},
			{
				name: 'role',
				type: 'list',
				message: 'What Is The Job Title Of This New Employee?',
				choices: listroles,
			},
			{
				name: 'manager',
				type: 'list',
				message: 'Who Is The Manager For This New employee',
				choices: listManagers,
			},
		])
		.then(function (answer) {
			let employeeFirstName = answer.first_name;
			let employeeLastName = answer.last_name;

			function FindRoleID() {
				for (let p = 0; p < listrolesids.length; p++) {
					if (listrolesids[p].title === answer.role) {
						return listrolesids[p].id;
					}
				}
			}

			function FindManagerID() {
				for (let q = 0; q < listmanagerids.length; q++) {
					if (listmanagerids[q].manager_name === answer.manager) {
						return listmanagerids[q].manager_id;
					}
				}
			}
			let employeeRole = FindRoleID();
			let employeeManager = FindManagerID();

			console.log(
				chalk.greenBright(`
			
-------------------------------------------------------------------------------------------------
Adding New Employee ${employeeFirstName} ${employeeLastName} to Database!
-------------------------------------------------------------------------------------------------
			
			`)
			);
			let addnewEmployee = new employee(employeeFirstName, employeeLastName, employeeRole, employeeManager);
			connection.query('INSERT INTO employee SET ?', addnewEmployee, function (err, res) {
				if (err) throw err;
			});
			restartApplication();
		});
}

function removeEmployee() {
	inquirer
		.prompt([{
			name: 'first_name',
			type: 'list',
			message: 'What Is The First Name Of The Employee You Want To Remove?',
			choices: listemployeefirstname,
		}, ])
		.then(function (answer) {
			const query = `
			SELECT last_name 
    		FROM employee
   			WHERE first_name = ?`;

			connection.query(query, [answer.first_name], function (err, res) {
				let firstNameRemove = answer.first_name;
				inquirer
					.prompt([{
						name: 'last_name',
						type: 'list',
						message: 'What Is The Last Name Of The Employee You Want To Remove?',
						choices: function () {
							let lastNameArray = [];
							for (let i = 0; i < res.length; i++) {
								lastNameArray.push(res[i].last_name);
							}
							return lastNameArray;
						},
					}, ])
					.then(function (answer) {
						const query = `
						SELECT id 
    					FROM employee
   						WHERE first_name = ? AND last_name = ?`;
						connection.query(query, [firstNameRemove, answer.last_name], function (err, res) {
							let lastNameRemove = answer.last_name;
							inquirer
								.prompt([{
									name: 'id',
									type: 'list',
									message: 'What Is The Employee ID Number Of The Employee You Want To Remove?',
									choices: function () {
										let listemployeeids = [];
										for (let m = 0; m < res.length; m++) {
											listemployeeids.push(res[m].id);
										}
										return listemployeeids;
									},
								}, ])
								.then(function (answer) {
									let employeeIDRemove = answer.id;
									console.log(
										chalk.yellowBright(`

-------------------------------------------------------------------------------------------------
Employee To Be Removed:
First Name ${firstNameRemove} | Last Name ${lastNameRemove} | Employee ID ${employeeIDRemove}
-------------------------------------------------------------------------------------------------

									`)
									);
									inquirer
										.prompt([{
											name: 'ensureRemove',
											type: 'list',
											message: `Are You Sure You Want To Remove Employee: ${firstNameRemove} ${lastNameRemove}, ID#: ${employeeIDRemove}?`,
											choices: ['YES', 'NO'],
										}, ])
										.then(function (answer) {
											if (answer.ensureRemove === 'YES') {
												console.log(
													chalk.redBright(`

-------------------------------------------------------------------------------------------------
Employee: ${firstNameRemove} ${lastNameRemove}, ID#: ${employeeIDRemove} Has Been Removed
-------------------------------------------------------------------------------------------------
												
												`)
												);
												connection.query(
													'DELETE FROM employee WHERE first_name = ? AND last_name = ? AND id = ?',
													[firstNameRemove, lastNameRemove, employeeIDRemove],

													function (err, res) {
														if (err) throw err;
														restartApplication();
													}
												);
											} else {
												console.log(
													chalk.blueBright(`

-------------------------------------------------------------------------------------------------
Removal Request Has Been Aborted
-------------------------------------------------------------------------------------------------
												
												`)
												);
												restartApplication();
											}
										});
								});
						});
					});
			});
		});
}

//*Update Employee Role
function updateEmployeeRole() {
	inquirer
		.prompt([{
			name: 'first_name',
			type: 'list',
			message: 'What Is The First Name Of The Employee That You Want to Update Their Role?',
			choices: listemployeefirstname,
		}, ])
		.then(function (answer) {
			const query = `
			SELECT last_name 
    		FROM employee
   			WHERE first_name = ?`;

			connection.query(query, [answer.first_name], function (err, res) {
				let firstNameRoleUpdate = answer.first_name;
				inquirer
					.prompt([{
						name: 'last_name',
						type: 'list',
						message: 'What Is The Last Name Of The Employee That You Want to Update Their Role?',
						choices: function () {
							let lastNameArray = [];
							for (let i = 0; i < res.length; i++) {
								lastNameArray.push(res[i].last_name);
							}
							return lastNameArray;
						},
					}, ])
					.then(function (answer) {
						let lastNameRoleUpdate = answer.last_name;
						const query = `
						SELECT id 
    					FROM employee
   						WHERE first_name = ? AND last_name = ?`;

						connection.query(query, [firstNameRoleUpdate, lastNameRoleUpdate], function (err, res) {
							inquirer
								.prompt([{
									name: 'id',
									type: 'list',
									message: 'What Is The Employee ID Number Of The Employee That You Want to Update Their Role?',
									choices: function () {
										let listemployeeids = [];
										for (let m = 0; m < res.length; m++) {
											listemployeeids.push(res[m].id);
										}
										return listemployeeids;
									},
								}, ])
								.then(function (answer) {
									let employeeIDRoleUpdate = answer.id;
									inquirer
										.prompt([{
											name: 'role_title',
											type: 'list',
											message: 'What Is The New Role You Want To Update For This Employee?',
											choices: listroles,
										}, ])
										.then(function (answer) {
											let newTitleRoleUpdate = answer.role_title;

											function FindNewRoleID() {
												for (let q = 0; q < listrolesids.length; q++) {
													if (listrolesids[q].title === answer.role_title) {
														return listrolesids[q].id;
													}
												}
											}

											let updateroleID = FindNewRoleID();

											console.log(
												chalk.yellowBright(`
			
-------------------------------------------------------------------------------------------------
Employee Role Update Request:
First Name: ${firstNameRoleUpdate} | Last Name: ${lastNameRoleUpdate} | New Role Title: ${newTitleRoleUpdate}
-------------------------------------------------------------------------------------------------
						
						`)
											);
											inquirer
												.prompt([{
													name: 'ensureRemove',
													type: 'list',
													message: `Are You Sure You Want To Update This Employee Role: ${firstNameRoleUpdate} ${lastNameRoleUpdate}, New Role Title: ${newTitleRoleUpdate}?`,
													choices: ['YES', 'NO'],
												}, ])
												.then(function (answer) {
													if (answer.ensureRemove === 'YES') {
														console.log(
															chalk.redBright(`
			
-------------------------------------------------------------------------------------------------
Employee: ${firstNameRoleUpdate} ${lastNameRoleUpdate}, New Role Title: ${newTitleRoleUpdate} Has Been Updated
-------------------------------------------------------------------------------------------------

								`)
														);
														connection.query(
															'UPDATE employee SET role_id = ? WHERE first_name = ? AND last_name = ? AND id = ?',
															[updateroleID, firstNameRoleUpdate, lastNameRoleUpdate, employeeIDRoleUpdate],

															function (err, res) {
																if (err) throw err;

																console.log(
																	chalk.cyanBright(`
			
-------------------------------------------------------------------------------------------------
Now That You Have Updated Employee: ${firstNameRoleUpdate} ${lastNameRoleUpdate}, Don't Forget To Update Their Manager If Necessary
-------------------------------------------------------------------------------------------------
								
								`)
																);

																restartApplication();
															}
														);
													} else {
														console.log(
															chalk.blueBright(`
			
-------------------------------------------------------------------------------------------------
Update Employee Role Request Has Been Aborted
-------------------------------------------------------------------------------------------------
								
								`)
														);
														restartApplication();
													}
												});
											//
										});
								});
						});
					});
			});
		});
}

function updateEmployeeManager() {
	Enquirer
		.prompt([{
			name: 'first_name',
			type: 'list',
			message: 'What Is The First Name Of The Employee That You Want to Update Their Manager?',
			choices: listemployeefirstname,
		}, ])
		.then(function (answer) {
			const query = `
			SELECT last_name 
    		FROM employee
   			WHERE first_name = ?`;
			connection.query(query, [answer.first_name], function (err, res) {
				let firstNameManagerUpdate = answer.first_name;
				Enquirer
					.prompt([{
						name: 'last_name',
						type: 'list',
						message: 'What Is The Last Name Of The Employee That You Want to Update Their Manager?',
						choices: function () {
							let lastNameArray = [];
							for (let i = 0; i < res.length; i++) {
								lastNameArray.push(res[i].last_name);
							}
							return lastNameArray;
						},
					}, ])
					.then(function (answer) {
						let lastNameManagerUpdate = answer.last_name;
						const query = `
						SELECT id 
    					FROM employee
   						WHERE first_name = ? AND last_name = ?`;
						connection.query(query, [firstNameManagerUpdate, lastNameManagerUpdate], function (err, res) {
							Enquirer
								.prompt([{
									name: 'id',
									type: 'list',
									message: 'What Is The Employee ID Number Of The Employee That You Want to Update Their Manager?',
									choices: function () {
										let listemployeeids = [];
										for (let m = 0; m < res.length; m++) {
											listemployeeids.push(res[m].id);
										}
										return listemployeeids;
									},
								}, ])
								.then(function (answer) {
									let employeeIDManagerUpdate = answer.id;
									Enquirer
										.prompt([{
											name: 'manager_name',
											type: 'list',
											message: 'Who Is The New Manager You Want To Update For This Employee?',
											choices: listManagers,
										}, ])
										.then(function (answer) {
											let newManagerUpdate = answer.manager_name || null;

											function FindNewManagerID() {
												for (let q = 0; q < listmanagerids.length; q++) {
													if (listmanagerids[q].manager_name === answer.manager_name) {
														return listmanagerids[q].manager_id;
													}
												}
											}

											let updateManagerID = FindNewManagerID();

											console.log(
												chalk.yellowBright(`
			
-------------------------------------------------------------------------------------------------
Employee Manager Update Request:
First Name: ${firstNameManagerUpdate} | Last Name: ${lastNameManagerUpdate} | New Manager: ${newManagerUpdate}
-------------------------------------------------------------------------------------------------
						
						`)
											);
											Enquirer
												.prompt([{
													name: 'ensureRemove',
													type: 'list',
													message: `Are You Sure You Want To Update This Employee Manager: ${firstNameManagerUpdate} ${lastNameManagerUpdate}, New Manager Title: ${newManagerUpdate}?`,
													choices: ['YES', 'NO'],
												}, ])
												.then(function (answer) {
													if (answer.ensureRemove === 'YES') {
														//
														console.log(
															chalk.redBright(`
			
-------------------------------------------------------------------------------------------------
Employee: ${firstNameManagerUpdate} ${lastNameManagerUpdate} Has Been Updated With The New Manager: ${newManagerUpdate} 
-------------------------------------------------------------------------------------------------
								
								`)
														);
														connection.query(
															'UPDATE employee SET manager_id = ? WHERE first_name = ? AND last_name = ? AND id = ?',
															[updateManagerID, firstNameManagerUpdate, lastNameManagerUpdate, employeeIDManagerUpdate],

															function (err, res) {
																if (err) throw err;

																console.log(
																	chalk.cyanBright(`
			
-------------------------------------------------------------------------------------------------
Now That You Have Updated The Manager Of Employee: ${firstNameManagerUpdate} ${lastNameManagerUpdate}, Don't Forget To Update Their Role If Necessary
-------------------------------------------------------------------------------------------------
								
								`)
																);

																restartApplication();
															}
														);
													} else {
														console.log(
															chalk.blueBright(`
			
-------------------------------------------------------------------------------------------------
Update Employee Manager Request Has Been Aborted
-------------------------------------------------------------------------------------------------
								
								`)
														);
														restartApplication();
													}
												});
										});
								});
						});
					});
			});
		});
}

function viewAllRoles() {
	const query = `
    SELECT * FROM role`;

	connection.query(query, function (err, res) {
		if (err) throw err;
		console.table(res);

		restartApplication();
	});
}

function addRole() {
	Enquirer
		.prompt([{
				name: 'newRole',
				type: 'input',
				message: 'What Is The Title Of The New Role You Want To Add?',
			},
			{
				name: 'newRoleSalary',
				type: 'number',
				message: 'What Is The Salary Of This New Role?',
			},
		])
		.then(function (answer) {
			let newRoleName = answer.newRole;
			let newRoleSalary = answer.newRoleSalary;
			let newRoleID = listroles.length + 1;

			console.log(
				chalk.greenBright(`
-------------------------------------------------------------------------------------------------
Adding New Role | Role Title: ${newRoleName} | Role Salary ${newRoleSalary} | Role ID ${newRoleID} to Database!
-------------------------------------------------------------------------------------------------
			`)
			);
			let addNewRole = new role(newRoleName, newRoleSalary, newRoleID);
			connection.query('INSERT INTO role SET ?', addNewRole, function (err, res) {
				if (err) throw err;
			});
			restartApplication();
		});
}

function removeRole() {
	Enquirer
		.prompt([{
			name: 'removeRole',
			type: 'list',
			message: 'What Role Do You Want To Remove?',
			choices: listroles,
		}, ])
		.then(function (answer) {
			connection.query('DELETE FROM role WHERE title = ?', [answer.removeRole], function (err, res) {
				if (err) throw err;
				console.log(
					chalk.redBright(`
-------------------------------------------------------------------------------------------------
The ${answer.removeRole} Role Has Been Removed From The DB
-------------------------------------------------------------------------------------------------
				`)
				);
			});
			restartApplication();
		});
}

function viewAllDept() {
	const query = `
    SELECT * FROM department`;

	connection.query(query, function (err, res) {
		if (err) throw err;
		console.table(res);

		restartApplication();
	});
}

function addDept() {
	Enquirer
		.prompt([{
			name: 'newDept',
			type: 'input',
			message: 'What Is The Name Of This New Department?',
		}, ])
		.then(function (answer) {
			let updatedDeptName = answer.newDept;
			let updateDeptID = listdepartments.length + 1;

			console.log(
				chalk.greenBright(`
			
-------------------------------------------------------------------------------------------------
Adding New Department | Department Name: ${updatedDeptName} | Department ID ${updateDeptID} to Database!
-------------------------------------------------------------------------------------------------
			
			`)
			);
			let addNewDept = new department(updatedDeptName, updateDeptID);
			connection.query('INSERT INTO department SET ?', addNewDept, function (err, res) {
				if (err) throw err;
			});
			restartApplication();
		});
}

function removeDept() {
	Enquirer
		.prompt([{
			name: 'removeDept',
			type: 'list',
			message: 'What Department Do You Want To Remove?',
			choices: listdepartments,
		}, ])
		.then(function (answer) {
			connection.query('DELETE FROM department WHERE name = ?', [answer.removeDept], function (err, res) {
				if (err) throw err;
				console.log(
					chalk.redBright(`
-------------------------------------------------------------------------------------------------
The ${answer.removeDept} Department Has Been Removed From The DB
-------------------------------------------------------------------------------------------------
				`)
				);
			});
			restartApplication();
		});
}

function viewTotalBudget() {
	Enquirer
		.prompt({
			name: 'deptChoice',
			type: 'list',
			message: 'What Department Would You Like To View The Total Utalized Budget?',
			choices: listdepartments,
		})
		.then(function (answer) {
			const query = `
			SELECT d.name AS Department_Name, SUM(r.salary) AS Total_Budget
            FROM employee e
            LEFT JOIN role r
            ON e.role_id = r.id
            LEFT JOIN department d
            ON d.id = r.department_id
            GROUP BY d.name
            HAVING d.name = ?`;
			connection.query(query, [answer.deptChoice], function (err, res) {
				if (err) throw err;
				console.log(`
		
					`);
				console.table(res);
				restartApplication();
			});
		});
}

function restOfFunctions() {
	console.log("Application Exit")
	connection.end();
}

function restartApplication() {
	Enquirer
		.prompt({
			name: 'rerun',
			type: 'list',
			message: 'Would You Like To Return To The Main Menu Or Exit The Application?',
			choices: ['Return To Main Menu', 'Exit Application'],
		})
		.then(function (data) {
			const reRunQ = data.rerun;
			if (reRunQ === 'Return To Main Menu') {
				init();
			} else {
				restOfFunctions();
			}
		});
}