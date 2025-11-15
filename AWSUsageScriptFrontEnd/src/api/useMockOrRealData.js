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
        const FORCE_MOCK_TESTING = false; // Set to false to disable testing
    
        if (FORCE_MOCK_TESTING) {
            // Force these services to use mock data for testing
            setEC2Data(mockData);
            setIsEC2DataMock(true);
            
            setLambdaData(mockData);
            setIsLambdaDataMock(true);
            
            setEBSData(mockData);
            setIsEBSDataMock(true);
            
            setRegionData(mockData);
            setIsRegionDataMock(true);
            
            setRDSData(mockData);
            setIsRDSDataMock(true);
            
            setCostData(mockData);
            setIsCostDataMock(true);
            
            sets3Data(mockData);
            setIsS3DataMock(true);
            
            setLoadBalancersData(mockData);
            setIsLBDataMock(true);
            
            setEIPsData(mockData);
            setIsEIPsDataMock(true);
            
            setIsLoading(false);
            return; // Skip the real API calls
        }

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

            const responseRegion = await apiService.getAWSRegion();

            // If threre is error in the returned call
            if(responseRegion.error){
                // Use mock data
                setRegionData(mockData);
                setIsRegionDataMock(true);
            } else {
                // else use the real data
                setRegionData(responseRegion.data);
                setIsRegionDataMock(false);
            }


            // EC2 API calls ===============================

            const responseEC2 = await apiService.getEC2();
            
            // If threre is error in the returned call
            if(responseEC2.error){
                // Use mock data
                setEC2Data(mockData);
                setIsEC2DataMock(true);
            } else {
                // else use the real data
                setEC2Data(responseEC2.data);
                setIsEC2DataMock(false);
            }

            // RDS API calls ============================

            const responseRDS = await apiService.getRDS();

            // If threre is error in the returned call
            if(responseRDS.error){
                // Use mock data
                setRDSData(mockData);
                setIsRDSDataMock(true);
            } else {
                // else use the real data
                setRDSData(responseRDS.data);
                setIsRDSDataMock(false);
            }

            // COST API calls ===============================

            const reponseCOST = await apiService.getAWSCosts();

            // If threre is error in the returned call
            if(reponseCOST.error){
                // Use mock data
                setCostData(mockData);
                setIsCostDataMock(true);
            } else {
                // else use the real data
                setCostData(reponseCOST.data);
                setIsCostDataMock(false);
            }

            // S3 API calls ====================

            const responseS3 = await apiService.getS3();

            // If there is error in the returned call
            if(responseS3.error){
                // Use mock data
                sets3Data(mockData);
                setIsS3DataMock(true);
            } else {
                sets3Data(responseS3.data);
                setIsS3DataMock(false);
            }

            // LAMBDA API calls ===================
            const responseLambda = await apiService.getLambda();

            if(responseLambda.error) {
                setLambdaData(mockData);
                setIsLambdaDataMock(true);
            } else {
                setLambdaData(responseLambda.data);
                setIsLambdaDataMock(false);
            }

            // ELB API calls ===================

            const responseELB = await apiService.getELB();

            if(responseELB.error) {
                setLoadBalancersData(mockData);
                setIsLBDataMock(true);
            } else {
                setLoadBalancersData(responseELB.data);
                setIsLBDataMock(false);
            }

            // EBS API calls ===================

            const responseEBS = await apiService.getEBS();

            if(responseEBS.error) {
                setEBSData(mockData);
                setIsEBSDataMock(true);
            } else {
                setEBSData(responseEBS.data);
                setIsEBSDataMock(false);
            }

            // EIPs API calls ===================

            const responseEIPs = await apiService.getEIP();

            if(responseEIPs.error) {
                setEIPsData(mockData);
                setIsEIPsDataMock(true);
            } else {
                setEIPsData(responseEIPs.data);
                setIsEIPsDataMock(false);
            }

        } catch (err) {

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

    return [
        regionData, errorRegion, isRegionDataMock,
        ec2Data, errorEC2, isEC2DataMock, 
        rdsData, errorRDS, isRDSDataMock, 
        costData, errorCost, isCostDataMock, 
        s3Data, errorsS3, isS3DataMock,
        lambdaData, errorLambda, isLambdaDataMock, 
        loadBalancersData, errorLoadBalancers, isLBDataMock, 
        EBSData, errorEBS, isEBSDataMock, 
        EIPsData, errorEIPs, isEIPsDataMock, 
        isLoading
    ];
}

export default useMockOrRealData;