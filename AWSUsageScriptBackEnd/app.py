import boto3
from datetime import datetime, timedelta
from botocore.exceptions import ClientError
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import subprocess
import os
from jose import JWTError, jwt

app = FastAPI()

# JWT Configuration
SECRET_KEY = "123"
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Security scheme
# “I expect clients to send an Authorization: Bearer <token> header with requests.”
security = HTTPBearer(auto_error=False)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"🔍 {request.method} {request.url.path}")
    print(f"🔍 Origin: {request.headers.get('origin', 'NO ORIGIN')}")
    print(f"🔍 Headers: {dict(request.headers)}")
    
    response = await call_next(request)
    
    print(f"📤 Response Status: {response.status_code}")
    print(f"📤 Response Headers: {dict(response.headers)}")
    
    return response

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:80",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:80",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

class AWSCredentials(BaseModel):
    access_key: str
    secret_access_key: str
    region: str = "ap-southeast-2"
    
class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    account_id: str
    region: str

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=5001, reload=True)

# JWT helper
def create_access_token(data: dict, expires_delta: timedelta = None):
    try:
        to_encode = data.copy() # copy passed data
        
        if expires_delta:
            expire = datetime.now() + expires_delta
        else:
            expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        
        return {
            'success': True,
            'message': 'Create JWT Token SUCCESSFULLY!',
            'encoded_jwt': encoded_jwt
        }
    except Exception as e:
        return {
            'success': False,
            'message': 'Create JWT Token UNSUCCESSFULLY',
            'encoded_jwt': None
        }
        
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        if credentials is None:
            print("--- No credentials provided")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No authorization token provided",
                headers={"WWW-Authenticate": "Bearer"},
            )
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        account_id: str = payload.get("account_id")
        region: str = payload.get("region")
        
        if account_id is None:
            raise HTTPException(
                status_code = status.HTTP_401_UNAUTHORIZED,
                detail = "Invalid authentication credentials",
                headers = {"WWW-Authenticate": "Bearer"},
            )
            
        return {"account_id": account_id, "region": region}
    
    except JWTError:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = "Invalid authentication credentials",
            headers = {"WWW-Authenticate": "Bearer"},
        )
        
@app.get('/health')
async def aws_health():
    try:
        print("--- Health check called ---")
        print
        return {
            'success': True,
            'message': f'Backend is accessible!'
        }
    except Exception as e:
        print(f"--- Health check error: {e} ---")
        return {
            'success': False,
            'message': f'Backend is NOT accessible: {e}'
        }
        
@app.post('/configure')
async def aws_configure(credentials: AWSCredentials):
    try:
        print(f"--- COFIGURING AWS CREDENTIALS ---")
        print(f"Region RECIEVED: {credentials.region}")
        print(f"Access Key ID RECIEVED: {credentials.access_key[:4]}****")
        
        # Create a test session to retrieve info about the current user using the passed credentials
        test_session = boto3.Session(
            aws_access_key_id = credentials.access_key,
            aws_secret_access_key = credentials.secret_access_key,
            region_name = credentials.region
        )
                
        # Test credentials with a simple STS call
        sts_client = test_session.client('sts')
                
        # Specify the user's identity from the current test session
        identity = sts_client.get_caller_identity()
        
        print(f"AWS Account ID: {identity.get('Account')}")
        print(f"User ARN: {identity.get('Arn')}")

        configure_aws_cli(credentials)
        
        # Specify the os env os it can be used by CLI or SDK from now on
        os.environ['AWS_ACCESS_KEY_ID'] = credentials.access_key
        os.environ['AWS_SECRET_ACCESS_KEY'] = credentials.secret_access_key
        os.environ['AWS_DEFAULT_REGION'] = credentials.region
        
        # Create JWT Token once authenthication has been passed
        print(f"----- Creating JWT Token")
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        response = create_access_token(
            data={
                "account_id": identity.get('Account'),
                "region": credentials.region,
                "user_arn": identity.get('Arn'),
            },
            expires_delta=access_token_expires
        )
        
        access_token = response['encoded_jwt']
        
        # If there is no exception has been caught, print the message of success
        print(f"AWS credentials configured sucessfully!")
        
        return {
            "success": True,
            "message": f"Authentication SUCCESSFULLY!",
            "token": {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                "account_id": identity.get('Account'),
                "region": credentials.region
            }
        }
        
    
    # Raise any exception if there is or has been raised by configure_aws_cli()
    except ClientError as e:
        return {
            "success": False,
            "message": f"Error with authentication: {e}",
        }
        
