import { use, useEffect, useState } from "react"
import mockData from "../constants/MockData";
import apiService from "./apiService";

const useMockOrRealData = (isAuthenticated = false) => {
    // const[data, setData] = useState(null);
    // Region
    const[regionData, setRegionData] = useState(null);
    const[isRegionDataMock, setIsRegionDataMock] = useState(false);
    const[errorRegion, setErrorRegion] = useState(null);
    // Cost
    const[costData, setCostData] = useState(null);
    const[errorCost, setErrorCost] = useState(null);
    const[isCostDataMock, setIsCostDataMock] = useState(false);


    // EC2
    const[ec2Data, setEC2Data] = useState(null);
    const[errorEC2, setErrorEC2] = useState(null);
    const[isEC2DataMock, setIsEC2DataMock] = useState(false);


    // RDS
    const[rdsData, setRDSData] = useState(null);
    const[errorRDS, setErrorRDS] = useState(null);
    const[isRDSDataMock, setIsRDSDataMock] = useState(false);
    

    // S3
    const[s3Data, sets3Data] = useState(null);
    const[errorsS3, setErrorS3] = useState(null);
    const[isS3DataMock, setIsS3DataMock] = useState(false);


    // Lambda
    const[lambdaData, setLambdaData] = useState(null);
    const[errorLambda, setErrorLambda] = useState(null);
    const[isLambdaDataMock, setIsLambdaDataMock] = useState(false);


    // Load balancers
    const[loadBalancersData, setLoadBalancersData] = useState(null);
    const[errorLoadBalancers, setErrorLoadBalancers] = useState(null);
    const[isLBDataMock, setIsLBDataMock] = useState(false);
    

    // Load balancers
    const[EBSData, setEBSData] = useState(null);
    const[errorEBS, setErrorEBS] = useState(null);
    const[isEBSDataMock, setIsEBSDataMock] = useState(false);


    // EIPs
    const[EIPsData, setEIPsData] = useState(null);
    const[errorEIPs, setErrorEIPs] = useState(null);
    const[isEIPsDataMock, setIsEIPsDataMock] = useState(false);


    // Loading state
    const[isLoading, setIsLoading] = useState(true);

    const fetchAWSData = async () => {
        // Turn on the loading state
        console.log('Loading ON ==================');

        // There is no error initially
        setErrorEC2(null);
        setErrorRDS(null);
        setErrorCost(null);
        setErrorRegion(null);
        setErrorEIPs(null);
        setErrorCost(null);
        setErrorEBS(null);

        // EC2 API calls
        try {

            // REGION API calls ============================

            // response = {
            //      data, error
            // }
            console.log('Requesting RDS instances');
            const responseRegion = await apiService.getAWSRegion();
            
            if(responseRegion.data) {
                console.log('There is REGION response being retrieved');
                console.log(responseRegion.data.current_region);
            
            } else {
                console.log('There is NO REGION response being retrieved')
            }

            // If threre is error in the returned call
            if(responseRegion.error){
                console.warn('REGION API call failed, using mock data', responseRegion.error);

                // Use mock data
                setRegionData(mockData);
                setIsRegionDataMock(true);
            } else {
                console.log('No error, using real REGION data');
                // else use the real data
                setRegionData(responseRegion.data);
                setIsRegionDataMock(false);
            }


            // EC2 API calls ===============================

            // response = {
            //      data, error
            // }
            console.log('Requesting EC2 instances');
            const responseEC2 = await apiService.getEC2();

            if(responseEC2.data) {
                console.log('There is EC2 response being retrieved');
                console.log(responseEC2.data.ec2Instances);
            
            } else {
                console.log('There is NO EC2 response being retrieved')
            }
            
            // If threre is error in the returned call
            if(responseEC2.error){
                console.warn('EC2 API call failed, using mock data', responseEC2.error);

                // Use mock data
                setEC2Data(mockData);
                setIsEC2DataMock(true);
            } else {
                console.log('No error, using real EC2 data');
                // else use the real data
                setEC2Data(responseEC2.data);
                setIsEC2DataMock(false);
            }

            // RDS API calls ============================

            // response = {
            //      data, error
            // }
            console.log('Requesting RDS instances');
            const responseRDS = await apiService.getRDS();
            
            if(responseRDS.data) {
                console.log('There is RDS response being retrieved');
                console.log(responseRDS.data.rdsInstances);
            
            } else {
                console.log('There is NO RDS response being retrieved')
            }

            // If threre is error in the returned call
            if(responseRDS.error){
                console.warn('RDS API call failed, using mock data', responseRDS.error);

                // Use mock data
                setRDSData(mockData);
                setIsRDSDataMock(true);
            } else {
                console.log('No error, using real RDS data');
                // else use the real data
                setRDSData(responseRDS.data);
                setIsRDSDataMock(false);
            }

            // COST API calls ===============================

            // response = {
            //      data, error
            // }
            console.log('Requesting COST instances');
            const reponseCOST = await apiService.getAWSCosts();
            
            if(reponseCOST.data) {
                console.log('There is COST response being retrieved');
                console.log(reponseCOST.data.totalCost);
            
            } else {
                console.log('There is NO COST response being retrieved')
            }

            // If threre is error in the returned call
            if(reponseCOST.error){
                console.warn('COST API call failed, using mock data', reponseCOST.error);

                // Use mock data
                setCostData(mockData);
                setIsCostDataMock(true);
            } else {
                console.log('No error, using real COST data');
                // else use the real data
                setCostData(reponseCOST.data);
                setIsCostDataMock(false);

                // console.log(rdsData?.rdsInstances?.length);
            }

            // S3 API calls ====================

            console.log('Requesting S3 instances');
            const responseS3 = await apiService.getS3();

            if(responseS3.data) {
                console.log('There is S3 response being retrieved');
                console.log(responseS3.data.s3Buckets);
            } else {
                console.log('There is NO S3 reponse being retrieved');
            }

            // If there is error in the returned call
            if(responseS3.error){
                console.warn('S3 API call failed, using mock data', responseS3.error);

                // Use mock data
                sets3Data(mockData);
                setIsS3DataMock(true);
            } else {
                console.log('No error, using real S3 data');
                sets3Data(responseS3.data);
                setIsS3DataMock(false);

            }

            // LAMBDA API calls ===================
            console.log('Requesting Lambda functions...');
            const responseLambda = await apiService.getLambda();
            
            if(responseLambda.data) {
                console.log('There is Lambda response being retrieved');
                console.log(responseLambda.data.lambdaFunctions);
            } else {
                console.log('There is NO Lambda response being retrieved');
            }

            if(responseLambda.error) {
                console.warn('Lambda API call failed, using mock data', responseLambda.error);

                setLambdaData(mockData);
                setIsLambdaDataMock(true);
            } else {
                console.log('No error, using real Lambda data');
                setLambdaData(responseLambda.data);
                setIsLambdaDataMock(false);

            }

            // ELB API calls ===================

            console.log('Requesting ELB functions...');
            const responseELB = await apiService.getELB();
            
            if(responseELB.data) {
                console.log('There is ELB response being retrieved');
                console.log(responseELB.data.loadBalancers);
            } else {
                console.log('There is NO ELB response being retrieved');
            }

            if(responseELB.error) {
                console.warn('ELB API call failed, using mock data', responseELB.error);

                setLoadBalancersData(mockData);
                setIsLBDataMock(true);
            } else {
                console.log('No error, using real ELB data');
                setLoadBalancersData(responseELB.data);
                setIsLBDataMock(false);
            }

            // EBS API calls ===================

            console.log('Requesting EBS Volumes...');
            const responseEBS = await apiService.getEBS();
            
            if(responseEBS.data) {
                console.log('There is EBS response being retrieved');
                console.log(responseEBS.data.ebsVolumes);
            } else {
                console.log('There is NO EBS response being retrieved');
            }

            if(responseEBS.error) {
                console.warn('EBS API call failed, using mock data', responseEBS.error);

                setEBSData(mockData);
                setIsEBSDataMock(true);
            } else {
                console.log('No error, using real EBS data');
                setEBSData(responseEBS.data);
                setIsEBSDataMock(false);
            }

            // EIPs API calls ===================

            console.log('Requesting EIPs...');
            const responseEIPs = await apiService.getEIP();
            
            if(responseEIPs.data) {
                console.log('There is EIPs response being retrieved');
                console.log(responseEIPs.data.elasticIPs);
            } else {
                console.log('There is NO EIPs response being retrieved');
            }

            if(responseEIPs.error) {
                console.warn('EIPs API call failed, using mock data', responseEIPs.error);

                setEIPsData(mockData);
                setIsEIPsDataMock(true);
            } else {
                console.log('No error, using real EIPs data');
                setEIPsData(responseEIPs.data);
                setIsEIPsDataMock(false);
            }

        } catch (err) {
            console.log('Failed to fetch AWS data: ', err);
            console.log('API call failed, using mock data');

            setEC2Data(mockData);
            setIsEC2DataMock(true);
            setCostData(mockData);
            setRDSData(mockData);

        } finally {
            setIsLoading(false);
        }
    }

    // Call fetchAWSData on mount
    useEffect(() => {
        if(isAuthenticated){
            fetchAWSData();
        }
    }, [isAuthenticated]);

    // Return the values
    return [regionData, errorRegion, ec2Data, errorEC2, rdsData, errorRDS, costData, errorCost, s3Data, errorsS3,lambdaData, errorLambda, loadBalancersData, errorLoadBalancers, EBSData, errorEBS, EIPsData, errorEIPs, isLoading];
}

export default useMockOrRealData;