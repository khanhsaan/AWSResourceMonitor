import logo from './logo.svg';
import './App.css';
import { act, use, useEffect, useState } from 'react';
import mockData from './constants/MockData';
import ServiceDetail from './components/ServiceDetails.js'
import CostBar from './components/CostBar.js'
import useMockOrRealData from './api/useMockOrRealData.js';
import LoginForm from './components/login/LoginForm.js';
import awsResourceApi from './api/apiService.js'

// Base URL
const API_BASE_URL = process.env.API_BASE_URL ?? "http://127.0.0.1:8000/api"

const discoverBackendURL = async () => {
  const possibleUrls = [
    'http://127.0.0.1:8000/api',
    'http://localhost:8000/api'
  ];
}
function App() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const[logginFailed, setLogginFailed] = useState(false);

  // Authenticate state
  const[isAuthenticated, setIsAuthenticated] = useState(false);

  // Health check
  const[isHealthy, setIsHealthy] = useState(false);

  // Retrieve the values from useMockOrRealData.js
  const[regionData, errorRegion, ec2Data, errorEC2, rdsData, errorRDS, costData, errorCost, s3Data, errorsS3,lambdaData, errorLambda, loadBalancersData, errorLoadBalancers, EBSData, errorEBS, EIPsData, errorEIPs, isLoading] = useMockOrRealData(isAuthenticated);

  // AWS credentials state
  const [awsCredentials, setAwsCredentials] = useState({
    access_key: '',
    secret_access_key: '',
    region: 'ap-southeast-2'
  });

  // Handle login
  const handleLogin = async(credentials) => {
    // Get the repsonse from the api service
    const response = await awsResourceApi.configureAWS(credentials);

    // If there is error
    if(response.error){
      console.warn('AWS CONFIGURATION FAILED!');
    }
    
    // If there is data being retrieved
    if(response.data){
      console.log('There is AWS CONFIGURATION response being retrieved!');
      console.log('Message from backend: ' + response.data.sucess + "\n" + response.data.message);

      // If the success is false, return false success state to the caller
      if(response.data.success === false){
        console.log("LOG IN FAILED!")
        return {
          success: false,
          error: response.data.message || 'Authentication failed!'
        }
      }
    }
    if(logginFailed){
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }

  // Handle log out
  const handleLogOut = () => {
    setIsAuthenticated(false);

    setAwsCredentials({
      access_key: '',
      secret_access_key: '',
      region: 'ap-southeast-2'
    });

    console.log('User logged out successfully!');
  }

  // LOGIN STATE
  if(!isAuthenticated) {
    return <LoginForm 
              onLogin = {handleLogin} 
              onLoginStatus={(status) => setLogginFailed(status.success)}>
          </LoginForm>
  }


  // Set setIsLoading to false after 1.5 seconds to give the data some time to be retrieved properly
  // useEffect(() => {
  //   setTimeout(() => setIsLoading(false), 1500);
  // }, []);

  // if the loading state is true, render loading screen and loading wheel
  if(isLoading) {
    return (
      <div className='loading-screen'>
      <div className='loading-spinner'></div>
        <p>Loading AWS Resources...</p>
      </div>
    )
  }

  // if(errorEC2 || ec2Data){
  //   console.log("Error getting EC2 instances or ")
  // }

  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <div className='header-content'>
          <div className='header-left'>
            <h1> AWS Resource Monitor</h1>
            {/* Display region */}
            <p>Region: <span className='region-badge'>{regionData?.current_region || "Cannot retrieve current region"}</span></p>
          </div>
          <div className='header-right'>
            <div className='cost-summary'>
              {/* toFixed(2) to ensure the number is being displayed with 2 decimal points */}
              <h2>${costData.totalCost.toFixed(2)}</h2>
              <p>Total Cost This Month</p>
            </div>
            
            {/* Log out button */}
            <button
              className='logout-btn'
              onClick={handleLogOut}
              title="Logout">
                Logout
              </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className='nav-tabs'>
        {/* "Overview" button */}
        {/* If the activeTab is set to overview, className is active, otherwise, className is empty */}
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}>
            Overview
        </button>

        {/* "Services" button */}
        <button
          className={activeTab === 'services' ? 'active': ''}
          onClick={() => setActiveTab('services')}>
            Services
        </button>

        {/* "Cost Breakdown" button */}
        <button
          className={activeTab == 'costs' ? 'active': ''}
          onClick={() => setActiveTab('costs')}>
            Cost Breakdown
        </button>
      </nav>

      {/* Main Content */}
      <main className='main-content'>
        {/* If "Overview" tab is being selected */}
        {activeTab === 'overview' && (
          <div className='overview-grid'>

            {/* Service Card of EC2 Instances */}
            <ServiceCard
              title={'EC2 Instances'}
              count={ec2Data?.ec2Instances?.length || 0}
              icon={'💻'}
              status={'healthy'}
              // Show how many instances are running using filter
              details={`${ec2Data?.ec2Instances?.filter(i => i.status === 'running').length || 0} running`}>
            </ServiceCard>

            {/* Service Card of RDS Databases */}
            <ServiceCard
              title={'RDS Databases'}
              count={rdsData?.rdsInstances?.length || 0}
              icon={'🗄️'}
              status={'healthy'}
              // Show how many databases are available using filter
              details={`${rdsData?.rdsInstances?.filter(i => i.status === 'available').length || 0} available`}>
            </ServiceCard>

            {/* Service Card of S3 Buckets */}
            <ServiceCard
              title={'S3 Buckets'}
              count={s3Data.s3Buckets.length}
              icon={'🪣'}
              status={'healthy'}

              // .reduce((acc, bucket) => acc + bucket.size, 0):
              // The reduce function loops over all elements in the array.
              // acc is the accumulator that keeps a running total.
              // bucket.size adds the size of each bucket to the total.
              // 0 is the initial value of the accumulator.
              details={`${s3Data.s3Buckets.reduce((accumulator, bucket) => accumulator + bucket.size, 0).toFixed(1)} GB totals`}>
            </ServiceCard>

            {/* Service Card of Lambda Functions */}
            <ServiceCard
              title={'Lamda Functions'}
              count={lambdaData?.lambdaFunctions?.length || 0}
              icon={'λ'}
              status={'healthy'}
              details={`All functions are active`}>
            </ServiceCard>

            {/* Service Card of Load Balancers */}
            <ServiceCard
              title={'Load Balancers'}
              count={loadBalancersData?.loadBalancers?.length || 0}
              icon={'⚖️'}
              status={'healthy'}
              // Show how many functions are active using filter
              details={`${loadBalancersData?.loadBalancers?.filter(i => i.state === 'active').length || 0} active`}>
            </ServiceCard>

            {/* Service Card of EBS Volumes*/}
            <ServiceCard
              title={'EBS Volumes'}
              count={EBSData?.ebsVolumes?.length || 0}
              icon={'💾'}
              status={'healthy'}
              // Show how many functions are active using filter
              details={`${EBSData?.ebsVolumes?.reduce((accumulator, vol) => accumulator + vol.size, 0).toFixed(1) || 0} GB totals`}>
            </ServiceCard>
          </div>
        )}

        {/* If Services tab are being selected */}
        {activeTab === 'services' && (
          <div className='overview-grid'>
            {/* Detail for EC2 Instances */}
            <ServiceDetail
              title={"EC2 Instances"}
              data={ec2Data.ec2Instances}
              type={'ec2'}></ServiceDetail>

            {/* Detail for RDS Databases */}
            <ServiceDetail
              title={'RDS Databases'}
              data={rdsData.rdsInstances}
              type={'rds'}></ServiceDetail>

            {/* Detail for S3 Buckets */}
            <ServiceDetail
              title={'S3 Buckets'}
              data={s3Data.s3Buckets}
              type={'s3'}></ServiceDetail>

            {/* Detail for S3 Buckets */}
            <ServiceDetail
              title={'Lambda Functions'}
              data={lambdaData.lambdaFunctions}
              type={'lambda'}></ServiceDetail>

            {/* Detail for Load Balancers */}
            <ServiceDetail
              title={'Load Balancers'}
              data={loadBalancersData.loadBalancers}
              type={'elb'}></ServiceDetail>

            {/* Detail for EBS Volumes */}
            <ServiceDetail
              title={'EBS Volumes'}
              data={EBSData.ebsVolumes}
              type={'ebs'}></ServiceDetail>

            {/* Detail for Elastic IPs*/}
            <ServiceDetail
              title={'Elastic IPs'}
              data={EIPsData.elasticIPs}
              type={'eip'}></ServiceDetail>
          </div>
        )}

        {activeTab === 'costs' && (
          <div className='costs-section'>
            <div className='cost-chart'>
              <h3>Cost Breakdown by Service</h3>
              {mockData.serviceCosts.map((service, index) => (
                <CostBar
                  key={index}
                  service={service}
                  total={mockData.totalCost}>
                </CostBar>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


// Service Card Component
function ServiceCard({
  // Passed parameters
  title,
  count,
  icon,
  status,
  details
}) {

  // Dictionary of status with corresponding colors
  const statusColors = {
    healthy: 'green',
    warning: 'orange',
    error: 'red'
  };

  return (
    <div className='service-card'>
      <div className = 'card-header'>

        {/* Display the passed icon for the corresponding service */}
        <span className='service-icon'>{icon}</span>

        {/* Display the passed title with style */}
        <div className='card-title'>
          <h3>{title}</h3>
          {/* Display the corresponding status with style */}
          <span className = {`status-indicator ${status}`}></span>
        </div>
      </div>
      
      {/* Display the card content with style */}
      <div className='card-content'>
        {/* Display the total number of instances */}
        <div className='count'>{count}</div>
        {/* Display how many services are running */}
        <div className='details'>{details}</div>
      </div>
    </div>
  );
}



export default App;
