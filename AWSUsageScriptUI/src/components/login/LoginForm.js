import { useState } from "react";

function LoginForm({ onLogin, onLoginStatus }) {
    const[credentials, setCredentials] = useState({
        access_key: '',
        secret_access_key: '',
        region: 'ap-southeast-2',
    });

    const[isLogginIn, setIsLoggingIn] = useState(false);
    const[error, setError] = useState('');
    // The user can have option to see the password or not
    const[showSecret, setShowSecret] = useState(false);
    const[logginFailed, setLogginFailed] = useState(false);
    
    const handleInputChange = (e) => {
        // e.target refers to the DOM element that triggered the change event.
        // name is the name attribute of the input element.
        // value is the current value typed into that input.
        const{name, value} = e.target;

        // It uses the previous state (prev) and spreads it with ...prev so existing values aren't lost.
        // Then it updates the field corresponding to name with the new value.

        // Ex:
        // Suppose prev = { username: 'john', password: '123' }
        // If name = 'username' and value = 'jane'
        // setCredentials(prev => ({
        //     ...prev,
        //     [name]: value
        // }))
        // Result: { username: 'jane', password: '123' }
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        // Prevent the default behavior that it may has
        e.preventDefault();

        // If the AWS access key or the secret key is missing
        if(!credentials.access_key || !credentials.secret_access_key) {
            setError('Please enter both Access Key and Secret Key');
            return;
        }

        // The user is logging in
        setIsLoggingIn(true);
        // The error is emptylogginFailed
        setError('');

        try {
            // Stimulate a bried delay for the Login process
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Pass the credentials from the user input to the passed function
            const response = await onLogin(credentials);

            
            if(response && response.success === false){
                setError(response.error || 'Login failed, please try again...');
                setLogginFailed(true);

                // The line onLoginStatus?.({success: false, error: response.error}); is using optional chaining (?.) to call the onLoginStatus function if it is defined. It passes an object with success: false and error: response.error as arguments.
                onLoginStatus?.({success: false, error: response.error});
            } else {
                setLogginFailed(false);
                onLoginStatus?.({success: true, error: null});
            }

            
            
        } catch (error) {
            setError('Failed to authenticate. Please check your credentials');
        } finally {
            // Finally, the user has finished logging in
            setIsLoggingIn(false);
        }
    };

    const regions = [
        'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
        'eu-west-1', 'eu-west-2', 'eu-central-1',
        'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1'
    ];

    return (
        <div className="login-container">
            <div className="login-form">
                <div className="login-header">
                    <h1>🔐 AWS Resource Monitor</h1>
                    <p>Enter your AWS credentials to continue</p>
                </div>

                {/* {error && (...)}:
                This is a logical AND (&&) operation used for conditional rendering. It means:

                "If error is truthy (i.e., not null, undefined, false, 0, or an empty string), then render the HTML inside the parentheses." */}
                {error && (
                    <div className="error-message">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/*  AWS Access Key ID input field */}
                    <div className="form-group">
                        {/* htmlFor (React JSX) / for (HTML): when the user clicks on the label the input field with the corresponding id will be focused on */}
                        <label htmlFor="accessKey">AWS Access Key ID *</label>
                        <input
                            type="text"
                            id="accessKey"
                            name="access_key"
                            value={credentials.access_key}
                            onChange={handleInputChange}
                            placeholder="Enter your AWS Access Key ID"
                            required>
                        </input>
                    </div>

                    {/* AWS Secret Access Key input field */}
                    <div className="form-group">
                        <label htmlFor="secretKey">AWS Secret Access Key *</label>
                        <div className="password-input-container">
                            <input
                                type={showSecret? "text" : "password"}
                                id="secretKey"
                                name="secret_access_key"
                                value={credentials.secret_access_key}
                                onChange={handleInputChange}
                                placeholder="Enter your AWS Secret Access Key"
                                required></input>

                            
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowSecret(!showSecret)}>

                                {showSecret ? '🙈' : '👁️'}
                                
                            </button>
                        </div>
                    </div>

                    {/* Region input field */}
                    <div className="form-group">
                        <label htmlFor="region">AWS Region</label>
                        <select
                            id="region"
                            name="region"
                            value={credentials.region}
                            onChange={handleInputChange}>

                                {regions.map(region => (
                                    <option key={region} value={region}>
                                        {region}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <button
                        type="submit" // Trigger onSubmit() event of the form
                        className="login-button"
                        disabled={isLogginIn}>
                            {isLogginIn ? '🔄 Connecting...' : '🚀 Connect to AWS'}
                    </button>
                </form>

                <div className="login-footer">
                    <p><strong>Note: </strong> Your credentials are only stored temporarily in this session and are not transmitted to any external servers except your configured AWS endpoints</p>
                </div>
            </div>
        </div>
    )
}

export default LoginForm;