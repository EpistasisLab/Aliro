var AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-2'
});
var ec2 = new AWS.EC2();
exports.makeForum = function(forum) {
var params = {
  MaxCount: 1, /* required */
  MinCount: 1, /* required */
  ImageId: 'ami-7f735a1a',
  InstanceType: 't2.medium',
   IamInstanceProfile: {
    Name: "ecsInstanceRole"
   },
//  Placement: {
//    AvailabilityZone: 'us-east-2',
//  },
  SecurityGroups: [
 //   'STRING_VALUE',
    'ssh','backend'
    /* more items */
 ],
//  SubnetId: 'STRING_VALUE',
  TagSpecifications: [
    {
      ResourceType: 'instance',
      Tags: [
        {
          Key: 'forum',
          Value: forum 
        },
        {
          Key: 'Name',
          Value: forum
        }
      ]
    },
    /* more items */
  ],
  UserData: new Buffer("#!/bin/bash\necho ECS_CLUSTER="+forum+" >> /etc/ecs/ecs.config\n").toString('base64')

};
ec2.runInstances(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
}
