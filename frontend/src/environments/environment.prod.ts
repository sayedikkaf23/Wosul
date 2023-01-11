export const environment = {
  production: true,
  serverUrl : `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`,
  // serverUrl : `http://13.235.9.73:8000` // AWS instance URL
  // serverUrl : `http://localhost:8000` // localhsot
};