def configure_aws_cli (credentials: AWSCredentials):
    try:
        # check=True: will raise a CalledProcessError if the command fails.

        # capture_output=True: captures stdout and stderr instead of printing them.

        # text=True: returns output as a string rather than bytes.

        # Configure AWS CLI access key
        subprocess.run([
            'aws', 'configure', 'set', 'aws_access_key_id', credentials.access_key
        ], check = True, capture_output=True, text=True)
        
        # Configure AWS CLI secret key
        subprocess.run([
            'aws', 'configure', 'set', 'aws_secret_access_key', credentials.secret_access_key
        ], check=True, capture_output=True, text=True)
        
        # Configure AWS CLI region
        subprocess.run([
            'aws', 'configure', 'set', 'region', credentials.region
        ], check=True, capture_output=True, text=True)

        # Configure output format to json
        subprocess.run([
            'aws', 'configure', 'set', 'output', 'json'
        ], check=True, capture_output=True, text=True)
        
        print("AWS CLI configured successfully")
        
    # If there is CalledProcessError, raise exception
    except subprocess.CalledProcessError as e:
        print(f"Error configuring AWS CLI: {e}")
        raise Exception(f"Failed to configure AWS CLI: {e}")
    
    # If there is FileNotFoundError, raise exception
    except FileNotFoundError:
        print(f"AWS CLI not found. Please install AWS CLI.")
        raise Exception("AWS CLI not installed")

@app.get("/")
async def root():
    return {"message": "Hello word"}

@app.get("/region")
async def aws_get_region(current_user: dict = Depends(verify_token)):
    try:
        session = boto3.Session()
        current_region = session.region_name
        print('----- CURRENT REGION -----------')
        print(f"Current AWS region: {current_region}")
        
        return {
            "success": True,
            "message": f"Current region: {current_region}",
            "current_region": current_region,
        }
    
    except Exception as e:
        return {
            "success": False,
            "message": f"Error getting current region: {e}",
            "current_region": "Cannot retrieve current region",
        }
    
@app.get("/costs")
def get_aws_costs(current_user: dict = Depends(verify_token)):
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
        # Filter the neccessery values from the 
        cost = float(response['ResultsByTime'][0]['Total']['UnblendedCost']['Amount'])
        # Print the result
        print(f"\nTotal AWS costs from {start_date} to {end_date}: {cost: .2f}")
        
        return {
            "sucess": True,
            "message": f"Total cost: {cost:.2f}",
            "totalCost": cost
        }

    except ClientError as e:
        print(f"\nError getting AWS costs: {e}")
        
        return {
            "sucess": False,
            "message": f"Error getting cost: {e}",
            "totalCost": cost
        }


