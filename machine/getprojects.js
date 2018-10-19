//Generate a list of projects based on machine_config.json
var getProjects = function(algorithms) {
    var project_list = [];
    for (var i in algorithms) {
        var algo = algorithms[i];
        console.log("Register " + algo)
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

module.exports = getProjects;
