import boto3
from datetime import datetime, timedelta
from botocore.exceptions import ClientError


def check_current_region():
    session = boto3.Session()
    current_region = session.region_name
    print(f"Current AWS region: {current_region}")
    
def get_aws_costs():
    try:
        # Get the Cost Explorer client
        cost_client = boto3.client('ce')
        # Specify today
        today = datetime.now()
        # Specify the start day as the first day of the month
        start_date = today.replace(day = 1).strftime("%Y-%m-%d")
        # Specify the end day as the tomorrow so today can be inclusive
        end_date = (today + timedelta(days = 1)).strftime("%Y-%m-%d")

        response = cost_client.get_cost_and_usage(
            TimePeriod = {
                'Start': start_date,
                'End': end_date,
            },
            # The detail for cost data is set to MONTHLY (Ex: DAILY, HOURLY)
            Granularity = 'MONTHLY',
            # UnblendedCost refers to the raw cost without any discounts for credits applied
            Metrics = ['UnblendedCost']
        )
        # Filter the neccessery values from the dictionary
        cost = float(response['ResultsByTime'][0]['Total']['UnblendedCost']['Amount'])
        # Print the result
        print(f"\nTotal AWS costs from {start_date} to {end_date}: {cost: .2f}")

    except ClientError as e:
        print(f"\nError getting AWS costs: {e}")

# Check RDS
def check_rds_services():
    try:
        print("---RDS Databases---")
        rds_client = boto3.client('rds')
        
        instances = rds_client.describe_db_instances()
        
        # If there is no instance, return
        if not instances['DBInstances']:
            print("No RDS istances found")
            return
        
        for db in instances['DBInstances']:
            print(f"DB Instance: {db['InstanceIndentifier']}")
            print(f" Engine: {db['Engine']} {db.get('EngineVersion', 'N/A')}")
            print(f" Class: {db['DBInstanceClass']}")
            print(f" Status: {db['DBInstanceStatus']}")
            print(f" Storage: {db.get('AllocatedStorage', 'N/A')} GB")
            
    except ClientError as err:
        print(f"Error checking RDS: {err}")
    return

# Check S3
def check_s3_services():
    try:
        print("--- S3 Buckers ---")
        s3_client = boto3.client('s3')
        
        # List buckets
        buckets = s3_client.list_buckets()
        
        # If there is no S3 bucket
        if not buckets['Buckets']:
            print('No S3 buckets found')
            return
        
        for bucket in buckets['Buckets']:
            bucket_name = bucket['Name']
            print(f"Buckets: {bucket_name}")
            
            try:
                # Get bucket size using CloudWatch
                cloudwatch = boto3.client('cloudwatch')
                response = cloudwatch.get_metric_statistics(
                    Namespace = 'AWS/S3',
                    MetricName = 'BucketSizeBytes',
                    Dimensions = [
                        {'Name': 'BucketName', 'Value': bucket_name},
                        {'Name': 'StorageType', 'Value': 'StandardStorage'}
                    ],
                    # Set the start time as the current time subtracting one day to get the last 24 hours
                    StartTime = datetime.now() - timedelta(days = 1),
                    # Set the end time as the current time
                    EndTime = datetime.now(),
                    # Period of 86400 secs which is 24 hours / 1 day
                    Period = 86400,
                    # Set the statistic to average
                    Statistics = ['Average']
                )
                
                if response['DataPoints']:
                    size_bytes = response['Datapoints'][-1]['Average']
                    size_gb = size_bytes / (1024**3)
                    print(f"    Size: {size_gb:.2f} GB")
                else:
                    print(f"    Size: Unable to determine")
                    
            except:
                print(f" Size: Unable to determine")
        
    except ClientError as error:
        print(f"Error checking S3: {error}")
        
# Check Lambda service
def check_lambda_services():
    try:
        # Create the lambda client
        lambda_client = boto3.client('lambda')
        
        # List all the functions
        functions = lambda_client.list_functions()
        
        # If there is no function
        if not functions['Functions']:
            print("No Lambda functions found")
            return
        
        # Iterate through each function in the dictionary to retrieve its metadata
        for func in functions['Functions']:
            print(f"Function: {func['FunctionName']}")
            print(f"    Runtime: {func['RunTime']}")
            print(f"    Memory: {func['MemorySize']} MB")
            print(f"    Timeout: {func['Timeout']} seconds")
            print(f"    Last Modified: {func['LastModified']}")
            
    except ClientError as error:
        print(f"Error checking Lambda: {error}")
        
