/**
 * Centralized configuration for the Movie Club web app
 * This file contains passwords, admin settings, and other configuration values
 */

const AppConfig = {
  // MARK: - Admin Configuration
  
  /**
   * Email addresses that are automatically granted admin privileges
   * (For future authentication implementation)
   */
  adminEmails: new Set([
    "rattanajoey@gmail.com"
  ]),
  
  /**
   * Password required to access the admin panel
   */
  adminPanelPassword: "adminpass",
  
  /**
   * Password required to publish monthly selections
   */
  publishSelectionsPassword: "thunderbolts",
  
  // MARK: - Oscar Voting Configuration
  
  /**
   * Password required to access Oscar voting
   */
  oscarVotingPassword: "oscar2025",
  
  /**
   * Whether Oscar voting is currently enabled
   */
  oscarVotingEnabled: true,
  
  // MARK: - Submission Configuration
  
  /**
   * Password required to submit movies
   */
  movieSubmissionPassword: "thunderbolts",
  
  // MARK: - Feature Flags
  
  /**
   * Whether submissions are currently open
   */
  submissionsOpen: false,
  
  /**
   * Whether to show the submission list
   */
  showSubmissionList: true,
  
  /**
   * Whether to show the holding pool
   */
  showHoldingPool: true,
  
  // MARK: - Firebase Collections
  
  collections: {
    monthlySelections: "MonthlySelections",
    genrePools: "GenrePools",
    submissions: "Submissions",
    holdingPool: "HoldingPool",
    oscarCategories: "OscarCategories",
    oscarVotes: "OscarVotes",
    users: "users"
  },
  
  // MARK: - Helper Functions
  
  /**
   * Check if an email should have admin privileges
   * @param {string} email - The email to check
   * @returns {boolean} - True if email is in admin list
   */
  isAdminEmail: function(email) {
    if (!email) return false;
    return this.adminEmails.has(email.toLowerCase());
  },
  
  /**
   * Get password from environment variables or use default
   * @param {string} envKey - Environment variable key
   * @param {string} defaultValue - Default value if env var not found
   * @returns {string} - The password to use
   */
  getPassword: function(envKey, defaultValue) {
    return process.env[envKey] || defaultValue;
  }
};

export default AppConfig;

/**
 * Usage Examples:
 * 
 * 1. Import the config:
 *    import AppConfig from '../config/appConfig';
 * 
 * 2. Check admin access:
 *    if (password === AppConfig.adminPanelPassword) {
 *      // Grant access
 *    }
 * 
 * 3. Check if email is admin:
 *    if (AppConfig.isAdminEmail(userEmail)) {
 *      // Auto-grant admin privileges
 *    }
 * 
 * 4. Use feature flags:
 *    if (AppConfig.oscarVotingEnabled) {
 *      // Show Oscar voting button
 *    }
 * 
 * 5. Access collection names:
 *    collection(db, AppConfig.collections.monthlySelections)
 * 
 * 6. Override with environment variables:
 *    - Add to .env file: REACT_APP_ADMIN_PASSWORD=your_secure_password
 *    - Use: AppConfig.getPassword('REACT_APP_ADMIN_PASSWORD', AppConfig.adminPanelPassword)
 */

