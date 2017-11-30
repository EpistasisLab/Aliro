var AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-2'
});
var ec2 = new AWS.EC2();

var params = {
  MaxCount: 0, /* required */
  MinCount: 0, /* required */
  AdditionalInfo: 'STRING_VALUE',
  BlockDeviceMappings: [
    {
      DeviceName: 'STRING_VALUE',
      Ebs: {
        DeleteOnTermination: true || false,
        Encrypted: true || false,
        Iops: 0,
        KmsKeyId: 'STRING_VALUE',
        SnapshotId: 'STRING_VALUE',
        VolumeSize: 0,
        VolumeType: standard | io1 | gp2 | sc1 | st1
      },
      NoDevice: 'STRING_VALUE',
      VirtualName: 'STRING_VALUE'
    },
    /* more items */
  ],
  ClientToken: 'STRING_VALUE',
  DisableApiTermination: true || false,
  DryRun: true || false,
  EbsOptimized: true || false,
  ElasticGpuSpecification: [
    {
      Type: 'STRING_VALUE' /* required */
    },
    /* more items */
  ],
  IamInstanceProfile: {
    Arn: 'STRING_VALUE',
    Name: 'STRING_VALUE'
  },
  ImageId: 'STRING_VALUE',
  InstanceInitiatedShutdownBehavior: stop | terminate,
  InstanceMarketOptions: {
    MarketType: spot,
    SpotOptions: {
      BlockDurationMinutes: 0,
      InstanceInterruptionBehavior: hibernate | stop | terminate,
      MaxPrice: 'STRING_VALUE',
      SpotInstanceType: one-time | persistent,
      ValidUntil: new Date || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789
    }
  },
  InstanceType: t1.micro | t2.nano | t2.micro | t2.small | t2.medium | t2.large | t2.xlarge | t2.2xlarge | m1.small | m1.medium | m1.large | m1.xlarge | m3.medium | m3.large | m3.xlarge | m3.2xlarge | m4.large | m4.xlarge | m4.2xlarge | m4.4xlarge | m4.10xlarge | m4.16xlarge | m2.xlarge | m2.2xlarge | m2.4xlarge | cr1.8xlarge | r3.large | r3.xlarge | r3.2xlarge | r3.4xlarge | r3.8xlarge | r4.large | r4.xlarge | r4.2xlarge | r4.4xlarge | r4.8xlarge | r4.16xlarge | x1.16xlarge | x1.32xlarge | x1e.xlarge | x1e.2xlarge | x1e.4xlarge | x1e.8xlarge | x1e.16xlarge | x1e.32xlarge | i2.xlarge | i2.2xlarge | i2.4xlarge | i2.8xlarge | i3.large | i3.xlarge | i3.2xlarge | i3.4xlarge | i3.8xlarge | i3.16xlarge | hi1.4xlarge | hs1.8xlarge | c1.medium | c1.xlarge | c3.large | c3.xlarge | c3.2xlarge | c3.4xlarge | c3.8xlarge | c4.large | c4.xlarge | c4.2xlarge | c4.4xlarge | c4.8xlarge | c5.large | c5.xlarge | c5.2xlarge | c5.4xlarge | c5.9xlarge | c5.18xlarge | cc1.4xlarge | cc2.8xlarge | g2.2xlarge | g2.8xlarge | g3.4xlarge | g3.8xlarge | g3.16xlarge | cg1.4xlarge | p2.xlarge | p2.8xlarge | p2.16xlarge | p3.2xlarge | p3.8xlarge | p3.16xlarge | d2.xlarge | d2.2xlarge | d2.4xlarge | d2.8xlarge | f1.2xlarge | f1.16xlarge,
  Ipv6AddressCount: 0,
  Ipv6Addresses: [
    {
      Ipv6Address: 'STRING_VALUE'
    },
    /* more items */
  ],
  KernelId: 'STRING_VALUE',
  KeyName: 'STRING_VALUE',
  LaunchTemplate: {
    LaunchTemplateId: 'STRING_VALUE',
    LaunchTemplateName: 'STRING_VALUE',
    Version: 'STRING_VALUE'
  },
  Monitoring: {
    Enabled: true || false /* required */
  },
  NetworkInterfaces: [
    {
      AssociatePublicIpAddress: true || false,
      DeleteOnTermination: true || false,
      Description: 'STRING_VALUE',
      DeviceIndex: 0,
      Groups: [
        'STRING_VALUE',
        /* more items */
      ],
      Ipv6AddressCount: 0,
      Ipv6Addresses: [
        {
          Ipv6Address: 'STRING_VALUE'
        },
        /* more items */
      ],
      NetworkInterfaceId: 'STRING_VALUE',
      PrivateIpAddress: 'STRING_VALUE',
      PrivateIpAddresses: [
        {
          PrivateIpAddress: 'STRING_VALUE', /* required */
          Primary: true || false
        },
        /* more items */
      ],
      SecondaryPrivateIpAddressCount: 0,
      SubnetId: 'STRING_VALUE'
    },
    /* more items */
  ],
  Placement: {
    Affinity: 'STRING_VALUE',
    AvailabilityZone: 'STRING_VALUE',
    GroupName: 'STRING_VALUE',
    HostId: 'STRING_VALUE',
    SpreadDomain: 'STRING_VALUE',
    Tenancy: default | dedicated | host
  },
  PrivateIpAddress: 'STRING_VALUE',
  RamdiskId: 'STRING_VALUE',
  SecurityGroupIds: [
    'STRING_VALUE',
    /* more items */
  ],
  SecurityGroups: [
    'STRING_VALUE',
    /* more items */
  ],
  SubnetId: 'STRING_VALUE',
  TagSpecifications: [
    {
      ResourceType: customer-gateway | dhcp-options | image | instance | internet-gateway | network-acl | network-interface | reserved-instances | route-table | snapshot | spot-instances-request | subnet | security-group | volume | vpc | vpn-connection | vpn-gateway,
      Tags: [
        {
          Key: 'STRING_VALUE',
          Value: 'STRING_VALUE'
        },
        /* more items */
      ]
    },
    /* more items */
  ],
  UserData: 'STRING_VALUE'
};
ec2.runInstances(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
