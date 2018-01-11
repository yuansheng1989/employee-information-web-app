const Sequelize = require('sequelize');

var sequelize = new Sequelize('deleh7tn71o0es', 'altgtfsnjyupen', '2707f91c50f08c8361604f7768d75b062985e37ee9c284de199d8efda298791c', {
    host: 'ec2-107-21-95-70.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    }
});

var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    last_name: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addresCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
});

var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
});

module.exports.initialize = function() {
    return new Promise(function(resolve,reject) {
        sequelize.sync()
        .then(function() {
            resolve();
        })
        .catch(function() {
            reject('unable to sync the database');
        });
    });
}

module.exports.getAllEmployees = function() {
    return new Promise(function(resolve,reject) {
        Employee.findAll({
            order: ["employeeNum"]
        })
        .then(function(data) {
            resolve(data);
        })
        .catch(function() {
            reject('no results returned');
        });
    });
}

module.exports.getEmployeesByStatus = function(status) {
    return new Promise(function(resolve,reject) {
        Employee.findAll({
            where: {
                status: status
            },
            order: ["employeeNum"]
        })
        .then(function(data) {
            resolve(data);
        })
        .catch(function() {
            reject('no results returned');
        });
    });
}

module.exports.getEmployeesByDepartment = function(department) {
    return new Promise(function(resolve,reject) {
        Employee.findAll({
            where: {
                department: department
            },
            order: ["employeeNum"]
        })
        .then(function(data) {
            resolve(data);
        })
        .catch(function() {
            reject('no results returned');
        });
    });
}

module.exports.getEmployeesByManager = function(manager) {
    return new Promise(function(resolve,reject) {
        Employee.findAll({
            where: {
                employeeManagerNum: manager
            },
            order: ["employeeNum"]
        })
        .then(function(data) {
            resolve(data);
        })
        .catch(function() {
            reject('no results returned');
        });
    });
}

module.exports.getEmployeeByNum = function(num) {
    return new Promise(function(resolve,reject) {
        Employee.findAll({
            where: {
                employeeNum: num
            },
            order: ["employeeNum"]
        })
        .then(function(data) {
            resolve(data[0]);
        })
        .catch(function() {
            reject('no results returned');
        });
    });
}

module.exports.getManagers = function() {
    return new Promise(function(resolve,reject) {
        Employee.findAll({
            where: {
                isManager: true
            },
            order: ["employeeNum"]
        })
        .then(function(data) {
            resolve(data);
        })
        .catch(function() {
            reject('no results returned');
        });
     });
}

module.exports.getDepartments = function() {
    return new Promise(function(resolve,reject) {
        Department.findAll({
            order: ["departmentId"]
        })
        .then(function(data) {
            resolve(data);
        })
        .catch(function() {
            reject('no results returned');
        });
    });
}

module.exports.addEmployee = function(employeeData) {
    return new Promise(function(resolve,reject) {
        // make sure the isManager property is set properly
        employeeData.isManager = (employeeData.isManager) ? true : false;
        // ensure that any blank values ("") for properties are set to null
        for (let i in employeeData) {
            if (employeeData[i] === "") {
                employeeData[i] = null;
            }
        }

        Employee.create(employeeData)
        .then(function() {
            resolve();
        })
        .catch(function() {
            reject('unable to create employee');
        });
    });
}

module.exports.updateEmployee = function(employeeData) {
    return new Promise(function(resolve,reject) {
        // make sure the isManager property is set properly
        employeeData.isManager = (employeeData.isManager) ? true : false;
        // ensure that any blank values ("") for properties are set to null
        for (let i in employeeData) {
            if (employeeData[i] === "") {
                employeeData[i] = null;
            }
        }

        Employee.update(employeeData, {
            where: {employeeNum: employeeData.employeeNum}
        })
        .then(function() {
            resolve();
        })
        .catch(function() {
            reject('unable to update employee');
        });
    });
}

module.exports.addDepartment = function(departmentData) {
    return new Promise(function(resolve,reject) {
        // ensure that any blank values ("") for properties are set to null
        for (let i in departmentData) {
            if (departmentData[i] === "") {
                departmentData[i] = null;
            }
        }

        Department.create(departmentData)
        .then(function() {
            resolve();
        })
        .catch(function() {
            reject('unable to create department');
        });
    });
}

module.exports.updateDepartment = function(departmentData) {
    return new Promise(function(resolve,reject) {
        // ensure that any blank values ("") for properties are set to null
        for (let i in departmentData) {
            if (departmentData[i] === "") {
                departmentData[i] = null;
            }
        }

        Department.update(departmentData, {
            where: {departmentId: departmentData.departmentId}
        })
        .then(function() {
            resolve();
        })
        .catch(function(err) {
            reject('unable to update department');
        });
    });
}

module.exports.getDepartmentById = function(id) {
    return new Promise(function(resolve,reject) {
        Department.findAll({
            where: {
                departmentId: id
            },
            order: ["departmentId"]
        })
        .then(function(data) {
            resolve(data[0]);
        })
        .catch(function() {
            reject('no results returned');
        });
    });
}

module.exports.deleteEmployeeByNum = function(num) {
    return new Promise(function(resolve,reject) {
        Employee.destroy({
            where: {employeeNum: num}
        })
        .then(function() {
            resolve();
        })
        .catch(function() {
            reject('unable to delete employee')
        });
    });
}