# Check RDS
@app.get("/rds")
async def check_rds_services(current_user: dict = Depends(verify_token)):
    try:
        print("---RDS Databases---")
        rds_client = boto3.client('rds')
        
        instances = rds_client.describe_db_instances()
        
        # Collect all of the tables datas
        tables_data = []
        
        # If there is no tables, return
        if not instances['DBInstances']:
            print("No RDS istances found")
            return {
                "success": True,
                "message": f"Found {len(tables_data)} tables",
                "rdsInstances": [],
                "total_count": 0,
            }
        
        for db in instances['DBInstances']:
            tables_info = {
                "identifier": db['DBInstanceIdentifier'],
                "engine": db['Engine'],
                "class": db['DBInstanceClass'],
                "status": db['DBInstanceStatus'],
                "storage": db.get('AllocatedStorage', 'N/A')
            }
            
            tables_data.append(tables_info)
            
            print(f"DB Instance: {db['DBInstanceIdentifier']}")
            print(f" Engine: {db['Engine']} {db.get('EngineVersion', 'N/A')}")
            print(f" Class: {db['DBInstanceClass']}")
            print(f" Status: {db['DBInstanceStatus']}")
            print(f" Storage: {db.get('AllocatedStorage', 'N/A')} GB")
            
        print(f"Found {len(tables_data)} tables")
            
        return {
            "success": True,
            "message": f"Found {len(tables_data)} tables",
            "rdsInstances": tables_data,
            "total_count": len(tables_data),
        }
    except ClientError as err:
        print(f"Error checking RDS: {err}")
        
        return {
            "success": False,
            "message": f"Error getting RDS databases: {err}",
            "rdsInstances": [],
            "total_count": 0,
        }
    return

# Check S3
@app.get("/s3")
async def check_s3_services(current_user: dict = Depends(verify_token)):
    try:
        print("--- S3 Buckers ---")
        s3_client = boto3.client('s3')
        
        # List buckets
        buckets = s3_client.list_buckets()
        
        # Collect all of the buckets
        buckets_data = []
        
        # If there is no S3 bucket
        if not buckets['Buckets']:
            print('No S3 buckets found')
            return {
                "sucess": True,
                "message": f"Found {len(buckets_data)} buckets",
                "buckets": buckets_data,
                "total_count": len(buckets_data)
            }
        
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
                
                if response['Datapoints']:
                    size_bytes = response['Datapoints'][-1]['Average']
                    size_gb = size_bytes / (1024**3)
                    print(f"    Size: {size_gb:.2f} GB")
                    
                    bucket_info = {
                        "name": bucket_name,
                        "size": size_gb,
                    }
                    
                    buckets_data.append(bucket_info)
                else:
                    print(f"    Size: Unable to determine")
                    
                    bucket_info = {
                        "name": bucket_name,
                        "size": None,
                    }
                    
                    buckets_data.append(bucket_info)
                    
            except Exception as e:
                print(f" Error occurs: {e}")
                
                bucket_info = {
                    "name": bucket_name,
                    "size": None,
                }
                
                buckets_data.append(bucket_info)
                
        return {
            "success": True,
            "message": f"Found {len(buckets_data)} buckets",
            "s3Buckets": buckets_data,
            "total_count": len(buckets_data)
        }
        
    except ClientError as error:
        print(f"Error checking S3: {error}")
        
        return {
            "sucess": False,
            "message": f"Error getting S3 Buckets: {error}",
            "s3Buckets": [],
            "total_count": 0,
        }
        
# Check Lambda service
@app.get("/lambda")
async def check_lambda_services(current_user: dict = Depends(verify_token)):
    try:
        # Collect all of the lambda functions
        lambda_data = []
        
        # Create the lambda client
        lambda_client = boto3.client('lambda')
        
        # List all the functions
        functions = lambda_client.list_functions()
        
        # If there is no function
        if not functions['Functions']:
            print("No Lambda functions found")
            return {
                "success": True,
                "message": f"Found {len(lambda_data)} functions",
                "functions": lambda_data,
                "total_count": len(lambda_data),
            }
        
        
        # Iterate through each function in the dictionary to retrieve its metadata
        for func in functions['Functions']:
            
            lambda_info = {
                "name": func['FunctionName'],
                "runtime": func['RunTime'],
                "memory": func['MemorySize'],
                "timeout": func['Timeout'],
                "lastModified": func['LastModified'],
            }
            
            print(f"Function: {func['FunctionName']}")
            print(f"    Runtime: {func['RunTime']}")
            print(f"    Memory: {func['MemorySize']} MB")
            print(f"    Timeout: {func['Timeout']} seconds")
            print(f"    Last Modified: {func['LastModified']}")
        
            lambda_data.append(lambda_info)
        
        return {
            "sucess": True,
            "message": f"Found {len(lambda_data)} functions",
            "lambdaFunctions": lambda_data,
            "total_count": len(lambda_data),
        }

    except ClientError as error:
        print(f"Error checking Lambda: {error}")
        
        return {
            "sucess": False,
            "message": f"Error getting Lambda functions: {error}",
            "lambdaFunctions": [],
            "total_count": 0,
        }
        
