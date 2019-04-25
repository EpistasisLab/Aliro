//Generate a list of projects based on machine_config.json
var getProjects = function(algorithms) {
    var project_list = [];
    for (var i in algorithms) {
        var algo = algorithms[i];
        console.log("Register algorithm " + algo)
        var project = {
            name: algo,
            command: "python",
            cwd: "machine/learn/",
            args: ["driver.py",  algo],
            options: "double-dash",
            capacity: "1",
            results: "machine/learn/tmp/" + algo
        }
        project_list.push(project);
    }
    return project_list;
}

//Return the residual capacity in machine
var getCapacity = function(projId, maxCapacity, projects) {
    var capacity = 0;
    if (projects[projId]) {
        capacity = Math.floor(maxCapacity / projects[projId].capacity);
    }
    return capacity;
};


//Check capacity in machine
var checkCapacity = function(projId, maxCapacity, projects) {
    var error_msg = {};
    var capacity = 0;
    if(typeof projects[projId] === 'undefined') {
        error_msg = {
            error: "Project '" + projId + "' does not exist"
        };
    } else {
        var capacity = getCapacity(projId, maxCapacity, projects);
        if (capacity === 0) {
            error_msg = {
                error: "No capacity available"
            };
        }
    }
    return {
      error_msg: error_msg,
      capacity: capacity
    };
};





exports.getProjects = getProjects;
exports.getCapacity = getCapacity;
exports.checkCapacity = checkCapacity;