# Check load balancers
def check_load_balancers():
    try:
        # Create the Classic Load Balancer client
        elb_client = boto3.client('elb')
        
        # Retrieve all of the Classic load balancers
        classic_lbs = elb_client.describe_load_balancers()
        
        # Create the Modern Load Balancers (ALB/NLB)
        elbv2_client = boto3.client('elbv2')
        modern_lbs = elbv2_client.describe_load_balancers()
        
        # Calculate the total number of load balancers
        total_lbs = len(classic_lbs['LoadBalancerDescriptions']) + len(modern_lbs['LoadBalancers'])
        
        if total_lbs == 0:
            print("No load balancers found")
            return
        
        # Show Classic LBs
        for lb in classic_lbs['LoadBalancerDescriptions']:
            print(f"Class LB: {lb['LoadBalancerName']}")
            
            # Scheme --> type of load balancer --> internet-facing / internal. 
            # internet-facing load balancer --> routes requests from clients over the internet
            # internal load balancer --> routes requests within a private network
            print(f"    Scheme: {lb['Scheme']}")
            print(f"    Instances: {len(lb['Instances'])}")
            
        # Show Modern LBs
        for lb in modern_lbs['LoadBalancers']:
            print(f"{lb['Type'].upper()}: {lb['LoadBalancerName']}")
            
            # The line print(f" State: {lb['State']['Code']}") --> State dictionary within each modern load balancer (lb) to retrieve the Code value --> (e.g., "active", "provisioning").
            print(f"    State: {lb['State']['Code']}")
            
            # Scheme --> type of load balancer --> internet-facing / internal. 
            # internet-facing load balancer --> routes requests from clients over the internet
            # internal load balancer --> routes requests within a private network
            print(f"    Scheme: {lb['Scheme']}")
            print()
            
    except ClientError as error:
        print(f"Error checking load balancers: {error}")

# Check EC2
def check_ec2_services():
    try:
        # Get the EC2 client
        ec2_client = boto3.client('ec2')
        response = ec2_client.describe_instances()
        
        if not response.get('Reservations'):
            print('No EC2 instances found')
            return 
        
        # Extract andn print instance details
        for reservation in response['Reservations']:
            for instance in reservation['Instances']:
                instance_id = instance['InstanceId']
                instance_type = instance['InstanceType']
                launch_time = instance['LaunchTime']
                print(f"Instance ID: {instance_id}, Type: {instance_type}, Launch Time: {launch_time}")

   
    except ClientError as e:
        print(f"Error checking services: {e}")
        
def check_ebs_volume():
    try:
        print("--- EBS volumes ---")
        
        # Create the ec2 client to retrieve their volumes
        ec2_client = boto3.client('ec2')
        
        volumes = ec2_client.describe_volumes()
        
        # If no volumes can be found
        if not volumes['Volumes']:
            print("No EBS volumes found")
            return
        
        # Keep track of the total size accross all of the volumes
        total_size = 0
        
        # Interate through each volume in the dictionary to retrieve the metadata
        for volume in volumes['Volumes']:
            size = volume['Size']
            total_size += size
            print(f"Volume: {volume['VolumeId']}")
            print(f"    Size: {size} GB")
            print(f"    Type: {volume['VolumeType']}")
            print(f"    State: {volume['State']}")
            if volume['Attachments']:
                print(f"    Attached to: {volume['Attachmeent'][0]['InstanceId']}")
            print()
            
        print(f"Total EBS storage: {total_size} GB")
        
    except ClientError as error:
        print(f"Error checking EBS volumes: {error}")
        
