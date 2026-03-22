const token = "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJjb3Vuc2Vsb3JAdW5pdmVyc2l0eS5lZHUiLCJyb2xlcyI6IlJPTEVfQ09VTlNFTE9SIiwiaWF0IjoxNzc0MDk2Nzk5LCJleHAiOjE3NzQxODMxOTl9.JCX_m_MRQd-8kavgZ8YKCqhW_u-ENR9OgZgxuum9yLnvvBHj9eOMML36Bg9XDilw";

function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64').toString('utf-8')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

const tokenData = decodeToken(token);
let userRole = tokenData?.role;
if (!userRole && tokenData?.roles) {
  userRole = tokenData.roles.replace('ROLE_', '');
}

console.log("Token Data:", tokenData);
console.log("Final userRole:", userRole);
