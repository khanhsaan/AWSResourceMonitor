import React from 'react';
import './MockDataStatus.css';

const MockDataStatus = ({ 
    isRegionDataMock, 
    isEC2DataMock, 
    isRDSDataMock, 
    isCostDataMock, 
    isS3DataMock, 
    isLambdaDataMock, 
    isLBDataMock, 
    isEBSDataMock, 
    isEIPsDataMock 
}) => {
    const services = [
        { name: 'Region', isMock: isRegionDataMock, icon: '🌍' },
        { name: 'EC2', isMock: isEC2DataMock, icon: '💻' },
        { name: 'RDS', isMock: isRDSDataMock, icon: '🗄️' },
        { name: 'Cost', isMock: isCostDataMock, icon: '💰' },
        { name: 'S3', isMock: isS3DataMock, icon: '🪣' },
        { name: 'Lambda', isMock: isLambdaDataMock, icon: 'λ' },
        { name: 'Load Balancer', isMock: isLBDataMock, icon: '⚖️' },
        { name: 'EBS', isMock: isEBSDataMock, icon: '💽' },
        { name: 'Elastic IP', isMock: isEIPsDataMock, icon: '🌐' }
    ];

    const mockCount = services.filter(service => service.isMock).length;
    const totalCount = services.length;
    const realCount = totalCount - mockCount;

    return (
        <div className="mock-data-status">
            <div className="status-header">
                <h3>Data Source Status</h3>
                <div className="status-summary">
                    <span className="real-data-count">
                        <span className="status-dot real"></span>
                        Real: {realCount}
                    </span>
                    <span className="mock-data-count">
                        <span className="status-dot mock"></span>
                        Mock: {mockCount}
                    </span>
                </div>
            </div>
            
            <div className="services-grid">
                {services.map((service, index) => (
                    <div 
                        key={index} 
                        className={`service-status ${service.isMock ? 'mock' : 'real'}`}
                        title={`${service.name}: ${service.isMock ? 'Using mock data' : 'Using real AWS data'}`}
                    >
                        <div className="service-icon">{service.icon}</div>
                        <div className="service-info">
                            <span className="service-name">{service.name}</span>
                            <span className={`service-badge ${service.isMock ? 'mock' : 'real'}`}>
                                {service.isMock ? 'MOCK' : 'REAL'}
                            </span>
                        </div>
                        <div className={`status-indicator ${service.isMock ? 'mock' : 'real'}`}>
                            {service.isMock ? '⚠️' : '✅'}
                        </div>
                    </div>
                ))}
            </div>
            
            {mockCount > 0 && (
                <div className="mock-data-warning">
                    <div className="warning-icon">⚠️</div>
                    <div className="warning-text">
                        <strong>Warning:</strong> {mockCount} service{mockCount > 1 ? 's are' : ' is'} using mock data. 
                        This may indicate API connection issues or missing AWS permissions.
                    </div>
                </div>
            )}
        </div>
    );
};

export default MockDataStatus;