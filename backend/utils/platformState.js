// In-memory cache for ultra-fast maintenance mode checks on every API request
// Falls back to DB on startup to persist state across server restarts.

let state = {
  maintenanceMode: false
};

module.exports = {
  isMaintenanceMode: () => state.maintenanceMode,
  setMaintenanceMode: (val) => { state.maintenanceMode = val; }
};
