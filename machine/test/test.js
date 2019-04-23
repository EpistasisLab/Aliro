process.env.MACHINE_CONFIG = './test/test_machine_config.json'
const machine_utils = require('../machine_utils.js');
const assert = require('assert');

var algorithms = ["DecisionTreeClassifier","GradientBoostingClassifier","KNeighborsClassifier"]
var project_list = machine_utils.getProjects(algorithms)
var projects = {};
project_list.forEach(function (value, i) {
    projects[algorithms[i]] = value;
});

describe('Mocha Test for getProjects function', function () {
  it('Test the total number of algorithms is the same with config.', function () {
        assert.equal(project_list.length, algorithms.length);
    });

  it('Test the name and order of algorithms is the same with config.', () => {
        for (var i in project_list) {
            var algo = project_list[i].name;
            var algo_conf = algorithms[i];
            assert.equal(algo_conf, algo);
        }
    });

});

describe('Mocha Test for getCapacity function', function () {
  it('Test getCapacity returns the correct capacity.', function () {
        assert.equal(machine_utils.getCapacity("DecisionTreeClassifier", 1, projects), 1);
    });

  it('Test getCapacity returns the correct capacity when maxCapacity=2.', function () {
        assert.equal(machine_utils.getCapacity("GradientBoostingClassifier", 2, projects), 2);
    });
});


describe('Mocha Test for checkCapacity function', function () {
  it('Test checkCapacity returns the correct values.', function () {
        ret = machine_utils.checkCapacity("DecisionTreeClassifier", 0, projects);
        assert.equal(ret.capacity, 0);
        assert.equal(ret.error_msg.error, "No capacity available");
    });

  it('Test checkCapacity returns the correct values when projId is not defined', function () {
        ret = machine_utils.checkCapacity("DecisionTreeClassifie", 2, projects);
        assert.equal(ret.capacity, 0);
        assert.equal(ret.error_msg.error, "Project 'DecisionTreeClassifie' does not exist");
    });

});

describe('Mocha Test for sendJSONResults function', function () {
  it('Test sendJSONResults returns the correct values.', function () {
        ret = machine_utils.sendJSONResults("machine/test/test_machine_config.json", "test_url");
        assert.equal(ret.uri, "test_url");
        assert.equal(ret.method, "PUT");
        assert.equal(ret.gzip, true);
        for (var i in ret.json["algorithms"]) {
            var algo = project_list[i].name;
            var algo_conf = algorithms[i];
            assert.equal(algo_conf, algo);
        }
    });

});

describe('Mocha Test for sendFileResults function', function () {
  it('Test sendFileResults returns the correct values.', function () {
        ret = machine_utils.sendFileResults("machine/test/iris_binary.tsv", "test_url");
        assert.equal(ret.uri, "test_url");
        assert.equal(ret.method, "PUT");
        assert.equal(ret.gzip, true);
    });

});