# Check load balancers
@app.get("/elb")
def check_load_balancers(current_user: dict = Depends(verify_token)):
    try:
        # Collect all of the load balancers
        elb_data = []
        
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
            
            return {
                "sucess": True,
                "message": f"Found 0 load balancers",
                "loadBalancers": [], 
                "total_count": 0,
            }
        
        # Show Classic LBs
        for lb in classic_lbs['LoadBalancerDescriptions']:
            print(f"Class LB: {lb['LoadBalancerName']}")
            
            # Scheme --> type of load balancer --> internet-facing / internal. 
            # internet-facing load balancer --> routes requests from clients over the internet
            # internal load balancer --> routes requests within a private network
            print(f"    Scheme: {lb['Scheme']}")
            print(f"    Instances: {len(lb['Instances'])}")
            
            classic_lbs_info = {
                "name": lb['LoadBalancerName'],
                "type": "Classic LB",
                "scheme": lb['Scheme'],
                "state": "",
            }
            
            elb_data.append(classic_lbs_info)
            
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
            
            modern_lbs_info = {
                "name": lb['LoadBalancerName'],
                "type": lb['Type'].upper(),
                "scheme": lb['Scheme'],
                "state": lb['State']['Code'],
            }
            
            elb_data.append(modern_lbs_info)
        
        return {
            "sucess": True,
            "message": f"Found {total_lbs} load balancers",
            "loadBalancers": elb_data,
            "total_count": len(elb_data),
        }
        
    except ClientError as error:
        print(f"Error checking load balancers: {error}")
        
        return {
            "sucess": False,
            "message": f"Error getting Load Balancers: {error}",
            "loadBalancers": [],
            "total_count": 0,
        }

# Check EC2
@app.get("/ec2")
async def check_ec2_services(current_user: dict = Depends(verify_token)):
    try:
        # Collect all the instance data
        instance_data = []
        
        # Get the EC2 client
        ec2_client = boto3.client('ec2')
        response = ec2_client.describe_instances()
        
        # If no instance found return immediately
        if not response.get('Reservations'):
            print('No EC2 instances found')
            return {
                "success": True,
                "message": f"Found {len(instance_data)} instances",
                "ec2Instances": instance_data,
                "total_count": len(instance_data)
            }
        
        # Extract andn print instance details
        for reservation in response['Reservations']:
            for instance in reservation['Instances']:
                
                instance_info = {
                    "instance_id": instance['InstanceId'],
                    "instance_type": instance['InstanceType'],
                    "launch_time": instance['LaunchTime']
                }
                
                instance_data.append(instance_info)
                
                
                print(f"Instance ID: {instance_info['instance_id']}, Type: {instance_info['instance_type']}, Launch Time: {instance_info['launch_time']}")

        return {
            "success": True,
            "message": f"Found {len(instance_data)} instances",
            "ec2Instances": instance_data,
            "total_count": len(instance_data),
        }
        
    except ClientError as e:
        print(f"Error checking services: {e}")
        
        return {
            "success": False,
            "error": f"Error checking EC2 services: {e}",
            "ec2Instances": [],
            "total_count": 0,
        }
        