# Check Elastic IPs
def check_elastic_ips():
    try:
        print("--- Elastic IPs ---")
        ec2_client = boto3.client('ec2')
        
        eips = ec2_client.describe_addresses()
        
        # If no Elastic ip can be found
        if not eips['Addresses']:
            print("No Elastic IPs found")
            return
        
        # Interate through each ip in the dictionary to retrieve the metadata
        for eip in eips['Addresses']:
            print(f"Elastic IP: {eip['PublicIp']}")
            
            # These lines check if an Elastic IP (EIP) is associated with an EC2 instance by looking for the 'InstanceId' key in the EIP dictionary. If it is present, it prints the instance ID to which the EIP is attached. If not, it indicates that the EIP is unattached, which can incur charges. This helps in identifying and managing costs associated with unused EIPs.
            
            if 'InstanceId' in eip:
                print(f"    Attached to: {eip['InstanceId']}")
            else:
                print(f"    Status: Unattached (incurring charges)")
        
        print()
        
    except ClientError as error:
        print(f"Error checking Elastic IPs: {error}")
        
def check_vpc_resources():
    try:
        print("--- VPC Resources ---")
        # Create the EC2 clients
        ec2_client = boto3.client('ec2')

        # Get the VPCs
        vpcs = ec2_client.describe_vpcs()
        print(f"VPCs: {len(vpcs['Vpcs'])}")
        
        # NAT Gateways
        nat_gws = ec2_client.describe_nat_gateways()
        active_nats = [nat for nat in nat_gws['NatGateways'] if nat['State'] == 'available']
        
        if active_nats:
            print(f"NAT Gateways: {len(active_nats)} (incurring hourly charges)")
        else:
            print("NAT gateways: None")
            
        # Get the Internet Gateways
        igws = ec2_client.describe_internet_gateways()
        print(f"Internet Gateways: {len(igws['InternetGateways'])}")
        
    except ClientError as error:
        print(f"Error checking VPC resources: {error}")
        
def get_service_costs():
    try:
        print("=== COSTS BY SERVICE ===")
        
        # Create the cost explorer client
        cost_client = boto3.client('ce')
        
        # Specify today
        today = datetime.now()
        
        # Specify start date as the first day of the month
        start_date = today.replace(day = 1).strftime("%Y-%m-%d")
        # Specify end date as today
        end_date = today.strftime("%Y-%m-%d")
        
        # Create the response of cost and usage from cost explorer
        response = cost_client.get_cost_and_usage(
            # Specify the time period
            TimePeriod = {
                'Start': start_date,
                'End': end_date,
            },
            # Specify the granularity of monthly
            Granularity = 'MONTHLY',
            Metrics = ['UnblendedCost'],
            GroupBy = [
                {
                    'Type': 'DIMENSION',
                    'Key': 'SERVICE'
                }
            ]
        )
        
        if response['ResultsByTime']:
            # Get the service costs from the dictionary
            service_costs = response['ResultsByTime'][0]['Groups']
            
            # Sort by cost (descending order)
            service_costs.sort(key = lambda x: float(x['Metrics']['UnblendedCost']['Amount']), reverse = True)
            
            # Keep track of the total cost
            total_cost = 0
        
            print(f"Service costs for {start_date} to {end_date}:")
            print("-" * 50)
            
            # Interate through each service in the service costs to retrieve the metadata and increment the total cost
            for service in service_costs:
                service_name = service['Keys'][0]
                cost = float(service['Metrics']['UnblendedCost']['Amount'])
                total_cost += cost
                
                if cost > 0.01: # Only show services with significant costs
                    print(f"{service_name:<30} ${cost:>8.2f}")
                    
        print("-" * 50)
        print(f"{'TOTAL':<30} ${total_cost:>8.2f}")
        
    except ClientError as error:
        print(f"Error getting service costs: {error}")
        
def main():
    print("Getting current region...")
    check_current_region()
    print("Getting AWS costs...")
    get_aws_costs()
    print("Checking running services...")
    check_ec2_services()
    
    print("\nChecking RDS services...")
    check_rds_services()
    
    print("\nChecking S3 Buckets...")
    check_s3_services()
    
    print("\nChecking Lambda functions...")
    check_lambda_services()
    
    print("\nChecking Load balancers...")
    check_load_balancers()
    
    print("\nChecking EBS volumes...")
    check_ebs_volume()
    
    print("\nChecking Elastic IPs...")
    check_elastic_ips()
    
    print("\nChecking VPCs...")
    check_vpc_resources()
    
    # print("\n" + "=" * 60)
    get_service_costs()
    
if __name__ == "__main__":
    main()
