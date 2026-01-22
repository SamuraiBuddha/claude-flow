/**
 * Run full validation suite
 */
export function runFullValidation(workingDir: any, options?: {}): Promise<{
    success: boolean;
    errors: never[];
    warnings: never[];
}>;
/**
 * Main validation orchestrator
 */
export class ValidationSystem {
    constructor(workingDir: any);
    workingDir: any;
    preInitValidator: PreInitValidator;
    postInitValidator: PostInitValidator;
    configValidator: ConfigValidator;
    modeValidator: ModeValidator;
    healthChecker: HealthChecker;
    /**
     * Run all pre-initialization checks
     * @returns {Object} Validation result with status and details
     */
    validatePreInit(options?: {}): Object;
    /**
     * Run all post-initialization verification checks
     * @returns {Object} Verification result with status and details
     */
    validatePostInit(): Object;
    /**
     * Validate configuration files
     * @returns {Object} Configuration validation result
     */
    validateConfiguration(): Object;
    /**
     * Test SPARC mode functionality
     * @returns {Object} Mode functionality test results
     */
    testModeFunctionality(): Object;
    /**
     * Run comprehensive health checks
     * @returns {Object} Health check results
     */
    runHealthChecks(): Object;
    /**
     * Generate validation report
     */
    generateReport(validationResults: any): string;
}
import { PreInitValidator } from './pre-init-validator.js';
import { PostInitValidator } from './post-init-validator.js';
import { ConfigValidator } from './config-validator.js';
import { ModeValidator } from './mode-validator.js';
import { HealthChecker } from './health-checker.js';
//# sourceMappingURL=index.d.ts.map