# Check EBS Volumes
@app.get("/ebs")
async def check_ebs_volume(current_user: dict = Depends(verify_token)):
    try:
        # Collect all of the ebs volumes
        ebs_data = []
        
        print("--- EBS volumes ---")
        
        # Create the ec2 client to retrieve their volumes
        ec2_client = boto3.client('ec2')
        
        volumes = ec2_client.describe_volumes()
        
        # If no volumes can be found
        if not volumes['Volumes']:
            print("No EBS volumes found")
            
            return {
                "success": True,
                "message": f"Found 0 volumes",
                "ebsVolumes": [],
                "total_count": 0,
                "total_size": 0,
            }
        
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
                
                ebs_info = {
                    "id": volume['VolumeId'],
                    "size": volume['Size'],
                    "type": volume['VolumeType'],
                    "state": volume['State'],
                    "attachedTo": volume['Attachments']
                }
                
                ebs_data.append(ebs_info)
            print()
            
            ebs_info = {
                "id": volume['VolumeId'],
                "size": volume['Size'],
                "type": volume['VolumeType'],
                "state": volume['State'],
                "attachedTo": "No attachment"
            }
            
            ebs_data.append(ebs_info)
            
        print(f"Total EBS storage: {total_size} GB")
        
        return {
            "success": True,
            "message": f"Found {len(ebs_data)} volumes",
            "ebsVolumes": ebs_data,
            "total_count": len(ebs_data),
            "total_size": total_size,
        }
        
    except ClientError as error:
        print(f"Error checking EBS volumes: {error}")
        
        return {
            "success": False,
            "message": f"Error getting EBS volumes: {error}",
            "ebsVolumes": [],
            "total_count": 0,
            "total_size": 0,
        }
        
# Check Elastic IPs
@app.get("/eip")
async def check_elastic_ips(current_user: dict = Depends(verify_token)):
    try:
        # Collect all of the elastic ips
        eips_data = []
        
        print("--- Elastic IPs ---")
        ec2_client = boto3.client('ec2')
        
        eips = ec2_client.describe_addresses()
        
        # If no Elastic ip can be found
        if not eips['Addresses']:
            print("No Elastic IPs found")
            return {
                "success": True,
                "message": f"Found 0 IPs",
                "ebsVolumes": [],
                "total_count": 0,
            }
        
        # Interate through each ip in the dictionary to retrieve the metadata
        for eip in eips['Addresses']:
            print(f"Elastic IP: {eip['PublicIp']}")
            
            # These lines check if an Elastic IP (EIP) is associated with an EC2 instance by looking for the 'InstanceId' key in the EIP dictionary. If it is present, it prints the instance ID to which the EIP is attached. If not, it indicates that the EIP is unattached, which can incur charges. This helps in identifying and managing costs associated with unused EIPs.
            
            if 'InstanceId' in eip:
                print(f"    Attached to: {eip['InstanceId']}")
                
                eips_info = {
                    "ip": eip['PublicIp'],
                    "attachedTo": eip['InstanceId'],
                    "status": "attached",
                }
                
                eips_data.append(eips_info)
            else:
                print(f"    Status: Unattached (incurring charges)")
                
                eips_info = {
                    "ip": eip['PublicIp'],
                    "attachedTo": None,
                    "status": "unattached",
                }
                
                eips_data.append(eips_info)
        
        print()
        
        return {
            "success": True,
            "message": f"Found {len(eips_data)} IPs",
            "elasticIPs": eips_data,
            "total_count": len(eips_data),
        }
    except ClientError as error:
        print(f"Error checking Elastic IPs: {error}")
        
        return {
            "success": False,
            "message": f"Error getting Elastic IPs: {error}",
            "elasticIPs": [],
            "total_count": 0,
        }
        
def check_vpc_resources(current_user: dict = Depends(verify_token)):
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

# Getting total service cost
@app.get("/cost")
async def get_service_costs(current_user: dict = Depends(verify_token)):
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
        
        return {
            "success": True,
            "message": f"Total cost: {total_cost:.2f}",
            "total_cost": round(total_cost, 2),
        }
        
    except ClientError as error:
        print(f"Error getting service costs: {error}")
        
        return {
            "success": False,
            "message": f"Error getting service costs: {error}",
            "total_cost": total_cost,
        }
