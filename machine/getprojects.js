//Generate a list of projects based on machine_config.json
var fs = require("mz/fs");
var machine_config_file = process.env.MACHINE_CONFIG
console.log("Machine config:", machine_config_file)

var getProjects = function() {
    var project_list = [];
    var machine_config = JSON.parse(fs.readFileSync(machine_config_file, 'utf-8'));
    var algorithms = machine_config["algorithms"]

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
