function ServiceDetail({
    title,
    data,
    type
  }) {
    // Create a dynamic function to be returned
    const renderContent = () => {
      if(!data || data.length ===  0){
        return <p className='no-data'>No {title.toLowerCase()} found</p>
      }
  
      switch(type) {
        case 'ec2':
          return data.map((instance, index) => (
            <div key={index} className='detail-item'>
              <strong>{instance.id}</strong>
              <span>Type: {instance.type}</span>
              <span>Status: <span className={`status ${instance.status}`}>{instance.status}</span></span>
            </div>
          ));
  
        case 'rds':
          return data.map((db, index) => (
            <div key={index} className='detail-item'>
              <strong>{db.identifier}</strong>
              <span>Engine: {db.engine}</span>
              <span>Class: {db.class}</span>
              <span>Storage: {db.storage}</span>
              <span>Status: <span className={`status ${db.status}`}>{db.status}</span></span>
            </div>
          ));
  
        case 's3':
          return data.map((bucket, index) => (
            <div key={index} className='detail-item'>
              <strong>{bucket.name}</strong>
              <span>Size: {bucket?.size ?? 'Undefined'}</span>
            </div>
          ));
  
        case 'lambda':
          return data.map((func, index) => (
            <div key={index} className='detail-item'>
              <strong>{func.name}</strong>
              <span>Runtime: {func.runtime}</span>
              <span>Memory: {func.memory}</span>
              <span>Timeout: {func.timeout}</span>
            </div>
          ));
  
        case 'elb':
          return data.map((elb, index) => (
            <div key={index} className='detail-item'>
              <strong>{elb.name}</strong>
              <span>Type: {elb.type}</span>
              <span>Scheme: {elb.scheme}</span>
              <span>State: <span className={`status ${elb.state}`}>{elb.state}</span></span>
            </div>
          ));
  
        case 'ebs':
          return data.map((ebs, index) => (
            <div key={index} className='detail-item'>
              <strong>{ebs.id}</strong>
              <span>Size: {ebs.size}</span>
              <span>Type: {ebs.type}</span>
              <span>State: <span className={`status ${ebs.state}`}>{ebs.state}</span></span>
              <span>{ebs.attachedTo ? `Attached to: ${ebs.attachedTo}` : ''}</span>
            </div>
          ));

          case 'eip':
            return data.map((eips, index) => (
              <div key={index} className='detail-item'>
                <strong>{eips.ip}</strong>
                <span>Size: {eips.size}</span>
                <span>Type: {eips.type}</span>
                <span>State: <span className={`status ${eips.status}`}>{eips.status}</span></span>
                <span>{eips.instanceId ? `Instance: ${eips.instanceId}}`: ''}</span>
                <span className="warning">{!eips.instanceId ? `⚠️ Unattached (incurring charges)`: ''}</span>
              </div>
            ));
          
          default:
            return <p>Data not available</p>
      }
    };
  
    return (
      <div className='service-detail-card'>
        {/* Return the title */}
        <h3>{title}</h3>
        {/* Return the dynamic renderContent() and its style */}
        <div className='detail-content'>
          {renderContent()}
        </div>
      </div>
    )
  }

  export default ServiceDetail;