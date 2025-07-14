const mockData = {
    current_region: 'us-east-1',
    totalCost: 127.45,
    costPeriod: {start: '2024-01-01', end: '2024-01-31'},
    ec2Instances: [
      {id: 'i-1234567890abcdef0', type: 't3.medium', launchTime: '2024-01-15T10:30:00Z', status: 'running'},
      {id: 'i-0987654321fedcba0', type: 't2.micro', launchTime: '2024-01-20T14:20:00Z', status: 'stopped'}
    ],
    rdsInstances: [
      { identifier: 'mydb-prod', engine: 'MySQL', version: '8.0.35', class: 'db.t3.micro', status: 'available', storage: 20 },
    ],
    s3Buckets: [
      { name: 'my-app-data', size: 15.7 },
      { name: 'backup-bucket', size: 2.3 },
      { name: 'logs-storage', size: 8.9 }
    ],
    lambdaFunctions: [
      { name: 'data-processor', runtime: 'python3.9', memory: 512, timeout: 300, lastModified: '2024-01-25T09:15:00Z' },
      { name: 'api-handler', runtime: 'nodejs18.x', memory: 256, timeout: 30, lastModified: '2024-01-28T16:45:00Z' }
    ],
    loadBalancers: [
      { name: 'app-alb', type: 'ALB', scheme: 'internet-facing', state: 'active' },
      { name: 'internal-nlb', type: 'NLB', scheme: 'internal', state: 'active' }
    ],
    ebsVolumes: [
      { id: 'vol-1234567890abcdef0', size: 30, type: 'gp3', state: 'in-use', attachedTo: 'i-1234567890abcdef0' },
      { id: 'vol-0987654321fedcba0', size: 100, type: 'gp2', state: 'available', attachedTo: null }
    ],
    elasticIPs: [
      { ip: '54.123.45.67', instanceId: 'i-1234567890abcdef0', status: 'attached' },
      { ip: '34.98.76.54', instanceId: null, status: 'unattached' }
    ],
    vpcResources: {
      vpcs: 2,
      natGateways: 1,
      internetGateways: 2
    },
    serviceCosts: [
      { service: 'Amazon Elastic Compute Cloud - Compute', cost: 45.23 },
      { service: 'Amazon Simple Storage Service', cost: 23.17 },
      { service: 'Amazon Relational Database Service', cost: 18.45 },
      { service: 'Amazon Virtual Private Cloud', cost: 15.30 },
      { service: 'AWS Lambda', cost: 8.67 },
      { service: 'Elastic Load Balancing', cost: 12.34 },
      { service: 'Amazon Elastic Block Store', cost: 4.29 }
    ]
  };

export default mockData;