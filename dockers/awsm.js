var aws = require('aws-sdk');
aws.config.update({
    region: 'us-east-2'
});
cloudformation = new aws.CloudFormation();
var p = {
    TemplateURL: 'https://s3.us-east-2.amazonaws.com/pennai-docker-files/cluster.json',
    Parameters: [{
        "ParameterValue": "",
        "ParameterKey": "EcsEndpoint"
    }, {
        "ParameterValue": "ecsInstanceRole",
        "ParameterKey": "IamRoleInstanceProfile"
    }, {
        "ParameterValue": "80",
        "ParameterKey": "SecurityIngressFromPort"
    }, {
        "ParameterValue": "subnet-6e106707,subnet-6148f51a,subnet-825c91cf",
        "ParameterKey": "SubnetIds"
    }, {
        "ParameterValue": "",
        "ParameterKey": "SubnetCidr3"
    }, {
        "ParameterValue": "",
        "ParameterKey": "SpotPrice"
    }, {
        "ParameterValue": "10.0.1.0/24",
        "ParameterKey": "SubnetCidr2"
    }, {
        "ParameterValue": "10.0.0.0/24",
        "ParameterKey": "SubnetCidr1"
    }, {
        "ParameterValue": "0.0.0.0/0",
        "ParameterKey": "SecurityIngressCidrIp"
    }, {
        "ParameterValue": "10.0.0.0/16",
        "ParameterKey": "VpcCidr"
    }, {
        "ParameterValue": "m4.large",
        "ParameterKey": "EcsInstanceType"
    }, {
        "ParameterValue": "diversified",
        "ParameterKey": "SpotAllocationStrategy"
    }, {
        "ParameterValue": "us-east-2a,us-east-2b,us-east-2c",
        "ParameterKey": "VpcAvailabilityZones"
    }, {
        "ParameterValue": "80",
        "ParameterKey": "SecurityIngressToPort"
    }, {
        "ParameterValue": "22",
        "ParameterKey": "EbsVolumeSize"
    }, {
        "ParameterValue": "sg-8c0e32e5",
        "ParameterKey": "SecurityGroupId"
    }, {
        "ParameterValue": "false",
        "ParameterKey": "UseSpot"
    }, {
        "ParameterValue": "upenn",
        "ParameterKey": "KeyName"
    }, {
        "ParameterValue": "",
        "ParameterKey": "IamSpotFleetRoleName"
    }, {
        "ParameterValue": "vpc-524f2e3b",
        "ParameterKey": "VpcId"
    }, {
        "ParameterValue": "10",
        "ParameterKey": "AsgMaxSize"
    }, {
        "ParameterValue": "gp2",
        "ParameterKey": "EbsVolumeType"
    }, {
        "ParameterValue": "ami-58f5db3d",
        "ParameterKey": "EcsAmiId"
    }, {
        "ParameterValue": "/dev/xvdcz",
        "ParameterKey": "DeviceName"
    }]
};
exports.makeStack = function(name, size, callback) {
    var params = p;
    params['StackName'] = name;

    params['Parameters'].push({
        "ParameterValue": name,
        "ParameterKey": "EcsClusterName"
    });
    params['Parameters'].push({
        "ParameterValue": size.toString(),
        "ParameterKey": "AsgMaxSize"
    });
    cloudformation.createStack(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            callback(false);
        } else callback(data); // successful response
    });
}
exports.rmStack = function(name, callback) {
    var params = {}
    params['StackName'] = name;
    cloudformation.deleteStack(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            callback(false);
        } else callback(data); // successful response
    });
}
exports.grokStack = function(name, callback) {
    var params = {}
    params['StackName'] = name;
    cloudformation.describeStacks(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            callback(false);
        } else callback(data); // successful response
    });
}
