// import './ServiceCard.css';

// const ServiceCard = ({
//     title,
//     count,
//     icon,
//     status = 'healthy',
//     details,
//     onClick,
//     isLoading = false,
//     trend = null,
//     className = ''
// }) => {
//     const handleClick = () => {
//         if(onClick && !isLoading) {
//             onClick();
//         }
//     };

//     const getTranIndicator = () => {
//         if(!trend) return null;

//         const{direction, percentage} = trend;

//         // Set the isPositive to true of direction is up, direction == 'up' returns true/ false
//         const isPositive = direction == 'up';
//         // Set the isNegative to true of direction is down, direction == 'down' returns true/ false
//         const isNegative = direction == 'down';

//         return (
//             <div className={`trend-indicator ${direction}`}>
//                 {/* Short form of:
//                     if(isPostive), then up arrow
//                     else if(isNegative), then down arrow
//                     else, then neutral arrow
//                 */}
//                 <span className="trend-arrow">
//                     {isPositive ? '↗' : isNegative ? '↘' : '→'}
//                 </span>
//                 <span className="trend-percentage">{percentage}%</span>
//             </div>
//         );
//     };

//     // This const use the passed 'status' as the index using in statusColors dict to indicate teh status healthy, warning, error or inactive
//     const getStatusColor = (status) => {
//         const statusColors = {
//             healthy: '#48bb78',
//             warning: '#ed8936',
//             error: '#f56565',
//             inactive: '#a0aec0'
//         };
//         return statusColors[status] || statusColors.healthy;
//     };

//     if(isLoading) {
//         return (
//             <div className={`service-card loading ${className}`}>
//                 <div className='card-skeleton'>
//                     <div className='skeleton-header'>
//                         <div className='skeleton-icon'></div>
//                         <div className='skeleton-title'></div>
//                     </div>
//                 </div>
//             </div>
//         )
//     }
// }

// export default ServiceCard;