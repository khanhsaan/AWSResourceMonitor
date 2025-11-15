# AWS Resource Monitoring

A comprehensive web application for monitoring AWS resource usage and costs. This full-stack solution provides real-time insights into your AWS infrastructure with an intuitive dashboard interface.

![Project Structure](https://img.shields.io/badge/Frontend-React-blue) ![Backend](https://img.shields.io/badge/Backend-FastAPI-green) ![AWS](https://img.shields.io/badge/Cloud-AWS-orange)

## 🚀 Features

### 📊 **Comprehensive AWS Monitoring**
- **Cost Analysis**: Monthly cost tracking using AWS Cost Explorer
- **EC2 Instances**: Monitor running instances, types, and status
- **RDS Databases**: Track database instances and configurations
- **S3 Storage**: Bucket analysis and storage metrics
- **Lambda Functions**: Function monitoring and execution stats
- **Load Balancers**: ELB/ALB monitoring and health checks
- **EBS Volumes**: Storage volume tracking and utilization
- **Elastic IPs**: IP address allocation and usage

### 🔐 **Security Features**
- Secure AWS credential handling
- Authentication-based access control
- No credential storage (credentials used only for session)
- AWS CLI integration for secure configuration

### 💻 **User Interface**
- Modern React-based dashboard
- Real-time data updates
- Service-specific detail views
- Cost visualization with charts
- Responsive design for all devices

## 🏗️ Architecture

### Frontend (React)
- **Location**: `AWSUsageScriptUI/`
- **Port**: 3000
- **Framework**: React 19.1.0 with React Router
- **Features**: Component-based architecture, API integration, responsive UI

### Backend (FastAPI)
- **Location**: `AWSUsageScript/`
- **Port**: 8000
- **Framework**: FastAPI with uvicorn
- **Features**: RESTful API, AWS SDK integration, CORS support

## 📋 Prerequisites

### System Requirements
- **Python 3.11+** (for backend)
- **Node.js 16+** (for frontend)
- **AWS CLI** (for retrieving real-time resources' information)
- **Git** (for cloning the repository)

### AWS Requirements
- AWS Account with programmatic access
- IAM user with the following permissions:
  - `AmazonEC2ReadOnlyAccess`
  - `AmazonRDSReadOnlyAccess`
  - `AmazonS3ReadOnlyAccess`
  - `AWSLambdaReadOnlyAccess`
  - `ElasticLoadBalancingReadOnly`
  - `AWSCostExplorerServiceReadOnly`

## 🚀 Quick Start

### Option 1: Automated Setup (Windows)
```bash
# Clone the repository
git clone <repository-url>
cd AWSScript_v1

# Run the automated setup script
winStart.bat
```

### Option 2: Automated Setup (Linux/macOS)
```bash
# Clone the repository
git clone <repository-url>
cd AWSScript_v1

# Make scripts executable
chmod +x linuxStart.bat

# Run the automated setup script
./linuxStart.bat
```

### Option 3: Manual Setup

#### Backend Setup
```bash
# Navigate to backend directory
cd AWSUsageScriptBackEnd

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install "fastapi[standard]"
pip install -r requirements.txt

# Start the backend server
fastapi dev app.py --port 8000
```

#### Frontend Setup
```bash
# Open new terminal and navigate to frontend directory
cd AWSUsageScriptFrontEnd

# Install dependencies
npm install

# Start the development server
npm start
```

## 🐳 Docker Deployment (under developing...)

### Backend Docker Container
```bash
# Navigate to backend directory
cd AWSUsageScriptBackEnd

# Build the Docker image
docker build -t aws-usage-backend .

# Run the container
docker run -p 8000:8000 aws-usage-backend
```

### Frontend Docker Setup
Create a `Dockerfile` in `AWSUsageScriptUI/` directory:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /configure` - Configure AWS credentials
- `GET /health` - Health check endpoint

### AWS Service Endpoints
- `GET /region` - Get current AWS region
- `GET /costs` - Retrieve monthly cost data
- `GET /ec2` - List EC2 instances
- `GET /rds` - List RDS instances
- `GET /s3` - List S3 buckets and metrics
- `GET /lambda` - List Lambda functions
- `GET /elb` - List Load Balancers
- `GET /ebs` - List EBS volumes
- `GET /eip` - List Elastic IP addresses

### API Base URL
- **Development**: `http://localhost:8000`
- **Production**: Configure according to your deployment

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
AWS_DEFAULT_REGION=ap-southeast-2
CORS_ORIGINS=http://localhost:3000
API_ROOT_PATH=/api
```

### AWS Credentials
The application supports multiple authentication methods:
1. **Web Interface**: Enter credentials through the login form
2. **AWS CLI**: Configure using `aws configure`
3. **Environment Variables**: Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
4. **IAM Roles**: For EC2 instances or containerized deployments

## 🧪 Testing (N/A - under developing...)

### Backend Tests
```bash
cd AWSUsageScriptBackEnd
python -m pytest tests/
```

### Frontend Tests
```bash
cd AWSUsageScriptFrontEnd
npm test
```

## 📁 Project Structure

```
AWSScript_v1/
├── AWSUsageScript/                 # Backend FastAPI application
│   ├── usageScript.py             # Main API application
│   ├── requirements.txt           # Python dependencies
│   ├── dockerfile                 # Docker configuration
│   ├── tests/                     # Backend tests
│   └── venv/                      # Python virtual environment
│
├── AWSUsageScriptUI/              # Frontend React application
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── auth/             # Authentication components
│   │   │   ├── dashboard/        # Dashboard components
│   │   │   └── login/            # Login components
│   │   ├── api/                  # API service layer
│   │   ├── constants/            # Application constants
│   │   └── App.js                # Main application component
│   ├── public/                   # Static assets
│   ├── package.json              # Node.js dependencies
│   └── README.md                 # Frontend documentation
│
├── winStart.bat                  # Windows startup script
├── winStop.bat                   # Windows shutdown script
├── linuxStart.bat                # Linux/macOS startup script
├── linuxStop.bat                 # Linux/macOS shutdown script
└── README.md                     # This file
```

## 🔒 Security Considerations

- **Credentials**: Never commit AWS credentials to version control
- **CORS**: Configure appropriate CORS origins for production
- **HTTPS**: Use HTTPS in production environments
- **IAM**: Follow principle of least privilege for AWS permissions
- **Container Security**: Run containers with non-root users

## 🐛 Troubleshooting

### Common Issues

#### AWS CLI Not Found
For detailed AWS CLI installation instructions for your operating system, please refer to the official AWS documentation: [Installing or updating to the latest version of the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

#### CORS Issues
Ensure the backend CORS configuration includes your frontend URL:
```python
allow_origins=["http://localhost:3000"]
```

#### Port Conflicts
- Backend default port: 8000
- Frontend default port: 3000
- Change ports if conflicts occur

#### AWS Permission Errors
Verify your IAM user has the required read permissions for all AWS services being monitored.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is created by Anthony Tran

---

**Note**: This application is for monitoring purposes only. Ensure you have appropriate AWS permissions and follow your organization's security policies.
