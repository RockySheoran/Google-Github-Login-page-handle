import { logoutUser } from "../services/authService";
import { checkAuth } from "../utils/cookies"
import cookie from 'js-cookie';




export  const Home = () => {
  const check = checkAuth();
  console.log(check)
  const logout = async () => {

    // Clear user data from cookies or local storage
    try {
      const logout_Response = await logoutUser();
      if(logout_Response.data?.success) {
        // Redirect to login or home page after logout
        console.log('Logout successful');
        document.cookie = 'userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        cookie.remove('userData');
    cookie.remove('jwt');

        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  


  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
          <div className="flex items-center space-x-4">
            <img 
              className="h-16 w-16 rounded-full object-cover" 
              src={check?.user?.avatar} 
              alt={check?.user?.name} 
            />
            <div>
              <h2 className="text-xl font-bold text-gray-800">{check?.user?.name}</h2>
              <p className="text-gray-600">{check?.user?.email}</p>
              <div className="flex items-center mt-1">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {check?.user?.provider} authenticated
                </span>
                {check?.user?.isVerified && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Verified
                  </span>
                )}
              </div>
              </div>
            </div>
            <button 
            className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition duration-200"
            onClick={() => {
              // Logout functionality
              logout()
            }}
          >
            Logout
          </button>
          </div>
          )
}
